// Менеджер ключей защищённого локального хранилища (vault).
//
// Модель (как в sovereign-vault / selfstore / desgrange.net):
//   • deviceKey  — non-extractable AES-256-GCM, привязан к этому браузеру/устройству.
//                  Генерируется один раз, хранится в IndexedDB (CryptoKey через
//                  structured clone). Позволяет прозрачно расшифровывать хранилище
//                  без ввода пароля на «своём» устройстве.
//   • masterKey  — случайный non-extractable AES-256-GCM, которым шифруются записи.
//                  Обёрнут (wrapKey) под deviceKey и (опц.) под passphrase-KEK.
//   • passphrase — опционально: PBKDF2-SHA256 (600k итераций) -> KEK, которым
//                  обёрнут тот же masterKey. Даёт переносимость между устройствами
//                  (пользователь вводит пароль на новом устройстве и «разблокирует»
//                  хранилище, после чего оно переоборачивается под новый deviceKey).
//
// masterKey НИКОГДА не лежит в памяти в виде байт и не извлекается (non-extractable).
// Сервер не видит ни ключей, ни данных — документы остаются только в браузере.

import { metaGet, metaPut, idbGet, STORE } from "./idb";
import { toBase64Url, fromBase64Url } from "@/lib/crypto";

export interface Envelope {
  v: 1;
  iv: string;
  ct: string;
}

const PBKDF2_ITERATIONS = 600_000;

class LockedError extends Error {
  constructor() {
    super("Хранилище заблокировано — требуется пароль");
    this.name = "VaultLockedError";
  }
}

let masterKeySession: CryptoKey | null = null;
let needsPassphrase = false;

function buf(input: ArrayBuffer | Uint8Array): Uint8Array<ArrayBuffer> {
  if (input instanceof Uint8Array) {
    // гарантируем ArrayBuffer-бэкинг (для BufferSource совместимости)
    const a = new Uint8Array(input.byteLength);
    a.set(input);
    return a as Uint8Array<ArrayBuffer>;
  }
  return new Uint8Array(input) as Uint8Array<ArrayBuffer>;
}

export function isUnlocked(): boolean {
  return masterKeySession !== null;
}

export function requiresPassphrase(): boolean {
  return needsPassphrase;
}

export async function initVault(): Promise<void> {
  const deviceKey = await metaGet<CryptoKey>("deviceKey");
  const masterWrapped = await metaGet<{ value: ArrayBuffer; iv: string }>(
    "masterKeyWrapped"
  );

  if (!deviceKey || !masterWrapped) {
    if (masterWrapped) {
      // Данные есть, но deviceKey на этом устройстве нет (новое устройство) —
      // нужен пароль для восстановления masterKey из passphrase-обёртки.
      needsPassphrase = true;
      return;
    }
    // Первый запуск: создаём deviceKey + masterKey.
    const newDevice = await crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
    );
    await metaPut("deviceKey", newDevice);
    const newMaster = await crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
    );
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const wrapped = await crypto.subtle.wrapKey("raw", newMaster, newDevice, {
      name: "AES-GCM",
      iv,
    });
    await metaPut("masterKeyWrapped", {
      value: wrapped,
      iv: toBase64Url(buf(iv)),
    });
    masterKeySession = newMaster;
    return;
  }

  // Обычный unlock на «своём» устройстве.
  await unlockWithDeviceKey(deviceKey, masterWrapped);
}

async function unlockWithDeviceKey(
  deviceKey: CryptoKey,
  masterWrapped: { value: ArrayBuffer; iv: string }
): Promise<void> {
  const iv = fromBase64Url(masterWrapped.iv);
  masterKeySession = await crypto.subtle.unwrapKey(
    "raw",
    buf(masterWrapped.value),
    deviceKey,
    { name: "AES-GCM", iv },
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
  );
  needsPassphrase = false;
}

export function lockVault(): void {
  masterKeySession = null;
}

function assertUnlocked(): CryptoKey {
  if (!masterKeySession) throw new LockedError();
  return masterKeySession;
}

export async function encryptJSON(obj: unknown): Promise<Envelope> {
  const key = assertUnlocked();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = buf(new TextEncoder().encode(JSON.stringify(obj)));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data);
  return { v: 1, iv: toBase64Url(iv), ct: toBase64Url(buf(ct)) };
}

export async function decryptJSON<T = unknown>(
  env: Envelope | null | undefined
): Promise<T | null> {
  if (!env || env.v !== 1) return null;
  try {
    const key = assertUnlocked();
    const iv = fromBase64Url(env.iv);
    const ct = fromBase64Url(env.ct);
    const plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      ct
    );
    return JSON.parse(new TextDecoder().decode(plain)) as T;
  } catch {
    return null;
  }
}

/* ----------------------------- Passphrase (portable) ----------------------------- */

export async function hasPassphrase(): Promise<boolean> {
  const rec = await metaGet<{ salt: string }>("masterKeyPass");
  return Boolean(rec);
}

export async function setPassphrase(passphrase: string): Promise<void> {
  const key = assertUnlocked();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const kek = await deriveKek(passphrase, salt);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const wrapped = await crypto.subtle.wrapKey("raw", key, kek, {
    name: "AES-GCM",
    iv,
  });
  await metaPut("masterKeyPass", {
    value: wrapped,
    salt: toBase64Url(salt),
    iv: toBase64Url(iv),
    iterations: PBKDF2_ITERATIONS,
  });
}

export async function unlockWithPassphrase(
  passphrase: string
): Promise<void> {
  const rec = await metaGet<{
    value: ArrayBuffer;
    salt: string;
    iv: string;
    iterations: number;
  }>("masterKeyPass");
  if (!rec) throw new Error("Пароль не задан — нечего разблокировать");
  const kek = await deriveKek(
    passphrase,
    fromBase64Url(rec.salt),
    rec.iterations
  );
  const iv = fromBase64Url(rec.iv);
  const master = await crypto.subtle.unwrapKey(
    "raw",
    buf(rec.value),
    kek,
    { name: "AES-GCM", iv },
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
  );
  masterKeySession = master;
  needsPassphrase = false;

  // На новом устройстве ещё нет deviceKey — создаём и переоборачиваем masterKey,
  // чтобы дальше unlock был прозрачным.
  const deviceKey = await metaGet<CryptoKey>("deviceKey");
  if (!deviceKey) {
    const newDevice = await crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
    );
    await metaPut("deviceKey", newDevice);
    const div = crypto.getRandomValues(new Uint8Array(12));
    const wrapped = await crypto.subtle.wrapKey("raw", master, newDevice, {
      name: "AES-GCM",
      iv: div,
    });
    await metaPut("masterKeyWrapped", {
      value: wrapped,
      iv: toBase64Url(div),
    });
  }
}

async function deriveKek(
  passphrase: string,
  salt: Uint8Array<ArrayBuffer>,
  iterations: number = PBKDF2_ITERATIONS
): Promise<CryptoKey> {
  const baseKey = await crypto.subtle.importKey(
    "raw",
    buf(new TextEncoder().encode(passphrase)),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["wrapKey", "unwrapKey"]
  );
}

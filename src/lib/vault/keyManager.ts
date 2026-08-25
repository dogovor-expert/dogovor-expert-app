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

import { metaGet, metaPut, metaDelete, idbGet, idbPut, idbGetAll, idbClear, STORE } from "./idb";
import { toBase64Url, fromBase64Url } from "@/lib/crypto";

export interface Envelope {
  v: 1;
  iv: string;
  ct: string;
}

export interface VaultBackup {
  version: 1;
  exportedAt: string;
  deviceKeyWrapped: { value: ArrayBuffer; iv: string } | null;
  masterKeyWrapped: { value: ArrayBuffer; iv: string };
  masterKeyPass?: { value: ArrayBuffer; salt: string; iv: string; iterations: number };
  documents: Array<{ meta: any; enc: Envelope }>;
  tokens: Array<{ providerId: string; enc: Envelope }>;
}

const PBKDF2_ITERATIONS = 600_000;
const AUTO_LOCK_MS_KEY = "autoLockMs";

class LockedError extends Error {
  constructor() {
    super("Хранилище заблокировано — требуется пароль");
    this.name = "VaultLockedError";
  }
}

let masterKeySession: CryptoKey | null = null;
let needsPassphrase = false;
let autoLockTimer: ReturnType<typeof setTimeout> | null = null;

function buf(input: ArrayBuffer | Uint8Array): Uint8Array<ArrayBuffer> {
  if (input instanceof Uint8Array) {
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
      needsPassphrase = true;
      return;
    }
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

  await unlockWithDeviceKey(deviceKey, masterWrapped);
  startAutoLockTimer();
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
  if (autoLockTimer) {
    clearTimeout(autoLockTimer);
    autoLockTimer = null;
  }
}

async function startAutoLockTimer(): Promise<void> {
  if (autoLockTimer) clearTimeout(autoLockTimer);
  const ms = await getAutoLockMs();
  if (ms > 0) {
    autoLockTimer = setTimeout(() => {
      lockVault();
      // Событие для UI
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("vault:locked"));
      }
    }, ms);
  }
}

export async function getAutoLockMs(): Promise<number> {
  const ms = await metaGet<number>(AUTO_LOCK_MS_KEY);
  return ms ?? 15 * 60 * 1000; // дефолт 15 мин
}

export async function setAutoLockMs(ms: number): Promise<void> {
  await metaPut(AUTO_LOCK_MS_KEY, ms);
  startAutoLockTimer();
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

export async function changePassphrase(
  oldPassphrase: string,
  newPassphrase: string
): Promise<void> {
  // Сначала разблокируем старым паролем (если vault залочен)
  if (!isUnlocked()) {
    await unlockWithPassphrase(oldPassphrase);
  }
  // Удаляем старую обёртку
  await metaDelete("masterKeyPass");
  // Ставим новую
  await setPassphrase(newPassphrase);
}

export async function removePassphrase(): Promise<void> {
  await metaDelete("masterKeyPass");
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
  startAutoLockTimer();
}

/* ----------------------------- Vault Backup / Restore ----------------------------- */

export async function exportVaultBackup(): Promise<VaultBackup> {
  const key = assertUnlocked();
  const deviceKey = await metaGet<CryptoKey>("deviceKey");
  const masterWrapped = await metaGet<{ value: ArrayBuffer; iv: string }>(
    "masterKeyWrapped"
  );
  const passRec = await metaGet<{
    value: ArrayBuffer;
    salt: string;
    iv: string;
    iterations: number;
  }>("masterKeyPass");
  const docs = await idbGetAll<{ enc: Envelope } & any>(STORE.docs);
  const tokens = await idbGetAll<{ enc: Envelope; providerId: string }>(
    STORE.tokens
  );

  // Экспортируем deviceKey (wrapped под masterKey) для восстановления на новом устройстве
  let deviceKeyWrapped: { value: ArrayBuffer; iv: string } | null = null;
  if (deviceKey) {
    const div = crypto.getRandomValues(new Uint8Array(12));
    const wrapped = await crypto.subtle.wrapKey("raw", deviceKey, key, {
      name: "AES-GCM",
      iv: div,
    });
    deviceKeyWrapped = { value: wrapped, iv: toBase64Url(div) };
  }

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    deviceKeyWrapped,
    masterKeyWrapped: masterWrapped!,
    masterKeyPass: passRec || undefined,
    documents: docs.map((d) => ({ meta: d, enc: d.enc })),
    tokens: tokens.map((t) => ({ providerId: t.providerId, enc: t.enc })),
  };
}

export async function importVaultBackup(
  backup: VaultBackup,
  passphrase?: string
): Promise<void> {
  // Если есть passphrase — используем её для unwrap masterKey
  // Иначе ожидаем, что deviceKeyWrapped можно unwrap текущим masterKey (same device)
  let masterKey: CryptoKey;

  if (passphrase && backup.masterKeyPass) {
    const kek = await deriveKek(
      passphrase,
      fromBase64Url(backup.masterKeyPass.salt),
      backup.masterKeyPass.iterations
    );
    masterKey = await crypto.subtle.unwrapKey(
      "raw",
      buf(backup.masterKeyPass.value),
      kek,
      { name: "AES-GCM", iv: fromBase64Url(backup.masterKeyPass.iv) },
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
    );
  } else if (backup.deviceKeyWrapped) {
    // unwrap deviceKey под текущим masterKey, затем unwrap masterKey под deviceKey
    const key = assertUnlocked();
    const deviceKey = await crypto.subtle.unwrapKey(
      "raw",
      buf(backup.deviceKeyWrapped.value),
      key,
      { name: "AES-GCM", iv: fromBase64Url(backup.deviceKeyWrapped.iv) },
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
    );
    masterKey = await crypto.subtle.unwrapKey(
      "raw",
      buf(backup.masterKeyWrapped.value),
      deviceKey,
      { name: "AES-GCM", iv: fromBase64Url(backup.masterKeyWrapped.iv) },
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
    );
  } else {
    throw new Error("Невозможно восстановить: нет deviceKeyWrapped и нет passphrase");
  }

  // Записываем в хранилище
  masterKeySession = masterKey;
  await metaPut("masterKeyWrapped", backup.masterKeyWrapped);
  if (backup.deviceKeyWrapped) {
    // deviceKey уже есть в памяти (unwrap выше), сохраняем
    // но нам нужно сохранить deviceKey как CryptoKey — его нет в бэкапе в открытом виде
    // На практике: если бэкап восстанавливается на то же устройство, deviceKey уже есть.
    // Если на новое устройство с passphrase — deviceKey создастся в unlockWithPassphrase.
  }
  if (backup.masterKeyPass) {
    await metaPut("masterKeyPass", backup.masterKeyPass);
  }

  // Очищаем и заливаем документы и токены
  await idbClear(STORE.docs);
  await idbClear(STORE.tokens);
  for (const d of backup.documents) {
    await idbPut(STORE.docs, { ...d.meta, enc: d.enc });
  }
  for (const t of backup.tokens) {
    await idbPut(STORE.tokens, { providerId: t.providerId, enc: t.enc });
  }

  startAutoLockTimer();
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

// Менеджер ключей защищённого локального хранилища (vault).
//
// СХЕМА («raw-bytes envelope», кросс-браузерная):
//   • deviceSecret — случайные 32 байта в IndexedDB (meta). Локальный секрет
//     устройства. Из него импортируется AES-ключ для шифрования мастер-секрета.
//   • masterSecret — случайные 32 байта, реальный мастер-ключ материала записей.
//     В памяти держится байтовый массив + non-extractable CryptoKey (импорт из
//     байтов), поэтому exportKey-извлечение невозможно даже при XSS-чтении объектов.
//   • Персистентность masterSecret — ТОЛЬКО через обычный encrypt():
//       meta["masterKeyWrapped"] = { v:2, iv, ct }   // ct = AESGCM(deviceKeyFromBytes, masterSecret)
//       meta["masterKeyPass"]    = { v:2, iv, ct, salt, iterations } // KEK = PBKDF2(pass)
//     Мы НЕ используем subtle.wrapKey(): по спецификации он требует extractable
//     ключ, и Chrome/Firefox/Safari (как и Node) бросают InvalidAccessError на
//     wrapKey(non-extractable) — из-за этого первая версия vault не работала.
//
// Гарантии прежней модели сохранены:
//   • на «своём» устройстве разблокировка прозрачна (deviceSecret есть в IDB);
//   • на новом устройстве нужен passphrase;
//   • сервер/другие процессы не видят ни ключей, ни данных.

import { metaGet, metaPut, metaDelete, idbGetAll, idbPut, idbClear, STORE } from "./idb";
import { toBase64Url, fromBase64Url } from "@/lib/crypto";

export interface Envelope {
  v: 1;
  iv: string;
  ct: string;
}

/** Обёртка masterSecret произвольным AES-ключом (v2 — байтовый формат). */
interface SecretWrap {
  v: 2;
  iv: string;
  ct: string;
}

export interface VaultBackup {
  version: 2;
  exportedAt: string;
  /** masterSecret под текущим deviceSecret — восстанавливается на этом же устройстве */
  masterForDevice: SecretWrap | null;
  /** masterSecret под passphrase — переносится между устройствами */
  masterForPass: { iv: string; ct: string; salt: string; iterations: number } | null;
  documents: Array<{ meta: Record<string, unknown>; enc: Envelope }>;
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

let masterKeySession: CryptoKey | null = null; // non-extractable, usages: encrypt/decrypt
let masterBytes: Uint8Array<ArrayBuffer> | null = null; // тот же материал для setPassphrase/export
let needsPassphrase = false;
let autoLockTimer: ReturnType<typeof setTimeout> | null = null;

function buf(input: ArrayBuffer | Uint8Array): Uint8Array<ArrayBuffer> {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  const a = new Uint8Array(bytes.byteLength);
  a.set(bytes);
  return a as Uint8Array<ArrayBuffer>;
}

function randomBytes(n: number): Uint8Array<ArrayBuffer> {
  const a = crypto.getRandomValues(new Uint8Array(n));
  return a as Uint8Array<ArrayBuffer>;
}

function assertUnlocked(): CryptoKey {
  if (!masterKeySession) throw new LockedError();
  return masterKeySession;
}

/* ------------------------------- Примитивы ------------------------------- */

async function importAesKey(
  bytes: Uint8Array,
  usages: KeyUsage[]
): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", buf(bytes), { name: "AES-GCM" }, false, usages);
}

async function aesEncrypt(
  key: CryptoKey,
  plaintext: Uint8Array
): Promise<SecretWrap> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, buf(plaintext));
  return { v: 2, iv: toBase64Url(iv), ct: toBase64Url(buf(ct)) };
}

async function aesDecrypt(key: CryptoKey, w: SecretWrap): Promise<Uint8Array<ArrayBuffer>> {
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromBase64Url(w.iv) }, key, fromBase64Url(w.ct));
  return buf(pt);
}

async function deriveKek(
  passphrase: string,
  salt: Uint8Array,
  iterations: number = PBKDF2_ITERATIONS
): Promise<CryptoKey> {
  const base = await crypto.subtle.importKey(
    "raw", buf(enc.encode(passphrase)), "PBKDF2", false, ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: buf(salt), iterations, hash: "SHA-256" },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

const enc = new TextEncoder();

async function getDeviceSecretAndKey(): Promise<{
  secret: Uint8Array<ArrayBuffer>;
  aes: CryptoKey;
}> {
  let secret = await metaGet<Uint8Array<ArrayBuffer>>("deviceSecret");
  if (!secret || secret.byteLength !== 32) {
    secret = randomBytes(32);
    await metaPut("deviceSecret", secret);
  }
  const bytes = buf(secret);
  const aes = await importAesKey(bytes, ["encrypt", "decrypt"]);
  return { secret: bytes, aes };
}

/** Импортирует masterSecret в памяти как non-extractable ключ записи. */
async function adoptMaster(bytes: Uint8Array): Promise<void> {
  masterBytes = buf(bytes);
  masterKeySession = await importAesKey(masterBytes, ["encrypt", "decrypt"]);
  needsPassphrase = false;
}

/* --------------------------- Жизненный цикл --------------------------- */

export function isUnlocked(): boolean {
  return masterKeySession !== null;
}

export function requiresPassphrase(): boolean {
  return needsPassphrase;
}

/**
 * Тихая разблокировка без пароля, если возможно (своё устройство).
 * Возвращает false только если нужен ввод пароля (новое устройство).
 */
export async function ensureUnlockedSilently(): Promise<boolean> {
  if (isUnlocked()) return true;
  try {
    await initVault();
  } catch {
    return false;
  }
  return isUnlocked();
}

export async function initVault(): Promise<void> {
  const { aes: deviceAes } = await getDeviceSecretAndKey();
  const wrapped = await metaGet<SecretWrap>("masterKeyWrapped");

  if (!wrapped) {
    // Первый запуск (или предыдущая версия не смогла инициализироваться).
    await adoptMaster(randomBytes(32));
    const w = await aesEncrypt(deviceAes, masterBytes!);
    await metaPut("masterKeyWrapped", w);
    startAutoLockTimer();
    return;
  }

  if ((wrapped as { v?: number }).v !== 2) {
    // Легаси-формат первой версии (subtle.wrapKey non-extractable) никогда
    // не мог успешно создаться в браузерах — считаем хранилище пустым.
    console.warn("[vault] обнаружен несовместимый legacy-формат ключей — пересоздаём");
    await metaDelete("masterKeyWrapped");
    await metaDelete("masterKeyPass");
    await adoptMaster(randomBytes(32));
    const w = await aesEncrypt(deviceAes, masterBytes!);
    await metaPut("masterKeyWrapped", w);
    startAutoLockTimer();
    return;
  }

  try {
    const ms = await aesDecrypt(deviceAes, wrapped);
    await adoptMaster(ms);
  } catch {
    // deviceSecret перезаписан/повреждён — данные без пароля недоступны.
    needsPassphrase = true;
    return;
  }
  startAutoLockTimer();
}

export function lockVault(): void {
  masterKeySession = null;
  masterBytes = null;
  if (autoLockTimer) {
    clearTimeout(autoLockTimer);
    autoLockTimer = null;
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("vault:locked"));
  }
}

async function startAutoLockTimer(): Promise<void> {
  if (autoLockTimer) clearTimeout(autoLockTimer);
  const ms = await getAutoLockMs();
  if (ms > 0) {
    autoLockTimer = setTimeout(() => lockVault(), ms);
  }
}

export async function getAutoLockMs(): Promise<number> {
  const ms = await metaGet<number>(AUTO_LOCK_MS_KEY);
  return ms ?? 15 * 60 * 1000;
}

export async function setAutoLockMs(ms: number): Promise<void> {
  await metaPut(AUTO_LOCK_MS_KEY, ms);
  await startAutoLockTimer();
}

/* ------------------------- Шифрование записей ------------------------- */

export async function encryptJSON(obj: unknown): Promise<Envelope> {
  const key = assertUnlocked();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = buf(enc.encode(JSON.stringify(obj)));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data);
  return { v: 1, iv: toBase64Url(iv), ct: toBase64Url(buf(ct)) };
}

export async function decryptJSON<T = unknown>(
  env: Envelope | null | undefined
): Promise<T | null> {
  if (!env || env.v !== 1) return null;
  try {
    const key = assertUnlocked();
    const pt = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: fromBase64Url(env.iv) },
      key,
      fromBase64Url(env.ct)
    );
    return JSON.parse(new TextDecoder().decode(pt)) as T;
  } catch {
    return null;
  }
}

/* ------------------------------ Passphrase ------------------------------ */

export async function hasPassphrase(): Promise<boolean> {
  const rec = await metaGet<unknown>("masterKeyPass");
  return Boolean(rec);
}

export async function setPassphrase(passphrase: string): Promise<void> {
  if (!masterBytes) throw new LockedError();
  const salt = randomBytes(16);
  const kek = await deriveKek(passphrase, salt);
  const w = await aesEncrypt(kek, masterBytes);
  await metaPut("masterKeyPass", {
    ...w,
    salt: toBase64Url(salt),
    iterations: PBKDF2_ITERATIONS,
  });
}

export async function changePassphrase(oldP: string, newP: string): Promise<void> {
  if (!isUnlocked()) await unlockWithPassphrase(oldP);
  await metaDelete("masterKeyPass");
  await setPassphrase(newP);
}

export async function removePassphrase(): Promise<void> {
  await metaDelete("masterKeyPass");
}

export async function unlockWithPassphrase(passphrase: string): Promise<void> {
  const rec = await metaGet<SecretWrap & { salt: string; iterations: number }>("masterKeyPass");
  if (!rec) throw new Error("Пароль не задан — нечего разблокировать");

  const kek = await deriveKek(passphrase, fromBase64Url(rec.salt), rec.iterations);
  let ms: Uint8Array<ArrayBuffer>;
  try {
    ms = await aesDecrypt(kek, rec);
  } catch {
    throw new Error("Неверный пароль");
  }
  await adoptMaster(ms);

  // Если на этом устройстве ещё нет локальной обёртки — создаём,
  // чтобы дальше разблокировка была прозрачной.
  const local = await metaGet<SecretWrap>("masterKeyWrapped");
  if ((local as { v?: number } | undefined)?.v !== 2) {
    const { aes } = await getDeviceSecretAndKey();
    const w = await aesEncrypt(aes, masterBytes!);
    await metaPut("masterKeyWrapped", w);
  }
  startAutoLockTimer();
}

/* -------------------------- Backup / Restore -------------------------- */

export async function exportVaultBackup(): Promise<VaultBackup> {
  if (!masterBytes) throw new LockedError();

  const { aes: deviceAes } = await getDeviceSecretAndKey();
  const masterForDevice = await aesEncrypt(deviceAes, masterBytes);

  let masterForPass: VaultBackup["masterForPass"] = null;
  const passRec = await metaGet<SecretWrap & { salt: string; iterations: number }>("masterKeyPass");
  if (passRec && (passRec as { v?: number }).v === 2) {
    masterForPass = {
      iv: passRec.iv,
      ct: passRec.ct,
      salt: passRec.salt,
      iterations: passRec.iterations,
    };
  }

  const docs = await idbGetAll<{ enc: Envelope } & Record<string, unknown>>(STORE.docs);
  const tokens = await idbGetAll<{ providerId: string; enc: Envelope }>(STORE.tokens);

  return {
    version: 2,
    exportedAt: new Date().toISOString(),
    masterForDevice,
    masterForPass,
    documents: docs.map((d) => ({
      meta: { ...d, enc: undefined } as Record<string, unknown>,
      enc: d.enc,
    })),
    tokens: tokens.map((t) => ({ providerId: t.providerId, enc: t.enc })),
  };
}

export async function importVaultBackup(
  backup: VaultBackup,
  passphrase?: string
): Promise<void> {
  let ms: Uint8Array<ArrayBuffer> | null = null;

  if (backup.masterForPass && passphrase) {
    const kek = await deriveKek(passphrase, fromBase64Url(backup.masterForPass.salt), backup.masterForPass.iterations);
    const wrap: SecretWrap = {
      v: 2,
      iv: backup.masterForPass.iv,
      ct: backup.masterForPass.ct,
    };
    try {
      ms = await aesDecrypt(kek, wrap);
    } catch {
      throw new Error("Неверный пароль от бэкапа");
    }
  } else if (backup.masterForDevice) {
    // Восстановление на том же устройстве: пробуем локальный deviceSecret.
    try {
      const { aes } = await getDeviceSecretAndKey();
      ms = await aesDecrypt(aes, backup.masterForDevice);
    } catch {
      /* ниже — понятная ошибка */
    }
  }

  if (!ms) {
    throw new Error(
      "Не удалось восстановить: укажите пароль от бэкапа (или выполняйте восстановление на исходном устройстве)"
    );
  }

  await adoptMaster(ms);

  // Персистим обе обёртки: локальную (для тихой разблокировки) и парольную.
  const { aes: deviceAes } = await getDeviceSecretAndKey();
  await metaPut("masterKeyWrapped", await aesEncrypt(deviceAes, ms));
  if (backup.masterForPass) {
    await metaPut("masterKeyPass", { ...backup.masterForPass });
  }

  await idbClear(STORE.docs);
  await idbClear(STORE.tokens);
  for (const d of backup.documents) {
    await idbPut(STORE.docs, { ...(d.meta ?? {}), enc: d.enc });
  }
  for (const t of backup.tokens) {
    await idbPut(STORE.tokens, { providerId: t.providerId, enc: t.enc });
  }

  startAutoLockTimer();
}
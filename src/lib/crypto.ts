/* ------------------- Zero-Knowledge share (AES-256-GCM) ------------------- */
// URL-safe Base64 + Web Crypto: клиентские функции для приватного шаринга,
// где ciphertext (d) уходит в query, а ключ (k) — только в #фрагмент URL,
// который НИКОГДА не отправляется на сервер. Сервер (Supabase/Vercel) при
// таком шаринге не видит содержимого. Это снимает операторство 152-ФЗ по
// содержимому shared-данных и трансграничную передачу ПД.
//
// ВАЖНО: Web Crypto (crypto.subtle) доступен только в браузере и только в
// secure context (https:// или localhost). Эти функции вызываются исключительно
// из client-компонентов.

const enc = new TextEncoder();
const dec = new TextDecoder();

export function toBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function fromBase64Url(s: string): Uint8Array<ArrayBuffer> {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
  const bin = atob(b64 + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function randomBytes(n: number): Uint8Array<ArrayBuffer> {
  const a = new Uint8Array(n);
  crypto.getRandomValues(a);
  return a;
}

async function importRawKey(keyBytes: Uint8Array<ArrayBuffer>): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", keyBytes, { name: "AES-GCM" }, false, [
    "encrypt",
    "decrypt",
  ]);
}

const SHARE_PREFIX = "v2.";

export interface EncryptedShare {
  /** значение для query-параметра d= (ciphertext, не содержит ключ) */
  d: string;
  /** случайный ключ — кладётся ТОЛЬКО в #фрагмент URL, не уходит на сервер */
  k: string;
}

/**
 * Шифрует произвольный JSON-объект случайным 256-битным ключом.
 * Возвращает ciphertext (d) и ключ (k). Ключ НЕ включается в d.
 */
export async function encryptJsonForShare(obj: unknown): Promise<EncryptedShare> {
  if (typeof crypto === "undefined" || !crypto.subtle) {
    throw new Error("Web Crypto недоступен в этом окружении");
  }
  const keyBytes = randomBytes(32);
  const iv = randomBytes(12); // 96 бит — рекомендованный размер для GCM
  const key = await importRawKey(keyBytes);
  const data = new Uint8Array(enc.encode(JSON.stringify(obj)));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data);
  const ctBytes = new Uint8Array(ct);
  const d = SHARE_PREFIX + toBase64Url(iv) + "." + toBase64Url(ctBytes);
  const k = toBase64Url(keyBytes);
  return { d, k };
}

/**
 * Расшифровывает результат encryptJsonForShare. `k` — ключ из фрагмента URL.
 * Возвращает null при ошибке (неверный ключ / битые данные).
 */
export async function decryptJsonFromShare<T = unknown>(
  d: string,
  k: string
): Promise<T | null> {
  if (typeof crypto === "undefined" || !crypto.subtle) return null;
  if (!d.startsWith(SHARE_PREFIX)) return null;
  try {
    const rest = d.slice(SHARE_PREFIX.length);
    const [ivStr, ctStr] = rest.split(".");
    if (!ivStr || !ctStr) return null;
    const keyBytes = fromBase64Url(k);
    if (keyBytes.length !== 32) return null;
    const key = await importRawKey(keyBytes);
    const plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: fromBase64Url(ivStr) },
      key,
      fromBase64Url(ctStr)
    );
    return JSON.parse(dec.decode(plain)) as T;
  } catch {
    return null;
  }
}

export function isEncryptedShare(d: string | null): boolean {
  return !!d && d.startsWith(SHARE_PREFIX);
}
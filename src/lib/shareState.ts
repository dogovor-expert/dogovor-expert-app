import LZString from "lz-string";
import {
  encryptJsonForShare,
  decryptJsonFromShare,
  isEncryptedShare,
  type EncryptedShare,
} from "@/lib/crypto";

export { isEncryptedShare } from "@/lib/crypto";

/**
 * Кодирование состояния документа в URL-хэш/query для переноса между
 * устройствами (serverless share). Паттерн как в SharePad / ToolBox / Apollo
 * Studio / Miragon team-topologies: JSON -> lz-string (URL-safe) -> ссылка.
 *
 * Хэш не уходит на сервер (приватно) и не требует бэкенда/авторизации.
 *
 * ВНИМАНИЕ: legacy-путь (lz-string) НЕ шифрует содержимое — ПД в query
 * параметре видны серверу/прокси/логам. Для приватного шаринга используй
 * encodeShareStateV2 / decodeShareStateV2 (AES-256-GCM, ключ в #фрагменте).
 */
export const MAX_SHARE_LENGTH = 30000;

export interface SharePayload {
  values: Record<string, string>;
  signSeller?: string | null;
  signBuyer?: string | null;
}

export function encodeShareState(payload: SharePayload): string {
  const full = LZString.compressToEncodedURIComponent(
    JSON.stringify({
      v: 1,
      values: payload.values,
      s: payload.signSeller || undefined,
      b: payload.signBuyer || undefined,
    })
  );
  if (full.length <= MAX_SHARE_LENGTH) return full;
  // Тяжёлые подписи (dataURL) не влезают в лимит URL — шарим без них,
  // документ по-прежнему рабочий, просто без «живых» подписей.
  return LZString.compressToEncodedURIComponent(
    JSON.stringify({ v: 1, values: payload.values })
  );
}

export function decodeShareState(encoded: string | null): SharePayload | null {
  if (!encoded) return null;
  try {
    const json = LZString.decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    const parsed = JSON.parse(json) as {
      v?: number;
      values?: Record<string, string>;
      s?: string;
      b?: string;
    };
    if (!parsed || typeof parsed.values !== "object" || parsed.values === null) {
      return null;
    }
    return {
      values: parsed.values,
      signSeller: parsed.s ?? null,
      signBuyer: parsed.b ?? null,
    };
  } catch {
    return null;
  }
}

/* ----------------------------- Zero-Knowledge share ----------------------------- */

export interface EncryptedShareLink extends EncryptedShare {}

/**
 * Шифрует состояние документа (values + подписи) случайным ключом AES-256-GCM.
 * Ключ возвращается отдельно (k) и предназначен для размещения в URL-фрагменте
 * (#k=...), который браузер не отправляет на сервер. Сервер видит только
 * ciphertext (d), не содержащий ключа.
 */
export async function encodeShareStateV2(
  payload: SharePayload
): Promise<EncryptedShareLink> {
  const result = await encryptJsonForShare({
    v: 2,
    values: payload.values,
    s: payload.signSeller || undefined,
    b: payload.signBuyer || undefined,
  });
  return result;
}

/**
 * Расшифровывает v2-ссылку. `d` берётся из query (?d=), `k` — из фрагмента
 * (#k=). При ошибке/отсутствии ключа возвращает null (без утечки данных).
 */
export async function decodeShareStateV2(
  d: string | null,
  k: string | null
): Promise<SharePayload | null> {
  if (!d || !k || !isEncryptedShare(d)) return null;
  try {
    const parsed = await decryptJsonFromShare<{
      v?: number;
      values?: Record<string, string>;
      s?: string;
      b?: string;
    }>(d, k);
    if (!parsed || typeof parsed.values !== "object" || parsed.values === null) {
      return null;
    }
    return {
      values: parsed.values,
      signSeller: parsed.s ?? null,
      signBuyer: parsed.b ?? null,
    };
  } catch {
    return null;
  }
}

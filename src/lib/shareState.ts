import LZString from "lz-string";

/**
 * Кодирование состояния документа в URL-хэш/query для переноса между
 * устройствами (serverless share). Паттерн как в SharePad / ToolBox / Apollo
 * Studio / Miragon team-topologies: JSON -> lz-string (URL-safe) -> ссылка.
 *
 * Хэш не уходит на сервер (приватно) и не требует бэкенда/авторизации.
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

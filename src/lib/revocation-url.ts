// Защита URL-источников отзыва (OCSP/CRL) от SSRF и небезопасных схем.
//
// Источники отзыва приходят из непроверенных данных сертификата (AIA / CRL
// Distribution Point). Если передать их в fetch без проверки, злоумышленник
// может заставить сервер сходить на внутренние адреса (SSRF) или загрузить
// ответ по plaintext http:// (MITM → подмена статуса отзыва).
//
// Правила:
//   - только https:// (никакого http://, ftp://, file:// и т.п.);
//   - запрет loopback / приватных / link-local / внутренних имён;
//   - опционально — ограничение на список разрешённых хостов (allowlist).

export interface SafeUrlOptions {
  /** Разрешённые хосты (точное совпадение или суффикс ".example.com"). Если задан — всё остальное запрещено. */
  allowedHosts?: readonly string[];
  /** Разрешить http:// (только для локальной разработки/тестов). По умолчанию false. */
  allowInsecure?: boolean;
}

const BLOCKED_HOST_SUFFIXES = [".local", ".internal", ".localhost", ".home", ".lan"];

function parseIpv4(host: string): number[] | null {
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host);
  if (!m) return null;
  const parts = m.slice(1).map((s) => Number(s));
  if (parts.some((n) => n < 0 || n > 255)) return null;
  return parts;
}

/** Приватные / loopback / link-local / multicast диапазоны IPv4. */
function isPrivateIpv4(host: string): boolean {
  const p = parseIpv4(host);
  if (!p) return false;
  const [a, b] = p;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 0) return true;
  if (a === 169 && b === 254) return true; // link-local
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
  if (a >= 224) return true; // multicast / reserved
  return false;
}

/** Приватные / loopback / link-local IPv6. */
function isPrivateIpv6(host: string): boolean {
  const h = host.replace(/^\[|\]$/g, "").toLowerCase();
  if (!h.includes(":")) return false;
  if (h === "::1" || h === "::") return true;
  if (h.startsWith("fc") || h.startsWith("fd")) return true; // unique local
  if (h.startsWith("fe8") || h.startsWith("fe9") || h.startsWith("fea") || h.startsWith("feb")) return true; // link-local
  if (h.startsWith("::ffff:")) return isPrivateIpv4(h.slice(7));
  return false;
}

/**
 * Проверяет, что URL безопасен для серверного запроса.
 * Бросает Error с коротким кодом (для логирования/деталей), либо возвращает URL.
 */
export function assertSafeRevocationUrl(rawUrl: string, options: SafeUrlOptions = {}): URL {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error("invalid_url");
  }

  const protocol = url.protocol.toLowerCase();
  if (protocol !== "https:" && !(options.allowInsecure && protocol === "http:")) {
    throw new Error("insecure_scheme");
  }

  const host = url.hostname.toLowerCase();
  if (!host) throw new Error("missing_host");
  if (host === "localhost" || BLOCKED_HOST_SUFFIXES.some((s) => host.endsWith(s))) {
    throw new Error("blocked_host");
  }
  if (isPrivateIpv4(host) || isPrivateIpv6(host)) {
    throw new Error("blocked_host");
  }

  if (options.allowedHosts && options.allowedHosts.length > 0) {
    const allowed = options.allowedHosts.some((h) => host === h.toLowerCase() || host.endsWith(`.${h.toLowerCase()}`));
    if (!allowed) throw new Error("host_not_allowed");
  }

  return url;
}

/** Максимальный размер ответа источника отзыва (защита от DoS/переполнения памяти). */
export const MAX_REVOCATION_RESPONSE_BYTES = 5 * 1024 * 1024;

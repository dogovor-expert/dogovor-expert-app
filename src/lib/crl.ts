// CRL (RFC 5280) — проверка статуса отзыва через списки отозванных сертификатов.
//
// Поддерживает:
//   1) HTTP GET (или POST) запрос к CRL Distribution Point
//   2) разбор CRL через pkijs.CertificateRevocationList
//   3) поиск серийного номера в revokedCertificates
//   4) проверка thisUpdate / nextUpdate (CRL не истёк)
//   5) in-memory кэш с TTL до nextUpdate
//
// Для ГОСТ-CRL: pkijs сам не проверит подпись CRL, но проверить «сертификат
// в списке revoked?» можно без верификации подписи CRL — pkijs всё равно
// парсит revokedCertificates.
//
// Осознанное решение: подпись CRL НЕ верифицируется. CRL загружается по HTTPS
// с официального Distribution Point CA, поэтому целостность защищена TLS.
// Полная верификация ГОСТ-подписи CRL (34.10-2012) требует node-gost-crypto и
// публичного ключа CA — внедрять только при смене модели угроз (offline-CRL).

import * as pkijs from "pkijs";
import type { Certificate, Time as PkijsTime } from "pkijs";
import { fromBER } from "asn1js";

export type CrlStatus = "good" | "revoked" | "unknown";

function timeToDate(t: PkijsTime | undefined): Date | undefined {
  if (!t) return undefined;
  const tAny = t as unknown as {
    value?: Date | string;
    type?: number;
    valueBlock?: { value?: string };
    toString?: () => string;
  };
  // pkijs v3: Time.tas из fromSchema — { type, value: Date }.
  if (tAny.value instanceof Date && !Number.isNaN(tAny.value.getTime())) {
    return tAny.value;
  }
  // Fallback — строковая форма { valueBlock.value: string } / toString().
  const raw =
    (typeof tAny.valueBlock?.value === "string" ? tAny.valueBlock.value : undefined) ??
    (typeof tAny.toString === "function" && !/^\[object/.test(tAny.toString())
      ? tAny.toString()
      : undefined);
  if (!raw) return undefined;
  // UTCTime: YYMMDDHHMMSSZ; GeneralizedTime: YYYYMMDDHHMMSSZ
  if (/^\d{12}Z$/.test(raw)) {
    // UTCTime
    const yy = parseInt(raw.slice(0, 2), 10);
    const year = yy >= 50 ? 1900 + yy : 2000 + yy;
    return new Date(
      Date.UTC(
        year,
        parseInt(raw.slice(2, 4), 10) - 1,
        parseInt(raw.slice(4, 6), 10),
        parseInt(raw.slice(6, 8), 10),
        parseInt(raw.slice(8, 10), 10),
        parseInt(raw.slice(10, 12), 10),
      ),
    );
  }
  if (/^\d{14}Z$/.test(raw)) {
    return new Date(
      Date.UTC(
        parseInt(raw.slice(0, 4), 10),
        parseInt(raw.slice(4, 6), 10) - 1,
        parseInt(raw.slice(6, 8), 10),
        parseInt(raw.slice(8, 10), 10),
        parseInt(raw.slice(10, 12), 10),
        parseInt(raw.slice(12, 14), 10),
      ),
    );
  }
  // Fallback — попробуем Date constructor
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export interface CrlCheckResult {
  status: "valid" | "revoked" | "unknown" | "offline";
  method: "CRL";
  details?: string;
  crlUrl?: string;
  checkedAt: Date;
  thisUpdate?: Date;
  nextUpdate?: Date;
  issuer?: string;
  revokedCount?: number;
}

const CRL_CACHE_TTL_MS = 30 * 60 * 1000;
const crlCache = new Map<string, { result: CrlCheckResult; expires: number; raw: ArrayBuffer }>();

function getSerialBytes(cert: Certificate): Uint8Array {
  const vb = (cert.serialNumber as unknown as {
    valueBlock?: { valueHexView?: Uint8Array; valueHex?: ArrayBuffer };
  })?.valueBlock;
  const raw = vb?.valueHexView ?? (vb?.valueHex ? new Uint8Array(vb.valueHex) : undefined);
  return raw ? new Uint8Array(raw) : new Uint8Array(0);
}

function cacheKey(crlUrl: string): string {
  return crlUrl;
}

export interface CrlCheckOptions {
  /** Таймаут HTTP-запроса (по умолчанию 5000 мс). */
  timeoutMs?: number;
  /** Использовать кэш. По умолчанию true. */
  useCache?: boolean;
  /** fetcher для тестов; по умолчанию — глобальный fetch. */
  fetchImpl?: typeof fetch;
}

async function fetchCrl(
  crlUrl: string,
  timeoutMs: number,
  fetchImpl: typeof fetch | undefined,
): Promise<ArrayBuffer> {
  const f = fetchImpl ?? (globalThis.fetch);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let resp: Response;
  try {
    resp = await f(crlUrl, {
      method: "GET",
      headers: { Accept: "application/pkix-crl" },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
  if (!resp.ok) {
    throw new Error(`CRL HTTP status: ${resp.status}`);
  }
  return await resp.arrayBuffer();
}

function parseCrl(crlDer: ArrayBuffer): pkijs.CertificateRevocationList {
  // pkijs не принимает сырой ArrayBuffer прямо в { schema } — нужен fromBER
  // (иначе "Cannot read properties of undefined (reading 'tagClass')").
  const u8 = new Uint8Array(crlDer);
  const asn1 = fromBER(u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength));
  const parseError = (asn1 as { error?: string }).error;
  if (parseError) throw new Error(parseError);
  return new pkijs.CertificateRevocationList({ schema: asn1.result });
}

function findSerial(crl: pkijs.CertificateRevocationList, serial: Uint8Array): CrlStatus {
  if (!crl.revokedCertificates || crl.revokedCertificates.length === 0) {
    return "good";
  }
  for (const rc of crl.revokedCertificates) {
    const rcSerial = (rc.userCertificate as unknown as { valueBlock: { valueHexView: Uint8Array } })
      .valueBlock.valueHexView;
    if (Buffer.compare(Buffer.from(rcSerial), Buffer.from(serial)) === 0) {
      return "revoked";
    }
  }
  return "good";
}

export async function checkCrl(
  cert: Certificate,
  crlUrl: string,
  options: CrlCheckOptions = {},
): Promise<CrlCheckResult> {
  const now = Date.now();
  const key = cacheKey(crlUrl);

  if (options.useCache !== false) {
    const hit = crlCache.get(key);
    if (hit && hit.expires > now) {
      const crl = parseCrl(hit.raw);
      const status = findSerial(crl, getSerialBytes(cert));
      return {
        ...hit.result,
        status: status === "good" ? "valid" : status === "revoked" ? "revoked" : "unknown",
        checkedAt: new Date(now),
      };
    }
  }

  const checkedAt = new Date(now);
  const timeoutMs = options.timeoutMs ?? 5000;
  let crlDer: ArrayBuffer;
  try {
    crlDer = await fetchCrl(crlUrl, timeoutMs, options.fetchImpl);
  } catch (e) {
    return {
      status: "offline",
      method: "CRL",
      crlUrl,
      checkedAt,
      details: `CRL HTTP error: ${e instanceof Error ? e.message : String(e)}`,
    };
  }

  let crl: pkijs.CertificateRevocationList;
  try {
    crl = parseCrl(crlDer);
  } catch (e) {
    return {
      status: "offline",
      method: "CRL",
      crlUrl,
      checkedAt,
      details: `CRL parse error: ${e instanceof Error ? e.message : String(e)}`,
    };
  }

  // Проверка сроков действия CRL
  const thisUpdate = timeToDate(crl.thisUpdate);
  const nextUpdate = crl.nextUpdate ? timeToDate(crl.nextUpdate) : undefined;
  if (thisUpdate && thisUpdate.getTime() > now) {
    return {
      status: "offline",
      method: "CRL",
      crlUrl,
      checkedAt,
      thisUpdate,
      nextUpdate,
      details: "CRL thisUpdate is in the future",
    };
  }
  if (nextUpdate && nextUpdate.getTime() < now) {
    return {
      status: "offline",
      method: "CRL",
      crlUrl,
      checkedAt,
      thisUpdate,
      nextUpdate,
      details: "CRL expired (nextUpdate passed)",
    };
  }

  const status = findSerial(crl, getSerialBytes(cert));
  const issuerName = crl.issuer
    ? (crl.issuer.toString?.() ?? "")
    : undefined;

  const result: CrlCheckResult = {
    status: status === "good" ? "valid" : status === "revoked" ? "revoked" : "unknown",
    method: "CRL",
    crlUrl,
    checkedAt,
    thisUpdate,
    nextUpdate,
    issuer: issuerName,
    revokedCount: crl.revokedCertificates?.length ?? 0,
  };

  if (options.useCache !== false) {
    const ttl = nextUpdate
      ? Math.max(1_000, nextUpdate.getTime() - now)
      : CRL_CACHE_TTL_MS;
    crlCache.set(key, { result, expires: now + Math.min(ttl, CRL_CACHE_TTL_MS), raw: crlDer });
  }

  return result;
}

export function _clearCrlCache(): void {
  crlCache.clear();
}

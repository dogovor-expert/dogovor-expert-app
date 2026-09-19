// OCSP (RFC 6960) — проверка статуса отзыва сертификата.
//
// Поддерживает:
//   1) построение OCSPRequest через pkijs (createForCertificate)
//   2) HTTP POST запрос к OCSP-серверу (Content-Type: application/ocsp-request)
//   3) разбор OCSPResponse (responseStatus + BasicOCSPResponse)
//   4) определение статуса good / revoked / unknown по SingleResponse
//   5) in-memory кэш (TTL ограничен nextUpdate и максимум 10 минутами)
//
// Использует pkijs (CertID, OCSPRequest, OCSPResponse, BasicOCSPResponse)
// и asn1js для низкоуровневого парсинга issuerKeyHash / issuerNameHash.

import * as pkijs from "pkijs";
import type { Certificate } from "pkijs";
import { fromBER } from "asn1js";
import { assertSafeRevocationUrl, MAX_REVOCATION_RESPONSE_BYTES } from "@/lib/revocation-url";

export type OcspStatus = "good" | "revoked" | "unknown";

export interface OcspCheckResult {
  status: "valid" | "revoked" | "unknown" | "offline";
  method: "OCSP";
  details?: string;
  ocspUrl?: string;
  checkedAt: Date;
  producedAt?: Date;
  thisUpdate?: Date;
  nextUpdate?: Date;
  /** Подпись BasicOCSPResponse проверена (для ГОСТ — false, fail-closed). */
  signatureVerified?: boolean;
}

// Кэш результатов: ключ — SHA-256 от (ocspUrl|issuerNameHash|issuerKeyHash|serial|issuerKey)
// Время жизни — до nextUpdate, но не больше OCSP_CACHE_TTL_MS.
const OCSP_CACHE_TTL_MS = 10 * 60 * 1000;
const ocspCache = new Map<string, { result: OcspCheckResult; expires: number }>();

function getSerialBytes(cert: Certificate): Uint8Array {
  const vb = (cert.serialNumber as unknown as {
    valueBlock?: { valueHexView?: Uint8Array; valueHex?: ArrayBuffer };
  })?.valueBlock;
  const raw = vb?.valueHexView ?? (vb?.valueHex ? new Uint8Array(vb.valueHex) : undefined);
  return raw ? new Uint8Array(raw) : new Uint8Array(0);
}

function bytesToHex(u8: Uint8Array): string {
  return Buffer.from(u8).toString("hex");
}

function cacheKey(cert: Certificate, issuerCert: Certificate | null, ocspUrl: string): string {
  // Ключу кэша достаточно уникальности, криптостойкость не нужна —
  // берём hex DER имени издателя напрямую (изоморфно, без node:crypto).
  const issuerNameHex = bytesToHex(new Uint8Array(cert.issuer.toSchema().toBER(false)));
  const issuerKeyHex = issuerCert
    ? bytesToHex(
        (issuerCert.subjectPublicKeyInfo.subjectPublicKey as unknown as {
          valueBlock: { valueHexView: Uint8Array };
        }).valueBlock.valueHexView,
      )
    : "noissuer";
  return `${ocspUrl}|${bytesToHex(getSerialBytes(cert))}|${issuerNameHex}|${issuerKeyHex}`;
}

export interface OcspCheckOptions {
  /** Таймаут HTTP-запроса (по умолчанию 4000 мс). */
  timeoutMs?: number;
  /** Издательский сертификат (для issuerKeyHash). Если не указан — issuerKeyHash будет нулями. */
  issuerCert?: Certificate | null;
  /** Использовать кэш. По умолчанию true. */
  useCache?: boolean;
  /** fetcher для тестов; по умолчанию — глобальный fetch. */
  fetchImpl?: typeof fetch;
  /** Пропустить проверку подписи ответа (только для юнит-тестов разбора). */
  skipSignatureCheck?: boolean;
  /** Разрешить http:// (только тесты/локальная разработка). */
  allowInsecure?: boolean;
}

/** Проверка подписи BasicOCSPResponse (best-effort; ГОСТ → false). */
async function verifyOcspSignature(
  basic: pkijs.BasicOCSPResponse,
  issuerCert: Certificate | null | undefined,
): Promise<boolean> {
  try {
    const embedded = basic.certs ?? [];
    const signer = issuerCert ?? embedded[0];
    if (!signer) return false;
    const ok = await basic.verify({ trustedCerts: [signer] });
    return ok === true;
  } catch {
    // ГОСТ-алгоритмы не поддержаны WebCrypto — подпись проверить нельзя.
    return false;
  }
}

export async function buildOcspRequestDer(
  cert: Certificate,
  issuerCert: Certificate | null,
): Promise<ArrayBuffer> {
  const ocspReq = new pkijs.OCSPRequest();
  if (issuerCert) {
    await ocspReq.createForCertificate(cert, {
      hashAlgorithm: "SHA-256",
      issuerCertificate: issuerCert,
    });
  } else {
    // Без issuer — собираем минимальный запрос вручную (SHA-1 по RFC 6960 через WebCrypto).
    const issuerDer = cert.issuer.toSchema().toBER(false);
    const issuerNameHash = new Uint8Array(await globalThis.crypto.subtle.digest("SHA-1", issuerDer));
    const serial = getSerialBytes(cert);
    const certId = new pkijs.CertID();
    (certId as unknown as { issuerNameHash: unknown }).issuerNameHash =
      new (await import("asn1js")).OctetString({ valueHex: issuerNameHash });
    (certId as unknown as { issuerKeyHash: unknown }).issuerKeyHash =
      new (await import("asn1js")).OctetString({ valueHex: new Uint8Array(20) });
    (certId as unknown as { serialNumber: unknown }).serialNumber =
      new (await import("asn1js")).Integer({ valueHex: serial });
    (certId as unknown as { hashAlgorithm: unknown }).hashAlgorithm = new pkijs.AlgorithmIdentifier({
      algorithmId: "1.3.14.3.2.26",
    });
    const tbs = new pkijs.Request();
    (tbs as unknown as { reqCert: unknown }).reqCert = certId;
    (ocspReq as unknown as { tbsRequest: { requestList: unknown[] } }).tbsRequest.requestList = [tbs];
  }
  // Добавляем nonce для защиты от replay-атак (RFC 8954).
  const nonce = globalThis.crypto.getRandomValues(new Uint8Array(16));
  (ocspReq as unknown as { tbsRequest: { requestExtensions?: pkijs.Extension[] } }).tbsRequest.requestExtensions = [
    new pkijs.Extension({
      extnID: "1.3.6.1.5.5.7.48.1.2", // id-pkix-ocsp-nonce
      extnValue: new (await import("asn1js")).OctetString({ valueHex: nonce }).toBER(),
    }),
  ];
  return (ocspReq as unknown as { toSchema: (b: boolean) => { toBER: (b: boolean) => ArrayBuffer } })
    .toSchema(true)
    .toBER(false);
}

function fromResponseData(resp: pkijs.BasicOCSPResponse, serial: Uint8Array): OcspStatus {
  for (const sr of resp.tbsResponseData.responses) {
    const srSerial = (sr.certID.serialNumber as unknown as { valueBlock: { valueHexView: Uint8Array } })
      .valueBlock.valueHexView;
    if (Buffer.compare(Buffer.from(srSerial), Buffer.from(serial)) === 0) {
      const cs = sr.certStatus as unknown as {
        status?: number;
        idBlock?: { tagNumber?: number; isConstructed?: boolean; tagClass?: number };
      };
      // Совместимость: ряд сборок pkijs кладёт в certStatus готовое число .status.
      if (typeof cs?.status === "number") {
        if (cs.status === 0) return "good";
        if (cs.status === 1) return "revoked";
        return "unknown";
      }
      // pkijs декодирует certStatus как ASN.1-блок CHOICE:
      //   [0] good   — primitive, tagNumber 0
      //   [1] revoked — constructed, tagNumber 1
      //   [2] unknown — primitive, tagNumber 2
      // (тот же разбор, что в pkijs CertificateRevocationList.getCertificateStatus)
      const tag = cs?.idBlock?.tagNumber;
      if (tag === 0) return "good";
      if (tag === 1) return "revoked";
      if (tag === 2) return "unknown";
      return "unknown";
    }
  }
  return "unknown";
}

export async function checkOcsp(
  cert: Certificate,
  ocspUrl: string,
  options: OcspCheckOptions = {},
): Promise<OcspCheckResult> {
  const now = Date.now();
  const issuer = options.issuerCert ?? null;
  const key = cacheKey(cert, issuer, ocspUrl);

  if (options.useCache !== false) {
    const hit = ocspCache.get(key);
    if (hit && hit.expires > now) {
      return hit.result;
    }
  }

  const checkedAt = new Date(now);

  // SSRF/HTTPS-guard: отклоняем небезопасные схемы и внутренние адреса.
  let safeUrl: URL;
  try {
    safeUrl = assertSafeRevocationUrl(ocspUrl, { allowInsecure: options.allowInsecure === true });
  } catch (e) {
    return {
      status: "offline",
      method: "OCSP",
      ocspUrl,
      checkedAt,
      details: `OCSP URL rejected: ${e instanceof Error ? e.message : String(e)}`,
    };
  }

  const reqDer = await buildOcspRequestDer(cert, issuer);
  const reqBase64 = Buffer.from(reqDer).toString("base64");

  const timeoutMs = options.timeoutMs ?? 4000;
  const f = options.fetchImpl ?? (globalThis.fetch);
  let resp: Response;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    resp = await f(safeUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/ocsp-request",
        Accept: "application/ocsp-response",
      },
      body: reqBase64,
      redirect: "error",
      signal: controller.signal,
    });
    clearTimeout(timer);
  } catch (e) {
    return {
      status: "offline",
      method: "OCSP",
      ocspUrl,
      checkedAt,
      details: `OCSP HTTP error: ${e instanceof Error ? e.message : String(e)}`,
    };
  }

  if (!resp.ok) {
    return {
      status: "offline",
      method: "OCSP",
      ocspUrl,
      checkedAt,
      details: `OCSP HTTP status: ${resp.status}`,
    };
  }

  const respBody = new Uint8Array(await resp.arrayBuffer());
  if (respBody.byteLength > MAX_REVOCATION_RESPONSE_BYTES) {
    return {
      status: "offline",
      method: "OCSP",
      ocspUrl,
      checkedAt,
      details: "OCSP response too large",
    };
  }
  let ocspResponse: pkijs.OCSPResponse;
  try {
    const respAsn1 = fromBER(
      respBody.buffer.slice(respBody.byteOffset, respBody.byteOffset + respBody.byteLength),
    );
    const parseError = (respAsn1 as { error?: string }).error;
    if (parseError) throw new Error(parseError);
    ocspResponse = new pkijs.OCSPResponse({ schema: respAsn1.result });
  } catch (e) {
    return {
      status: "offline",
      method: "OCSP",
      ocspUrl,
      checkedAt,
      details: `OCSP response parse error: ${e instanceof Error ? e.message : String(e)}`,
    };
  }

  const respStatusRaw = ocspResponse.responseStatus as unknown as {
    valueDec?: number;
    value?: number;
    valueBlock?: { valueDec?: number };
    toString?: () => string;
  };
  const respStatus =
    typeof respStatusRaw === "number"
      ? respStatusRaw
      : (respStatusRaw?.valueDec ?? respStatusRaw?.valueBlock?.valueDec ?? respStatusRaw?.value ?? Number.NaN);
  if (respStatus !== 0) {
    return {
      status: "offline",
      method: "OCSP",
      ocspUrl,
      checkedAt,
      details: `OCSP responseStatus=${respStatusRaw?.toString?.() ?? respStatus}`,
    };
  }
  if (!ocspResponse.responseBytes) {
    return {
      status: "offline",
      method: "OCSP",
      ocspUrl,
      checkedAt,
      details: "OCSP response missing responseBytes",
    };
  }

  const respBytes = (ocspResponse.responseBytes.response as unknown as {
    valueBlock: { valueHexView: Uint8Array };
  }).valueBlock.valueHexView;
  let basic: pkijs.BasicOCSPResponse;
  try {
    const basicAsn1 = fromBER(
      respBytes.buffer.slice(respBytes.byteOffset, respBytes.byteOffset + respBytes.byteLength) as ArrayBuffer,
    );
    const parseError = (basicAsn1 as { error?: string }).error;
    if (parseError) throw new Error(parseError);
    basic = new pkijs.BasicOCSPResponse({ schema: basicAsn1.result });
  } catch (e) {
    return {
      status: "offline",
      method: "OCSP",
      ocspUrl,
      checkedAt,
      details: `OCSP BasicOCSPResponse parse error: ${e instanceof Error ? e.message : String(e)}`,
    };
  }

  const serial = getSerialBytes(cert);
  const status = fromResponseData(basic, serial);
  const singleResp = basic.tbsResponseData.responses[0];

  // Fail-closed: без проверенной подписи ответа статус "valid" не принимаем.
  const signatureVerified = options.skipSignatureCheck
    ? true
    : await verifyOcspSignature(basic, issuer);
  let mappedStatus: OcspCheckResult["status"] =
    status === "good" ? "valid" : status === "revoked" ? "revoked" : "unknown";
  if (mappedStatus === "valid" && !signatureVerified) {
    mappedStatus = "unknown";
  }

  const result: OcspCheckResult = {
    status: mappedStatus,
    method: "OCSP",
    ocspUrl,
    checkedAt,
    producedAt: basic.tbsResponseData.producedAt,
    thisUpdate: singleResp?.thisUpdate,
    nextUpdate: singleResp?.nextUpdate,
    signatureVerified,
    details: signatureVerified
      ? undefined
      : "OCSP signature not verified (algorithm unsupported or invalid) — status not trusted",
  };

  if (options.useCache !== false) {
    const ttl = result.nextUpdate
      ? Math.max(1_000, result.nextUpdate.getTime() - now)
      : OCSP_CACHE_TTL_MS;
    ocspCache.set(key, { result, expires: now + Math.min(ttl, OCSP_CACHE_TTL_MS) });
  }

  return result;
}

// Тестовая утилита — очистить кэш (для юнит-тестов).
export function _clearOcspCache(): void {
  ocspCache.clear();
}

// Помощник: создать OCSPRequest в base64 (для тестов и логирования).
export async function buildOcspRequestBase64(
  cert: Certificate,
  issuer: Certificate | null,
): Promise<string> {
  return Buffer.from(await buildOcspRequestDer(cert, issuer)).toString("base64");
}

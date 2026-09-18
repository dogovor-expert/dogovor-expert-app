import * as pkijs from "pkijs";
import type * as asn1js from "asn1js";
import { gostCrypto } from "node-gost-crypto";
import { getTrustedRoots, type TrustedRoot } from "@/lib/trusted-roots";
import { parseSubject, parseIssuer, getValidity, getExtensions, getThumbprints, isQualifiedCertificate, type ParsedSubject } from "@/lib/cert-parser";
import { checkOcsp } from "@/lib/ocsp";
import { checkCrl } from "@/lib/crl";

export interface SignerInfo {
  thumbprintSha1: string;
  thumbprintSha256: string;
  subject: ParsedSubject;
  issuer: ParsedSubject;
  validFrom: Date;
  validTo: Date;
  keyUsage: string[];
  extKeyUsage: string[];
  isQualified: boolean;
  serialNumber?: string;
  signingTime?: Date;
}

export interface ChainCert {
  subject: ParsedSubject;
  issuer: ParsedSubject;
  validFrom: Date;
  validTo: Date;
  thumbprintSha1: string;
  thumbprintSha256: string;
  isRoot: boolean;
  isTrustedRoot: boolean;
  extensions: ReturnType<typeof getExtensions>;
}

export interface RevocationInfo {
  status: "valid" | "revoked" | "unknown" | "offline";
  checkedAt: Date;
  method: "CRL" | "OCSP" | "none";
  details?: string;
}

export interface TimestampInfo {
  present: boolean;
  time?: Date;
  tsaUrl?: string;
  valid?: boolean;
  signer?: ParsedSubject;
  /** TICKET-4: результат криптоверификации штампа RFC 3161. */
  status?: "valid" | "invalid" | "unknown_offline";
  genTime?: Date;
  tsaSubject?: ParsedSubject;
  chainOk?: boolean;
  details?: string;
}

export interface IntegrityInfo {
  hashMatch: boolean;
  algorithm:
    | "GOST R 34.11-2012-256"
    | "GOST R 34.11-2012-512"
    | "GOST R 34.11-94"
    | "SHA-256"
    | "SHA-384"
    | "SHA-512"
    | "unknown";
  messageDigestHex: string;
  computedDigestHex: string;
}

export interface PAdESVerificationResult {
  valid: boolean;
  cryptoVerified: boolean;
  chainValid: boolean;
  errors: string[];
  warnings: string[];
  signer: SignerInfo | null;
  chain: ChainCert[];
  revocation: RevocationInfo;
  timestamp: TimestampInfo;
  integrity: IntegrityInfo;
}

function hexToUint8(hex: string): Uint8Array {
  const clean = hex.replace(/\s/g, "");
  if (clean.length % 2 !== 0) throw new Error("Invalid hex length");
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < clean.length; i += 2) {
    bytes[i / 2] = parseInt(clean.substr(i, 2), 16);
  }
  return bytes;
}

function fail(msg: string, errors: string[]): PAdESVerificationResult {
  errors.push(msg);
  return {
    valid: false,
    cryptoVerified: false,
    chainValid: false,
    errors,
    warnings: [],
    signer: null,
    chain: [],
    revocation: { status: "unknown", checkedAt: new Date(), method: "none" },
    timestamp: { present: false },
    integrity: { hashMatch: false, algorithm: "unknown", messageDigestHex: "", computedDigestHex: "" },
  };
}

export async function computeHash(algorithm: string, data: Uint8Array): Promise<string> {
  const gostAlgorithm = algorithm.startsWith("GOST R 34.11-");
  const cryptoImpl = gostAlgorithm ? gostCrypto.subtle : crypto.subtle;
  const input = new Uint8Array(data);
  const hashBuf = await cryptoImpl.digest(algorithm, input);
  return Buffer.from(hashBuf).toString("hex");
}

export type KnownHashAlgorithm = NonNullable<IntegrityInfo["algorithm"]>;

export function mapHashOidToAlgorithm(oid: string): { algorithm: KnownHashAlgorithm; isGost: boolean } {
  if (oid === "1.2.643.7.1.1.2.2") return { algorithm: "GOST R 34.11-2012-256", isGost: true };
  if (oid === "1.2.643.7.1.1.2.3") return { algorithm: "GOST R 34.11-2012-512", isGost: true };
  if (oid === "1.2.643.2.2.19") return { algorithm: "GOST R 34.11-94", isGost: true };
  if (oid === "2.16.840.1.101.3.4.2.1") return { algorithm: "SHA-256", isGost: false };
  if (oid === "2.16.840.1.101.3.4.2.2") return { algorithm: "SHA-384", isGost: false };
  if (oid === "2.16.840.1.101.3.4.2.3") return { algorithm: "SHA-512", isGost: false };
  return { algorithm: "unknown", isGost: false };
}

// Обрезает буфер до длины, заявленной в DER-заголовке SEQUENCE (0x30 ...).
// Нули после конца структуры — это zero-padding /Contents зарезервированного окна.
function truncateDerToLength(bytes: Uint8Array): Uint8Array {
  if (bytes.length < 2 || bytes[0] !== 0x30) return bytes;
  const first = bytes[1];
  if (first < 0x80) return bytes.subarray(0, Math.min(2 + first, bytes.length));
  const lenBytes = first & 0x7f;
  if (lenBytes === 0 || lenBytes > 4 || bytes.length < 2 + lenBytes) return bytes;
  let len = 0;
  for (let i = 0; i < lenBytes; i++) len = len * 256 + bytes[2 + i];
  return bytes.subarray(0, Math.min(2 + lenBytes + len, bytes.length));
}

interface PkijsAttribute {
  attrId: string;
  attrValues: asn1js.AsnType[];
}

function getSignedAttrValue(attrs: unknown, oid: string): asn1js.AsnType | undefined {
  if (!attrs) return undefined;
  const attrsObj = attrs as { attributes?: PkijsAttribute[]; array?: PkijsAttribute[] };
  const list = attrsObj.attributes ?? attrsObj.array;
  if (!list) return undefined;
  for (const attr of list) {
    const attrId = (attr as { attrId?: string; type?: unknown }).attrId ?? String((attr as { type?: unknown }).type);
    if (attrId === oid) {
      const values = (attr as { attrValues?: unknown[]; values?: unknown[] }).attrValues ??
        (attr as { values?: unknown[] }).values;
      if (values && values.length > 0) {
        return values[0] as asn1js.AsnType;
      }
    }
  }
  return undefined;
}

// ─────────────────────────────────────────────────────────────────────────
// TICKET-4: криптографическая верификация TSA-штампа (RFC 3161 TimeStampToken).
// Статусы: valid / invalid (целостность под вопросом → понижает вердикт) /
// unknown_offline (нет доверенных корней/сбой сети → только warning).
// ─────────────────────────────────────────────────────────────────────────

export interface TsaVerifyOutcome {
  status: "valid" | "invalid" | "unknown_offline";
  genTime?: Date;
  tsaSubject?: ParsedSubject;
  chainOk?: boolean;
  details?: string;
}

const TST_INFO_OID = "1.2.840.113549.1.9.16.1.4";
const EKU_TIMESTAMPING = "1.3.6.1.5.5.7.3.8";

function toAbs(buf: Uint8Array): ArrayBuffer {
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
}

function bytesToHex(buf: ArrayBufferLike | Uint8Array): string {
  return Buffer.from(buf as Uint8Array).toString("hex").toLowerCase();
}

export async function verifyTsaTimestamp(
  tokenValue: asn1js.AsnType,
  signerSignature: Uint8Array,
): Promise<TsaVerifyOutcome> {
  let tokenDer: ArrayBuffer;
  try {
    tokenDer = tokenValue.toBER(false);
  } catch (e) {
    return { status: "invalid", details: `TSA token re-encode failed: ${e instanceof Error ? e.message : e}` };
  }

  // 1) Структура: ContentInfo(signedData) → SignedData → TSTInfo.
  let signedData: pkijs.SignedData;
  let tst: pkijs.TSTInfo;
  try {
    const ci = pkijs.ContentInfo.fromBER(tokenDer);
    if (ci.contentType !== pkijs.ContentInfo.SIGNED_DATA) {
      return { status: "invalid", details: `TSA token is not SignedData (${ci.contentType})` };
    }
    signedData = new pkijs.SignedData({ schema: ci.content });
    const eci = signedData.encapContentInfo;
    if (eci.eContentType !== TST_INFO_OID) {
      return { status: "invalid", details: `Unexpected eContentType ${eci.eContentType} (expected TSTInfo)` };
    }
    if (!eci.eContent) return { status: "invalid", details: "TSA token has no attached content" };
    const eContent = new Uint8Array(eci.eContent.valueBlock.valueHexView);
    tst = pkijs.TSTInfo.fromBER(toAbs(eContent));
  } catch (e) {
    return { status: "invalid", details: `TSA token parse error: ${e instanceof Error ? e.message : e}` };
  }

  // 2) messageImprint: хэш от значения основной подписи должен совпадать —
  //    это привязывает штамп именно к этой подписи (защита от переноса).
  const imprintAlgOid = tst.messageImprint.hashAlgorithm.algorithmId;
  const { algorithm: imprintAlg } = mapHashOidToAlgorithm(imprintAlgOid);
  if (imprintAlg === "unknown") {
    return { status: "invalid", details: `Unknown messageImprint hash algorithm ${imprintAlgOid}` };
  }
  try {
    const computed = await computeHash(imprintAlg, signerSignature);
    const expected = bytesToHex(tst.messageImprint.hashedMessage.valueBlock.valueHexView);
    if (computed.toLowerCase() !== expected) {
      return {
        status: "invalid",
        details: "TSA messageImprint mismatch: timestamp does not cover this signature (content or signature was swapped)",
      };
    }
  } catch (e) {
    return { status: "invalid", details: `messageImprint hash error: ${e instanceof Error ? e.message : e}` };
  }

  // 3) Сертификат TSA по SID из токена.
  const tsaSignerInfo = signedData.signerInfos[0];
  if (!tsaSignerInfo) return { status: "invalid", details: "TSA token has no signerInfo" };
  const tsaCerts = (signedData.certificates ?? []).filter(
    (c): c is pkijs.Certificate => c instanceof pkijs.Certificate,
  );
  const derHex = (ber: ArrayBuffer): string => Buffer.from(ber).toString("hex").toLowerCase();
  const tsaSid = tsaSignerInfo.sid as pkijs.IssuerAndSerialNumber | undefined;
  const tsaCert = tsaCerts.find((c) => {
    try {
      if (!tsaSid?.issuer || !tsaSid.serialNumber) return false;
      if (derHex(c.subject.toSchema().toBER(false)) !== derHex(tsaSid.issuer.toSchema().toBER(false))) return false;
      const cs = Buffer.from((c.serialNumber as unknown as { valueBlock: { valueHex: ArrayBuffer } }).valueBlock.valueHex).toString("hex").toLowerCase();
      const ss = Buffer.from((tsaSid.serialNumber as unknown as { valueBlock: { valueHex: ArrayBuffer } }).valueBlock.valueHex).toString("hex").toLowerCase();
      return cs === ss;
    } catch {
      return false;
    }
  }) ?? tsaCerts[0];
  if (!tsaCert) return { status: "invalid", details: "TSA certificate not found in token" };

  // 4) Криптоверификация подписи токена (ГОСТ-движок, attached content).
  try {
    const gostCi = gostCrypto.asn1.ContentInfo.decode(tokenDer);
    const gostSd = new gostCrypto.cms.SignedDataContentInfo(gostCi);
    const gostTsaCert = new gostCrypto.cert.X509(tsaCert.toSchema().toBER(false));
    await gostSd.verifySignature(gostTsaCert);
  } catch (e) {
    return { status: "invalid", details: `TSA signature verification failed: ${e instanceof Error ? e.message : e}` };
  }

  // 5) genTime внутри срока действия сертификата TSA.
  const { notBefore, notAfter } = getValidity(tsaCert);
  if (tst.genTime < notBefore || tst.genTime > notAfter) {
    return { status: "invalid", details: "TSA genTime outside certificate validity" };
  }

  // 6) Цепочка доверия сертификата TSA до configured trusted roots.
  const tsaSubject = parseSubject(tsaCert);
  const { extKeyUsage } = getExtensions(tsaCert);
  let chainOk = false;
  let trustedRoots: TrustedRoot[];
  try {
    trustedRoots = await getTrustedRoots();
  } catch (e) {
    return { status: "unknown_offline", genTime: tst.genTime, tsaSubject, details: `trusted roots unavailable: ${e instanceof Error ? e.message : e}` };
  }
  if (trustedRoots.length === 0) {
    return { status: "valid", genTime: tst.genTime, tsaSubject, chainOk: false, details: "TSA chain not verified: no trusted roots configured" };
  }

  const nameKey = (name: pkijs.RelativeDistinguishedNames): string => {
    try {
      return derHex(name.toSchema().toBER(false));
    } catch {
      return "";
    }
  };
  const pool: pkijs.Certificate[] = [...tsaCerts, ...trustedRoots.map((r) => r.cert)];
  const bySubject = new Map<string, pkijs.Certificate>();
  for (const c of pool) {
    const k = nameKey(c.subject);
    if (k && !bySubject.has(k)) bySubject.set(k, c);
  }
  const toGost = (c: pkijs.Certificate) => new gostCrypto.cert.X509(c.toSchema().toBER(false));
  let current = tsaCert;
  const visited = new Set<string>();
  for (;;) {
    const curKey = nameKey(current.subject);
    if (visited.has(curKey)) {
      return { status: "invalid", genTime: tst.genTime, tsaSubject, details: "TSA certificate chain loop" };
    }
    visited.add(curKey);
    const curSha1 = (await getThumbprints(current)).sha1;
    if (trustedRoots.some((r) => r.thumbprintSha1 === curSha1)) {
      chainOk = true;
      break;
    }
    if (nameKey(current.issuer) === curKey) {
      return { status: "invalid", genTime: tst.genTime, tsaSubject, details: "TSA chain ends at untrusted self-signed certificate" };
    }
    const parent = bySubject.get(nameKey(current.issuer));
    if (!parent) {
      return { status: "invalid", genTime: tst.genTime, tsaSubject, details: "TSA chain incomplete: issuer not found" };
    }
    let ok = false;
    try {
      ok = Boolean(await toGost(current).verify(toGost(parent)));
    } catch (e) {
      return { status: "invalid", genTime: tst.genTime, tsaSubject, details: `TSA chain error: ${e instanceof Error ? e.message : e}` };
    }
    if (!ok) {
      return { status: "invalid", genTime: tst.genTime, tsaSubject, details: "TSA chain: invalid signature in certificate" };
    }
    current = parent;
  }

  const extra = extKeyUsage.includes(EKU_TIMESTAMPING)
    ? undefined
    : "TSA certificate lacks id-kp-timeStamping EKU";
  return { status: "valid", genTime: tst.genTime, tsaSubject, chainOk, details: extra };
}

export async function verifyPAdESCrypto(
  pdfBytes: Uint8Array,
  signedContent: Uint8Array,
  cmsHex: string
): Promise<PAdESVerificationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  let cmsDER: Uint8Array;
  try {
    cmsDER = hexToUint8(cmsHex);
    // /Contents у внешних подписантов (КриптоПро и др.) дополнен нулями до
    // зарезервированного окна — обрезаем буфер до длины, заявленной в DER-заголовке.
    cmsDER = truncateDerToLength(cmsDER);
  } catch {
    return fail("Invalid CMS hex", errors);
  }

  let contentInfo: pkijs.ContentInfo;
  let signedData: pkijs.SignedData;
  try {
    const cmsArrayBuffer = cmsDER.buffer.slice(cmsDER.byteOffset, cmsDER.byteOffset + cmsDER.byteLength) as ArrayBuffer;
    contentInfo = pkijs.ContentInfo.fromBER(cmsArrayBuffer);
    if (contentInfo.contentType !== pkijs.ContentInfo.SIGNED_DATA) {
      return fail("CMS is not SignedData", errors);
    }
    signedData = new pkijs.SignedData({ schema: contentInfo.content });
  } catch (e) {
    return fail(`CMS parse error: ${e instanceof Error ? e.message : e}`, errors);
  }

  if (!signedData.certificates || signedData.certificates.length === 0) {
    return fail("No certificates in CMS", errors);
  }

  if (!signedData.signerInfos || signedData.signerInfos.length === 0) {
    return fail("No signerInfo in CMS", errors);
  }
  const signerInfo = signedData.signerInfos[0];

  // Выбираем сертификат подписанта по SID (issuerAndSerialNumber), а не вслепую первый
  const sid = signerInfo.sid as pkijs.IssuerAndSerialNumber | undefined;
  const derHex = (ber: ArrayBuffer): string => Buffer.from(ber).toString("hex").toLowerCase();
  const matchCert = (c: pkijs.Certificate): boolean => {
    try {
      if (!sid || !sid.issuer || !sid.serialNumber) return false;
      const certSubjectDer = c.subject.toSchema().toBER(false);
      const sidIssuerDer = sid.issuer.toSchema().toBER(false);
      if (derHex(certSubjectDer) !== derHex(sidIssuerDer)) return false;
      const certSerial = Buffer.from((c.serialNumber as unknown as { valueBlock: { valueHex: ArrayBuffer } }).valueBlock.valueHex).toString("hex").toLowerCase();
      const sidSerial = Buffer.from((sid.serialNumber as unknown as { valueBlock: { valueHex: ArrayBuffer } }).valueBlock.valueHex).toString("hex").toLowerCase();
      return certSerial === sidSerial;
    } catch {
      return false;
    }
  };
  const sidMatch = signedData.certificates.find(
    (c) => c instanceof pkijs.Certificate && matchCert(c),
  ) as pkijs.Certificate | undefined;
  if (sidMatch) {
    if (sidMatch !== signedData.certificates[0]) {
      warnings.push("Signer certificate matched via SID (not the first certificate in CMS)");
    }
  } else {
    warnings.push("Signer certificate not matched via SID — using first certificate in CMS");
  }
  const signerCert = (sidMatch ?? signedData.certificates[0]) as pkijs.Certificate;
  const subject = parseSubject(signerCert);
  const issuer = parseIssuer(signerCert);
  const { notBefore, notAfter } = getValidity(signerCert);
  const { keyUsage, extKeyUsage, crlDistributionPoints, ocspUrls } = getExtensions(signerCert);
  const { sha1, sha256 } = await getThumbprints(signerCert);
  const isQualified = isQualifiedCertificate(extKeyUsage);

  if (!isQualified) {
    warnings.push("Certificate does not contain EKU id-kp-qcSign (1.2.643.7.1.1.1.1) — may not be qualified");
  }
  if (!keyUsage.includes("digitalSignature")) warnings.push("KeyUsage: missing digitalSignature");
  if (!keyUsage.includes("nonRepudiation")) warnings.push("KeyUsage: missing nonRepudiation (non-repudiation)");

  const now = new Date();
  if (now < notBefore) errors.push("Certificate not yet valid");
  if (now > notAfter) errors.push("Certificate expired");

  let messageDigestHex = "";
  let signingTime: Date | undefined;

  const messageDigestVal = getSignedAttrValue(signerInfo.signedAttrs, "1.2.840.113549.1.9.4");
  if (messageDigestVal) {
    const val = messageDigestVal as asn1js.OctetString;
    messageDigestHex = Buffer.from(val.valueBlock.valueHex).toString("hex");
  }

  const signingTimeVal = getSignedAttrValue(signerInfo.signedAttrs, "1.2.840.113549.1.9.5");
  if (signingTimeVal) {
    const val = signingTimeVal as asn1js.UTCTime | asn1js.GeneralizedTime;
    signingTime = new Date(val.toString());
  }

  if (!messageDigestHex) {
    return fail("No messageDigest in signedAttrs", errors);
  }

  // Digest-алгоритм конкретного подписанта (может отличаться от digestAlgorithms[0] при нескольких signerInfos)
  const hashAlgOid = signerInfo.digestAlgorithm?.algorithmId || signedData.digestAlgorithms[0]?.algorithmId || "";
  const { algorithm: hashAlgorithm, isGost: isGostHash } = mapHashOidToAlgorithm(hashAlgOid);

  let computedDigestHex = "";
  if (isGostHash) {
    computedDigestHex = await computeHash(hashAlgorithm, signedContent);
  } else {
    computedDigestHex = await computeHash("SHA-256", signedContent);
    warnings.push(`Hash algorithm is not GOST: ${hashAlgOid}`);
  }

  const hashMatch = computedDigestHex.toLowerCase() === messageDigestHex.toLowerCase();
  if (!hashMatch) {
    errors.push("Document hash mismatch: document was modified after signing");
  }

  let cryptoVerified = false;
  try {
    // pkijs не поддерживает ГОСТ-алгоритмы подписи — верифицируем собственным
    // движком node-gost-crypto (аналог gostCMS.verifySignature).
    const cmsBuffer = cmsDER.buffer.slice(cmsDER.byteOffset, cmsDER.byteOffset + cmsDER.byteLength) as ArrayBuffer;
    const gostContentInfo = gostCrypto.asn1.ContentInfo.decode(cmsBuffer);
    const gostSignedData = new gostCrypto.cms.SignedDataContentInfo(gostContentInfo);
    const certDer = signerCert.toSchema().toBER(false);
    const gostCert = new gostCrypto.cert.X509(certDer);
    const dataBuffer = signedContent.buffer.slice(signedContent.byteOffset, signedContent.byteOffset + signedContent.byteLength) as ArrayBuffer;
    const result = await gostSignedData.verifySignature(gostCert, { contentType: "data", content: dataBuffer });
    cryptoVerified = Boolean(result);
    if (!cryptoVerified) errors.push("Cryptographic signature verification failed");
  } catch (e) {
    errors.push(`Crypto verification error: ${e instanceof Error ? e.message : e}`);
  }

  let chainValid = false;
  const chainResult: ChainCert[] = [];
  try {
    const trustedRoots = await getTrustedRoots();
    const trustedCerts = trustedRoots.map((r) => r.cert);
    const chainCerts = signedData.certificates.map((c) => c as pkijs.Certificate);

    // Если доверенных корневых нет в конфиге — не блокируем подпись, а предупреждаем
    const hasTrustedRoots = trustedRoots.length > 0;

    if (hasTrustedRoots) {
      // pkijs не поддерживает ГОСТ-алгоритмы подписи сертификатов — валидируем
      // цепочку собственным обходом через гостовый движок (gostCert.X509.verify):
      // даты, критичные расширения, issuer-match, keyCertSign и подпись каждого звена.
      const nameKey = (name: pkijs.RelativeDistinguishedNames): string => {
        try {
          return Buffer.from(name.toSchema().toBER(false)).toString("hex").toLowerCase();
        } catch {
          return "";
        }
      };
      const toGostCert = (c: pkijs.Certificate) => new gostCrypto.cert.X509(c.toSchema().toBER(false));

      const pool: pkijs.Certificate[] = [...chainCerts, ...trustedCerts];
      const bySubject = new Map<string, pkijs.Certificate>();
      for (const c of pool) {
        const k = nameKey(c.subject);
        if (k && !bySubject.has(k)) bySubject.set(k, c);
      }

      const isTrustedCert = async (c: pkijs.Certificate): Promise<boolean> => {
        const tp = (await getThumbprints(c)).sha1;
        return trustedRoots.some((r) => r.thumbprintSha1 === tp);
      };

      let current = signerCert;
      const visited = new Set<string>();
      while (true) {
        const curKey = nameKey(current.subject);
        if (visited.has(curKey)) {
          chainValid = false;
          errors.push("Certificate chain contains a loop");
          break;
        }
        visited.add(curKey);

        if (await isTrustedCert(current)) break;

        if (nameKey(current.issuer) === nameKey(current.subject)) {
          chainValid = false;
          errors.push("Certificate chain ends at self-signed certificate not present in trusted roots");
          break;
        }

        const parent = bySubject.get(nameKey(current.issuer));
        if (!parent) {
          chainValid = false;
          errors.push("Certificate chain incomplete: issuer not found in CMS or trusted roots");
          break;
        }

        try {
          const ok = await toGostCert(current).verify(toGostCert(parent));
          if (!ok) {
            chainValid = false;
            errors.push("Certificate chain: invalid signature in intermediate certificate");
            break;
          }
        } catch (e) {
          chainValid = false;
          errors.push(`Certificate chain validation error: ${e instanceof Error ? e.message : e}`);
          break;
        }
        current = parent;
      }
    } else {
      // Нет доверенных корней — считаем цепочку "валидной структурно", но без доверия к корню
      chainValid = true;
      warnings.push("Trusted root CAs not configured — certificate chain trust not verified. Set TRUSTED_ROOT_CA_PEM env var.");
    }

    for (let i = 0; i < chainCerts.length; i++) {
      const c = chainCerts[i];
      const subj = parseSubject(c);
      const iss = parseIssuer(c);
      const { notBefore: nb, notAfter: na } = getValidity(c);
      const { sha1: s1, sha256: s256 } = await getThumbprints(c);
      const ext = getExtensions(c);
      const isRoot = subj.rawDN === iss.rawDN;
      const isTrusted = hasTrustedRoots && trustedRoots.some((r) => r.thumbprintSha1 === s1);
      chainResult.push({
        subject: subj,
        issuer: iss,
        validFrom: nb,
        validTo: na,
        thumbprintSha1: s1,
        thumbprintSha256: s256,
        isRoot,
        isTrustedRoot: isTrusted,
        extensions: ext,
      });
    }

    if (hasTrustedRoots && !chainValid) {
      errors.push("Certificate chain does not lead to trusted root CA");
    }
  } catch (e) {
    warnings.push(`Chain validation failed: ${e instanceof Error ? e.message : e}`);
  }

  let revocation: RevocationInfo = { status: "unknown", checkedAt: now, method: "none" };
  try {
    if (ocspUrls.length > 0) {
      // Приоритет 1: OCSP. В pades-verify нет доступа к issuerCert; checkOcsp
      // соберёт запрос с issuerKeyHash=0, многие OCSP-серверы всё равно
      // отвечают «authorized» по URL из AIA. Если ответ не пришёл — фолбэк
      // на CRL делается на уровне вызывающего кода.
      const ocspResult = await checkOcsp(signerCert, ocspUrls[0]);
      revocation = { status: ocspResult.status, checkedAt: ocspResult.checkedAt, method: "OCSP" };
      if (ocspResult.details) revocation.details = ocspResult.details;
    } else if (crlDistributionPoints.length > 0) {
      const crlResult = await checkCrl(signerCert, crlDistributionPoints[0]);
      revocation = { status: crlResult.status, checkedAt: crlResult.checkedAt, method: "CRL" };
      if (crlResult.details) revocation.details = crlResult.details;
    }
  } catch (e) {
    revocation = { status: "offline", checkedAt: now, method: "none", details: String(e) };
  }

  if (revocation.status === "revoked") {
    errors.push("Certificate revoked (CRL/OCSP)");
  } else if (revocation.status === "offline") {
    warnings.push("Revocation check offline");
  }

  let timestamp: TimestampInfo = { present: false };
  // pkijs v3 кладёт атрибуты в SignedAndUnsignedAttributes.attributes (а не .array) —
  // обрабатываем обе формы.
  const unsignedAttrs = signerInfo.unsignedAttrs as unknown as { array?: PkijsAttribute[]; attributes?: PkijsAttribute[] };
  const unsignedList = unsignedAttrs?.array ?? unsignedAttrs?.attributes;
  if (unsignedList) {
    for (const attr of unsignedList) {
      const attrId = (attr as { attrId?: string; type?: unknown }).attrId ?? String((attr as { type?: unknown }).type);
      if (attrId === "1.2.840.113549.1.9.16.2.14") {
        // TICKET-4: полноценная верификация TimeStampToken.
        const tokenValue = getSignedAttrValue(signerInfo.unsignedAttrs, attrId);
        timestamp = { present: true, valid: false };
        if (tokenValue) {
          try {
            const tsa = await verifyTsaTimestamp(tokenValue, new Uint8Array(signerInfo.signature as unknown as ArrayBufferLike));
            timestamp.status = tsa.status;
            timestamp.genTime = tsa.genTime;
            timestamp.time = tsa.genTime;
            timestamp.tsaSubject = tsa.tsaSubject;
            timestamp.signer = tsa.tsaSubject;
            timestamp.chainOk = tsa.chainOk;
            timestamp.details = tsa.details;
            if (tsa.status === "valid") {
              timestamp.valid = true;
              if (tsa.details) warnings.push(`TSA: ${tsa.details}`);
            } else if (tsa.status === "invalid") {
              errors.push(`TSA timestamp invalid: ${tsa.details ?? "verification failed"}`);
            } else {
              warnings.push(`TSA status unknown (offline): ${tsa.details ?? ""}`.trim());
            }
          } catch (e) {
            timestamp.status = "invalid";
            errors.push(`TSA verification error: ${e instanceof Error ? e.message : e}`);
          }
        } else {
          warnings.push("TSA attribute has no parseable value");
        }
        break;
      }
    }
  }

  const valid = errors.length === 0 && cryptoVerified && chainValid && hashMatch;

  return {
    valid,
    cryptoVerified,
    chainValid,
    errors,
    warnings,
    signer: {
      thumbprintSha1: sha1,
      thumbprintSha256: sha256,
      subject,
      issuer,
      validFrom: notBefore,
      validTo: notAfter,
      keyUsage,
      extKeyUsage,
      isQualified,
      serialNumber: subject.serialNumber,
      signingTime,
    },
    chain: chainResult,
    revocation,
    timestamp,
    integrity: {
      hashMatch,
      algorithm: hashAlgorithm,
      messageDigestHex,
      computedDigestHex,
    },
  };
}

export async function extractSignedContentFromPDF(pdfBytes: Uint8Array): Promise<{ signedContent: Uint8Array; cmsHex: string; byteRange: number[] } | null> {
  const { PDFDocument, PDFName, PDFArray, PDFDict, PDFHexString, PDFNumber, asPDFName } = await import("pdf-lib");

  try {
    const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
    const catalog = pdfDoc.catalog;
    const acroForm = catalog.lookupMaybe(asPDFName("AcroForm"), PDFDict);
    if (!acroForm) return null;

    const fields = acroForm.lookupMaybe(asPDFName("Fields"), PDFArray);
    if (!fields) return null;

    // PDFArray.array — private в pdf-lib; идём через size()/get()/context.lookup.
    // PDFDict имеет protected-конструктор, поэтому тип выводится из lookup.
    const sigDict = (() => {
      for (let i = 0; i < fields.size(); i++) {
        const field = pdfDoc.context.lookup(fields.get(i), PDFDict);
        const ft = field?.lookupMaybe(asPDFName("FT"), PDFName);
        // PDFName.asString() возвращает значение СО слешем ("/Sig")
        if (ft && ft.asString() === "/Sig") {
          return field;
        }
      }
      return undefined;
    })();
    if (!sigDict) return null;

    const byteRangeArr = sigDict.lookupMaybe(asPDFName("ByteRange"), PDFArray);
    if (!byteRangeArr) return null;

    const nums: number[] = [];
    for (let i = 0; i < byteRangeArr.size(); i++) {
      const n = byteRangeArr.lookupMaybe(i, PDFNumber);
      if (!n) return null;
      nums.push(n.asNumber());
    }
    if (nums.length !== 4) return null;

    const [start1, len1, start2, len2] = nums;
    // Строгие требования PAdES: подпись покрывает файл ОТ НАЧАЛА ДО КОНЦА,
    // разрыв между диапазонами — ровно место, где лежит /Contents.
    // Иначе часть файла не защищена подписью и верификация была бы неполной.
    if (start1 !== 0 || len1 < 0 || len2 < 0) return null;
    const gapStart = start1 + len1;
    const gapEnd = start2;
    if (gapEnd !== gapStart) return null; // нестандартный gap — байты между диапазонами не подписаны
    if (gapEnd + len2 !== pdfBytes.length) return null; // хвост файла не покрыт подписью
    if (gapEnd > pdfBytes.length) return null;

    const signedContent = new Uint8Array(len1 + len2);
    signedContent.set(pdfBytes.subarray(0, gapStart), 0);
    signedContent.set(pdfBytes.subarray(gapEnd, gapEnd + len2), len1);

    // lookupMaybe БЕЗ указания типа всегда бросает UnexpectedObjectTypeError (pdf-lib 1.17.1) —
    // обязательно передаём тип PDFHexString
    const contents = sigDict.lookupMaybe(asPDFName("Contents"), PDFHexString);
    // asString() у PDFHexString возвращает hex-строку без скобок
    const cmsHex = contents?.asString() || "";
    if (!/^[0-9A-Fa-f]+$/.test(cmsHex) || cmsHex.length < 100) return null;

    return { signedContent, cmsHex, byteRange: nums };
  } catch {
    return null;
  }
}
import type { Certificate, RelativeDistinguishedNames } from "pkijs";

/** Узкий type guard: значение — объект (для доступа к вложенным полям asn1js/pkijs). */
function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

export interface ParsedSubject {
  cn?: string;
  snils?: string;
  inn?: string;
  ogrn?: string;
  ogrnip?: string;
  o?: string;
  ou?: string;
  title?: string;
  email?: string;
  street?: string;
  locality?: string;
  region?: string;
  country?: string;
  serialNumber?: string;
  rawDN: string;
  unparsed: Array<{ oid: string; value: string }>;
}

const OID_MAP: Record<string, keyof ParsedSubject> = {
  "2.5.4.3": "cn",
  "1.2.643.100.3": "snils",
  "1.2.643.3.113.1.1": "inn",
  "1.2.643.3.113.1.2": "inn",
  "1.2.643.100.1": "ogrn",
  "1.2.643.100.5": "ogrnip",
  "2.5.4.10": "o",
  "2.5.4.11": "ou",
  "2.5.4.12": "title",
  "1.2.840.113549.1.9.1": "email",
  "2.5.4.9": "street",
  "2.5.4.7": "locality",
  "2.5.4.8": "region",
  "2.5.4.6": "country",
  "2.5.4.5": "serialNumber",
};

export function parseSubject(cert: Certificate): ParsedSubject {
  return parseName(cert.subject);
}

export function parseIssuer(cert: Certificate): ParsedSubject {
  return parseName(cert.issuer);
}

function parseName(name: RelativeDistinguishedNames | undefined): ParsedSubject {
  const result: ParsedSubject = {
    rawDN: "",
    unparsed: [],
  };
  const parts: string[] = [];

  if (!name?.typesAndValues) {
    return result;
  }

  for (const tv of name.typesAndValues) {
    const oid = tv.type;
    const rawValue: unknown = tv.value?.valueBlock?.value ?? "";
    const value = String(rawValue);
    parts.push(`${oid}=${value}`);
    result.unparsed.push({ oid, value });

    const key = OID_MAP[oid];
    if (key && typeof value === "string") {
      (result as Record<keyof ParsedSubject, unknown>)[key] = value;
    }
  }

  result.rawDN = parts.join(", ");
  return result;
}

export function getValidity(cert: Certificate): { notBefore: Date; notAfter: Date } {
  return {
    notBefore: new Date(cert.notBefore.value),
    notAfter: new Date(cert.notAfter.value),
  };
}

export interface CertificateExtensions {
  keyUsage: string[];
  extKeyUsage: string[];
  authorityKeyId?: string;
  subjectKeyId?: string;
  crlDistributionPoints: string[];
  ocspUrls: string[];
  caIssuersUrls: string[];
}

export function getExtensions(cert: Certificate): CertificateExtensions {
  const keyUsage: string[] = [];
  const extKeyUsage: string[] = [];
  let authorityKeyId: string | undefined;
  let subjectKeyId: string | undefined;
  const crlDistributionPoints: string[] = [];
  const ocspUrls: string[] = [];
  const caIssuersUrls: string[] = [];

  if (!cert.extensions) {
    return {
      keyUsage,
      extKeyUsage,
      authorityKeyId,
      subjectKeyId,
      crlDistributionPoints,
      ocspUrls,
      caIssuersUrls,
    };
  }

  for (const ext of cert.extensions) {
    const oid = ext.extnID;
    const value = ext.parsedValue;

    if (oid === "2.5.29.15" && isRecord(value)) {
      const valueBlock = value.valueBlock;
      const bits = isRecord(valueBlock) ? valueBlock.valueHexView : undefined;
      if (bits instanceof Uint8Array) {
        const view = bits;
        if (view[0] & 0x80) keyUsage.push("digitalSignature");
        if (view[0] & 0x40) keyUsage.push("nonRepudiation");
        if (view[0] & 0x20) keyUsage.push("keyEncipherment");
        if (view[0] & 0x10) keyUsage.push("dataEncipherment");
        if (view[0] & 0x08) keyUsage.push("keyAgreement");
        if (view[0] & 0x04) keyUsage.push("keyCertSign");
        if (view[0] & 0x02) keyUsage.push("cRLSign");
      }
    }

    if (oid === "2.5.29.37" && isRecord(value)) {
      if (Array.isArray(value.array)) {
        for (const k of value.array) {
          if (isRecord(k) && isRecord(k.valueBlock)) {
            extKeyUsage.push(k.valueBlock.toString());
          }
        }
      } else if (Array.isArray(value.keyPurposes)) {
        for (const k of value.keyPurposes) {
          const oid = isRecord(k) && isRecord(k.valueBlock) ? k.valueBlock.toString() : undefined;
          if (typeof oid === "string") extKeyUsage.push(oid);
        }
      }
    }

    if (oid === "2.5.29.35" && isRecord(value)) {
      const keyIdentifier = value.keyIdentifier;
      const valueHex = isRecord(keyIdentifier) && isRecord(keyIdentifier.valueBlock)
        ? keyIdentifier.valueBlock.valueHex
        : undefined;
      authorityKeyId = valueHex ? Buffer.from(valueHex as ArrayBufferLike).toString("hex") : "";
    }

    if (oid === "2.5.29.14" && isRecord(value)) {
      const valueHex = isRecord(value.valueBlock) ? value.valueBlock.valueHex : undefined;
      subjectKeyId = valueHex ? Buffer.from(valueHex as ArrayBufferLike).toString("hex") : "";
    }

    if (oid === "2.5.29.31" && isRecord(value)) {
      if (Array.isArray(value.array)) {
        for (const dp of value.array) {
          if (!isRecord(dp) || !isRecord(dp.distributionPoint) || !Array.isArray(dp.distributionPoint.array)) continue;
          for (const name of dp.distributionPoint.array) {
            if (!isRecord(name) || name.type !== 0 || !isRecord(name.value) || !Array.isArray(name.value.array)) continue;
            for (const gn of name.value.array) {
              if (isRecord(gn) && gn.type === 6 && typeof gn.value === "string") {
                crlDistributionPoints.push(gn.value);
              }
            }
          }
        }
      } else if (Array.isArray(value.distributionPoints)) {
        for (const dp of value.distributionPoints) {
          if (!isRecord(dp)) continue;
          const names = Array.isArray(dp.distributionPoint) ? dp.distributionPoint : undefined;
          const fullName = !names && isRecord(dp.distributionPoint) && Array.isArray(dp.distributionPoint.array)
            ? dp.distributionPoint.array
            : undefined;
          for (const gn of names ?? fullName ?? []) {
            if (isRecord(gn) && gn.type === 6 && typeof gn.value === "string") {
              crlDistributionPoints.push(gn.value);
            }
          }
        }
      }
    }

    if (oid === "1.3.6.1.5.5.7.1.1" && isRecord(value)) {
      const descriptions = Array.isArray(value.accessDescriptions) ? value.accessDescriptions : Array.isArray(value.array) ? value.array : undefined;
      for (const ad of descriptions ?? []) {
        if (!isRecord(ad)) continue;
        const locationValue = isRecord(ad.accessLocation) ? ad.accessLocation.value : undefined;
        if (ad.accessMethod === "1.3.6.1.5.5.7.48.1" && typeof locationValue === "string") {
          ocspUrls.push(locationValue);
        }
        if (ad.accessMethod === "1.3.6.1.5.5.7.48.2" && typeof locationValue === "string") {
          caIssuersUrls.push(locationValue);
        }
      }
    }
  }

  return {
    keyUsage,
    extKeyUsage,
    authorityKeyId,
    subjectKeyId,
    crlDistributionPoints,
    ocspUrls,
    caIssuersUrls,
  };
}

export function getThumbprints(cert: Certificate): Promise<{ sha1: string; sha256: string }> {
  const certDer = cert.toSchema().toBER(false);
  return Promise.all([
    crypto.subtle.digest("SHA-1", certDer),
    crypto.subtle.digest("SHA-256", certDer),
  ]).then(([sha1Buf, sha256Buf]) => ({
    sha1: Buffer.from(sha1Buf).toString("hex").toUpperCase(),
    sha256: Buffer.from(sha256Buf).toString("hex").toUpperCase(),
  }));
}

export function isQualifiedCertificate(extKeyUsage: string[]): boolean {
  return extKeyUsage.includes("1.2.643.7.1.1.1.1");
}
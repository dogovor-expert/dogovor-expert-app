import type { Certificate } from "pkijs";

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

function parseName(name: any): ParsedSubject {
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
    const value = tv.value?.valueBlock?.value ?? "";
    parts.push(`${oid}=${value}`);
    result.unparsed.push({ oid, value });

    const key = OID_MAP[oid];
    if (key) {
      (result as any)[key] = value;
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

    if (oid === "2.5.29.15" && value) {
      const bits = (value as any).valueBlock?.valueHexView;
      if (bits) {
        const view = new Uint8Array(bits);
        if (view[0] & 0x80) keyUsage.push("digitalSignature");
        if (view[0] & 0x40) keyUsage.push("nonRepudiation");
        if (view[0] & 0x20) keyUsage.push("keyEncipherment");
        if (view[0] & 0x10) keyUsage.push("dataEncipherment");
        if (view[0] & 0x08) keyUsage.push("keyAgreement");
        if (view[0] & 0x04) keyUsage.push("keyCertSign");
        if (view[0] & 0x02) keyUsage.push("cRLSign");
      }
    }

    if (oid === "2.5.29.37" && value) {
      for (const k of (value as any).array || []) {
        extKeyUsage.push(k.valueBlock.toString());
      }
    }

    if (oid === "2.5.29.35" && value) {
      authorityKeyId = Buffer.from((value as any).keyIdentifier?.valueBlock?.valueHex || []).toString("hex");
    }

    if (oid === "2.5.29.14" && value) {
      subjectKeyId = Buffer.from((value as any).valueBlock?.valueHex || []).toString("hex");
    }

    if (oid === "2.5.29.31" && value) {
      for (const dp of (value as any).array || []) {
        for (const name of dp.distributionPoint?.array || []) {
          if (name.type === 0) {
            for (const gn of name.value.array) {
              if (gn.type === 6) crlDistributionPoints.push(gn.value);
            }
          }
        }
      }
    }

    if (oid === "1.3.6.1.5.5.7.1.1" && value) {
      for (const ad of (value as any).array || []) {
        if (ad.accessMethod === "1.3.6.1.5.5.7.48.1") {
          ocspUrls.push(ad.accessLocation?.value || "");
        }
        if (ad.accessMethod === "1.3.6.1.5.5.7.48.2") {
          caIssuersUrls.push(ad.accessLocation?.value || "");
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
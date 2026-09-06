import { XMLParser } from "fast-xml-parser";
import * as pkijs from "pkijs";
import { verifyTslXmlSignature } from "@/lib/xmldsig-verify";

export interface TslCertificate {
  thumbprint: string;
  issuerDN: string;
  subjectDN: string;
  notBefore: Date;
  notAfter: Date;
  derBase64: string;
  parsed: pkijs.Certificate;
}

export interface TslAuthority {
  name: string;
  shortName?: string;
  email?: string;
  inn?: string;
  ogrn?: string;
  region?: string;
  certificates: TslCertificate[];
}

export interface TslMetadata {
  version: number;
  date: string;
  schemeVersion: string;
  signatureValid: boolean;
  signatureError?: string;
  source: string;
}

export interface TslData {
  metadata: TslMetadata;
  authorities: TslAuthority[];
}

export interface TslParserOptions {
  verifySignature?: boolean;
  source?: string;
}

const XML_PARSER_OPTIONS = {
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
  parseAttributeValue: false,
  trimValues: true,
  isArray: (name: string) => {
    return [
      "УдостоверяющийЦентр",
      "Ключ",
      "Сертификаты",
      "ДанныеСертификата",
      "АдресСписковОтзыва",
      "ПрограммноАппаратныйКомплекс",
      "Адрес",
    ].includes(name);
  },
};

function extractText(obj: unknown): string {
  if (obj === null || obj === undefined) return "";
  if (typeof obj === "string") return obj.trim();
  if (typeof obj === "number") return String(obj);
  if (typeof obj === "object" && obj !== null) {
    const o = obj as Record<string, unknown>;
    if ("#text" in o) return String(o["#text"]).trim();
    if ("@_xsi:nil" in o && o["@_xsi:nil"] === "true") return "";
  }
  return "";
}

function extractOFromDN(dn: string, oid: string): string | undefined {
  const parts = dn.split(/,(?![^()]*\))/).map((p) => p.trim());
  for (const part of parts) {
    if (part.startsWith(oid + "=")) {
      return part.substring(oid.length + 1);
    }
  }
  return undefined;
}

function parseCertificateData(
  certData: Record<string, unknown> | string
): { thumbprint: string; issuerDN: string; subjectDN: string; certBase64?: string } | null {
  if (typeof certData === "string") return null;

  const thumbprint = extractText(certData["Отпечаток"]);
  const issuerDN = extractText(certData["КемВыдан"]);
  const subjectDN = extractText(certData["КомуВыдан"]);

  let certBase64: string | undefined;
  const datum = certData["Данные"];
  const body = datum ?? certData["#text"];
  if (typeof body === "string") {
    certBase64 = body.replace(/\s/g, "");
  }

  if (!thumbprint || !issuerDN || !subjectDN) return null;
  return { thumbprint, issuerDN, subjectDN, certBase64 };
}

export async function parseTslXml(
  xmlContent: string,
  options: TslParserOptions = {}
): Promise<TslData> {
  const { verifySignature = true, source = "unknown" } = options;

  const parser = new XMLParser(XML_PARSER_OPTIONS);
  const parsed = parser.parse(xmlContent) as Record<string, unknown>;
  const root = parsed["АккредитованныеУдостоверяющиеЦентры"] as Record<string, unknown> | undefined;

  if (!root) {
    throw new Error("Invalid TSL: root element 'АккредитованныеУдостоверяющиеЦентры' not found");
  }

  const version = parseInt(extractText(root["Версия"]), 10) || 0;
  const date = extractText(root["Дата"]);
  const schemeVersion = extractText(root["@_xsi:noNamespaceSchemaLocation"]) || "unknown";

  let signatureValid = false;
  let signatureError: string | undefined;
  if (verifySignature) {
    const sigResult = await verifyTslXmlSignature(xmlContent);
    signatureValid = sigResult.valid;
    signatureError = sigResult.error;
  } else {
    signatureError = "XMLDSig verification skipped";
  }

  const authorities: TslAuthority[] = [];
  const authorityNodes = root["УдостоверяющийЦентр"];

  if (Array.isArray(authorityNodes)) {
    for (const authNode of authorityNodes) {
      if (typeof authNode !== "object" || authNode === null) continue;
      const auth = authNode as Record<string, unknown>;

      const name = extractText(auth["Название"]);
      const shortName = extractText(auth["КраткоеНазвание"]) || undefined;
      const email = extractText(auth["ЭлектроннаяПочта"]) || undefined;

      const innFromAddress = extractOFromDN(name, "ИНН") || extractOFromDN(extractText(auth["Название"]), "ИНН");
      const ogrnFromAddress = extractOFromDN(name, "ОГРН") || extractOFromDN(extractText(auth["Название"]), "ОГРН");

      let region: string | undefined;
      const address = auth["Адрес"];
      if (typeof address === "object" && address !== null) {
        const addrObj = address as Record<string, unknown>;
        if (typeof addrObj["Регион"] === "object" && addrObj["Регион"] !== null) {
          const regObj = addrObj["Регион"] as Record<string, unknown>;
          region = extractText(regObj["Название"]) || undefined;
        }
      }

      const certificates: TslCertificate[] = [];
      const certFromKeys = (keyNodes: Record<string, unknown>) => {
        const keys = keyNodes["Ключ"];
        if (Array.isArray(keys)) {
          for (const keyNode of keys) {
            if (typeof keyNode !== "object" || keyNode === null) continue;
            const kn = keyNode as Record<string, unknown>;
            const certsContainer = kn["Сертификаты"];
            const certsContainerObj = Array.isArray(certsContainer)
              ? (certsContainer[0] as Record<string, unknown> | undefined)
              : (certsContainer as Record<string, unknown> | null);
            if (typeof certsContainerObj === "object" && certsContainerObj !== null) {
              const certs = certsContainerObj["ДанныеСертификата"];
              if (Array.isArray(certs)) {
                for (const certData of certs) {
                  const parsed2 = parseCertificateData(certData as Record<string, unknown>);
                  if (!parsed2 || !parsed2.certBase64) continue;

                  try {
                    const certDer = Uint8Array.from(Buffer.from(parsed2.certBase64, "base64"));
                    const certArrayBuffer = certDer.buffer.slice(
                      certDer.byteOffset,
                      certDer.byteOffset + certDer.byteLength
                    ) as ArrayBuffer;
                    const parsedCert = pkijs.Certificate.fromBER(certArrayBuffer);
                    const notBefore = new Date((parsedCert.notBefore as any).value);
                    const notAfter = new Date((parsedCert.notAfter as any).value);

                    certificates.push({
                      thumbprint: parsed2.thumbprint,
                      issuerDN: parsed2.issuerDN,
                      subjectDN: parsed2.subjectDN,
                      notBefore,
                      notAfter,
                      derBase64: parsed2.certBase64,
                      parsed: parsedCert,
                    });
                  } catch (e) {
                    console.warn(`[tsl-parser] Failed to parse certificate for ${name}:`, e);
                  }
                }
              }
            }
          }
        }
      };

      const topLevelKeys = auth["КлючиУполномоченныхЛиц"];
      if (typeof topLevelKeys === "object" && topLevelKeys !== null) {
        certFromKeys(topLevelKeys as Record<string, unknown>);
      }

      const hwComplexes = auth["ПрограммноАппаратныеКомплексы"];
      if (typeof hwComplexes === "object" && hwComplexes !== null) {
        const hwList = (hwComplexes as Record<string, unknown>)["ПрограммноАппаратныйКомплекс"];
        const list = Array.isArray(hwList) ? hwList : hwList ? [hwList] : [];
        for (const hwNode of list) {
          if (typeof hwNode !== "object" || hwNode === null) continue;
          const hw = hwNode as Record<string, unknown>;
          const keys = hw["КлючиУполномоченныхЛиц"];
          if (typeof keys === "object" && keys !== null) {
            certFromKeys(keys as Record<string, unknown>);
          }
        }
      }

      authorities.push({
        name: name || "Unknown",
        shortName,
        email,
        inn: innFromAddress,
        ogrn: ogrnFromAddress,
        region,
        certificates,
      });
    }
  }

  return {
    metadata: {
      version,
      date,
      schemeVersion,
      signatureValid,
      signatureError,
      source,
    },
    authorities,
  };
}

export function getRootCaCertificates(tslData: TslData): TslCertificate[] {
  const now = new Date();
  const rootCerts: TslCertificate[] = [];

  for (const auth of tslData.authorities) {
    for (const cert of auth.certificates) {
      if (cert.notAfter < now) continue;
      const subject = cert.subjectDN;
      const issuer = cert.issuerDN;
      if (subject === issuer) {
        rootCerts.push(cert);
      }
    }
  }

  return rootCerts;
}

export function getAllValidCertificates(tslData: TslData): TslCertificate[] {
  const now = new Date();
  const certs: TslCertificate[] = [];
  for (const auth of tslData.authorities) {
    for (const cert of auth.certificates) {
      if (cert.notAfter < now) continue;
      certs.push(cert);
    }
  }
  return certs;
}

export function certificateToPem(cert: TslCertificate): string {
  const wrapped = cert.derBase64.match(/.{1,64}/g)?.join("\n") ?? cert.derBase64;
  return `-----BEGIN CERTIFICATE-----\n${wrapped}\n-----END CERTIFICATE-----`;
}
import { gostCrypto } from "node-gost-crypto";
import * as pkijs from "pkijs";
import { DOMParser } from "@xmldom/xmldom";
import { ExclusiveCanonicalization } from "xml-crypto";

const XMLDSIG_NS = "http://www.w3.org/2000/09/xmldsig#";
const KZ_GOST_SIG = "urn:ietf:params:xml:ns:cpxmlsec:algorithms:gostr34102012-gostr34112012-256";
const KZ_GOST_DIGEST = "urn:ietf:params:xml:ns:cpxmlsec:algorithms:gostr34112012-256";
const EXC_C14N = "http://www.w3.org/2001/10/xml-exc-c14n#";
const X509CERT = "X509Certificate";

export interface XmlDsigVerifyResult {
  valid: boolean;
  error?: string;
  details?: {
    signatureAlgorithm?: string;
    digestAlgorithm?: string;
    canonicalization?: string;
    signatureVerified?: boolean;
    documentDigestMatch?: boolean;
    signerSubject?: string;
  };
}

function childElement(node: Node, localName: string): Element | null {
  for (const c of Array.from(node.childNodes)) {
    if (c.nodeType === 1 && (c as Element).localName === localName) {
      return c as Element;
    }
  }
  return null;
}

function descendantElement(node: Node, localName: string, ns?: string): Element | null {
  for (const c of Array.from(node.childNodes)) {
    if (c.nodeType !== 1) continue;
    const el = c as Element;
    if (el.localName === localName && (!ns || el.namespaceURI === ns)) return el;
    const found = descendantElement(el, localName, ns);
    if (found) return found;
  }
  return null;
}

function elementText(node: Element | null | undefined): string {
  if (!node) return "";
  return (node.textContent || "").replace(/\s+/g, "").trim();
}

function elementToObject(element: Element): Record<string, unknown> | null {
  const obj: Record<string, unknown> = {};
  for (let i = 0; i < element.attributes.length; i++) {
    const a = element.attributes[i];
    obj[`${a.namespaceURI ? a.namespaceURI + ":" : ""}${a.nodeName}`] = a.value;
  }
  obj["#text"] = element.textContent || "";
  return obj;
}

function removeSignatureSubtree(node: Node): number {
  let removed = 0;
  for (const c of Array.from(node.childNodes)) {
    if (c.nodeType === 1) {
      const el = c as Element;
      if (el.localName === "Signature" && el.namespaceURI === XMLDSIG_NS) {
        if (el.parentNode) el.parentNode.removeChild(el);
        removed++;
        continue;
      }
      removed += removeSignatureSubtree(el);
    }
  }
  return removed;
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

function fromBase64(b64: string): Uint8Array {
  return Uint8Array.from(Buffer.from(b64, "base64"));
}

function parseCertificate(b64: string): pkijs.Certificate {
  const der = fromBase64(b64);
  return pkijs.Certificate.fromBER(toArrayBuffer(der));
}

async function gostDigestBytes(data: Uint8Array): Promise<Uint8Array> {
  const digestBuf = await gostCrypto.subtle.digest("GOST R 34.11-2012-256", data as BufferSource);
  return new Uint8Array(digestBuf);
}

async function importGostPublicKey(cert: pkijs.Certificate): Promise<CryptoKey> {
  const spkiDer = cert.subjectPublicKeyInfo.toSchema().toBER();
  const key = await gostCrypto.subtle.importKey("spki", spkiDer as BufferSource, {
    name: "GOST R 34.10-2012-256",
  }, true, ["verify"]);
  return key;
}

function bases64Equal(a: string, b: string): boolean {
  const norm = (s: string) => s.replace(/[\r\n\s]/g, "");
  return norm(a) === norm(b);
}

export async function verifyTslXmlSignature(xmlContent: string): Promise<XmlDsigVerifyResult> {
  const result: XmlDsigVerifyResult = { valid: false };
  let doc: Document;
  try {
    doc = new DOMParser({
      errorHandler: { warning: () => {}, error: () => {}, fatalError: () => {} },
    }).parseFromString(xmlContent, "text/xml");
  } catch (e) {
    result.error = `XML parse error: ${e instanceof Error ? e.message : e}`;
    return result;
  }

  const signatures = doc.getElementsByTagNameNS(XMLDSIG_NS, "Signature");
  if (!signatures || signatures.length === 0) {
    result.error = "Signature element not found";
    return result;
  }
  const signatureNode = signatures[0];

  const signedInfoEl = childElement(signatureNode, "SignedInfo");
  if (!signedInfoEl) {
    result.error = "SignedInfo element not found";
    return result;
  }

  const signatureValueEl = descendantElement(signatureNode, "SignatureValue", XMLDSIG_NS);
  const x509CertEl = descendantElement(signatureNode, X509CERT, XMLDSIG_NS);
  if (!signatureValueEl) {
    result.error = "SignatureValue not found";
    return result;
  }
  if (!x509CertEl) {
    result.error = "X509Certificate not found";
    return result;
  }

  const signatureValueB64 = elementText(signatureValueEl);
  const certB64 = elementText(x509CertEl);
  if (!signatureValueB64 || !certB64) {
    result.error = "Empty SignatureValue or X509Certificate";
    return result;
  }

  const digestMethodEl = descendantElement(signedInfoEl, "DigestMethod", XMLDSIG_NS);
  const sigMethodEl = descendantElement(signatureNode, "SignatureMethod", XMLDSIG_NS);
  const canonEl = descendantElement(signedInfoEl, "CanonicalizationMethod", XMLDSIG_NS);
  const digestAlgorithm = digestMethodEl ? (elementToObject(digestMethodEl)?.["Algorithm"] as string | undefined) : undefined;
  const signatureAlgorithm = sigMethodEl ? (elementToObject(sigMethodEl)?.["Algorithm"] as string | undefined) : undefined;
  const canonicalization = canonEl ? (elementToObject(canonEl)?.["Algorithm"] as string | undefined) : undefined;

  result.details = {
    signatureAlgorithm,
    digestAlgorithm,
    canonicalization,
  };

  if (canonicalization && canonicalization !== EXC_C14N) {
    result.error = `Unsupported canonicalization: ${canonicalization}`;
    return result;
  }
  if (signatureAlgorithm && signatureAlgorithm !== KZ_GOST_SIG) {
    result.error = `Unsupported signature algorithm: ${signatureAlgorithm}`;
    return result;
  }
  if (digestAlgorithm && digestAlgorithm !== KZ_GOST_DIGEST) {
    result.error = `Unsupported digest algorithm: ${digestAlgorithm}`;
    return result;
  }

  let publicKey: CryptoKey;
  let signerSubject: string | undefined;
  try {
    const cert = parseCertificate(certB64);
    publicKey = await importGostPublicKey(cert);
    signerSubject = cert.subject?.typesAndValues
      .map((t) => {
        const raw: unknown = t.value?.valueBlock?.value;
        return typeof raw === "string" ? raw : typeof raw === "number" ? String(raw) : "";
      })
      .filter(Boolean)
      .join(", ")
      .slice(0, 200);
    result.details.signerSubject = signerSubject;
  } catch (e) {
    result.error = `Failed to load signer certificate: ${e instanceof Error ? e.message : e}`;
    return result;
  }

  let canonSignedInfo = "";
  try {
    const exc = new ExclusiveCanonicalization();
    canonSignedInfo = exc.process(signedInfoEl, { signatureNode });
  } catch (e) {
    result.error = `SignedInfo canonicalization failed: ${e instanceof Error ? e.message : e}`;
    return result;
  }

  let signatureVerified = false;
  try {
    const signedInfoDigest = await gostDigestBytes(Buffer.from(canonSignedInfo, "utf8"));
    const sigBytes = fromBase64(signatureValueB64);
    signatureVerified = await gostCrypto.subtle.verify(
      { name: "GOST R 34.10-2012-256" },
      publicKey,
      toArrayBuffer(sigBytes),
      toArrayBuffer(signedInfoDigest)
    );
  } catch (e) {
    result.error = `Signature verification error: ${e instanceof Error ? e.message : e}`;
    return result;
  }
  result.details.signatureVerified = signatureVerified;
  if (!signatureVerified) {
    result.error = "Cryptographic signature verification failed";
    return result;
  }

  let documentDigestMatch = false;
  try {
    const referenceEl = descendantElement(signedInfoEl, "Reference", XMLDSIG_NS);
    const digestValueEl = referenceEl ? childElement(referenceEl, "DigestValue") : null;
    const expectedDigestB64 = elementText(digestValueEl);
    // Удаляем подпись из исходного DOM вместо cloneNode(true): doc локален
    // для этой функции, а полный deep clone 12MB TSL стоил +300-600MB heap
    // и вносил вклад в OOM прода (2026-09-28, exit 139).
    const docRoot = doc.documentElement;
    removeSignatureSubtree(docRoot);
    const exc = new ExclusiveCanonicalization();
    const canonicalDoc = exc.process(docRoot, { signatureNode });
    const docDigest = await gostDigestBytes(Buffer.from(canonicalDoc, "utf8"));
    const docDigestB64 = Buffer.from(docDigest).toString("base64");
    documentDigestMatch = !!expectedDigestB64 && bases64Equal(docDigestB64, expectedDigestB64);
    result.details.documentDigestMatch = documentDigestMatch;
    if (!documentDigestMatch) {
      result.error = "Document digest mismatch: content does not match the signed value";
      return result;
    }
  } catch (e) {
    result.error = `Reference digest verification error: ${e instanceof Error ? e.message : e}`;
    return result;
  }

  result.valid = true;
  return result;
}
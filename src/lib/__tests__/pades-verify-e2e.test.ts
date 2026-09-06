// @vitest-environment node
import { describe, it, expect } from "vitest";
import { gostCrypto } from "node-gost-crypto";
import { verifyPAdESCrypto } from "@/lib/pades-verify";

function toHex(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += bytes[i].toString(16).padStart(2, "0");
  return s;
}

function toAscii(s: string): Uint8Array {
  return Uint8Array.from([...s].map((c) => c.charCodeAt(0)));
}

async function buildSignedCms(content: Uint8Array): Promise<{ cmsHex: string; cert: unknown }> {
  const cert = new gostCrypto.cert.X509({
    subject: { countryName: "RU", commonName: "Test GOST Signer", organizationName: "Test Org" },
  });
  const privKeyInfo = await cert.generate("TC-256");
  await cert.sign(privKeyInfo);

  const cms = new gostCrypto.cms.SignedDataContentInfo();
  cms.setEnclosed({ contentType: "data", content: content.buffer as ArrayBuffer });
  gostCrypto.cms.options.autoAddCert = true;
  await cms.addSignature(privKeyInfo, cert, true);
  const der = cms.encode("DER") as ArrayBuffer;
  return { cmsHex: toHex(new Uint8Array(der)), cert };
}

describe("verifyPAdESCrypto E2E (сгенерированный ГОСТ-PDF)", () => {
  it("принимает подпись CMS, созданную node-gost-crypto (GOST R 34.10-2012-256)", async () => {
    const docBytes = toAscii("%PDF-1.4\n1 0 obj << /Type /Catalog >> endobj\ntrailer << /Root 1 0 R >>\n%%EOF");
    const signedContent = docBytes;
    const { cmsHex } = await buildSignedCms(signedContent);

    const result = await verifyPAdESCrypto(new Uint8Array(docBytes), signedContent, cmsHex);

    expect(result.valid).toBe(true);
    expect(result.cryptoVerified).toBe(true);
    expect(result.integrity.hashMatch).toBe(true);
    expect(result.chain.length).toBe(1);
  });

  it("отвергает модифицированный документ (hash mismatch)", async () => {
    const signedContent = toAscii("ORIGINAL CONTENT FOR SIGNING");
    const { cmsHex } = await buildSignedCms(signedContent);

    const tampered = toAscii("ORIGINAL CONTENT FOR TAMPERING");
    const result = await verifyPAdESCrypto(tampered, tampered, cmsHex);

    expect(result.valid).toBe(false);
    expect(result.integrity.hashMatch).toBe(false);
    expect(result.errors.some((e) => /modified after signing/i.test(e))).toBe(true);
  });
});
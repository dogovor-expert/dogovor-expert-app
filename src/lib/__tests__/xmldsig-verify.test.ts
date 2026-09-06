// @vitest-environment node
import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { verifyTslXmlSignature } from "@/lib/xmldsig-verify";

const TSL_FIXTURE = "C:/Users/alikpc/Downloads/сертификат/tsl.xml";
const hasFixture = existsSync(TSL_FIXTURE);

let xml: string | undefined;
beforeAll(() => {
  if (hasFixture) {
    xml = readFileSync(TSL_FIXTURE, "utf8");
  }
});

describe("verifyTslXmlSignature (honest XMLDSig, ГОСТ R 34.10-2012-256)", () => {
  it.skipIf(!hasFixture)("принимает подписанный Минцифрой TSL", async () => {
    const result = await verifyTslXmlSignature(xml!);
    expect(result.valid).toBe(true);
    expect(result.details?.signatureVerified).toBe(true);
    expect(result.details?.documentDigestMatch).toBe(true);
    expect(result.details?.signatureAlgorithm).toBe(
      "urn:ietf:params:xml:ns:cpxmlsec:algorithms:gostr34102012-gostr34112012-256"
    );
    expect(result.details?.digestAlgorithm).toBe(
      "urn:ietf:params:xml:ns:cpxmlsec:algorithms:gostr34112012-256"
    );
    expect(result.details?.canonicalization).toBe("http://www.w3.org/2001/10/xml-exc-c14n#");
    expect(result.details?.signerSubject).toContain("МИНИСТЕРСТВО ЦИФРОВОГО РАЗВИТИЯ");
  });

  it.skipIf(!hasFixture)("отклоняет модифицированный документ (tamper)", async () => {
    const tampered = xml!.slice(0, 500) + "X" + xml!.slice(501);
    const result = await verifyTslXmlSignature(tampered);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("digest mismatch");
  });

  it("без XMLDSig-подписи возвращает ошибку, а не ложный valid:true", async () => {
    const unsigned = "<АккредитованныеУдостоверяющиеЦентры><Версия>1</Версия></АккредитованныеУдостоверяющиеЦентры>";
    const result = await verifyTslXmlSignature(unsigned);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/Signature element not found/i);
  });
});
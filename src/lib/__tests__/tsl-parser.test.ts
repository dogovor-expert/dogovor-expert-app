import { describe, it, expect } from "vitest";
import { parseTslXml } from "@/lib/tsl-parser";

describe("parseTslXml signatureValid честность", () => {
  it("при verifySignature:false НЕ возвращает ложный signatureValid:true", async () => {
    const xml = "<АккредитованныеУдостоверяющиеЦентры><Версия>1</Версия><Дата>2026-01-01</Дата><УдостоверяющийЦентр></УдостоверяющийЦентр></АккредитованныеУдостоверяющиеЦентры>";
    const result = await parseTslXml(xml, { verifySignature: false, source: "test" });
    expect(result.metadata.signatureValid).toBe(false);
    expect(result.metadata.signatureError).toContain("skipped");
  });

  it("схема/версия/дата парсятся корректно", async () => {
    const xml = '<АккредитованныеУдостоверяющиеЦентры xsi:noNamespaceSchemaLocation="scheme.xsd"><Версия>16326</Версия><Дата>2026-08-26</Дата><УдостоверяющийЦентр></УдостоверяющийЦентр></АккредитованныеУдостоверяющиеЦентры>';
    const result = await parseTslXml(xml, { verifySignature: false, source: "test" });
    expect(result.metadata.version).toBe(16326);
    expect(result.metadata.date).toBe("2026-08-26");
    expect(result.metadata.schemeVersion).toBe("scheme.xsd");
  });
});
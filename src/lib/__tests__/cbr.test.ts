import { describe, it, expect } from "vitest";
import { parseCbrXml } from "@/lib/legal/cbr";

const SAMPLE_XML = `<?xml version="1.0" encoding="windows-1251"?><ValCurs Date="12.09.2026" name="Foreign Currency Market"><Valute ID="R01235"><NumCode>840</NumCode><CharCode>USD</CharCode><Nominal>1</Nominal><Name>Доллар США</Name><Value>82,9977</Value><VunitRate>82.9977</VunitRate></Valute><Valute ID="R01239"><NumCode>978</NumCode><CharCode>EUR</CharCode><Nominal>1</Nominal><Name>Евро</Name><Value>95,7793</Value><VunitRate>95.7793</VunitRate></Valute><Valute ID="R01375"><NumCode>156</NumCode><CharCode>CNY</CharCode><Nominal>1</Nominal><Name>Юань</Name><Value>12,2780</Value><VunitRate>12.278</VunitRate></Valute><Valute ID="R01750"><NumCode>410</NumCode><CharCode>KRW</CharCode><Nominal>1000</Nominal><Name>Вона</Name><Value>58,6556</Value><VunitRate>0.0586556</VunitRate></Valute></ValCurs>`;

describe("parseCbrXml (аудит 3.3): официальный XML ЦБ РФ", () => {
  it("дату берёт из атрибута ValCurs@Date", () => {
    const { date } = parseCbrXml(SAMPLE_XML);
    expect(date).toBe("12.09.2026");
  });

  it("парсит USD/EUR/CNY", () => {
    const { rates } = parseCbrXml(SAMPLE_XML);
    expect(rates.USD).toBe(82.9977);
    expect(rates.EUR).toBe(95.7793);
    expect(rates.CNY).toBe(12.278);
  });

  it("учитывает Nominal: 1000 вон → 0.0586 ₽ за 1 вону", () => {
    const { rates } = parseCbrXml(SAMPLE_XML);
    expect(rates.KRW).toBeCloseTo(0.0587, 3);
  });

  it("игнорирует не-нужные валюты", () => {
    const { rates } = parseCbrXml(SAMPLE_XML);
    expect(rates).not.toHaveProperty("AUD");
  });

  it("на пустом/битом XML → rates.EUR отсутствует (route уйдёт в fallback)", () => {
    const { rates } = parseCbrXml("");
    expect(rates.EUR).toBeUndefined();
  });
});

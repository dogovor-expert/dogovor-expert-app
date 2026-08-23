import { describe, it, expect } from "vitest";
import { applyFieldFormat, buildTemplateDefaults } from "@/lib/format";
import type { LegalTemplate, TemplateField } from "@/data/types";

const tf = (id: string, type: TemplateField["type"]): TemplateField => ({
  id,
  label: id,
  type,
  defaultValue: "",
  category: "contract",
});

describe("applyFieldFormat", () => {
  it("поле *_words (прописью) не форматируется как число", () => {
    expect(
      applyFieldFormat(tf("contract_price_words", "text"), "Шестьсот пятьдесят тысяч рублей 00 копеек")
    ).toBe("Шестьсот пятьдесят тысяч рублей 00 копеек");
  });

  it("сумма цифрами по-прежнему фильтруется", () => {
    expect(applyFieldFormat(tf("contract_price", "number"), "abc650000def")).toBe("650000");
  });

  it("VIN форматируется в верхний регистр без пробелов", () => {
    expect(applyFieldFormat(tf("car_vin", "text"), "xta 219000 l0123456")).toBe(
      "XTA219000L0123456"
    );
  });

  it("код подразделения паспорта маскируется как XXX-XXX", () => {
    expect(applyFieldFormat(tf("seller_passport_code", "text"), "770001")).toBe("770-001");
    expect(applyFieldFormat(tf("seller_passport_code", "text"), "77")).toBe("77");
    expect(applyFieldFormat(tf("department_code", "text"), "050001")).toBe("050-001");
  });
});

describe("buildTemplateDefaults", () => {
  it("radio/select получают defaultValue, текстовые — пусто", () => {
    const t: LegalTemplate = {
      id: "t",
      name: "Т",
      category: "auto",
      description: "",
      lastUpdated: "2026",
      actSource: "",
      suggestedDocs: [],
      fields: [
        { id: "seller_status", label: "S", type: "radio" as const, defaultValue: "person", category: "seller" as const },
        { id: "seller_fio", label: "F", type: "text" as const, defaultValue: "Иванов Иван Иванович", category: "seller" as const },
      ],
      previewTemplate: "",
    };
    const v = buildTemplateDefaults(t);
    expect(v.seller_status).toBe("person");
    expect(v.seller_fio).toBe("");
  });
});
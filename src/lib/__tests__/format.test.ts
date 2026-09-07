import { describe, it, expect } from "vitest";
import { applyFieldFormat, buildTemplateDefaults, formatInn, formatPhoneRu } from "@/lib/format";
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

  it("ИНН форматируется группами по 4 цифры через applyFieldFormat", () => {
    expect(applyFieldFormat(tf("seller_inn", "text"), "7707083893")).toBe("7707 0838 93");
    expect(applyFieldFormat(tf("buyer_inn", "text"), "123456789012")).toBe("1234 5678 9012");
    expect(applyFieldFormat(tf("seller_inn", "text"), "770 708 389 3")).toBe("7707 0838 93");
    expect(applyFieldFormat(tf("seller_inn", "text"), "")).toBe("");
  });

  it("Телефон форматируется как +7 (XXX) XXX-XX-XX", () => {
    expect(applyFieldFormat(tf("seller_phone", "text"), "")).toBe("+7");
    expect(applyFieldFormat(tf("seller_phone", "text"), "9")).toBe("+7 (9");
    expect(applyFieldFormat(tf("seller_phone", "text"), "925")).toBe("+7 (925");
    expect(applyFieldFormat(tf("seller_phone", "text"), "925123")).toBe("+7 (925) 123");
    expect(applyFieldFormat(tf("seller_phone", "text"), "9251234")).toBe("+7 (925) 123-4");
    expect(applyFieldFormat(tf("seller_phone", "text"), "9251234567")).toBe("+7 (925) 123-45-67");
    // 8... нормализуется к 7...
    expect(applyFieldFormat(tf("seller_phone", "text"), "89251234567")).toBe("+7 (925) 123-45-67");
  });
});

describe("formatInn", () => {
  it("группирует по 4 цифры", () => {
    expect(formatInn("7707083893")).toBe("7707 0838 93");
    expect(formatInn("123456789012")).toBe("1234 5678 9012");
  });
  it("обрезает лишние цифры и схлопывает пробелы/дефисы", () => {
    expect(formatInn("77070838930000")).toBe("7707 0838 9300");
    expect(formatInn("7 7 0 7-0-8 3 8 9 3")).toBe("7707 0838 93");
  });
  it("пустая строка → пустая", () => {
    expect(formatInn("")).toBe("");
  });
});

describe("formatPhoneRu", () => {
  it("постепенный набор цифр", () => {
    expect(formatPhoneRu("")).toBe("+7");
    expect(formatPhoneRu("9")).toBe("+7 (9");
    expect(formatPhoneRu("925")).toBe("+7 (925");
    expect(formatPhoneRu("9251")).toBe("+7 (925) 1");
    expect(formatPhoneRu("925123")).toBe("+7 (925) 123");
    expect(formatPhoneRu("9251234")).toBe("+7 (925) 123-4");
    expect(formatPhoneRu("92512345")).toBe("+7 (925) 123-45");
    expect(formatPhoneRu("925123456")).toBe("+7 (925) 123-45-6");
    expect(formatPhoneRu("9251234567")).toBe("+7 (925) 123-45-67");
  });
  it("8... нормализуется к +7...", () => {
    expect(formatPhoneRu("89251234567")).toBe("+7 (925) 123-45-67");
  });
  it(">11 цифр сохраняет последние 11 цифр", () => {
    // 15 цифр: slice(-11) = последние 11. Не начинается с 7/8 — не нормализуется.
    // Это поведение для «грязного» ввода; просто проверим, что нет падения.
    const out = formatPhoneRu("89251234567999");
    expect(out).toMatch(/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/);
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
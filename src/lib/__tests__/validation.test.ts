import { describe, it, expect } from "vitest";
import {
  runLegalAudit,
  isFieldVisible,
  normalizeOptions,
  innChecksumValid,
  ogrnChecksumValid,
  snilsChecksumValid,
} from "@/lib/validation";
import { dkpLikeTemplate, dkpLikeFields } from "./fixtures";

describe("innChecksumValid", () => {
  it("валидный ИНН юрлица", () => {
    expect(innChecksumValid("7707083893")).toBe(true);
  });

  it("невалидная контрольная цифра", () => {
    expect(innChecksumValid("7707083894")).toBe(false);
  });

  it("12-значный ИНН физлица", () => {
    expect(innChecksumValid("123456789047")).toBe(true);
  });
});

describe("ogrnChecksumValid", () => {
  it("валидный ОГРН (Сбербанк)", () => {
    expect(ogrnChecksumValid("1027700132195")).toBe(true);
  });

  it("невалидная контрольная цифра", () => {
    expect(ogrnChecksumValid("1027700132194")).toBe(false);
  });
});

describe("snilsChecksumValid", () => {
  it("валидный СНИЛС", () => {
    expect(snilsChecksumValid("11223344595")).toBe(true);
  });

  it("невалидный СНИЛС", () => {
    expect(snilsChecksumValid("11223344596")).toBe(false);
  });
});

describe("isFieldVisible", () => {
  it("без зависимости — виден всегда", () => {
    expect(isFieldVisible(dkpLikeFields[0], {})).toBe(true);
  });

  it("по dependsOn.value", () => {
    const field = dkpLikeFields.find((f) => f.id === "seller_inn")!;
    expect(isFieldVisible(field, { is_company: "true" })).toBe(true);
    expect(isFieldVisible(field, { is_company: "false" })).toBe(false);
    expect(isFieldVisible(field, {})).toBe(false);
  });
});

describe("normalizeOptions", () => {
  it("строки → {label, value}", () => {
    expect(normalizeOptions(["а", "б"])).toEqual([
      { label: "а", value: "а" },
      { label: "б", value: "б" },
    ]);
  });

  it("undefined → []", () => {
    expect(normalizeOptions(undefined)).toEqual([]);
  });
});

describe("runLegalAudit", () => {
  it("required пустое поле → error", () => {
    const results = runLegalAudit(dkpLikeTemplate, {});
    const sellerFio = results.find((r) => r.field === "seller_fio");
    expect(sellerFio?.type).toBe("error");
    expect(sellerFio?.message).toContain("обязательно");
  });

  it("значение по умолчанию (образец) в важном поле → warning", () => {
    const results = runLegalAudit(dkpLikeTemplate, {
      seller_fio: "Иванов Иван Иванович",
    });
    const sellerFio = results.find((r) => r.field === "seller_fio");
    expect(sellerFio?.type).toBe("warning");
    expect(sellerFio?.message).toContain("значение по умолчанию");
  });

  it("реальные данные в required → нет error", () => {
    const results = runLegalAudit(dkpLikeTemplate, {
      seller_fio: "Смирнов Пётр Сергеевич",
    });
    expect(results.filter((r) => r.field === "seller_fio" && r.type === "error")).toHaveLength(0);
  });

  it("валидные паспортные данные → нет ошибок", () => {
    const results = runLegalAudit(dkpLikeTemplate, {
      seller_passport_series: "45 12",
      seller_passport_number: "348912",
    });
    expect(results.filter((r) => r.field.includes("passport") && r.type === "error")).toHaveLength(0);
  });

  it("неверная серия паспорта → error", () => {
    const results = runLegalAudit(dkpLikeTemplate, {
      seller_passport_series: "45A1",
    });
    expect(results.find((r) => r.field === "seller_passport_series")?.type).toBe("error");
  });

  it("VIN 17 символов с известным WMI → success", () => {
    const results = runLegalAudit(dkpLikeTemplate, {
      car_vin: "XW8ZZZ61XKG123456",
    });
    const vin = results.find((r) => r.field === "car_vin");
    expect(vin?.type).toBe("success");
    expect(vin?.message).toContain("Volkswagen");
  });

  it("короткий VIN → error", () => {
    const results = runLegalAudit(dkpLikeTemplate, { car_vin: "1234" });
    expect(results.find((r) => r.field === "car_vin")?.type).toBe("error");
  });

  it("валидный ИНН → нет результата по полю", () => {
    const results = runLegalAudit(dkpLikeTemplate, {
      seller_inn: "7707083893",
      is_company: "true",
    });
    expect(results.filter((r) => r.field === "seller_inn")).toHaveLength(0);
  });

  it("ИНН с неверной контрольной цифрой → warning", () => {
    const results = runLegalAudit(dkpLikeTemplate, {
      seller_inn: "7707083894",
      is_company: "true",
    });
    const inn = results.find((r) => r.field === "seller_inn");
    expect(inn?.type).toBe("warning");
    expect(inn?.message).toContain("контрольного числа");
  });

  it("короткий ИНН → error", () => {
    const results = runLegalAudit(dkpLikeTemplate, {
      seller_inn: "7707",
      is_company: "true",
    });
    expect(results.find((r) => r.field === "seller_inn")?.type).toBe("error");
  });

  it("скрытое зависит-поле не проверяется", () => {
    const results = runLegalAudit(dkpLikeTemplate, {
      seller_inn: "7707",
      is_company: "false",
    });
    expect(results.filter((r) => r.field === "seller_inn")).toHaveLength(0);
  });

  it("ОГРН: неверная контрольная → warning", () => {
    const results = runLegalAudit(dkpLikeTemplate, { ogrn: "1027700132194" });
    expect(results.find((r) => r.field === "ogrn")?.type).toBe("warning");
  });

  it("СНИЛС: неверная контрольная → warning", () => {
    const results = runLegalAudit(dkpLikeTemplate, { snils: "11223344596" });
    expect(results.find((r) => r.field === "snils")?.type).toBe("warning");
  });

  it("короткий БИК → error", () => {
    const results = runLegalAudit(dkpLikeTemplate, { bik: "0445" });
    expect(results.find((r) => r.field === "bik")?.type).toBe("error");
  });

  it("одно слово в ФИО → warning", () => {
    const results = runLegalAudit(dkpLikeTemplate, { seller_fio: "Иванов" });
    expect(results.find((r) => r.field === "seller_fio")?.type).toBe("warning");
  });

  it("minLength → error", () => {
    const results = runLegalAudit(dkpLikeTemplate, { title: "ab" });
    expect(results.find((r) => r.field === "title")?.type).toBe("error");
  });
});

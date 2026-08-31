import { describe, expect, it } from "vitest";
import {
  toDigits,
  normalizeDate,
  isValidInn,
  normalizeVin,
  normalizePlate,
  latinToCyrillic,
} from "@/lib/ocrPostprocess";

describe("toDigits (char-confusion в числовом контексте)", () => {
  it("превращает кириллические омоглифы в цифры", () => {
    expect(toDigits("451О")).toBe("4510");
    expect(toDigits("ЗЗО7")).toBe("3307");
    expect(toDigits("I2345Б")).toBe("123456");
  });
  it("отбрасывает мусор", () => {
    expect(toDigits("45а10х")).toBe("4510");
  });
});

describe("normalizeDate", () => {
  it("исправляет O/О в датах", () => {
    expect(normalizeDate("15.ОЗ.1985")).toBe("15.03.1985");
  });
  it("парсит разные разделители", () => {
    expect(normalizeDate("12/05/2010")).toBe("12.05.2010");
    expect(normalizeDate("12-05-2010")).toBe("12.05.2010");
  });
  it("восстанавливает век из 6 цифр", () => {
    expect(normalizeDate("150385")).toBe("15.03.1985");
    expect(normalizeDate("150310")).toBe("15.03.2010");
  });
  it("отвергает бессмысленные даты", () => {
    expect(normalizeDate("99.99.9999")).toBe("");
    expect(normalizeDate("мусор")).toBe("");
  });
});

describe("isValidInn (контрольные суммы)", () => {
  it("валидный 10-значный ИНН", () => {
    expect(isValidInn("7707083893")).toBe(true); // Сбербанк
  });
  it("невалидный ИНН отклоняется", () => {
    expect(isValidInn("7707083894")).toBe(false);
  });
  it("омоглифы нормализуются", () => {
    expect(isValidInn("77O7O83893")).toBe(true);
  });
  it("неверная длина — false", () => {
    expect(isValidInn("123")).toBe(false);
  });
});

describe("normalizeVin", () => {
  it("принимает корректный VIN", () => {
    expect(normalizeVin("XTA219010L1234567")).toBe("XTA219010L1234567");
  });
  it("исправляет I/O/Q на цифры", () => {
    expect(normalizeVin("XTA219010L123456O")).toBe("XTA219010L1234560");
  });
  it("отвергает неверную длину", () => {
    expect(normalizeVin("XTA219")).toBeNull();
  });
});

describe("normalizePlate", () => {
  it("распознаёт ГРЗ", () => {
    expect(normalizePlate("А123ВС777")).toBe("А123ВС777");
    expect(normalizePlate("а 123 вс 77")).toBe("А123ВС77");
  });
  it("отбрасывает не-ГРЗ", () => {
    expect(normalizePlate("123456")).toBeNull();
  });
});

describe("latinToCyrillic", () => {
  it("переводит омоглифы ИBAHOB → ИВАНОВ", () => {
    expect(latinToCyrillic("ИBAHOB")).toBe("ИВАНОВ");
  });
});

import { describe, it, expect } from "vitest";
import { isValidInn, formatInn } from "@/lib/inn";

describe("isValidInn", () => {
  it("пустая строка считается валидной (поле не заполнено)", () => {
    expect(isValidInn("")).toBe(true);
  });

  it("валидный ИНН юрлица (Сбербанк)", () => {
    expect(isValidInn("7707083893")).toBe(true);
  });

  it("невалидная контрольная цифра", () => {
    expect(isValidInn("7707083894")).toBe(false);
  });

  it("неверная длина", () => {
    expect(isValidInn("770708389")).toBe(false);
    expect(isValidInn("77070838931")).toBe(false);
  });

  it("нецифровые символы", () => {
    expect(isValidInn("77A7083893")).toBe(false);
  });
});

describe("formatInn", () => {
  it("вырезает мусор и ограничивает 12 цифрами", () => {
    expect(formatInn("7707 083 893 extra")).toBe("7707083893");
    expect(formatInn("1234567890123456")).toBe("123456789012");
  });
});

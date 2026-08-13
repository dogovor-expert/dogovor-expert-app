import { describe, it, expect } from "vitest";
import { numberToWords, rublesToWords, parseMoney } from "@/lib/words";

describe("numberToWords", () => {
  it("ноль", () => {
    expect(numberToWords(0)).toBe("ноль");
  });

  it("простые числа до 100", () => {
    expect(numberToWords(5)).toBe("пять");
    expect(numberToWords(21)).toBe("двадцать один");
  });

  it("сотни и тысячи", () => {
    expect(numberToWords(200)).toBe("двести");
    expect(numberToWords(1000)).toBe("одна тысяча");
    expect(numberToWords(2000)).toBe("две тысячи");
    expect(numberToWords(950000)).toBe("девятьсот пятьдесят тысяч");
  });

  it("миллионы: 1 200 000", () => {
    expect(numberToWords(1200000)).toBe("один миллион двести тысяч");
  });

  it("сложное число с несколькими разрядами", () => {
    expect(numberToWords(2112001)).toBe("два миллиона сто двенадцать тысяч один");
  });
});

describe("parseMoney", () => {
  it("пробелы и запятая", () => {
    expect(parseMoney("1 234 567,89")).toEqual({ rub: 1234567, kop: 89 });
  });

  it("точка как разделитель копеек", () => {
    expect(parseMoney("1200000.5")).toEqual({ rub: 1200000, kop: 50 });
  });

  it("несколько точек — лишние отбрасываются", () => {
    expect(parseMoney("1.200.000,00")).toEqual({ rub: 1200000, kop: 0 });
  });

  it("мусор → null", () => {
    expect(parseMoney("")).toBeNull();
    expect(parseMoney("abc")).toBeNull();
    expect(parseMoney("--")).toBeNull();
  });
});

describe("rublesToWords", () => {
  it("целая сумма", () => {
    expect(rublesToWords("950000")).toBe("девятьсот пятьдесят тысяч рублей 00 копеек");
  });

  it("сумма с копейками", () => {
    expect(rublesToWords("1 200 000,50")).toBe("один миллион двести тысяч рублей 50 копеек");
  });

  it("единственное число рубля", () => {
    expect(rublesToWords("21")).toBe("двадцать один рубль 00 копеек");
  });

  it("несколько рублей (2-4)", () => {
    expect(rublesToWords("22")).toBe("двадцать два рубля 00 копеек");
  });

  it("ноль", () => {
    expect(rublesToWords("0")).toBe("ноль рублей 00 копеек");
  });

  it("пустая строка → null", () => {
    expect(rublesToWords("")).toBeNull();
  });
});

import { describe, it, expect } from "vitest";
import { cn, escapeHtml, formatNumber, validateInn } from "@/lib/utils";

describe("cn", () => {
  it("склеивает строки и отбрасывает пустые значения", () => {
    expect(cn("a", null, undefined, false, "b", "")).toBe("a b");
  });

  it("пустой вызов → пустая строка", () => {
    expect(cn()).toBe("");
  });
});

describe("escapeHtml", () => {
  it("экранирует спецсимволы", () => {
    expect(escapeHtml(`<b>"'&</b>`)).toBe("&lt;b&gt;&quot;&#39;&amp;&lt;/b&gt;");
  });
});

describe("formatNumber", () => {
  it("форматирует по ru-RU с неразрывным пробелом", () => {
    expect(formatNumber(950000)).toBe("950\u00A0000");
  });
});

describe("validateInn", () => {
  it("валидный ИНН юрлица", () => {
    expect(validateInn("7707083893")).toBe(true);
  });

  it("невалидная контрольная цифра", () => {
    expect(validateInn("7707083894")).toBe(false);
  });
});

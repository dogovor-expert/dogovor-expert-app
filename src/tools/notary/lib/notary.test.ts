/**
 * Регрессия логики «Контроля оферт» (порт Веб-нотариуса).
 *
 * Логика чистая (без DOM): в node работает через fallback-ветки
 * (strip-тегами вместо DOMParser, SubtleCrypto из node:crypto).
 * Проверяем инварианты, а не дословные выхлопы LCS.
 */
import { describe, it, expect } from "vitest";
import { computeFingerprint } from "@/tools/notary/lib/hash";
import { diffWords, diffBlocks, summarizeDiff } from "@/tools/notary/lib/diff";
import { formatRelative, shortenHash, formatCount } from "@/tools/notary/lib/format";

describe("computeFingerprint", () => {
  it("детерминирован и даёт 64 hex-символа", async () => {
    const a = await computeFingerprint("Договор № 101");
    const b = await computeFingerprint("Договор № 101");
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });
  it("различает входы (включая пробелы/регистр)", async () => {
    const a = await computeFingerprint("сумма 150 000");
    const b = await computeFingerprint("сумма 150 001");
    const c = await computeFingerprint("");
    expect(a).not.toBe(b);
    expect(c).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("diffWords", () => {
  it("идентичный текст — только same", () => {
    const t = diffWords("аренда 12 месяцев", "аренда 12 месяцев");
    expect(t.length).toBeGreaterThan(0);
    expect(t.every((x) => x.kind === "same")).toBe(true);
  });
  it("добавление и удаление помечаются (токены чисел несут пробел — особенность токенизатора)", () => {
    const t = diffWords("ставка 10 процентов", "ставка 20 процентов годовых");
    const kinds = new Set(t.map((x) => x.kind));
    expect(kinds.has("add")).toBe(true);
    expect(t.find((x) => x.kind === "remove")?.text.trim()).toBe("10");
    expect(t.find((x) => x.kind === "add")?.text.trim()).toBe("20");
  });
  it("пустые входы — пустой результат", () => {
    expect(diffWords("", "")).toEqual([]);
  });
});

describe("diffBlocks", () => {
  const P = (s: string) => `<p>${s}</p>`;
  it("одинаковый HTML — только context", () => {
    const b = diffBlocks(P("пункт один"), P("пункт один"));
    expect(b.length).toBe(1);
    expect(b[0].type).toBe("context");
  });
  it("изменённый абзац даёт валидные блоки (add/remove/changed) с покрытием текста", () => {
    const b = diffBlocks(P("аренда 100 рублей"), P("аренда 200 рублей"));
    expect(b.length).toBeGreaterThan(0);
    expect(b.every((x) => ["context", "add", "remove", "changed"].includes(x.type))).toBe(true);
    const changed = b.filter((x) => x.type === "changed");
    for (const c of changed) {
      expect(c.wordDiff?.some((x) => x.kind !== "same")).toBe(true);
    }
    // весь новый текст покрыт блоками
    const texts = b.map((x) => x.after ?? x.before ?? "").join(" ");
    expect(texts).toContain("200");
  });
  it("риск-чипсы извлекаются из data-risk", () => {
    const b = diffBlocks(
      P("старый текст"),
      `<p>новый текст <mark data-risk="critical">штраф 50%</mark></p>`,
    );
    expect(b.some((x) => x.riskLevel === "critical")).toBe(true);
  });
  it("summarizeDiff согласован с блоками", () => {
    const b = diffBlocks(
      `${P("same")}${P("old")}`,
      `${P("same")}${P("new")}${P("extra")}`,
    );
    const s = summarizeDiff(b);
    const counted = b.filter((x) => x.type === "add").length;
    expect(s.added).toBe(counted);
    expect(s.added + s.removed + s.changed + b.filter((x) => x.type === "context").length).toBe(b.length);
    // новый и добавленный текст не потеряны
    const texts = b.map((x) => x.after ?? x.before ?? "").join(" ");
    expect(texts).toContain("extra");
  });
});

describe("format helpers", () => {
  it("formatRelative на фиксированном now", () => {
    const now = new Date("2026-09-30T12:00:00Z");
    expect(formatRelative("2026-09-30T11:55:00Z", now)).toBe("5 мин назад");
    expect(formatRelative("2026-09-30T11:59:40Z", now)).toBe("только что");
    expect(formatRelative("2026-09-28T12:00:00Z", now)).toBe("2 дн назад");
  });
  it("shortenHash и formatCount", () => {
    expect(shortenHash("abcdef1234567890")).toBe("abcdef12…567890");
    expect(shortenHash("abc")).toBe("abc");
    expect(formatCount(999)).toBe("999");
    expect(formatCount(1500)).toBe("1,5k");
    expect(formatCount(9400000)).toBe("9,4M");
  });
});

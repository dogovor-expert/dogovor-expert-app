import { describe, expect, it } from "vitest";
import {
  COMPARE_FAQ,
  COMPARE_FEATURES,
  COMPARE_META,
  COMPARE_NORMS,
  COMPARE_RELATED,
  COMPARE_SEO_SECTIONS,
  COMPARE_STEPS,
} from "@/data/doc-compare";

describe("COMPARE_META", () => {
  it("путь — /sravnenie-dogovorov", () => {
    expect(COMPARE_META.path).toBe("/sravnenie-dogovorov");
  });

  it("title и description в допустимых пределах", () => {
    expect(COMPARE_META.title.length).toBeLessThanOrEqual(70);
    expect(COMPARE_META.description.length).toBeGreaterThanOrEqual(120);
    expect(COMPARE_META.description.length).toBeLessThanOrEqual(185);
  });

  it("ключевые слова заданы", () => {
    expect(COMPARE_META.keywords.length).toBeGreaterThanOrEqual(5);
    expect(COMPARE_META.keywords.every((k) => k.length > 3)).toBe(true);
  });
});

describe("COMPARE_STEPS / COMPARE_FEATURES", () => {
  it("шаги содержательны", () => {
    expect(COMPARE_STEPS.length).toBeGreaterThanOrEqual(3);
    for (const s of COMPARE_STEPS) {
      expect(s.title.length).toBeGreaterThan(5);
      expect(s.text.length).toBeGreaterThanOrEqual(40);
    }
  });

  it("преимущества содержательны", () => {
    expect(COMPARE_FEATURES.length).toBeGreaterThanOrEqual(4);
    for (const f of COMPARE_FEATURES) {
      expect(f.text.length).toBeGreaterThanOrEqual(40);
    }
  });
});

describe("COMPARE_NORMS", () => {
  it("каждая норма ссылается на ГК РФ", () => {
    expect(COMPARE_NORMS.length).toBeGreaterThanOrEqual(4);
    for (const n of COMPARE_NORMS) {
      expect(n.title).toContain("ГК РФ");
      expect(n.text.length).toBeGreaterThanOrEqual(80);
    }
  });
});

describe("COMPARE_SEO_SECTIONS", () => {
  it("разделы имеют заголовок и абзацы", () => {
    expect(COMPARE_SEO_SECTIONS.length).toBeGreaterThanOrEqual(2);
    for (const s of COMPARE_SEO_SECTIONS) {
      expect(s.h2.length).toBeGreaterThan(5);
      expect(s.paragraphs.length).toBeGreaterThanOrEqual(2);
      for (const p of s.paragraphs) {
        expect(p.length).toBeGreaterThanOrEqual(120);
      }
    }
  });
});

describe("COMPARE_FAQ", () => {
  it("вопросы уникальны и ответы содержательны", () => {
    expect(COMPARE_FAQ.length).toBeGreaterThanOrEqual(6);
    const qs = COMPARE_FAQ.map((f) => f.q);
    expect(new Set(qs).size).toBe(qs.length);
    for (const f of COMPARE_FAQ) {
      expect(f.q.length).toBeGreaterThan(10);
      expect(f.a.length).toBeGreaterThanOrEqual(80);
    }
  });
});

describe("COMPARE_RELATED", () => {
  it("внутренние ссылки корректны", () => {
    expect(COMPARE_RELATED.length).toBeGreaterThanOrEqual(4);
    for (const r of COMPARE_RELATED) {
      expect(r.href.startsWith("/")).toBe(true);
      expect(r.label.length).toBeGreaterThan(5);
    }
    expect(new Set(COMPARE_RELATED.map((r) => r.href)).size).toBe(
      COMPARE_RELATED.length
    );
  });
});

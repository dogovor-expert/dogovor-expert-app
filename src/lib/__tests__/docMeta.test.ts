import { describe, it, expect } from "vitest";
import {
  truncateWord,
  stripParenthetical,
  docTitle,
  docDesc,
  blankTitle,
  blankDesc,
  SEO_YEAR,
} from "@/lib/seo/docMeta";
import { LEGAL_TEMPLATES } from "@/data/templates";

describe("docMeta.truncateWord", () => {
  it("короткий текст не трогает", () => {
    expect(truncateWord("Договор займа", 60)).toBe("Договор займа");
  });

  it("режет по границе слова и не добавляет троеточие", () => {
    const out = truncateWord("слово ".repeat(30), 40);
    expect(out.length).toBeLessThanOrEqual(40);
    expect(out).not.toMatch(/…$/);
    expect(out).not.toMatch(/\s$/);
  });

  it("схлопывает пробелы", () => {
    expect(truncateWord("а   б\nв", 60)).toBe("а б в");
  });
});

describe("docMeta.stripParenthetical", () => {
  it("снимает хвостовые скобки", () => {
    expect(stripParenthetical("Договор аренды автомобиля (без экипажа)")).toBe(
      "Договор аренды автомобиля"
    );
  });
  it("не снимает, если имя станет слишком коротким", () => {
    expect(stripParenthetical("Акт (передачи)")).toBe("Акт (передачи)");
  });
});

describe("docMeta.docTitle", () => {
  it("короткое имя + год + образец + скачать", () => {
    const t = docTitle("Брачный договор");
    expect(t).toContain(String(SEO_YEAR));
    expect(t).toContain("образец");
    expect(t.length).toBeLessThanOrEqual(60);
  });

  it("для ВСЕХ шаблонов: год присутствует и длина ≤60", () => {
    for (const tpl of LEGAL_TEMPLATES) {
      const t = docTitle(tpl.name);
      expect(t, tpl.name).toContain(String(SEO_YEAR));
      expect(t.length, `${tpl.name} → ${t}`).toBeLessThanOrEqual(60);
      expect(t.length, tpl.name).toBeGreaterThan(10);
    }
  });

  it("длинное имя сохраняет год и обрезается без «…»", () => {
    const t = docTitle("Договор аренды автомобиля между физическими лицами (без экипажа)");
    expect(t).toContain(String(SEO_YEAR));
    expect(t.length).toBeLessThanOrEqual(60);
    expect(t).not.toContain("…");
  });
});

describe("docMeta.docDesc", () => {
  it("год и форматы стоят в начале описания", () => {
    const d = docDesc("Краткое описание.");
    expect(d.startsWith(`Образец ${SEO_YEAR} года (Word и PDF).`)).toBe(true);
  });

  it("для ВСЕХ шаблонов: год присутствует и длина ≤160", () => {
    for (const tpl of LEGAL_TEMPLATES) {
      const d = docDesc(tpl.description);
      expect(d, tpl.name).toContain(String(SEO_YEAR));
      expect(d.length, tpl.name).toBeLessThanOrEqual(160);
    }
  });
});

describe("docMeta.blankTitle/blankDesc", () => {
  it("год в заголовке бланка, длина ≤60", () => {
    for (const tpl of LEGAL_TEMPLATES) {
      const t = blankTitle(tpl.name);
      expect(t, tpl.name).toContain(String(SEO_YEAR));
      expect(t.length, tpl.name).toBeLessThanOrEqual(60);
      const d = blankDesc(tpl.name);
      expect(d).toContain(String(SEO_YEAR));
      expect(d.length).toBeLessThanOrEqual(160);
    }
  });
});

describe("docMeta: уникальность SEO-title документов", () => {
  // Инвариант: эффективный заголовок страницы /documents/{id} (seoTitle ?? docTitle)
  // обязан быть уникальным — иначе два документа конкурируют в выдаче (каннибализация).
  it("у всех шаблонов эффективный title уникален и ≤60", () => {
    const seen = new Map<string, string>();
    for (const tpl of LEGAL_TEMPLATES) {
      const title = tpl.seoTitle ?? docTitle(tpl.name);
      expect(title.length, `${tpl.id} → ${title}`).toBeLessThanOrEqual(60);
      const prev = seen.get(title);
      expect(prev, `дубль title «${title}»: ${prev} и ${tpl.id}`).toBeUndefined();
      seen.set(title, tpl.id);
    }
  });

  it("явный seoTitle содержит год и не пустой", () => {
    for (const tpl of LEGAL_TEMPLATES) {
      if (!tpl.seoTitle) continue;
      expect(tpl.seoTitle, tpl.id).toContain(String(SEO_YEAR));
      expect(tpl.seoTitle.trim().length, tpl.id).toBeGreaterThan(10);
    }
  });
});
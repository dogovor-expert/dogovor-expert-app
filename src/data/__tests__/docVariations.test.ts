import { describe, it, expect } from "vitest";
import { DOC_VARIATIONS } from "@/data/docVariations";
import { LEGAL_TEMPLATES } from "@/data/legalTemplates";

describe("каталог вариаций шаблонов (programmatic SEO)", () => {
  it("id вариаций уникальны, формат en-lower-hyphens", () => {
    const ids = new Set(DOC_VARIATIONS.map((v) => v.id));
    expect(ids.size).toBe(DOC_VARIATIONS.length);
    for (const v of DOC_VARIATIONS) {
      expect(v.id, v.id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    }
  });

  it("templateId каждой вариации существует в LEGAL_TEMPLATES", () => {
    const templateIds = new Set(LEGAL_TEMPLATES.map((t) => t.id));
    for (const v of DOC_VARIATIONS) {
      expect(
        templateIds.has(v.templateId),
        `вариация ${v.id} ссылается на несуществующий templateId ${v.templateId}`
      ).toBe(true);
    }
  });

  it("h1 / title / description непустые и уникальны глобально", () => {
    const h1 = new Set(DOC_VARIATIONS.map((v) => v.h1));
    const title = new Set(DOC_VARIATIONS.map((v) => v.title));
    const description = new Set(DOC_VARIATIONS.map((v) => v.description));
    expect(h1.size).toBe(DOC_VARIATIONS.length);
    expect(title.size).toBe(DOC_VARIATIONS.length);
    expect(description.size).toBe(DOC_VARIATIONS.length);

    for (const v of DOC_VARIATIONS) {
      expect(v.h1, v.id).toBeTruthy();
      expect(v.title, v.id).toBeTruthy();
      expect(v.description, v.id).toBeTruthy();
    }
  });

  it("title ≤ 60 симв., description в диапазоне 140–160", () => {
    for (const v of DOC_VARIATIONS) {
      expect(v.title.length, `${v.id}: title`).toBeLessThanOrEqual(60);
      expect(v.description.length, `${v.id}: description`).toBeGreaterThanOrEqual(140);
      expect(v.description.length, `${v.id}: description`).toBeLessThanOrEqual(160);
    }
  });

  it("specifics ≥ 3, faq ≥ 3", () => {
    for (const v of DOC_VARIATIONS) {
      expect(v.specifics.length, `${v.id}: specifics`).toBeGreaterThanOrEqual(3);
      expect(v.faq.length, `${v.id}: faq`).toBeGreaterThanOrEqual(3);
    }
    for (const v of DOC_VARIATIONS) {
      for (const s of v.specifics) {
        expect(typeof s && s.length > 40, `${v.id}: specifics пункт слишком короткий`).toBe(true);
      }
      for (const { q, a } of v.faq) {
        expect(q && a, `${v.id}: faq q/a пустые`).toBeTruthy();
      }
    }
  });

  it("h1 не совпадает с name родительского шаблона", () => {
    const parentNames = new Set(
      LEGAL_TEMPLATES.map((t) => t.name.toLocaleLowerCase("ru"))
    );
    for (const v of DOC_VARIATIONS) {
      expect(
        parentNames.has(v.h1.toLocaleLowerCase("ru")),
        `h1 вариации ${v.id} совпадает с именем шаблона`
      ).toBe(false);
    }
  });

  it("пилот покрывает ≥ 4 категорий и ≥ 2 вариации на категорию", () => {
    const byCategory = new Map<string, number>();
    for (const v of DOC_VARIATIONS) {
      const parent = LEGAL_TEMPLATES.find((t) => t.id === v.templateId);
      expect(parent, `${v.id}: нет родителя`).toBeDefined();
      const cat = parent!.category;
      byCategory.set(cat, (byCategory.get(cat) || 0) + 1);
    }
    expect(byCategory.size).toBeGreaterThanOrEqual(4);
    for (const [cat, count] of byCategory) {
      expect(count, `категория ${cat}`).toBeGreaterThanOrEqual(2);
    }
  });

  it("normNotes непустые", () => {
    for (const v of DOC_VARIATIONS) {
      expect(v.normNotes, v.id).toBeTruthy();
    }
  });
});
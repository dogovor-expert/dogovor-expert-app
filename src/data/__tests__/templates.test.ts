import { describe, it, expect } from "vitest";
import { LEGAL_TEMPLATES } from "@/data/legalTemplates";
import { TEMPLATE_META } from "@/data/templatesMeta";
import { TEMPLATE_COUNT } from "@/lib/site";
import { buildTemplateDefaults } from "@/lib/format";

describe("каталог шаблонов", () => {
  it("570 шаблонов (договоры + заявления + арбитраж + корпоративные + госзакупки + кадровые + претензии по сферам), id уникальны", () => {
    expect(LEGAL_TEMPLATES.length).toBe(570);
    const ids = new Set(LEGAL_TEMPLATES.map((t) => t.id));
    expect(ids.size).toBe(LEGAL_TEMPLATES.length);
  });

  it("TEMPLATE_COUNT (UI-строки) совпадает с каталогом — дрейф невозможен", () => {
    // Регрессия 29.09.2026: в текстах страниц захардкожено было «369 шаблонов».
    expect(TEMPLATE_COUNT).toBe(LEGAL_TEMPLATES.length);
    expect(TEMPLATE_META.length).toBe(LEGAL_TEMPLATES.length);
  });

  it("suggestedDocs ссылается только на существующие id шаблонов", () => {
    // Регрессия 29.09.2026: 88 ссылок были заданы русским НАЗВАНИЕМ или
    // несуществующим id — потребители резолвят их через .filter(Boolean),
    // поэтому блок «Связанные документы» молча терял спутников.
    const ids = new Set(LEGAL_TEMPLATES.map((t) => t.id));
    const broken: string[] = [];
    for (const t of LEGAL_TEMPLATES) {
      for (const d of t.suggestedDocs ?? []) {
        if (!ids.has(d)) broken.push(`${t.id} -> ${d}`);
      }
    }
    expect(broken).toEqual([]);
  });

  it("suggestedDocs не содержит самоссылок и дублей", () => {
    const problems: string[] = [];
    for (const t of LEGAL_TEMPLATES) {
      const docs = t.suggestedDocs ?? [];
      if (docs.includes(t.id)) problems.push(`${t.id}: самоссылка`);
      if (new Set(docs).size !== docs.length) problems.push(`${t.id}: дубль`);
    }
    expect(problems).toEqual([]);
  });

  it("все категории валидны", () => {
    const valid = [
      "auto",
      "business",
      "realty",
      "finance",
      "legal",
      "family",
      "other",
      "migration",
      "postal",
    ];
    for (const t of LEGAL_TEMPLATES) {
      expect(valid, `шаблон ${t.id}`).toContain(t.category);
    }
  });

  it("каждый шаблон имеет id, name и поля", () => {
    for (const t of LEGAL_TEMPLATES) {
      expect(t.id, `шаблон ${t.id}`).toBeTruthy();
      expect(t.name, `шаблон ${t.id}`).toBeTruthy();
      expect(Array.isArray(t.fields), `шаблон ${t.id}`).toBe(true);
      expect(t.fields.length, `шаблон ${t.id}`).toBeGreaterThan(0);
    }
  });

  it("buildTemplateDefaults работает для всех шаблонов", () => {
    for (const t of LEGAL_TEMPLATES) {
      const values = buildTemplateDefaults(t);
      for (const f of t.fields) {
        expect(
          Object.prototype.hasOwnProperty.call(values, f.id),
          `шаблон ${t.id}: не хватает дефолта для поля ${f.id}`
        ).toBe(true);
      }
    }
  });
});

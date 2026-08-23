import { describe, it, expect } from "vitest";
import { LEGAL_TEMPLATES } from "@/data/legalTemplates";
import { buildTemplateDefaults } from "@/lib/format";

describe("каталог шаблонов", () => {
  it("369 шаблонов, id уникальны", () => {
    expect(LEGAL_TEMPLATES.length).toBe(369);
    const ids = new Set(LEGAL_TEMPLATES.map((t) => t.id));
    expect(ids.size).toBe(LEGAL_TEMPLATES.length);
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

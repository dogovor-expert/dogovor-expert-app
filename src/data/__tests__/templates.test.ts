import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { LEGAL_TEMPLATES } from "@/data/legalTemplates";
import { TEMPLATE_COUNT, templateWord } from "@/data/templateCount";
import { buildTemplateDefaults } from "@/lib/format";

describe("каталог шаблонов", () => {
  it("570 шаблонов (369 + 139 заявлений + 11 арбитраж + 15 корпоративных + 8 госзакупок + 16 кадровых + 12 претензий по сферам), id уникальны", () => {
    expect(LEGAL_TEMPLATES.length).toBe(570);
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

  it("TEMPLATE_COUNT синхронен с LEGAL_TEMPLATES (аудит 29.09.2026: был хардкод 369)", () => {
    expect(TEMPLATE_COUNT).toBe(LEGAL_TEMPLATES.length);
    expect(templateWord(1)).toBe("шаблон");
    expect(templateWord(3)).toBe("шаблона");
    expect(templateWord(570)).toBe("шаблонов");
    expect(templateWord(11)).toBe("шаблонов");
  });

  it("public/llms.txt не врёт про число шаблонов", () => {
    const llms = readFileSync(join(process.cwd(), "public", "llms.txt"), "utf8");
    expect(llms).toContain(`— ${TEMPLATE_COUNT} `);
    expect(llms).not.toContain("369");
  });

  it("все suggestedDocs резолвятся в id шаблонов (аудит 29.09.2026: было 88 битых)", () => {
    const ids = new Set(LEGAL_TEMPLATES.map((t) => t.id));
    const broken: string[] = [];
    for (const t of LEGAL_TEMPLATES) {
      for (const l of t.suggestedDocs ?? []) {
        if (!ids.has(l)) broken.push(`${t.id} -> ${l}`);
      }
    }
    expect(broken).toEqual([]);
  });
});

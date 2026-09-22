import { describe, expect, it } from "vitest";
import { LEGAL_TEMPLATES } from "@/data/legalTemplates";
import { TEMPLATE_PREVIEWS } from "@/data/templatePreviews";

/**
 * Инвариант, которого раньше не было: у КАЖДОГО шаблона должен быть непустой
 * текст документа. Иначе рендер даёт пустой HTML, и пользователь подписывает
 * пустой PDF (или видит пустой предпросмотр).
 *
 * Текст берётся по приоритету: TEMPLATE_PREVIEWS[id] → inline previewTemplate
 * (тот же порядок, что в клиенте и в /api/sign/prepare).
 */
describe("тексты документов (templatePreviews)", () => {
  it("у каждого шаблона есть непустой текст для рендера", () => {
    const missing = LEGAL_TEMPLATES.filter((t) => {
      const preview = TEMPLATE_PREVIEWS[t.id] ?? t.previewTemplate ?? "";
      return preview.trim().length === 0;
    }).map((t) => t.id);

    expect(missing).toEqual([]);
  });

  it("шаблонов с текстом заметно больше, чем без него (санити-проверка)", () => {
    expect(LEGAL_TEMPLATES.length).toBeGreaterThan(300);
  });
});

import { describe, it, expect } from "vitest";
import { LEGAL_TEMPLATES } from "@/data/templates";
import { TEMPLATE_PREVIEWS } from "@/data/templatePreviews";
import { renderTemplateDocument, applyBlankMarkers } from "@/lib/renderDocument";
import type { LegalTemplate } from "@/data/types";

const t = LEGAL_TEMPLATES.find((x) => x.id === "dkp-auto") as LegalTemplate;

function renderBlank(mode: "html" | "pdf" | "docx"): string {
  return renderTemplateDocument(t, {}, {
    previewTemplate: TEMPLATE_PREVIEWS[t.id] ?? t.previewTemplate,
    blank: true,
    blankMode: mode,
  });
}

describe("пустой бланк", () => {
  it("в html-режиме не остаётся сырых маркеров и есть брендинг", () => {
    const html = renderBlank("html");
    expect(html).not.toContain("__BLANK__");
    expect(html).toContain("blank-field");
    expect(html).toContain("dogovor.expert");
    expect(html).toContain(t.name);
  });

  it("в pdf-режиме поля заменяются подчёркиваниями, маркеров нет", () => {
    const html = renderBlank("pdf");
    expect(html).not.toContain("__BLANK__");
    expect(html).toContain("dogovor.expert");
    expect(html).toMatch(/_+/);
  });

  it("в docx-режиме поля заменяются подчёркиваниями", () => {
    const html = renderBlank("docx");
    expect(html).not.toContain("__BLANK__");
    expect(html).toContain("dogovor.expert");
  });

  it("applyBlankMarkers корректно раскрывает маркер конкретного поля", () => {
    const field = t.fields[0];
    const html = `до __BLANK__${field.id}__ после`;
    const out = applyBlankMarkers(html, t, "html");
    expect(out).not.toContain("__BLANK__");
    expect(out).toContain("blank-field");
  });

  it("маркеры разных полей не пересекаются (нет частичного совпадения)", () => {
    // seller — префикс seller_fio: проверяем, что токены не путаются.
    const fake = {
      ...t,
      fields: [
        { id: "seller", type: "text", label: "Продавец", category: "seller" },
        { id: "seller_fio", type: "text", label: "ФИО продавца", category: "seller" },
      ],
    } as LegalTemplate;
    const html = `__BLANK__seller__ и __BLANK__seller_fio__`;
    const out = applyBlankMarkers(html, fake, "html");
    expect(out).not.toContain("__BLANK__");
    expect((out.match(/blank-field/g) || []).length).toBe(2);
  });
});

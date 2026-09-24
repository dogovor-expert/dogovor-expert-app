import { describe, it, expect } from "vitest";
import { LEGAL_TEMPLATES } from "@/data/legalTemplates";
import { renderTemplateDocument } from "@/lib/renderDocument";
import { buildTemplateDefaults } from "@/lib/format";

const STATEMENT_IDS = [
  "stmt-fssp-execution",
  "stmt-prosecutor-complaint",
  "stmt-vacation",
  "stmt-housing-recalc",
  "stmt-court-postpone",
];

describe("заявления (пилот, волна 0)", () => {
  it("все 5 заявлений существуют и помечены kind/formKind/group", () => {
    for (const id of STATEMENT_IDS) {
      const t = LEGAL_TEMPLATES.find((x) => x.id === id);
      expect(t, id).toBeTruthy();
      expect(t!.kind, id).toBe("statement");
      expect(t!.formKind, id).toBe("free");
      expect(t!.statementGroup, id).toBeTruthy();
    }
  });

  it("у каждого заявления заполнен блок «Куда подавать»", () => {
    for (const id of STATEMENT_IDS) {
      const t = LEGAL_TEMPLATES.find((x) => x.id === id)!;
      expect(t.submitTo?.where, id).toBeTruthy();
      expect(t.submitTo?.term, id).toBeTruthy();
      expect(t.submitTo?.fee, id).toBeTruthy();
      expect(t.submitTo?.attach, id).toBeTruthy();
    }
  });

  it("sampleValues покрывают все mustache-переменные превью", () => {
    for (const id of STATEMENT_IDS) {
      const t = LEGAL_TEMPLATES.find((x) => x.id === id)!;
      expect(t.sampleValues, id).toBeTruthy();
      // Собираем все {{переменные}} превью: и {{x}}, и имена секций {{#x}}
      // ({{/x}} regex не ловит — слэш не входит в [a-z0-9_]).
      const tpl = t.previewTemplate ?? "";
      const vars = new Set(
        [
          ...[...tpl.matchAll(/\{\{\s*([a-z0-9_]+)\s*\}\}/gi)].map((m) => m[1].toLowerCase()),
          ...[...tpl.matchAll(/\{\{#\s*([a-z0-9_]+)\s*\}\}/gi)].map((m) => m[1].toLowerCase()),
        ]
      );
      // Служебные: вычисляемые движком (суммы прописью, статусы, даты),
      // а также секции {{#x}} без значений — движок скрывает их сам
      // (одиночный {{x}} при этом даёт пустоту, что для образца допустимо,
      // если секция обёрнута в {{#x}}).
      const sectionVars = new Set(
        [...tpl.matchAll(/\{\{#\s*([a-z0-9_]+)\s*\}\}/gi)].map((m) => m[1].toLowerCase())
      );
      const skip = new Set([
        "sum_words",
        "city",
        "date",
        ...[...vars].filter(
          (v) => v.endsWith("_is_person") || v.endsWith("_is_ip") || v.endsWith("_is_legal")
        ),
      ]);
      const defaults = buildTemplateDefaults(t);
      const missing = [...vars].filter(
        (v) =>
          !skip.has(v) &&
          !sectionVars.has(v) &&
          !(t.sampleValues?.[v] ?? "").toString().trim() &&
          !(defaults[v] ?? "").toString().trim()
      );
      expect(missing, `${id}: переменные без значений — ${missing.join(", ")}`).toEqual([]);
    }
  });

  it("образец рендерится: нет пустых {{ }}, нет маркеров бланка", () => {
    for (const id of STATEMENT_IDS) {
      const t = LEGAL_TEMPLATES.find((x) => x.id === id)!;
      const html = renderTemplateDocument(t, { ...buildTemplateDefaults(t), ...(t.sampleValues ?? {}) });
      expect(html, id).not.toMatch(/\{\{[^}]+\}\}/);
      expect(html, id).not.toContain("blank-token");
      expect(html.length, id).toBeGreaterThan(500);
    }
  });

  it("пустой бланк рендерится: значения заменены маркерами", () => {
    const t = LEGAL_TEMPLATES.find((x) => x.id === "stmt-fssp-execution")!;
    const html = renderTemplateDocument(t, {}, { blank: true });
    expect(html).not.toMatch(/\{\{[^}]+\}\}/);
    expect(html.length).toBeGreaterThan(500);
  });
});

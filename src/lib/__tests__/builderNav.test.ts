import { describe, expect, it } from "vitest";
import type { LegalTemplate, TemplateField } from "@/data/types";
import { incompleteRequiredFields } from "@/lib/builderNav";

function field(
  id: string,
  label: string,
  opts: Partial<TemplateField> = {}
): TemplateField {
  return {
    id,
    label,
    type: "text",
    defaultValue: "",
    category: "seller",
    ...opts,
  };
}

function tpl(fields: TemplateField[]): LegalTemplate {
  return {
    id: "t",
    name: "Т",
    category: "auto",
    description: "",
    lastUpdated: "2026",
    actSource: "",
    suggestedDocs: [],
    fields,
    previewTemplate: "",
  };
}

describe("incompleteRequiredFields", () => {
  it("возвращает только обязательные незаполненные", () => {
    const t = tpl([
      field("a", "A", { validation: { required: true } }),
      field("b", "B", { validation: { required: true } }),
      field("c", "C"),
    ]);
    const res = incompleteRequiredFields(t, { a: "x" });
    expect(res.map((r) => r.id)).toEqual(["b"]);
  });

  it("пустой результат, когда всё заполнено", () => {
    const t = tpl([field("a", "A", { validation: { required: true } })]);
    expect(incompleteRequiredFields(t, { a: "x" })).toEqual([]);
  });

  it("пробельные значения считаются пустыми", () => {
    const t = tpl([field("a", "A", { validation: { required: true } })]);
    expect(incompleteRequiredFields(t, { a: "   " }).map((r) => r.id)).toEqual([
      "a",
    ]);
  });

  it("скрытые по dependsOn поля исключаются", () => {
    const t = tpl([
      field("kind", "K"),
      field("extra", "E", {
        validation: { required: true },
        dependsOn: { fieldId: "kind", value: "org" },
      }),
    ]);
    // kind !== org → extra невидимо → не в списке
    expect(incompleteRequiredFields(t, { kind: "person" })).toEqual([]);
    // kind === org → extra видимо и пусто → в списке
    expect(
      incompleteRequiredFields(t, { kind: "org" }).map((r) => r.id)
    ).toEqual(["extra"]);
  });

  it("порядок — как в шаблоне (сверху вниз)", () => {
    const t = tpl([
      field("z", "Z", { validation: { required: true } }),
      field("a", "A", { validation: { required: true } }),
      field("m", "M", { validation: { required: true } }),
    ]);
    expect(
      incompleteRequiredFields(t, {}).map((r) => r.id)
    ).toEqual(["z", "a", "m"]);
  });
});

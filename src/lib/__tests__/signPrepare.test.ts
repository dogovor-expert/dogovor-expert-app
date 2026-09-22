import { describe, expect, it } from "vitest";
import {
  SIGN_MAX_RESERVE,
  SIGN_MIN_RESERVE,
  SIGN_PROBE_RESERVE,
  buildSignableDocument,
  normalizeReserve,
  normalizeSignFields,
  previewForTemplate,
  resolveSignTemplate,
} from "@/lib/sign-prepare";
import { LEGAL_TEMPLATES } from "@/data/legalTemplates";
import { TEMPLATE_PREVIEWS } from "@/data/templatePreviews";

describe("normalizeSignFields", () => {
  it("строки сохраняются как есть", () => {
    expect(normalizeSignFields({ city: "Москва" })).toEqual({ city: "Москва" });
  });

  it("boolean/number приводятся к строкам", () => {
    expect(normalizeSignFields({ agreed: true, count: 5 })).toEqual({
      agreed: "true",
      count: "5",
    });
  });

  it("null/undefined/массивы/объекты отбрасываются", () => {
    expect(
      normalizeSignFields({
        a: null,
        b: undefined,
        c: [1, 2],
        d: { x: 1 },
        keep: "v",
      })
    ).toEqual({ keep: "v" });
  });

  it("не-объект → пустой набор", () => {
    expect(normalizeSignFields(null)).toEqual({});
    expect(normalizeSignFields("строка")).toEqual({});
    expect(normalizeSignFields([1, 2])).toEqual({});
  });
});

describe("resolveSignTemplate / previewForTemplate", () => {
  it("находит существующий шаблон по id", () => {
    const id = LEGAL_TEMPLATES[0].id;
    expect(resolveSignTemplate(id)?.id).toBe(id);
  });

  it("несуществующий id → null (в БД таблицы templates нет)", () => {
    expect(resolveSignTemplate("no-such-template-xyz")).toBeNull();
  });

  it("текст шаблона всегда непустой (map или inline)", () => {
    const withMap = LEGAL_TEMPLATES.find((t) => TEMPLATE_PREVIEWS[t.id]);
    expect(withMap).toBeTruthy();
    expect(previewForTemplate(withMap!).length).toBeGreaterThan(0);
  });
});

describe("buildSignableDocument", () => {
  it("собирает непустой HTML без остаточных Mustache-плейсхолдеров", () => {
    const doc = buildSignableDocument("dkp-auto", {});
    expect(doc).not.toBeNull();
    expect(doc!.template.id).toBe("dkp-auto");
    expect(doc!.html.length).toBeGreaterThan(200);
    // Все подстановки должны быть разрешены — иначе в PDF попадёт «{{field}}».
    expect(doc!.html).not.toContain("{{");
  });

  it("несуществующий шаблон → null (подписывать нечего)", () => {
    expect(buildSignableDocument("no-such-template-xyz", {})).toBeNull();
  });

  it("значения из fields попадают в HTML", () => {
    const template = resolveSignTemplate("dkp-auto");
    expect(template).not.toBeNull();
    const field = template!.fields.find((f) => f.type === "text");
    if (!field) return; // у шаблона нет текстовых полей — проверять нечего
    const doc = buildSignableDocument("dkp-auto", { [field.id]: "ПРОВЕРКА-123" });
    expect(doc).not.toBeNull();
    expect(doc!.html).toContain("ПРОВЕРКА-123");
  });
});

describe("normalizeReserve", () => {
  it("undefined/null → пробный резерв", () => {
    expect(normalizeReserve(undefined)).toBe(SIGN_PROBE_RESERVE);
    expect(normalizeReserve(null)).toBe(SIGN_PROBE_RESERVE);
  });

  it("корректное значение принимается", () => {
    expect(normalizeReserve(10000)).toBe(10000);
    expect(normalizeReserve(SIGN_MIN_RESERVE)).toBe(SIGN_MIN_RESERVE);
    expect(normalizeReserve(SIGN_MAX_RESERVE)).toBe(SIGN_MAX_RESERVE);
  });

  it("вне диапазона / не целое / не число → null", () => {
    expect(normalizeReserve(SIGN_MIN_RESERVE - 1)).toBeNull();
    expect(normalizeReserve(SIGN_MAX_RESERVE + 1)).toBeNull();
    expect(normalizeReserve(12.5)).toBeNull();
    expect(normalizeReserve("10000")).toBeNull();
  });
});

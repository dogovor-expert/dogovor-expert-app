import { describe, expect, it } from "vitest";
import {
  extractMrzLines,
  tryParseMrz,
  applyMrzToRole,
  mrzManualHints,
  type MrzParseSuccess,
} from "@/lib/docMrz";
import type { LegalTemplate, TemplateField } from "@/data/types";

// ─── Фикстуры: чек-суммы 7-3-1 вычислены и проверены библиотекой mrz@5 ───
// TD3 — загранпаспорт РФ: VOLKOV VLADIMIR, № 751234567, д.р. 12.05.1982, срок 11.05.2030.
const TD3_L1 = "P<RUSVOLKOV<<VLADIMIR<<<<<<<<<<<<<<<<<<<<<<<";
const TD3_L2 = "7512345672RUS8205122M3005110<<<<<<<<<<<<<<06";
// TD3 с намеренно битым чек-числом номера (2 → 9).
const TD3_L2_BROKEN = "7512345679RUS8205122M3005110<<<<<<<<<<<<<<06";
// TD1 — ID-карта: SCHMIDT HANNA, № 012345678, д.р. 01.01.1990, срок 01.01.2031.
const TD1_LINES = [
  "I<DEU0123456784<<<<<<<<<<<<<<<",
  "9001011F3101012DEU<<<<<<<<<<<8",
  "SCHMIDT<<HANNA<<<<<<<<<<<<<<<<",
];

const makeTemplate = (fields: TemplateField[]): LegalTemplate => ({
  id: "t",
  name: "Тест",
  category: "realty",
  actSource: "ГК РФ",
  lastUpdated: "2026-01-01",
  description: "",
  suggestedDocs: [],
  fields,
  previewTemplate: "{{buyer_fio}}",
});

const buyerFields = (ids: string[]): TemplateField[] =>
  ids.map((id) => ({
    id: `buyer_${id}`,
    label: id,
    type: "text",
    category: "buyer",
    defaultValue: "",
  }));

const fullTemplate = makeTemplate(
  buyerFields([
    "fio",
    "passport",
    "birthday",
    "passport_date",
    "passport_valid_until",
  ])
);

const mrzFromTd3 = (): MrzParseSuccess => {
  const r = tryParseMrz(`${TD3_L1}\n${TD3_L2}`);
  if (!r) throw new Error("TD3 не распарсился");
  return r;
};

describe("extractMrzLines", () => {
  it("находит группу TD3 (2×44) в чистом тексте", () => {
    const groups = extractMrzLines(`${TD3_L1}\n${TD3_L2}`);
    expect(groups).toHaveLength(1);
    expect(groups[0]).toEqual([TD3_L1, TD3_L2]);
  });

  it("игнорирует мусор и склеенные OCR-пробелы", () => {
    const noisy = `МРЗ:\n${TD3_L1.replace(/</g, " < ")}\nкакие-то помехи\n${TD3_L2}`;
    const groups = extractMrzLines(noisy);
    expect(groups.length).toBeGreaterThanOrEqual(1);
    expect(tryParseMrz(noisy)?.valid).toBe(true);
  });
});

describe("tryParseMrz", () => {
  it("TD3: валидные чек-суммы, поля корректны", () => {
    const r = mrzFromTd3();
    expect(r.valid).toBe(true);
    expect(r.format).toBe("TD3");
    expect(r.fields.documentNumber).toBe("751234567");
    expect(r.fields.birthDate).toBe("820512");
    expect(r.fields.expiryDate).toBe("300511");
    expect(r.fields.lastName).toBe("VOLKOV");
    expect(r.fields.firstName).toBe("VLADIMIR");
  });

  it("битая чек-сумма → valid:false", () => {
    const r = tryParseMrz(`${TD3_L1}\n${TD3_L2_BROKEN}`);
    expect(r).not.toBeNull();
    expect(r?.valid).toBe(false);
  });

  it("TD1 (3×30) парсится", () => {
    const r = tryParseMrz(TD1_LINES.join("\n"));
    expect(r?.valid).toBe(true);
    expect(r?.fields.documentNumber).toBe("012345678");
  });

  it("текст без MRZ → null", () => {
    expect(tryParseMrz("Паспорт гражданина РФ\nвыдан 12.05.2015")).toBeNull();
  });
});

describe("applyMrzToRole — регресс TICKET-2", () => {
  it("НЕ заполняет дату выдачи паспорта (в MRZ её нет)", () => {
    const out = applyMrzToRole(fullTemplate, "buyer", mrzFromTd3());
    expect(out["buyer_passport_date"]).toBeUndefined();
  });

  it("срок действия попадает в passport_valid_until, а не в дату выдачи", () => {
    const out = applyMrzToRole(fullTemplate, "buyer", mrzFromTd3());
    expect(out["buyer_passport_valid_until"]).toBe("11.05.2030");
  });

  it("ФИО, номер и дата рождения заполняются из MRZ", () => {
    const out = applyMrzToRole(fullTemplate, "buyer", mrzFromTd3());
    expect(out["buyer_fio"]).toBe("VOLKOV VLADIMIR");
    expect(out["buyer_passport"]).toBe("751234567");
    expect(out["buyer_birthday"]).toBe("12.05.1982");
  });
});

describe("mrzManualHints", () => {
  it("есть поле passport_date → подсказка о ручном заполнении", () => {
    const hints = mrzManualHints(fullTemplate, "buyer");
    expect(hints).toHaveLength(1);
    expect(hints[0]).toMatch(/дата выдачи/i);
  });

  it("нет поля passport_date → пустой список", () => {
    const t = makeTemplate(buyerFields(["fio", "passport"]));
    expect(mrzManualHints(t, "buyer")).toEqual([]);
  });
});

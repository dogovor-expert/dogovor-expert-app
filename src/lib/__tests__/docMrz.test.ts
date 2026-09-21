import { describe, expect, it } from "vitest";
import {
  extractMrzLines,
  tryParseMrz,
  applyMrzToRole,
  mrzManualHints,
  mrzLineCandidatesFromWords,
  hasMrzSignature,
  type MrzWordBox,
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

// ─── Геометрическая сборка строк из слов (новый путь) ────────────────────────
/** Режет строку MRZ на «слова» с боксами в одну визуальную строку. */
const wordsFromLine = (line: string, y: number): MrzWordBox[] =>
  [line.slice(0, 6), line.slice(6, 20), line.slice(20)].map((text, i) => ({
    text,
    bbox: { x0: i * 120, y0: y, x1: i * 120 + 110, y1: y + 30 },
  }));

describe("mrzLineCandidatesFromWords — сборка рваного OCR", () => {
  it("склеивает слова одной строки по X и группирует по Y", () => {
    const words = [...wordsFromLine(TD3_L1, 100), ...wordsFromLine(TD3_L2, 140)];
    const lines = mrzLineCandidatesFromWords(words);
    expect(lines).toEqual([TD3_L1, TD3_L2]);
  });

  it("без координат (только текст) MRZ не собирается — доказывает ценность пути", () => {
    // Тот же «рваный» OCR в виде текста: каждая часть короче 28 → кандидатов нет.
    const broken = `${TD3_L1.slice(0, 6)} ${TD3_L1.slice(6, 20)}\n${TD3_L2.slice(0, 6)} ${TD3_L2.slice(6, 20)}`;
    expect(extractMrzLines(broken)).toHaveLength(0);
    expect(tryParseMrz(broken)).toBeNull();
  });

  it("tryParseMrz со словами распознаёт TD3 даже при пустом тексте", () => {
    const words = [...wordsFromLine(TD3_L1, 100), ...wordsFromLine(TD3_L2, 140)];
    const r = tryParseMrz("", words);
    expect(r?.valid).toBe(true);
    expect(r?.format).toBe("TD3");
    expect(r?.fields.documentNumber).toBe("751234567");
  });

  it("мусорные слова игнорируются, валидность сохраняется", () => {
    const words = [
      ...wordsFromLine(TD3_L1, 100),
      ...wordsFromLine(TD3_L2, 140),
      { text: "Оплата", bbox: { x0: 0, y0: 300, x1: 60, y1: 330 } },
    ];
    const r = tryParseMrz("", words);
    expect(r?.valid).toBe(true);
  });
});

describe("extractMrzLines — склеенные строки и артефакты", () => {
  it("две склеенные строки TD3 (88 символов) разрезаются на пару", () => {
    const groups = extractMrzLines(`${TD3_L1}${TD3_L2}`);
    expect(groups).toHaveLength(1);
    expect(groups[0]).toEqual([TD3_L1, TD3_L2]);
  });

  it("OCR-артефакты (|, «») не мешают нормализации", () => {
    // Артефакты ВСТАВЛЯЮТСЯ вокруг/внутрь строки (а не заменяют символы MRZ).
    const dirty = `«${TD3_L1.slice(0, 20)}|${TD3_L1.slice(20)}»\n${TD3_L2}`;
    expect(tryParseMrz(dirty)?.valid).toBe(true);
  });
});

describe("hasMrzSignature — диагностика без парсинга", () => {
  it("текст внутреннего паспорта РФ → false", () => {
    expect(
      hasMrzSignature("Паспорт гражданина РФ\nвыдан 12.05.2015\nкод подразделения")
    ).toBe(false);
  });

  it("слова с MRZ-подобной строкой → true", () => {
    const words = [...wordsFromLine(TD3_L1, 100), ...wordsFromLine(TD3_L2, 140)];
    expect(hasMrzSignature("", words)).toBe(true);
  });

  it("валидная строка MRZ в тексте → true", () => {
    expect(hasMrzSignature(`${TD3_L1}\n${TD3_L2}`)).toBe(true);
  });
});

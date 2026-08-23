import type { TemplateField } from "@/data/types";

export interface PersonData {
  fio: string;
  birthday: string;
  phone: string;
  passport_series: string;
  passport_number: string;
  passport_issued_by: string;
  passport_code: string;
  address: string;
}

const EMPTY_PERSON: PersonData = {
  fio: "",
  birthday: "",
  phone: "",
  passport_series: "",
  passport_number: "",
  passport_issued_by: "",
  passport_code: "",
  address: "",
};

const PERSON_SLOTS: Array<{ key: keyof PersonData; matches: string[] }> = [
  { key: "fio", matches: ["_fio"] },
  { key: "birthday", matches: ["_birthday", "_birth_date", "_dob"] },
  { key: "phone", matches: ["_phone"] },
  { key: "passport_series", matches: ["_passport_series"] },
  { key: "passport_number", matches: ["_passport_number"] },
  {
    key: "passport_issued_by",
    matches: ["_passport_issued_by", "_passport_by", "_passport_issued"],
  },
  { key: "passport_code", matches: ["_passport_code", "_department_code"] },
  {
    key: "address",
    matches: ["_address", "_addr", "_registration", "_living_address"],
  },
];

export function roleToPerson(
  values: Record<string, string>,
  prefix: string,
  fields: TemplateField[]
): PersonData {
  const out: PersonData = { ...EMPTY_PERSON };
  for (const slot of PERSON_SLOTS) {
    for (const f of fields) {
      if (!f.id.startsWith(prefix)) continue;
      if (!slot.matches.some((m) => f.id.includes(m))) continue;
      const v = (values[f.id] || "").trim();
      if (v) {
        out[slot.key] = v;
        break;
      }
    }
  }
  // Совмещённое поле паспорта (напр. owner_passport «1234 567890»): раскладываем
  // на серию и номер, чтобы «Сохранённое лицо» корректно круговоротилось.
  const combined = fields.find((f) => f.id === `${prefix}_passport`);
  if (combined) {
    const v = (values[combined.id] || "").trim();
    if (v) {
      const parts = v.split(/\s+/);
      if (parts.length >= 2) {
        out.passport_series = parts[0];
        out.passport_number = parts.slice(1).join("");
      } else {
        out.passport_number = v;
      }
    }
  }
  return out;
}

export function personToFields(
  person: PersonData,
  prefix: string,
  fields: TemplateField[]
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const slot of PERSON_SLOTS) {
    const v = (person[slot.key] || "").trim();
    if (!v) continue;
    for (const f of fields) {
      if (!f.id.startsWith(prefix)) continue;
      if (!slot.matches.some((m) => f.id.includes(m))) continue;
      out[f.id] = v;
    }
  }
  // Если у шаблона нет отдельных полей серии/номера, а есть совмещённое
  // <prefix>_passport — подставляем туда «серия номер» целиком. Без этого
  // «Сохранённые лица» не заполняли паспорт в таких шаблонах (баг №3).
  const combined = fields.find((f) => f.id === `${prefix}_passport`);
  if (combined && !out[combined.id]) {
    const v = [person.passport_series, person.passport_number]
      .filter(Boolean)
      .join(" ");
    if (v) out[combined.id] = v;
  }
  return out;
}
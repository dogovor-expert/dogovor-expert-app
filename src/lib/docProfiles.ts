/**
 * Реестр «профилей документов» для универсального сканера (Фаза 5).
 *
 * Каждый профиль описывает:
 *  - вид документа (id, label);
 *  - жесткие/мягкие текстовые маркеры, по которым документ опознаётся в OCR-тексте;
 *  - извлекаемые поля (поле шаблона + как достать значение из текста);
 *  - связь с ролями (для какого префикса роли применим).
 *
 * Это расширяет базовый сканер (который жёстко знает только паспорт/СТС/ПТС/ВУ)
 * до «универсального распознавателя любых полей сделки» — включая ИП/юрлиц,
 * у которых нет поля *_passport, но есть *_inn / *_ogrn и т.п.
 */

import type { LegalTemplate } from "@/data/types";

export type DocProfileId =
  | "passport"
  | "inn_individual"
  | "inn_company"
  | "ogrn"
  | "snils"
  | "egrul_extract"
  | "egrip_extract"
  | "bank_account"
  | null;

export interface ExtractedField {
  /** id поля шаблона (может содержать {role} плейсхолдер). */
  fieldId: string;
  /** Значение, подставленное в поле. */
  value: string;
}

export interface DocProfile {
  id: DocProfileId;
  label: string;
  hint: string;
  /** Жёсткие маркеры: документ распознан, если хотя бы один есть в тексте. */
  strongMarkers: RegExp[];
  /** Мягкие маркеры: повышают уверенность, но не обязательны. */
  softMarkers?: RegExp[];
  /** Извлекает поля из текста; поле шаблона использует {role}. */
  extract: (text: string, role: string) => ExtractedField[];
  /** Применим ли профиль для данной роли (по набору полей шаблона). */
  applicable: (template: LegalTemplate, role: string) => boolean;
}

const INN_RE = /\b(\d{10,12})\b/;

function clean0(v: string): string {
  return v.replace(/[^\d]/g, "");
}

/**
 * Возвращает ВСЕ роли (префиксы) шаблона, включая роли без *_passport
 * (ИП, ООО, физлица), которые раньше не получали OCR-слот.
 */
export function allRolePrefixes(template: LegalTemplate): string[] {
  const out = new Set<string>();
  for (const f of template.fields) {
    const m = f.id.match(/^([a-zA-Zа-яА-Я0-9]+)_(?:fio|name|inn|ogrn|passport)$/);
    if (m) out.add(m[1].toLowerCase());
  }
  // Учитываем также роли, заданные только через *_inn / *_ogrn / *_company.
  for (const f of template.fields) {
    const m = f.id.match(/^([a-zA-Zа-яА-Я0-9]+)_(?:inn|ogrn|company|snils)$/);
    if (m) out.add(m[1].toLowerCase());
  }
  return [...out].filter((p) => p !== "contract" && p !== "base");
}

export const DOC_PROFILES: DocProfile[] = [
  {
    id: "passport",
    label: "Паспорт РФ",
    hint: "Серия, номер, ФИО, дата рождения",
    strongMarkers: [
      /паспорт/i,
      /серия\s*№/i,
      /ФИО|фамилия|имя\s+отчество/i,
      /MVD|ОРГАН/i,
    ],
    extract: (text, role) => {
      const out: ExtractedField[] = [];
      const surname = text.match(/фамилия\s*[:：]?\s*([А-ЯЁ][а-яё\-]+)/);
      if (surname) {
        out.push({ fieldId: `${role}_lastname`, value: surname[1] });
        out.push({ fieldId: `${role}_surname`, value: surname[1] });
      }
      return out;
    },
    applicable: () => true,
  },
  {
    id: "inn_individual",
    label: "Свидетельство ИНН (физлицо/ИП)",
    hint: "12 цифр — идентификационный номер налогоплательщика",
    strongMarkers: [/\bИНН\b/i, /идентификационный\s+номер\s+налогоплательщика/i],
    softMarkers: [/индивидуальный|ИП|предпринимател/i],
    extract: (text, role) => {
      const out: ExtractedField[] = [];
      const m = INN_RE.exec(text);
      if (m) {
        const inn = clean0(m[1]);
        if (inn.length === 12) {
          out.push({ fieldId: `${role}_inn`, value: inn });
        }
      }
      return out;
    },
    applicable: (template, role) =>
      template.fields.some((f) => f.id === `${role}_inn`),
  },
  {
    id: "inn_company",
    label: "Свидетельство ИНН (юрлицо)",
    hint: "10 цифр — ИНН организации",
    strongMarkers: [/\bИНН\b/i, /идентификационный\s+номер\s+налогоплательщика/i],
    softMarkers: [/организац|ООО|АО|фирм|общество/i],
    extract: (text, role) => {
      const out: ExtractedField[] = [];
      const m = INN_RE.exec(text);
      if (m) {
        const inn = clean0(m[1]);
        if (inn.length === 10) {
          out.push({ fieldId: `${role}_inn`, value: inn });
        }
      }
      return out;
    },
    applicable: (template, role) =>
      template.fields.some((f) => f.id === `${role}_inn`),
  },
  {
    id: "ogrn",
    label: "Свидетельство ОГРН",
    hint: "13 цифр — основной государственный регистрационный номер",
    strongMarkers: [/\bОГРН\b/i, /основной\s+гос(?:ударственный)?\s+регистрационный/i],
    extract: (text, role) => {
      const out: ExtractedField[] = [];
      const m = /\b(\d{13})\b/.exec(text);
      if (m) {
        out.push({ fieldId: `${role}_ogrn`, value: m[1] });
      }
      return out;
    },
    applicable: (template, role) =>
      template.fields.some((f) => f.id === `${role}_ogrn`),
  },
  {
    id: "snils",
    label: "СНИЛС",
    hint: "11 цифр — страховой номер индивидуального лицевого счёта",
    strongMarkers: [/СНИЛС/i, /страховой\s+номер/i],
    extract: (text, role) => {
      const out: ExtractedField[] = [];
      const m = /\b(\d{3})\D*(\d{3})\D*(\d{3})\D*(\d{2})\b/.exec(text);
      if (m) {
        out.push({
          fieldId: `${role}_snils`,
          value: `${m[1]}-${m[2]}-${m[3]} ${m[4]}`,
        });
      }
      return out;
    },
    applicable: (template, role) =>
      template.fields.some((f) => f.id === `${role}_snils`),
  },
  {
    id: "egrul_extract",
    label: "Выписка ЕГРЮЛ",
    hint: "Выписка из ЕГРЮЛ (юрлицо): ОГРН, ИНН, директор",
    strongMarkers: [/ЕГРЮЛ/i, /единый\s+гос(?:ударственный)?\s+реестр\s+(?:юридич|юридических)/i],
    softMarkers: [/выписк|ОГРН/i],
    extract: (text, role) => {
      const out: ExtractedField[] = [];
      const ogrn = /\bОГРН(?:[:\s])*(\d{13})\b/i.exec(text);
      if (ogrn) out.push({ fieldId: `${role}_ogrn`, value: ogrn[1] });
      const inn = /\bИНН(?:[:\s])*(\d{10})\b/i.exec(text);
      if (inn) out.push({ fieldId: `${role}_inn`, value: clean0(inn[1]) });
      const dir = /директор\s*:?\s*([А-ЯЁ][а-яё]+(?:\s+[А-ЯЁ][а-яё]+){1,2})/.exec(
        text
      );
      if (dir) out.push({ fieldId: `${role}_director`, value: dir[1] });
      return out;
    },
    applicable: (template, role) =>
      template.fields.some(
        (f) => f.id === `${role}_ogrn` || f.id === `${role}_inn`
      ),
  },
  {
    id: "egrip_extract",
    label: "Выписка ЕГРИП",
    hint: "Выписка из ЕГРИП (ИП): ОГРНИП, ИНН",
    strongMarkers: [/ЕГРИП/i, /единый\s+гос(?:ударственный)?\s+реестр\s+(?:индивидуальн|индивидуальных)/i],
    softMarkers: [/ИП|ОГРНИП|предпринимател/i],
    extract: (text, role) => {
      const out: ExtractedField[] = [];
      const ogrnip = /\bОГРНИП(?:[:\s])*(\d{15})\b/i.exec(text);
      if (ogrnip) out.push({ fieldId: `${role}_ogrnip`, value: ogrnip[1] });
      const inn = /\bИНН(?:[:\s])*(\d{12})\b/i.exec(text);
      if (inn) out.push({ fieldId: `${role}_inn`, value: clean0(inn[1]) });
      return out;
    },
    applicable: (template, role) =>
      template.fields.some(
        (f) => f.id === `${role}_ogrnip` || f.id === `${role}_inn`
      ),
  },
  {
    id: "bank_account",
    label: "Банковские реквизиты",
    hint: "Расчётный счёт, БИК, корр. счёт получателя",
    strongMarkers: [/расчётный\s+счёт/i, /р\/с/i, /БИК/i, /корр(?:еспондент)?\s+счёт/i],
    extract: (text, role) => {
      const out: ExtractedField[] = [];
      const rs = /\b(20\d{19})\b/.exec(text);
      if (rs) out.push({ fieldId: `${role}_bank_account`, value: rs[1] });
      const bik = /\bБИК(?:[:\s])*(\d{9})\b/i.exec(text);
      if (bik) out.push({ fieldId: `${role}_bank_bik`, value: bik[1] });
      return out;
    },
    applicable: (template, role) =>
      template.fields.some(
        (f) =>
          f.id === `${role}_bank_account` ||
          f.id.startsWith(`${role}_bank`)
      ),
  },
];

/**
 * Определяет, какому профилю документа соответствует OCR-текст.
 * Возвращает первый профиль, у которого есть жёсткий маркер (и доп. проверки).
 */
export function detectProfile(text: string): DocProfile | null {
  const t = text.toLowerCase();
  for (const p of DOC_PROFILES) {
    const strongHit = p.strongMarkers.some((r) => r.test(t));
    if (!strongHit) continue;
    // Для двзнзначных (паспорт vs ИНН) предпочитаем конкретные.
    if (p.strongMarkers.some((r) => /\bИНН\b/i.test(String(r.source))) && /паспорт/i.test(t)) {
      continue;
    }
    return p;
  }
  return null;
}

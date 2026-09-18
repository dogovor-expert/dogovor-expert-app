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
import { extractPassportData } from "@/lib/docOcr";

export type DocProfileId =
  | "passport"
  | "inn_individual"
  | "inn_company"
  | "ogrn"
  | "snils"
  | "egrul_extract"
  | "egrip_extract"
  | "bank_account"
  | "vuc_new"
  | "osago"
  | "egrn_extract"
  | "marriage_cert"
  | "power_of_attorney"
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
      const data = extractPassportData(text);
      const out: ExtractedField[] = [];
      const push = (id: string, value?: string) => {
        if (value && value.trim()) {
          out.push({ fieldId: id, value: value.trim() });
        }
      };
      push(`${role}_fio`, data.fio);
      push(`${role}_lastname`, data.fio?.split(/\s+/)[0]);
      // составное поле паспорта: серия + номер
      if (data.series && data.number) {
        push(`${role}_passport`, `${data.series} ${data.number}`);
      } else {
        push(`${role}_passport`, data.series || data.number);
      }
      push(`${role}_passport_series`, data.series);
      push(`${role}_passport_number`, data.number);
      push(`${role}_birthday`, data.birthday);
      push(`${role}_birth_place`, data.birthPlace);
      push(`${role}_passport_issued_by`, data.issuedBy);
      push(`${role}_passport_date`, data.issuedDate);
      push(`${role}_passport_code`, data.code);
      push(`${role}_address`, data.address);
      push(`${role}_inn`, data.inn);
      push(`${role}_snils`, data.snils);
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
  {
    // ВУ нового образца (пластик 2025+): 2 строки по 4 цифры.
    // 1) паспортные данные владельца, 2) категории/дата, 3) номер удостоверения.
    id: "vuc_new",
    label: "Водительское удостоверение (новое)",
    hint: "Пластиковое ВУ 2025+: серия/номер, ФИО, дата рождения",
    strongMarkers: [
      /водительск(?:ое)?\s+удостоверени[ея]/i,
      /\bкатегори[яи]\s*[A-DM]/i,
      /\bM\s+1\s+\b/i,
    ],
    softMarkers: [/водител[ья]/i, /удостоверени/i],
    extract: (text, role) => {
      const out: ExtractedField[] = [];
      // Стандартный формат: XX XX NNNNNN (2-2-6, новые — 2-2-6, либо сплошные 10 цифр).
      const m =
        /\b(\d{2})\s*(\d{2})\s*(\d{6})\b/.exec(text) ||
        /\b(\d{10})\b/.exec(text);
      if (m) {
        const num = m[3]
          ? `${m[1]} ${m[2]} ${m[3]}`
          : `${(m[1]).slice(0, 2)} ${(m[1]).slice(2, 4)} ${(m[1]).slice(4, 10)}`;
        out.push({ fieldId: `${role}_vuc_number`, value: num });
      }
      const fio = text.match(
        /([А-ЯЁ][а-яё-]+)\s+([А-ЯЁ][а-яё-]+)\s+([А-ЯЁ][а-яё-]+)/
      );
      if (fio) {
        out.push({ fieldId: `${role}_lastname`, value: fio[1] });
        out.push({ fieldId: `${role}_firstname`, value: fio[2] });
        out.push({ fieldId: `${role}_middlename`, value: fio[3] });
      }
      const dob = /\bдата\s+рождения[^\d]*(\d{2}[.\-/]\d{2}[.\-/]\d{4})/i.exec(text);
      if (dob) out.push({ fieldId: `${role}_birthdate`, value: dob[1] });
      return out;
    },
    applicable: (template, role) =>
      template.fields.some(
        (f) => f.id === `${role}_vuc_number` || f.id === `${role}_vuc`
      ),
  },
  {
    // Полис ОСАГО: серия XXX (буквы) + номер 10 цифр, владелец, VIN, гос. номер.
    id: "osago",
    label: "Полис ОСАГО",
    hint: "Страховой полис: серия/номер, владелец, VIN, гос. номер",
    strongMarkers: [
      /страхов(?:ой|ая)\s+полис/i,
      /ОСАГО/i,
      /\bОСАГО\b/i,
    ],
    softMarkers: [/страхов[а-я]+/i, /полис[а-я]+/i],
    extract: (text, role) => {
      const out: ExtractedField[] = [];
      // Серия XXX + номер 10 цифр (или наоборот — современный полис 9 цифр).
      const m =
        /\b([А-ЯЁ]{3})\s*(\d{9,10})\b/.exec(text) ||
        /\b(\d{9,10})\b/.exec(text);
      if (m) {
        const series = m[1] && /[А-ЯЁ]/.test(m[1]) ? m[1] : "";
        const number = m[1] && /[А-ЯЁ]/.test(m[1]) ? m[2] : m[1];
        if (series) out.push({ fieldId: `${role}_osago_series`, value: series });
        if (number) out.push({ fieldId: `${role}_osago_number`, value: number });
      }
      const vin = /\bVIN[:\s]*([A-HJ-NPR-Z0-9]{17})\b/i.exec(text);
      if (vin) out.push({ fieldId: `${role}_vin`, value: vin[1] });
      const grz = /\b([А-ЯЁ]\d{3}[А-ЯЁ]{2}\d{2,3})\b/.exec(text);
      if (grz) out.push({ fieldId: `${role}_grz`, value: grz[1] });
      return out;
    },
    applicable: (template, role) =>
      template.fields.some(
        (f) =>
          f.id === `${role}_osago_number` ||
          f.id === `${role}_osago_series` ||
          f.id === `${role}_vin`
      ),
  },
  {
    // Выписка ЕГРН (на недвижимость): кадастровый номер, адрес, площадь, правообладатель.
    id: "egrn_extract",
    label: "Выписка ЕГРН",
    hint: "Кадастровый номер, адрес объекта, правообладатель",
    strongMarkers: [
      /ЕГРН/i,
      /единый\s+гос(?:ударственный)?\s+реестр\s+недвижимост/i,
    ],
    softMarkers: [/выписк[а-я]*\s+из\s+ЕГРН/i, /кадастров/i],
    extract: (text, role) => {
      const out: ExtractedField[] = [];
      // Кадастровый номер: 2 блока по : + 6 блоков по : (всего 8).
      const cad =
        /\b(\d{2}:\d{2}:\d{6,7}:\d{1,7})\b/.exec(text) ||
        /\b(\d{2}:\d{2}:\d{6,7})\b/.exec(text);
      if (cad) out.push({ fieldId: `${role}_cadastral`, value: cad[1] });
      // Площадь: "площад[ью]?\s*:?\s*<число>,?\d*\s*кв\.?\s*м"
      const area = /площад[ьи]?\s*:?\s*(\d+(?:[.,]\d+)?)\s*(?:кв\.?\s*м|м²)/i.exec(
        text
      );
      if (area) {
        const v = area[1].replace(",", ".");
        out.push({ fieldId: `${role}_area`, value: v });
      }
      // Правообладатель: "правообладател[ья]?\s*:?\s*ФИО/название"
      const owner = /правообладател[ья]?\s*:?\s*([А-ЯЁ][А-ЯЁа-яё0-9\s\-"«».,]+)/.exec(
        text
      );
      if (owner) {
        const v = owner[1].trim().split(/\s{2,}|(?=\s+(?:ИНН|ОГРН|Дата))/i)[0];
        if (v.length > 0 && v.length < 200) {
          out.push({ fieldId: `${role}_owner`, value: v });
        }
      }
      return out;
    },
    applicable: (template, role) =>
      template.fields.some(
        (f) =>
          f.id === `${role}_cadastral` ||
          f.id === `${role}_area` ||
          f.id === `${role}_owner`
      ),
  },
  {
    // Свидетельство о браке: ФИО мужа/жены, дата, номер актовой записи.
    id: "marriage_cert",
    label: "Свидетельство о браке",
    hint: "ФИО мужа/жены, дата регистрации, номер актовой записи",
    strongMarkers: [
      /свидетельство\s+о\s+(?:заключении\s+)?брак[аеу]/i,
      /актовая\s+запис[ьи]/i,
    ],
    softMarkers: [/заключен[еяия]+\s+брак/i, /муж[ае]?\s*:|жен[аы]?\s*:/i],
    extract: (text, role) => {
      const out: ExtractedField[] = [];
      // "муж: ФИО" / "жена: ФИО"
      const husband = /(?:^|\n)\s*(?:он|муж)\s*:?\s*([А-ЯЁ][а-яё-]+\s+[А-ЯЁ][а-яё-]+\s+[А-ЯЁ][а-яё-]+)/m.exec(
        text
      );
      const wife = /(?:^|\n)\s*(?:она|жена)\s*:?\s*([А-ЯЁ][а-яё-]+\s+[А-ЯЁ][а-яё-]+\s+[А-ЯЁ][а-яё-]+)/m.exec(
        text
      );
      if (husband) {
        const [last, first, mid] = husband[1].split(/\s+/);
        out.push({ fieldId: `${role}_husband_lastname`, value: last });
        out.push({ fieldId: `${role}_husband_firstname`, value: first });
        out.push({ fieldId: `${role}_husband_middlename`, value: mid });
      }
      if (wife) {
        const [last, first, mid] = wife[1].split(/\s+/);
        out.push({ fieldId: `${role}_wife_lastname`, value: last });
        out.push({ fieldId: `${role}_wife_firstname`, value: first });
        out.push({ fieldId: `${role}_wife_middlename`, value: mid });
      }
      // Номер актовой записи: "№" + цифры
      const akt = /№\s*(\d+)/.exec(text);
      if (akt) out.push({ fieldId: `${role}_akt_number`, value: akt[1] });
      return out;
    },
    applicable: (template, role) =>
      template.fields.some(
        (f) =>
          f.id === `${role}_husband_lastname` ||
          f.id === `${role}_wife_lastname` ||
          f.id === `${role}_akt_number`
      ),
  },
  {
    // Доверенность (генеральная/специальная): ФИО доверителя/поверенного, дата, номер.
    id: "power_of_attorney",
    label: "Доверенность",
    hint: "ФИО доверителя/поверенного, дата выдачи, номер",
    strongMarkers: [
      /доверенност[ьи]\b/i,
      /настоящ[аяей]+\s+доверенност/i,
    ],
    softMarkers: [/доверител[ья]?\s*:|поверенн[а-яё]*\s*:/i],
    extract: (text, role) => {
      const out: ExtractedField[] = [];
      const tr = /доверител[ья]?\s*:?\s*([А-ЯЁ][а-яё-]+\s+[А-ЯЁ][а-яё-]+\s+[А-ЯЁ][а-яё-]+)/.exec(
        text
      );
      if (tr) {
        const [last, first, mid] = tr[1].split(/\s+/);
        out.push({ fieldId: `${role}_grantor_lastname`, value: last });
        out.push({ fieldId: `${role}_grantor_firstname`, value: first });
        out.push({ fieldId: `${role}_grantor_middlename`, value: mid });
      }
      const at = /поверенн[а-яё]+\s*:?\s*([А-ЯЁ][а-яё-]+\s+[А-ЯЁ][а-яё-]+\s+[А-ЯЁ][а-яё-]+)/.exec(
        text
      );
      if (at) {
        const [last, first, mid] = at[1].split(/\s+/);
        out.push({ fieldId: `${role}_attorney_lastname`, value: last });
        out.push({ fieldId: `${role}_attorney_firstname`, value: first });
        out.push({ fieldId: `${role}_attorney_middlename`, value: mid });
      }
      // Дата выдачи: "выдана\s*<дата>" или "<DD.MM.YYYY>"
      const dt =
        /выдана[^\d]*(\d{2}[.\-/]\d{2}[.\-/]\d{4})/i.exec(text) ||
        /\b(\d{2}[.\-/]\d{2}[.\-/]\d{4})\b/.exec(text);
      if (dt) out.push({ fieldId: `${role}_poa_date`, value: dt[1] });
      return out;
    },
    applicable: (template, role) =>
      template.fields.some(
        (f) =>
          f.id === `${role}_grantor_lastname` ||
          f.id === `${role}_attorney_lastname` ||
          f.id === `${role}_poa_date`
      ),
  },
];

/**
 * Определяет, какому профилю документа соответствует OCR-текст.
 * Возвращает первый профиль, у которого есть жёсткий маркер (и доп. проверки).
 */
export function detectProfile(text: string): DocProfile | null {
  const all = detectAllProfiles(text);
  return all.length > 0 ? all[0] : null;
}

export function detectAllProfiles(text: string): DocProfile[] {
  const t = text.toLowerCase();
  const result: DocProfile[] = [];
  for (const p of DOC_PROFILES) {
    const strongHit = p.strongMarkers.some((r) => r.test(t));
    if (!strongHit) continue;
    // Для двзнзначных (паспорт vs ИНН) предпочитаем конкретные.
    if (p.strongMarkers.some((r) => /\bИНН\b/i.test(String(r.source))) && /паспорт/i.test(t)) {
      continue;
    }
    result.push(p);
  }
  return result;
}

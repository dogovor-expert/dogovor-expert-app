/**
 * MRZ (Machine Readable Zone) — машиночитаемая зона загранпаспортов
 * (TD3: 2 строки × 44 символа) и ID-карт (TD1: 3 × 30).
 *
 * Killer-фича: чек-суммы (7-3-1) дают математическую гарантию
 * правильности полей — OCR-ошибки в одной цифре ломают валидность,
 * а autocorrect парсера mrz чинит O↔0, I↔1 внутри числовых зон.
 *
 * ВАЖНО: у внутренних паспортов РФ MRZ нет — зона есть только в
 * загранпаспортах. Функция просто возвращает null, если MRZ не найдена.
 */

import { parse as parseMRZ } from "mrz";
import type { LegalTemplate } from "@/data/types";

export interface MrzParseSuccess {
  ok: true;
  format: string;
  fields: {
    lastName?: string | null;
    firstName?: string | null;
    documentNumber?: string | null;
    birthDate?: string | null;
    expiryDate?: string | null;
    sex?: string | null;
    issuingState?: string | null;
    nationality?: string | null;
  };
  valid: boolean;
  raw: string[];
}

/**
 * Ищет строки MRZ в произвольном OCR-тексте. Признаки:
 *  - длина строки 30/36/44 после нормализации;
 *  - состоит только из A-Z, 0-9 и '<';
 *  - начинается с P/I/A/C/V + '<' (тип документа) или содержит
 *    паттернTD3-второй строки (цифры+чек-суммы).
 * Возвращает группы найденных строк (2 для TD2/TD3, 3 для TD1).
 */
export function extractMrzLines(text: string): string[][] {
  const mrzChar = /^[A-Z0-9<]{28,46}$/;
  const candidates = text
    .split("\n")
    .map((l) => l.replace(/[\s«»]/g, "").replace(/О/g, "0").toUpperCase())
    .filter((l) => mrzChar.test(l));

  const groups: string[][] = [];
  for (let i = 0; i < candidates.length; i++) {
    const cur = candidates[i];
    const next = candidates[i + 1];
    const next2 = candidates[i + 2];
    // TD3: первая строка начинается с P<, вторая — цифры/даты, обе по 44.
    if (cur.length === 44 && /^P[<A-Z]/.test(cur)) {
      if (next && next.length === 44) {
        groups.push([cur, next]);
        i++;
        continue;
      }
    }
    // TD1: 3 строки по 30, первая начинается с I</A</C<.
    if (cur.length === 30 && /^[IAC][<A-Z]/.test(cur)) {
      if (next && next2 && next.length === 30 && next2.length === 30) {
        groups.push([cur, next, next2]);
        i += 2;
        continue;
      }
    }
    // TD2: 2 строки по 36.
    if (cur.length === 36 && /^[IACVP][<A-Z]/.test(cur)) {
      if (next && next.length === 36) {
        groups.push([cur, next]);
        i++;
      }
    }
  }
  return groups;
}

/**
 * Пытается распарсить MRZ из OCR-текста. Возвращает первый валидный
 * (или лучший доступный) результат.
 */
export function tryParseMrz(text: string): MrzParseSuccess | null {
  const groups = extractMrzLines(text);
  if (groups.length === 0) return null;

  let best: MrzParseSuccess | null = null;
  for (const lines of groups) {
    try {
      const res = parseMRZ(lines, { autocorrect: true });
      const candidate: MrzParseSuccess = {
        ok: true,
        format: res.format,
        fields: {
          lastName: res.fields.lastName ?? null,
          firstName: res.fields.firstName ?? null,
          documentNumber: res.fields.documentNumber ?? null,
          birthDate: res.fields.birthDate ?? null,
          expiryDate: res.fields.expirationDate ?? null,
          sex: res.fields.sex ?? null,
          issuingState: res.fields.issuingState ?? null,
          nationality: res.fields.nationality ?? null,
        },
        valid: res.valid,
        raw: lines,
      };
      // Приоритет валидному результату (все чек-суммы сошлись).
      if (res.valid) return candidate;
      if (!best) best = candidate;
    } catch {
      // Неверный формат строки — пробуем следующую группу.
    }
  }
  return best;
}

/**
 * Маппинг MRZ-полей в поля шаблона (роль prefix — владелец документа).
 * Даты mrz отдает в формате YYMMDD → превращаем в DD.MM.YYYY.
 */
export function applyMrzToRole(
  template: LegalTemplate,
  prefix: string,
  mrz: MrzParseSuccess
): Record<string, string> {
  const out: Record<string, string> = {};
  const find = (candidates: string[]): string | null =>
    candidates.find((id) => template.fields.some((f) => f.id === id)) ?? null;

  const put = (candidates: string[], value?: string | null) => {
    if (!value) return;
    const id = find(candidates);
    if (id) out[id] = value;
  };

  // ФИО из MRZ: "IVANOV<<IVAN<IVANOVICH" → Фамилия Имя Отчество.
  if (mrz.fields.lastName || mrz.fields.firstName) {
    const fio = [mrz.fields.lastName, mrz.fields.firstName]
      .filter(Boolean)
      .join(" ")
      .replace(/</g, " ")
      .trim();
    if (fio) {
      // Транслитерация — MRZ всегда латиницей; заполняем как есть,
      // т.к. шаблоны принимают латиницу для иностранных документов.
      put([`${prefix}_fio`, `${prefix}_full_name`, `${prefix}_name`], fio);
    }
  }

  put(
    [`${prefix}_passport`, `${prefix}_passport_number`],
    mrz.fields.documentNumber ?? null
  );
  put([`${prefix}_birthday`, `${prefix}_birth_date`], formatDate6(mrz.fields.birthDate));
  // ВАЖНО: ДАТУ ВЫДАЧИ из MRZ получить невозможно — в машиночитаемой зоне
  // (ICAO 9303 TD1/TD2/TD3) есть только номер, дата рождения и СРОК ДЕЙСТВИЯ.
  // Раньше сюда ошибочно писалась expiryDate → в договор молча попадала дата
  // окончания вместо даты выдачи. Поле остаётся пустым; см. mrzManualHints().
  put(
    [`${prefix}_passport_valid_until`, `${prefix}_valid_until`],
    formatDate6(mrz.fields.expiryDate)
  );

  return out;
}

/**
 * Поля шаблона, которые MRZ принципиально не может заполнить, но которые
 * ожидаются для этого типа документа → UI должен попросить пользователя
 * заполнить их вручную (иначе молчаливая пустота или, что хуже, догадка).
 */
export function mrzManualHints(
  template: LegalTemplate,
  prefix: string
): string[] {
  const hints: string[] = [];
  if (template.fields.some((f) => f.id === `${prefix}_passport_date`)) {
    hints.push(
      "Дата выдачи паспорта не считывается с MRZ загранпаспорта — заполните вручную из визуальной зоны"
    );
  }
  return hints;
}

/** YYMMDD (mrz) → DD.MM.YYYY, с обработкой '<' / мусора. */
function formatDate6(v?: string | null): string | undefined {
  if (!v) return undefined;
  const s = v.replace(/[^0-9]/g, "");
  if (s.length !== 6) return undefined;
  const yy = s.slice(0, 2);
  const mm = s.slice(2, 4);
  const dd = s.slice(4, 6);
  if (Number(mm) < 1 || Number(mm) > 12) return undefined;
  if (Number(dd) < 1 || Number(dd) > 31) return undefined;
  const year = Number(yy) > 40 ? `19${yy}` : `20${yy}`;
  return `${dd}.${mm}.${year}`;
}

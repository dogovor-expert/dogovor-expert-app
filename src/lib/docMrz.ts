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
 *
 * Два источника строк:
 *  1) текст OCR, порезанный по строкам (extractMrzLines) — исторический путь;
 *  2) СЛОВА с координатами (mrzLineCandidatesFromWords) — общий OCR часто
 *     рвёт 44-символьную строку MRZ на куски, поэтому строку собираем
 *     геометрически: группируем слова по вертикали и склеиваем по X.
 *     Боксы приходят и от Tesseract, и от серверного OCR.
 */

import { parse as parseMRZ } from "mrz";
import type { LegalTemplate } from "@/data/types";

/** Алфавит машиночитаемой зоны по ICAO 9303: A–Z, цифры и заполнитель '<'. */
export const MRZ_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<";

/** Слово OCR с координатами — минимальный контракт (совместим с OcrWord). */
export interface MrzWordBox {
  text: string;
  bbox: { x0: number; y0: number; x1: number; y1: number };
}

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

/** Допустимые длины строк MRZ: TD1 — 30, TD2 — 36, TD3 — 44. */
const MRZ_LINE_LENGTHS = [44, 36, 30] as const;

/** Строгая проверка «это похоже на строку MRZ»: длина 28–46, алфавит A-Z0-9<. */
const STRICT_MRZ_LINE = /^[A-Z0-9<]{28,46}$/;

/**
 * Нормализация одного токена/строки MRZ: верхний регистр, кириллическая «О»
 * (омоглиф нуля), удаление OCR-артефактов и всего, что не входит в алфавит.
 */
function normalizeMrzChars(s: string): string {
  return s
    .toUpperCase()
    .replace(/О/g, "0")
    .replace(/[«»|¦/\\.,:;'"`~^]/g, "")
    .replace(/[^A-Z0-9<]/g, "");
}

/**
 * Склеенные строки: OCR иногда отдаёт две строки MRZ одним токеном без
 * разделителя (60/72/88 символов). Разрезаем ровно пополам, если обе
 * половины сами по себе — валидные строки MRZ.
 */
function splitConcatenated(line: string): string[] {
  for (const len of MRZ_LINE_LENGTHS) {
    if (line.length === len * 2) {
      const a = line.slice(0, len);
      const b = line.slice(len);
      if (STRICT_MRZ_LINE.test(a) && STRICT_MRZ_LINE.test(b)) return [a, b];
    }
  }
  return [line];
}

/**
 * Собирает строки-кандидаты MRZ из слов с координатами. Слова группируются
 * по вертикальному перекрытию (одна строка документа) и склеиваются по X.
 * Это чинит главную проблему: общий OCR рвёт моношрифтовую строку MRZ на
 * отдельные «слова», и по тексту она не проходит фильтр длины.
 */
export function mrzLineCandidatesFromWords(
  words: readonly MrzWordBox[]
): string[] {
  const items = words
    .map((w) => {
      const text = normalizeMrzChars(w.text);
      const h = Math.max(1, w.bbox.y1 - w.bbox.y0);
      return { text, bbox: w.bbox, h, cy: (w.bbox.y0 + w.bbox.y1) / 2 };
    })
    .filter((w) => w.text.length > 0);

  items.sort((a, b) => a.cy - b.cy);

  const lines: { words: typeof items; cy: number; h: number }[] = [];
  for (const w of items) {
    const line = lines.find((l) => {
      const overlap =
        Math.min(l.cy + l.h / 2, w.cy + w.h / 2) -
        Math.max(l.cy - l.h / 2, w.cy - w.h / 2);
      return overlap > Math.min(l.h, w.h) * 0.5;
    });
    if (line) {
      line.words.push(w);
      line.cy =
        (line.cy * (line.words.length - 1) + w.cy) / line.words.length;
      line.h = Math.max(line.h, w.h);
    } else {
      lines.push({ words: [w], cy: w.cy, h: w.h });
    }
  }

  return lines.map((l) =>
    l.words
      .slice()
      .sort((a, b) => a.bbox.x0 - b.bbox.x0)
      .map((w) => w.text)
      .join("")
  );
}

/**
 * Группирует строки-кандидаты в наборы MRZ: TD3 (2×44), TD2 (2×36), TD1 (3×30).
 * Общий код для текстового и геометрического путей.
 */
function groupMrzCandidates(candidates: string[]): string[][] {
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
 * Ищет строки MRZ в произвольном OCR-тексте. Признаки:
 *  - длина строки 30/36/44 после нормализации;
 *  - состоит только из A-Z, 0-9 и '<';
 *  - начинается с P/I/A/C/V + '<' (тип документа) или содержит
 *    паттерн TD3-второй строки (цифры+чек-суммы).
 * Возвращает группы найденных строк (2 для TD2/TD3, 3 для TD1).
 */
export function extractMrzLines(text: string): string[][] {
  const candidates: string[] = [];
  for (const rawLine of text.split("\n")) {
    const line = normalizeMrzChars(rawLine);
    // Обычная строка MRZ.
    if (STRICT_MRZ_LINE.test(line)) {
      candidates.push(line);
      continue;
    }
    // Склеенные OCR строки (60/72/88) — проверяем ДО строгого фильтра длины.
    for (const part of splitConcatenated(line)) {
      if (part !== line && STRICT_MRZ_LINE.test(part)) candidates.push(part);
    }
  }
  return groupMrzCandidates(candidates);
}

/**
 * Пытается распарсить MRZ из OCR-текста. Если переданы слова с координатами,
 * сначала пробуем геометрическую сборку строк (надёжнее при «рваном» OCR),
 * затем — обычный текстовый путь. Возвращает первый валидный
 * (или лучший доступный) результат.
 */
export function tryParseMrz(
  text: string,
  words?: readonly MrzWordBox[]
): MrzParseSuccess | null {
  const groups: string[][] = [];
  const seen = new Set<string>();

  const pushGroups = (candidateLines: string[]) => {
    for (const g of groupMrzCandidates(candidateLines)) {
      const key = g.join("|");
      if (seen.has(key)) continue;
      seen.add(key);
      groups.push(g);
    }
  };

  if (words && words.length > 0) {
    pushGroups(
      mrzLineCandidatesFromWords(words).filter((l) => STRICT_MRZ_LINE.test(l))
    );
  }
  pushGroups(
    extractMrzLines(text)
      .flat()
      .filter((l) => STRICT_MRZ_LINE.test(l))
  );

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
 * Диагностика (без парсинга): есть ли в тексте/словах признаки MRZ вообще.
 * Нужна для аналитики — отличает «MRZ нет в кадре» (внутренний паспорт РФ)
 * от «MRZ есть, но не распозналась» (наша недоработка). На парсинг не влияет.
 */
export function hasMrzSignature(
  text: string,
  words?: readonly MrzWordBox[]
): boolean {
  if (words && words.length > 0) {
    const joined = mrzLineCandidatesFromWords(words).filter(
      (l) => l.length >= 28 && l.length <= 46 && /^[A-Z0-9<]+$/.test(l)
    );
    if (joined.length > 0) return true;
  }
  return text.split("\n").some((l) => {
    const line = normalizeMrzChars(l);
    return (
      line.length >= 20 && line.length <= 60 && /^[A-Z0-9<]+$/.test(line)
    );
  });
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

/**
 * Производственный календарь РФ (5-дневная рабочая неделя).
 *
 * Источники:
 *  - ст. 111, 112 ТК РФ — выходные (сб, вс) и нерабочие праздничные дни;
 *  - ч. 2 ст. 112 ТК РФ — при совпадении праздника с выходным день отдыха
 *    переносится на следующий рабочий день (кроме 1–8 января);
 *  - постановления Правительства РФ о переносе выходных дней:
 *    № 1314 от 10.08.2023 (2024), № 1335 от 04.10.2024 (2025),
 *    № 1466 от 24.09.2025 (2026).
 *  - ст. 193 ГК РФ — если последний день срока приходится на нерабочий день,
 *    днём окончания срока считается ближайший следующий за ним рабочий день.
 *
 * Перенесённый обычный выходной (например, суббота) становится рабочим днём.
 * Для годов without ПП о переносах действует только автоматическое правило ч.2 ст.112 ТК.
 */

/** Нерабочие праздничные дни (ст. 112 ТК РФ) в формате MM-DD. 1–8 января — все. */
const JAN_1_8 = ["01-01", "01-02", "01-03", "01-04", "01-05", "01-06", "01-07", "01-08"];
const OTHER_FESTIVALS = ["02-23", "03-08", "05-01", "05-09", "06-12", "11-04"];

/**
 * Явные переносы Правительства: год → [источник, получатель] (полные даты).
 * Источник — суббота/воскресенье (или совпавший с выходным праздник из ч.2 ст.112,
 * который Правительство перенесло на конкретный день вместо автоматического).
 */
const GOV_TRANSFERS: Record<number, [string, string][]> = {
  2024: [
    ["2024-01-06", "2024-05-10"], // ПП 1314
    ["2024-01-07", "2024-12-31"],
    ["2024-04-27", "2024-04-29"],
    ["2024-11-02", "2024-04-30"],
    ["2024-12-28", "2024-12-30"],
  ],
  2025: [
    ["2025-01-04", "2025-05-02"], // ПП 1335
    ["2025-01-05", "2025-12-31"],
    ["2025-02-23", "2025-05-08"],
    ["2025-03-08", "2025-06-13"],
    ["2025-11-01", "2025-11-03"],
  ],
  2026: [
    ["2026-01-03", "2026-01-09"], // ПП 1466
    ["2026-01-04", "2026-12-31"],
  ],
};

/** Год, для которого известно постановление о переносах (или точно не будет). */
export const TRANSFERS_KNOWN_UNTIL = 2026;

function iso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export function parseIso(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

interface YearCalendar {
  /** Все нерабочие даты года (выходные + праздники + перенесённые). */
  off: Set<string>;
  /** Дни, которые перестали быть выходными из-за переноса (рабочие субботы). */
  workingWeekends: Set<string>;
}

const cache = new Map<number, YearCalendar>();

function buildYear(year: number): YearCalendar {
  const off = new Set<string>();
  const workingWeekends = new Set<string>();
  const transfers = GOV_TRANSFERS[year] ?? [];
  const movedAway = new Set(transfers.map(([from]) => from));
  const movedTo = new Set(transfers.map(([, to]) => to));

  const holidayIso = (mmdd: string) => `${year}-${mmdd}`;
  const isWeekend = (s: string) => {
    const dow = parseIso(s).getDay();
    return dow === 0 || dow === 6;
  };

  // Выходные по умолчанию (сб, вс). Перенесённый правительством ОБЫЧНЫЙ выходной
  // становится рабочим; совпавший с праздником (ст. 112) остаётся нерабочим.
  const isFestivalDay = (s: string) => JAN_1_8.includes(s.slice(5)) || OTHER_FESTIVALS.includes(s.slice(5));
  const first = new Date(year, 0, 1);
  for (let d = new Date(first); d.getFullYear() === year; d.setDate(d.getDate() + 1)) {
    const s = iso(d);
    if (isWeekend(s)) {
      if (!movedAway.has(s) || isFestivalDay(s)) off.add(s);
      else workingWeekends.add(s);
    }
  }

  // Праздники 1–8 января: нерабочие; совпавшие с выходным переносятся только ПП.
  for (const mmdd of JAN_1_8) {
    const s = holidayIso(mmdd);
    if (isWeekend(s)) {
      // если ПП перенёс этот день — добавляем дату-получатель
      const t = transfers.find(([from]) => from === s);
      if (t && !isWeekend(t[1])) off.add(t[1]);
      else off.add(s); // всё равно часть новогоднего периода
    } else {
      off.add(s);
    }
  }

  // Прочие праздники: ч.2 ст.112 (выходный → следующий рабочий), если ПП не выбрал иной день.
  for (const mmdd of OTHER_FESTIVALS) {
    const s = holidayIso(mmdd);
    if (movedAway.has(s)) continue; // перенос уже обработан ниже (источник → рабочий день)
    if (isWeekend(s)) {
      // автоматически — ближайший понедельник (для 112-ых праздников), но
      // только если это не 1–8 января; для лет, где ПП перенёс вручную — целевая дата.
      const t = transfers.find(([from]) => from === s);
      if (t) {
        if (!isWeekend(t[1])) off.add(t[1]);
      } else {
        const next = parseIso(s);
        do next.setDate(next.getDate() + 1); while (isWeekend(iso(next)));
        off.add(iso(next));
      }
      off.add(s);
    } else {
      off.add(s);
    }
  }

  // Целевые дни явных переносов (в т.ч. обычных выходных, напр. 02.11→30.04).
  for (const [from, to] of transfers) {
    if (!movedAway.has(from)) continue;
    const isFromPlainWeekend = !JAN_1_8.includes(from.slice(5)) && !OTHER_FESTIVALS.includes(from.slice(5));
    if (isFromPlainWeekend) workingWeekends.add(from);
    // дата-получатель становится нерабочей, если она рабочая по умолчанию
    if (!isWeekend(to) || movedTo.has(to)) off.add(to);
  }

  return { off, workingWeekends };
}

function calendarFor(year: number): YearCalendar {
  let c = cache.get(year);
  if (!c) {
    c = buildYear(year);
    cache.set(year, c);
  }
  return c;
}

/** Рабочий ли день (5-дневка, производственный календарь РФ). Принимает Date или "YYYY-MM-DD". */
export function isWorkday(date: Date | string): boolean {
  const s = typeof date === "string" ? date : iso(date);
  const year = Number(s.slice(0, 4));
  const c = calendarFor(year);
  if (c.off.has(s)) return false;
  if (c.workingWeekends.has(s)) return true;
  const dow = parseIso(s).getDay();
  return dow !== 0 && dow !== 6;
}

/** Число рабочих дней в периоде [from, to] включительно. from > to → 0. */
export function countWorkdays(from: string, to: string): number {
  if (from > to) return 0;
  let n = 0;
  const d = parseIso(from);
  const end = parseIso(to);
  while (d <= end) {
    if (isWorkday(new Date(d))) n++;
    d.setDate(d.getDate() + 1);
  }
  return n;
}

/**
 * Ст. 193 ГК РФ: если последний день срока — нерабочий, срок переносится
 * на ближайший следующий рабочий день.
 */
export function shiftDeadline(date: string): { date: string; shifted: boolean } {
  const d = parseIso(date);
  let shifted = false;
  while (!isWorkday(new Date(d))) {
    d.setDate(d.getDate() + 1);
    shifted = true;
  }
  return { date: iso(d), shifted };
}

/** Есть ли по год утверждённый правительством план переносов. */
export function hasTransferDecree(year: number): boolean {
  return year <= TRANSFERS_KNOWN_UNTIL;
}

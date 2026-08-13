export interface KeyRateChange {
  from: string;
  rate: number;
}

export const KEY_RATES: KeyRateChange[] = [
  { from: "2021-03-22", rate: 4.5 },
  { from: "2021-07-26", rate: 6.5 },
  { from: "2021-10-25", rate: 7.5 },
  { from: "2021-12-20", rate: 8.5 },
  { from: "2022-02-14", rate: 9.5 },
  { from: "2022-02-28", rate: 20 },
  { from: "2022-04-11", rate: 17 },
  { from: "2022-05-04", rate: 14 },
  { from: "2022-05-27", rate: 11.5 },
  { from: "2022-06-14", rate: 9.5 },
  { from: "2022-07-25", rate: 8 },
  { from: "2022-09-19", rate: 7.5 },
  { from: "2023-07-24", rate: 8.5 },
  { from: "2023-08-15", rate: 12 },
  { from: "2023-09-18", rate: 13 },
  { from: "2023-10-30", rate: 15 },
  { from: "2023-12-18", rate: 16 },
  { from: "2024-07-29", rate: 18 },
  { from: "2024-09-16", rate: 19 },
  { from: "2024-10-28", rate: 21 },
  { from: "2025-06-09", rate: 20 },
  { from: "2025-07-28", rate: 18 },
  { from: "2025-09-15", rate: 17 },
  { from: "2025-10-27", rate: 16.5 },
  { from: "2025-12-22", rate: 16 },
  { from: "2026-02-16", rate: 15.5 },
  { from: "2026-03-23", rate: 15 },
  { from: "2026-04-27", rate: 14.5 },
  { from: "2026-06-22", rate: 14.25 },
  { from: "2026-07-27", rate: 14 },
];

export const MIN_SUPPORTED_DATE = "2021-03-22";

export function currentKeyRate(): number {
  return KEY_RATES[KEY_RATES.length - 1].rate;
}

export function fmtRate(rate: number): string {
  return rate.toFixed(2).replace(".", ",") + " %";
}

export function parseDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function today(): string {
  return toDateStr(new Date());
}

export function daysBetween(a: string, b: string): number {
  return Math.round((parseDate(b).getTime() - parseDate(a).getTime()) / 86400000);
}

export function plusDays(s: string, n: number): string {
  const d = parseDate(s);
  return toDateStr(new Date(d.getTime() + n * 86400000));
}

export function daysInYear(s: string): number {
  const y = parseDate(s).getFullYear();
  return y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0) ? 366 : 365;
}

export function fmtMoney(n: number): string {
  return n.toLocaleString("ru-RU", { maximumFractionDigits: 2 }) + " ₽";
}

export interface InterestPeriod {
  from: string;
  to: string;
  days: number;
  rate: number;
  debt: number;
  amount: number;
}

export function rateOn(dateStr: string): number {
  for (let i = KEY_RATES.length - 1; i >= 0; i--) {
    if (parseDate(dateStr).getTime() >= parseDate(KEY_RATES[i].from).getTime()) {
      return KEY_RATES[i].rate;
    }
  }
  return KEY_RATES[0].rate;
}

export function formatDateRu(s: string): string {
  const [y, m, d] = s.split("-");
  return `${d}.${m}.${y}`;
}

/**
 * Расчёт процентов по ключевой ставке ЦБ РФ по периодам действия ставки.
 * Период: с даты начала просрочки по дату окончания включительно (daysBetween + 1).
 * Используется для ст. 395 ГК РФ, индексации ст. 208 ГПК РФ.
 */
export function calcInterestByKeyRate(
  debt: number,
  fromStr: string,
  toStr: string,
  includeEndDay = true
): { periods: InterestPeriod[]; total: number; dayFactor: number } {
  const periods: InterestPeriod[] = [];
  let cursor = fromStr;
  const endMs = parseDate(toStr).getTime();
  let total = 0;

  const changesInRange = KEY_RATES.filter(
    (c) => parseDate(c.from).getTime() > parseDate(fromStr).getTime() && parseDate(c.from).getTime() <= endMs
  );

  const boundaries = [...changesInRange.map((c) => c.from), toStr];
  for (const boundary of boundaries) {
    const lastBound = parseDate(cursor).getTime();
    const nextBound = parseDate(boundary).getTime();
    if (nextBound < lastBound) continue;
    const rate = rateOn(cursor);
    let days = Math.round((nextBound - lastBound) / 86400000);
    if (isLastBoundary(boundary, toStr) && includeEndDay) days += 1;
    if (days <= 0) continue;
    const amount = debt * rate / 100 * (days / daysInYear(cursor));
    total += amount;
    periods.push({
      from: cursor,
      to: boundary,
      days,
      rate,
      debt,
      amount: Math.round(amount * 100) / 100,
    });
    cursor = boundary;
  }

  return { periods, total: Math.round(total * 100) / 100, dayFactor: 365 };
}

function isLastBoundary(b: string, toStr: string): boolean {
  return b === toStr;
}

/**
 * Расчёт по ст. 395 ГК РФ с учётом частичных оплат (метод последовательных остатков).
 * Оплаты уменьшают основной долг начиная со дня оплаты.
 */
export function calc395WithPayments(
  debt: number,
  fromStr: string,
  toStr: string,
  payments: { date: string; amount: number }[]
): { periods: InterestPeriod[]; total: number; remainingDebt: number } {
  const evSorted = payments
    .map((p) => ({ ...p, kind: "pay" as const }))
    .sort((a, b) => (a.date < b.date ? -1 : 1));

  const rateChanges = KEY_RATES.filter(
    (c) => parseDate(c.from).getTime() > parseDate(fromStr).getTime() && parseDate(c.from).getTime() <= parseDate(toStr).getTime()
  ).map((c) => ({ date: c.from, kind: "rate" as const }));

  const events = [...rateChanges, ...evSorted].sort((a, b) => (a.date < b.date ? -1 : 1));

  const periods: InterestPeriod[] = [];
  let cursor = fromStr;
  let balance = debt;
  let total = 0;

  for (const ev of events) {
    const evMs = parseDate(ev.date).getTime();
    const cursorMs = parseDate(cursor).getTime();
    if (evMs <= cursorMs) continue;
    const rate = rateOn(cursor);
    let days = Math.round((evMs - cursorMs) / 86400000);
    const isLast = evMs === parseDate(toStr).getTime();
    if (isLast) days += 1;
    if (days > 0 && balance > 0) {
      const amount = (balance * rate / 100 * (days / daysInYear(cursor)));
      total += amount;
      periods.push({ from: cursor, to: ev.date, days, rate, debt: balance, amount: Math.round(amount * 100) / 100 });
    }
    cursor = ev.date;
    if (ev.kind === "pay") {
      balance = Math.max(0, balance - ev.amount);
    }
  }

  return { periods, total: Math.round(total * 100) / 100, remainingDebt: balance };
}

/**
 * Компенсация за задержку заработной платы — ст. 236 ТК РФ:
 * 1/150 ключевой ставки ЦБ от задолженности за каждый день задержки.
 * Ставка применяется по периодам её действия (не делится на 365).
 */
export function calcSalaryDelayPeriods(
  sum: number,
  fromStr: string,
  toStr: string,
  includeEndDay = true
): { periods: InterestPeriod[]; total: number; days: number } {
  const periods: InterestPeriod[] = [];
  let cursor = fromStr;
  const endMs = parseDate(toStr).getTime();
  let total = 0;
  let daysTotal = 0;

  const changesInRange = KEY_RATES.filter(
    (c) => parseDate(c.from).getTime() > parseDate(fromStr).getTime() && parseDate(c.from).getTime() <= endMs
  );

  const boundaries = [...changesInRange.map((c) => c.from), toStr];
  for (const boundary of boundaries) {
    const lastBound = parseDate(cursor).getTime();
    const nextBound = parseDate(boundary).getTime();
    if (nextBound < lastBound) continue;
    const rate = rateOn(cursor);
    let days = Math.round((nextBound - lastBound) / 86400000);
    if (isLastBoundary(boundary, toStr) && includeEndDay) days += 1;
    if (days <= 0) continue;
    const amount = sum * rate / 100 / 150 * days;
    total += amount;
    daysTotal += days;
    periods.push({
      from: cursor,
      to: boundary,
      days,
      rate,
      debt: sum,
      amount: Math.round(amount * 100) / 100,
    });
    cursor = boundary;
  }

  return { periods, total: Math.round(total * 100) / 100, days: daysTotal };
}

/**
 * Пени за ЖКХ — ч. 14 ст. 155 ЖК РФ:
 * с 31-го по 90-й день — 1/300 ключевой ставки, с 91-го дня — 1/130.
 */
export function calcZhkhPenalty(sum: number, days: number): { p300: number; p130: number; total: number } {
  const rate = rateOn(today());
  const d31_90 = Math.max(0, Math.min(days, 90) - 30);
  const d91 = Math.max(0, days - 90);
  const p300 = sum * rate / 100 / 300 * d31_90;
  const p130 = sum * rate / 100 / 130 * d91;
  return {
    p300: Math.round(p300 * 100) / 100,
    p130: Math.round(p130 * 100) / 100,
    total: Math.round((p300 + p130) * 100) / 100,
  };
}

/**
 * Пени за взносы на капремонт — ч. 14.1 ст. 155 ЖК РФ:
 * 1/300 ключевой ставки с 31-го дня просрочки (без повышения до 1/130).
 */
export function calcCapRepairPenalty(sum: number, days: number): { p300: number; total: number } {
  const rate = rateOn(today());
  const d = Math.max(0, days - 30);
  const p300 = sum * rate / 100 / 300 * d;
  return {
    p300: Math.round(p300 * 100) / 100,
    total: Math.round(p300 * 100) / 100,
  };
}

/**
 * Госпошлина по имущественному иску — пп. 1 п. 1 ст. 333.19 НК РФ (ред. 09.09.2024).
 */
export function courtFeeProperty(claim: number, entity: boolean): { fee: number; formula: string } {
  if (claim <= 100000) {
    return { fee: 4000, formula: "4 000 ₽ (минимум)" };
  }
  if (claim <= 300000) {
    const fee = 4000 + (claim - 100000) * 0.03;
    return { fee: Math.round(fee), formula: "4 000 ₽ + 3% суммы свыше 100 000 ₽" };
  }
  if (claim <= 500000) {
    const fee = 10000 + (claim - 300000) * 0.025;
    return { fee: Math.round(fee), formula: "10 000 ₽ + 2,5% суммы свыше 300 000 ₽" };
  }
  if (claim <= 1000000) {
    const fee = 15000 + (claim - 500000) * 0.02;
    return { fee: Math.round(fee), formula: "15 000 ₽ + 2% суммы свыше 500 000 ₽" };
  }
  if (claim <= 3000000) {
    const fee = 25000 + (claim - 1000000) * 0.01;
    return { fee: Math.round(fee), formula: "25 000 ₽ + 1% суммы свыше 1 000 000 ₽" };
  }
  if (claim <= 8000000) {
    const fee = 45000 + (claim - 3000000) * 0.007;
    return { fee: Math.round(fee), formula: "45 000 ₽ + 0,7% суммы свыше 3 000 000 ₽" };
  }
  if (claim <= 24000000) {
    const fee = 80000 + (claim - 8000000) * 0.0035;
    return { fee: Math.round(fee), formula: "80 000 ₽ + 0,35% суммы свыше 8 000 000 ₽" };
  }
  if (claim <= 50000000) {
    const fee = 136000 + (claim - 24000000) * 0.003;
    return { fee: Math.round(fee), formula: "136 000 ₽ + 0,3% суммы свыше 24 000 000 ₽" };
  }
  if (claim <= 100000000) {
    const fee = 214000 + (claim - 50000000) * 0.002;
    return { fee: Math.round(fee), formula: "214 000 ₽ + 0,2% суммы свыше 50 000 000 ₽" };
  }
  const fee = Math.min(314000 + (claim - 100000000) * 0.0015, 900000);
  return { fee: Math.round(fee), formula: "314 000 ₽ + 0,15% суммы свыше 100 000 000 ₽, но не более 900 000 ₽" };
}

export interface CourtFeeResult {
  name: string;
  fee: number;
  formula: string;
  base: string;
}

export function courtFeeNonProperty(): { child: number; org: number } {
  return { child: 3000, org: 20000 };
}

export function courtFeeAppeal(): { child: number; org: number } {
  return { child: 3000, org: 15000 };
}

export function courtFeeCassation(): { child: number; org: number } {
  return { child: 5000, org: 20000 };
}

export function courtFeeAlimony(): number {
  return 150;
}

/**
 * Неустойка по договору (законные варианты: 1/300, 1/150, 1/130 ключевой ставки, либо договорной % в день / % годовых).
 */
export function calcContractPenalty(
  sum: number,
  rate: number,
  mode: "perDay" | "perYear" | "f300" | "f150" | "f130",
  days: number
): number {
  let daily: number;
  if (mode === "perDay") {
    daily = rate / 100;
  } else if (mode === "perYear") {
    daily = rate / 100 / 365;
  } else {
    const key = rateOn(today());
    const denom = mode === "f300" ? 300 : mode === "f150" ? 150 : 130;
    daily = key / 100 / denom;
  }
  return Math.round(sum * daily * days * 100) / 100;
}

export interface AlimonyResult {
  share: number;
  monthly: number;
  penalty: number;
}

/**
 * Алименты — ст. 81 СК РФ (доля дохода), пени — ст. 115 СК РФ (0,5% за день просрочки).
 */
export function calcAlimony(income: number, children: number, debt: number, penaltyDays: number): AlimonyResult {
  const share = children <= 1 ? 1 / 4 : children === 2 ? 1 / 3 : 1 / 2;
  return {
    share,
    monthly: Math.round(income * share * 100) / 100,
    penalty: Math.round(debt * 0.005 * penaltyDays * 100) / 100,
  };
}
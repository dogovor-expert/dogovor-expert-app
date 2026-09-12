export interface IpContributions {
  fixed: number;
  percent: number;
  maxPercent: number;
  totalMin: number;
  totalMax: number;
  dueFixed: string;
  duePercent: string;
}

const CONTRIB: Record<number, { fixed: number; percentMax: number; dueFixed: string; duePercent: string; percent: number; threshold: number }> = {
  2024: { fixed: 49500, percentMax: 277571, dueFixed: "до 28 декабря 2024", duePercent: "до 01.07.2025", percent: 1, threshold: 300000 },
  2025: { fixed: 53658, percentMax: 300888, dueFixed: "до 28 декабря 2025", duePercent: "до 01.07.2026", percent: 1, threshold: 300000 },
  2026: { fixed: 57390, percentMax: 321818, dueFixed: "до 28 декабря 2026", duePercent: "до 01.07.2027", percent: 1, threshold: 300000 },
  2027: { fixed: 61154, percentMax: 342923, dueFixed: "до 28 декабря 2027", duePercent: "до 01.07.2028", percent: 1, threshold: 300000 },
};

export function ipContributions(year: number, income: number, months?: number): IpContributions {
  const c = CONTRIB[year] ?? CONTRIB[2026];
  const coef = months && months > 0 && months < 12 ? months / 12 : 1;
  const fixed = Math.round(c.fixed * coef);
  const excess = Math.max(0, income - c.threshold);
  const percent = Math.min(Math.round(excess * c.percent / 100), Math.round(c.percentMax * coef));
  return {
    fixed,
    percent,
    maxPercent: Math.round(c.percentMax * coef),
    totalMin: fixed + percent,
    totalMax: fixed + Math.round(c.percentMax * coef),
    dueFixed: c.dueFixed,
    duePercent: c.duePercent,
  };
}

export const NDFL_BRACKETS = [
  { upTo: 2_400_000, rate: 13, subtract: 0 },
  { upTo: 5_000_000, rate: 15, subtract: 48_000 },
  { upTo: 20_000_000, rate: 18, subtract: 198_000 },
  { upTo: 50_000_000, rate: 20, subtract: 598_000 },
  { upTo: Infinity, rate: 22, subtract: 1_598_000 },
];

export const CHILD_DEDUCTIONS = [0, 1400, 2800, 6000, 6000, 6000, 6000, 6000, 6000, 6000];
export const CHILD_DEDUCTION_LIMIT = 450_000;
export const DISABLED_CHILD_DEDUCTION = 12000;

export function ndflTax(annualIncome: number, children: number): { tax: number; deductions: number } {
  let taxable = annualIncome;
  let deductions = 0;
  if (children > 0 && annualIncome <= CHILD_DEDUCTION_LIMIT) {
    for (let i = 1; i <= children && i < CHILD_DEDUCTIONS.length; i++) {
      deductions += CHILD_DEDUCTIONS[i];
    }
    taxable = Math.max(0, annualIncome - deductions * 12);
  }
  const bracket = NDFL_BRACKETS.find((b) => taxable <= b.upTo);
  if (!bracket) {
    throw new Error(`No NDFL bracket for taxable=${taxable}`);
  }
  return { tax: Math.max(0, taxable * bracket.rate / 100 - bracket.subtract), deductions };
}

export function propertyReturn(purchasePrice: number, interestPaid?: number): { refund: number; limit: number; refundInterest: number } {
  const limit = 2_000_000;
  const refund = Math.min(purchasePrice, limit) * 0.13;
  const refundInterest = interestPaid ? Math.min(interestPaid, 3_000_000) * 0.13 : 0;
  return { refund: Math.round(refund), limit, refundInterest: Math.round(refundInterest) };
}

/** УСН: ставки, минимальный налог 1% для «доходы-расходы», порог НДС 20 млн (2026). */
export function usnTax(income: number, expenses: number, mode: "income" | "incomeMinus"): {
  tax: number;
  minTax: number;
  rate: number;
  vatStatus: "no" | "rate5" | "rate7";
  vatRate: number;
  usnLost: boolean;
} {
  const rate = mode === "income" ? 6 : 15;
  const taxBase = mode === "income" ? income * 0.06 : (income - expenses) * 0.15;
  const minTax = mode === "incomeMinus" ? income * 0.01 : 0;
  let vatStatus: "no" | "rate5" | "rate7" = "no";
  let usnLost = false;
  if (income > 20_000_000) {
    if (income <= 272_500_000) vatStatus = "rate5";
    else if (income <= 490_500_000) vatStatus = "rate7";
    else usnLost = true;
  }
  return { tax: Math.round(Math.max(taxBase, minTax)), minTax: Math.round(minTax), rate, vatStatus, vatRate: vatStatus === "rate5" ? 5 : vatStatus === "rate7" ? 7 : 0, usnLost };
}

/** НПД: 4%/6%, вычет 10 000 ₽ (пока не исчерпан — 3%/4%). */
export function npdTax(incomePpl: number, incomeOrg: number): {
  ratePpl: number;
  rateOrg: number;
  tax: number;
  deductionUsed: number;
  deductionLeft: number;
} {
  const basePpl = incomePpl * 0.04;
  const baseOrg = incomeOrg * 0.06;
  const gross = basePpl + baseOrg;
  const deductionUsed = Math.min(gross, 10_000);
  const tax = gross - deductionUsed;
  return {
    ratePpl: 4,
    rateOrg: 6,
    tax: Math.round(tax * 100) / 100,
    deductionUsed: Math.round(deductionUsed * 100) / 100,
    deductionLeft: Math.max(0, 10_000 - deductionUsed),
  };
}

/** Отпускные: СДЗ = доход за 12 мес / (29,3 × 12), ст. 139 ТК. */
export function vacationPay(salary12: number, days: number): { sdz: number; pay: number } {
  const sdz = salary12 / (29.3 * 12);
  return { sdz: Math.round(sdz * 100) / 100, pay: Math.round(Math.max(0, sdz) * days * 100) / 100 };
}

/**
 * Отпускные с учётом премий — ПП РФ № 540 от 24.04.2025 (п. 15),
 * ранее ПП № 922 п. 15 (формула идентична).
 *
 * Правила п. 15:
 *  - ежемесячные премии — не более одной выплаты за каждый показатель
 *    за каждый месяц расчётного периода;
 *  - премии за период > 1 месяца, но ≤ расчётного периода (квартальные,
 *    полугодовые) — по одной за каждый показатель;
 *  - годовое вознаграждение (и за выслугу лет) — за календарный год,
 *    предшествующий событию, независимо от времени начисления;
 *  - если расчётный период отработан не полностью — премии учитываются
 *    пропорционально отработанному времени, КРОМЕ премий, начисленных
 *    уже за фактически отработанное время (они берутся полностью).
 *
 * Периоды по п. 5 (больничный, отпуск, простой, командировка) исключаются
 * из расчётного периода: знаменатель = 29,3 × полные месяцы + дни в неполных.
 */
export interface VacationBonusInput {
  /** Выплаты по окладу/тарифу за расчётный период (без премий), ₽. */
  salary12: number;
  /** Сумма ежемесячных премий, начисленных в расчётном периоде, ₽. */
  monthlyBonuses?: number;
  /** Сумма квартальных/полугодовых премий (за период ≤ расчётного), ₽. */
  periodBonuses?: number;
  /** Годовая премия (и выслуга) за предшествующий календарный год, ₽. */
  annualBonus?: number;
  /** Полностью отработанные месяцы из 12 (12–0), по умолчанию 12. */
  fullyWorkedMonths?: number;
  /** Календарные дни в неполностью отработанных месяцах, по умолчанию 0. */
  partialMonthDays?: number;
  /** Премии начислены уже пропорционально отработанному времени → берём полностью. */
  bonusesAlreadyProportional?: boolean;
}

export interface VacationBonusResult {
  sdz: number;
  pay: number;
  /** Итоговые включённые премии (с учётом пропорционализации). */
  bonusesIncluded: number;
  /** Знаменатель: 29,3 × полные месяцы + дни неполных (или 29,3 × 12). */
  denominator: number;
  /** Доля отработанного времени (для пропорционализации премий). */
  workedFraction: number;
}

export function vacationPayWithBonuses(
  i: VacationBonusInput,
  days: number,
): VacationBonusResult | null {
  const fm = Math.max(0, Math.min(12, i.fullyWorkedMonths ?? 12));
  const pd = Math.max(0, Math.min(31, i.partialMonthDays ?? 0));
  const denominator = fm >= 12 ? 29.3 * 12 : 29.3 * fm + pd;
  if (denominator <= 0 || !isFinite(i.salary12) || i.salary12 < 0) return null;

  const workedFraction = Math.min(1, denominator / (29.3 * 12));
  const proportional = workedFraction < 1 && !i.bonusesAlreadyProportional;
  const scale = (v: number) => (proportional ? v * workedFraction : v);

  const bonusesIncluded =
    scale(i.monthlyBonuses ?? 0) +
    scale(i.periodBonuses ?? 0) +
    scale(i.annualBonus ?? 0);

  const sdz = (Math.max(0, i.salary12) + bonusesIncluded) / denominator;
  return {
    sdz: Math.round(sdz * 100) / 100,
    pay: Math.round(Math.max(0, sdz) * days * 100) / 100,
    bonusesIncluded: Math.round(bonusesIncluded * 100) / 100,
    denominator: Math.round(denominator * 100) / 100,
    workedFraction: Math.round(workedFraction * 1000) / 1000,
  };
}

/** Компенсация неиспользованного отпуска: 2,33 дня за месяц работы. */
export function unusedVacationDays(monthsWorked: number): number {
  return Math.min(Math.round(monthsWorked * 2.33 * 100) / 100, 28);
}

export const TRANSPORT_FEDERAL_RATES: { upTo: number; rate: number }[] = [
  { upTo: 100, rate: 2.5 },
  { upTo: 150, rate: 3.5 },
  { upTo: 200, rate: 5 },
  { upTo: 250, rate: 7.5 },
  { upTo: Infinity, rate: 15 },
];

export const TRANSPORT_REGIONS: Record<string, {
  name: string;
  rates: { upTo: number; rate: number }[];
  /** Ставки, дифференцированные по налоговым периодам (Свердловская обл.). */
  byYear?: Record<number, { upTo: number; rate: number }[]>;
  note?: string;
}> = {
  federal: { name: "Федеральные (базовые)", rates: TRANSPORT_FEDERAL_RATES },
  moscow: {
    name: "Москва",
    rates: [
      { upTo: 100, rate: 12 },
      { upTo: 150, rate: 25 },
      { upTo: 200, rate: 45 },
      { upTo: 250, rate: 75 },
      { upTo: Infinity, rate: 150 },
    ],
  },
  spb: {
    name: "Санкт-Петербург",
    rates: [
      { upTo: 100, rate: 24 },
      { upTo: 150, rate: 35 },
      { upTo: 200, rate: 50 },
      { upTo: 250, rate: 75 },
      { upTo: Infinity, rate: 150 },
    ],
  },
  mskobl: {
    name: "Московская область",
    rates: [
      { upTo: 100, rate: 10 },
      { upTo: 150, rate: 34 },
      { upTo: 200, rate: 49 },
      { upTo: 250, rate: 75 },
      { upTo: Infinity, rate: 150 },
    ],
  },
  nso: {
    name: "Новосибирская область",
    rates: [
      { upTo: 100, rate: 6 },
      { upTo: 150, rate: 10 },
      { upTo: 200, rate: 15 },
      { upTo: 250, rate: 25 },
      { upTo: Infinity, rate: 30 },
    ],
  },
  // Закон РТ от 29.11.2002 № 24-ЗРТ, ст. 5 (ред. 2026)
  tat: {
    name: "Татарстан",
    rates: [
      { upTo: 100, rate: 10 },
      { upTo: 150, rate: 35 },
      { upTo: 200, rate: 50 },
      { upTo: 250, rate: 75 },
      { upTo: Infinity, rate: 150 },
    ],
    note: "До 100 л.с.: для организаций — 25 ₽, для физлиц — 10 ₽ (указана ставка физлиц).",
  },
  // Закон СО от 29.11.2002 № 43-ОЗ (ред. от 14.11.2024) — ставки растут по годам
  sverdl: {
    name: "Свердловская область",
    rates: [
      { upTo: 100, rate: 10.4 },
      { upTo: 150, rate: 14.6 },
      { upTo: 200, rate: 35.4 },
      { upTo: 250, rate: 53.7 },
      { upTo: Infinity, rate: 107.3 },
    ],
    byYear: {
      2025: [
        { upTo: 100, rate: 10 },
        { upTo: 150, rate: 14 },
        { upTo: 200, rate: 34 },
        { upTo: 250, rate: 51.6 },
        { upTo: Infinity, rate: 103.2 },
      ],
      2026: [
        { upTo: 100, rate: 10.4 },
        { upTo: 150, rate: 14.6 },
        { upTo: 200, rate: 35.4 },
        { upTo: 250, rate: 53.7 },
        { upTo: Infinity, rate: 107.3 },
      ],
      2027: [
        { upTo: 100, rate: 10.8 },
        { upTo: 150, rate: 15.2 },
        { upTo: 200, rate: 36.8 },
        { upTo: 250, rate: 55.8 },
        { upTo: Infinity, rate: 111.6 },
      ],
      2028: [
        { upTo: 100, rate: 11.2 },
        { upTo: 150, rate: 15.8 },
        { upTo: 200, rate: 38.3 },
        { upTo: 250, rate: 58 },
        { upTo: Infinity, rate: 116.1 },
      ],
    },
    note: "Ставки повышаются ежегодно (2025→2028). Выберите налоговый период.",
  },
  // Обл. закон Ростовской обл. от 10.05.2012 № 843-ЗС, ст. 5 (ред. 27.11.2025 № 370-ЗС)
  rostov: {
    name: "Ростовская область",
    rates: [
      { upTo: 100, rate: 16 },
      { upTo: 150, rate: 25 },
      { upTo: 200, rate: 50 },
      { upTo: 250, rate: 75 },
      { upTo: Infinity, rate: 150 },
    ],
    note: "До 100 л.с.: 12 ₽ для авто старше 10 лет, иначе 16 ₽. С 2027: 100–150 л.с. — 30 ₽ (расчёт по базовым).",
  },
  // Закон НО от 28.11.2002 № 71-З — дополнительный интервал «до 45 л.с.»
  nnov: {
    name: "Нижегородская область",
    rates: [
      { upTo: 45, rate: 13.5 },
      { upTo: 100, rate: 22.5 },
      { upTo: 150, rate: 31.5 },
      { upTo: 200, rate: 45 },
      { upTo: 250, rate: 75 },
      { upTo: Infinity, rate: 150 },
    ],
    note: "Есть отдельная ставка до 45 л.с. (13,5 ₽).",
  },
};

export function transportTax(
  power: number,
  region: keyof typeof TRANSPORT_REGIONS,
  months = 12,
  luxuryCoef = 1,
  year = 2026
): { rate: number; tax: number; luxury: number } {
  const conf = TRANSPORT_REGIONS[region];
  const rates = conf?.byYear?.[year] ?? conf?.rates ?? TRANSPORT_FEDERAL_RATES;
  const bracket = rates.find((r) => power <= r.upTo);
  if (!bracket) {
    throw new Error(`No transport tax bracket for power=${power}`);
  }
  const tax = Math.round(power * bracket.rate * months / 12 * luxuryCoef * 100) / 100;
  return { rate: bracket.rate, tax, luxury: luxuryCoef };
}

export function luxuryCoefFor(avgPrice: number, ageYears: number): number {
  if (avgPrice > 15_000_000 && ageYears <= 20) return 3;
  if (avgPrice > 10_000_000 && ageYears <= 10) return 3;
  if (avgPrice > 5_000_000 && ageYears <= 5) return 2;
  if (avgPrice > 3_000_000 && ageYears <= 3) return 1.1;
  return 1;
}

export { CONTRIB as IP_CONTRIB }; // re-export to calculate без функции при необходимости
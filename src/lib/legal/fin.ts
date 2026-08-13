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
  const bracket = NDFL_BRACKETS.find((b) => annualIncome <= b.upTo)!;
  return { tax: annualIncome * bracket.rate / 100 - bracket.subtract, deductions };
}

export function propertyReturn(purchasePrice: number, interestPaid?: number): { refund: number; limit: number; refundInterest: number } {
  const limit = 2_000_000;
  const refund = Math.min(purchasePrice, limit) * 0.13;
  const refundInterest = interestPaid ? Math.min(interestPaid, 3_000_000) * 0.13 : 0;
  return { refund: Math.round(refund), limit, refundInterest: Math.round(refundInterest) };
}

/** УСН: ставки, минимальный налог 1% для «доходы-расходы», порог НДС 60 млн. */
export function usnTax(income: number, expenses: number, mode: "income" | "incomeMinus"): {
  tax: number;
  minTax: number;
  rate: number;
  vatStatus: "no" | "rate5" | "rate7";
  vatRate: number;
} {
  const rate = mode === "income" ? 6 : 15;
  const tax = mode === "income" ? income * 0.06 : Math.max(income * 0.15 - expenses * 0, income * 0.15 - 0);
  const incomeMinusTax = Math.max(0, income * 0.15);
  const taxBase = mode === "income" ? income * 0.06 : (income - expenses) * 0.15;
  const minTax = mode === "incomeMinus" ? income * 0.01 : 0;
  let vatStatus: "no" | "rate5" | "rate7" = "no";
  if (income > 60_000_000) vatStatus = income <= 250_000_000 ? "rate5" : "rate7";
  return { tax: Math.round(Math.max(taxBase, minTax)), minTax: Math.round(minTax), rate, vatStatus, vatRate: vatStatus === "rate5" ? 5 : vatStatus === "rate7" ? 7 : 0 };
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

export const TRANSPORT_REGIONS: Record<string, { name: string; rates: { upTo: number; rate: number }[] }> = {
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
};

export function transportTax(power: number, region: keyof typeof TRANSPORT_REGIONS, months = 12, luxuryCoef = 1): {
  rate: number;
  tax: number;
  luxury: number;
} {
  const rates = TRANSPORT_REGIONS[region]?.rates ?? TRANSPORT_FEDERAL_RATES;
  const bracket = rates.find((r) => power <= r.upTo)!;
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
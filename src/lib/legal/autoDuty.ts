export interface CustomsFeeTier {
  upTo: number;
  fee: number;
}

export const CUSTOMS_FEES: CustomsFeeTier[] = [
  { upTo: 200000, fee: 775 },
  { upTo: 450000, fee: 1550 },
  { upTo: 1200000, fee: 3100 },
  { upTo: 2700000, fee: 8530 },
  { upTo: 4200000, fee: 12000 },
  { upTo: 5500000, fee: 15500 },
  { upTo: 7000000, fee: 20000 },
  { upTo: 8000000, fee: 23000 },
  { upTo: 9000000, fee: 25000 },
  { upTo: 10000000, fee: 27000 },
  { upTo: Infinity, fee: 30000 },
];

export function customsFeeFor(value: number): number {
  for (const t of CUSTOMS_FEES) if (value <= t.upTo) return t.fee;
  return CUSTOMS_FEES[CUSTOMS_FEES.length - 1].fee;
}

export interface DutyTier {
  name: string;
  calc: (valueRub: number, volumeCm3: number) => number;
  note: string;
}

export const FX_RATES = {
  USD: 82.9977,
  EUR: 95.7793,
  CNY: 12.278,
  KRW: 0.0586556,
  JPY: 0.520852,
};

export function fxToRub(amount: number, currency: keyof typeof FX_RATES): number {
  return Math.round(amount * FX_RATES[currency] * 100) / 100;
}

export interface ImportScenario {
  subject: "individual" | "individualResale" | "legal";
  fuel: "petrol" | "diesel" | "electric" | "parallelHybrid" | "sequentialHybrid";
  ageYears: number;
  volumeCm3: number;
  powerHp: number;
  valueRub: number;
}

export interface TaxDutyRow {
  name: string;
  amount: number;
  formula: string;
}

export function dutyForFizNew(valueEur: number, volumeCm3: number): { duty: number; rate: string } {
  const tiers: { upTo: number; pct: number; minEurCm3: number }[] = [
    { upTo: 8500, pct: 0.54, minEurCm3: 2.5 },
    { upTo: 16700, pct: 0.48, minEurCm3: 3.5 },
    { upTo: 42300, pct: 0.48, minEurCm3: 5.5 },
    { upTo: 84500, pct: 0.48, minEurCm3: 7.5 },
    { upTo: 169000, pct: 0.48, minEurCm3: 15 },
    { upTo: Infinity, pct: 0.48, minEurCm3: 20 },
  ];
  const t = tiers.find((x) => valueEur <= x.upTo)!;
  const byPct = valueEur * t.pct;
  const byMin = volumeCm3 / 1000 * t.minEurCm3;
  const duty = Math.max(byPct, byMin);
  return { duty, rate: `${Math.round(t.pct * 100)}%, но не менее ${t.minEurCm3} €/см³` };
}

export function dutyForFizOld(ageYears: number, volumeCm3: number): { duty: number; rate: string } {
  const rows: { from: number; to: number; eur3_5: number; eur5: number }[] = [
    { from: 0, to: 1000, eur3_5: 1.5, eur5: 3 },
    { from: 1001, to: 1500, eur3_5: 1.7, eur5: 3.2 },
    { from: 1501, to: 1800, eur3_5: 2.5, eur5: 3.5 },
    { from: 1801, to: 2300, eur3_5: 2.7, eur5: 4.8 },
    { from: 2301, to: 3000, eur3_5: 3, eur5: 5 },
    { from: 3001, to: Infinity, eur3_5: 3.6, eur5: 5.7 },
  ];
  const r = rows.find((x) => volumeCm3 >= x.from && volumeCm3 <= x.to)!;
  const rate = ageYears < 5 ? r.eur3_5 : r.eur5;
  const duty = volumeCm3 / 1000 * rate;
  return { duty, rate: `${rate} €/см³` };
}

export interface ExciseTier {
  fromHp: number;
  toHp: number;
  rubPerHp: number;
}

export const EXCISE_LEGHT_CARS: ExciseTier[] = [
  { fromHp: 0, toHp: 90, rubPerHp: 0 },
  { fromHp: 90, toHp: 150, rubPerHp: 64 },
  { fromHp: 150, toHp: 200, rubPerHp: 613 },
  { fromHp: 200, toHp: 300, rubPerHp: 1004 },
  { fromHp: 300, toHp: 400, rubPerHp: 1711 },
  { fromHp: 400, toHp: 500, rubPerHp: 1771 },
  { fromHp: 500, toHp: Infinity, rubPerHp: 1829 },
];

export function exciseFor(powerHp: number): { amount: number; rate: number } {
  const t = EXCISE_LEGHT_CARS.find((x) => powerHp > x.fromHp && powerHp <= x.toHp) ?? EXCISE_LEGHT_CARS[EXCISE_LEGHT_CARS.length - 1];
  return { amount: Math.round(powerHp * t.rubPerHp), rate: t.rubPerHp };
}

export function calcImportCosts(s: ImportScenario): { rows: TaxDutyRow[]; total: number; carWithDuty: number } {
  const rows: TaxDutyRow[] = [];
  const fee = customsFeeFor(s.valueRub);
  rows.push({ name: "Таможенный сбор", amount: fee, formula: fee.toLocaleString("ru-RU") + " ₽ (по стоимости)" });

  let duty = 0;
  let dutyNote = "";
  if (s.subject === "individual") {
    const valueEur = s.valueRub / FX_RATES.EUR;
    if (s.ageYears < 3) {
      const r = dutyForFizNew(valueEur, s.volumeCm3);
      duty = r.duty * FX_RATES.EUR;
      dutyNote = r.rate;
    } else {
      const r = dutyForFizOld(s.ageYears, s.volumeCm3);
      duty = r.duty * FX_RATES.EUR;
      dutyNote = r.rate;
    }
  } else {
    const pct = s.ageYears < 3 ? 0.15 : s.ageYears < 7 ? 0.2 : null;
    if (pct !== null) {
      duty = s.valueRub * pct;
      dutyNote = `${Math.round(pct * 100)}% от таможенной стоимости`;
      if (s.ageYears >= 3 && s.ageYears < 7) {
        const minPerCm3 = s.fuel === "diesel" ? 0.32 : 0.36;
        const minDuty = s.volumeCm3 / 1000 * minPerCm3 * FX_RATES.EUR;
        if (duty < minDuty) {
          duty = minDuty;
          dutyNote = `мин. ${minPerCm3} €/см³`;
        }
      }
    } else {
      const eurPerCm3 = s.ageYears >= 7 ? (s.fuel === "diesel" ? 1.4 : s.volumeCm3 > 3000 ? 3.2 : s.volumeCm3 > 2300 ? 2.2 : s.volumeCm3 > 1800 ? 2.2 : s.volumeCm3 > 1500 ? 1.6 : s.volumeCm3 > 1000 ? 1.5 : 1.4) : 1.4;
      duty = s.volumeCm3 / 1000 * eurPerCm3 * FX_RATES.EUR;
      dutyNote = `${eurPerCm3} €/см³`;
    }
  }
  rows.push({ name: "Таможенная пошлина", amount: Math.round(duty), formula: dutyNote });

  let excise = 0;
  const payExcise = s.subject !== "individual";
  if (payExcise) {
    if (s.fuel === "electric") {
      rows.push({ name: "Акциз", amount: 0, formula: "Электромобили освобождены от акциза (ст. 193 НК)" });
    } else {
      const e = exciseFor(s.powerHp);
      excise = e.amount;
      rows.push({ name: "Акциз", amount: excise, formula: `${s.powerHp} л.с. × ${e.rate} ₽/л.с. (ст. 193 НК)` });
    }
  }

  let vat = 0;
  if (s.subject !== "individual") {
    vat = Math.round((s.valueRub + duty + excise) * 0.22 * 100) / 100;
    rows.push({ name: "НДС 22%", amount: vat, formula: "(цена + пошлина + акциз) × 22%" });
  }

  const u = utilSbFor(s);
  rows.push({ name: "Утилизационный сбор", amount: u.amount, formula: u.formula });

  const total = Math.round((fee + duty + excise + vat + u.amount) * 100) / 100;
  return { rows, total, carWithDuty: Math.round((s.valueRub + total) * 100) / 100 };
}

export interface UtilTier {
  maxHp: number;
  kNew: number;
  kUsed: number;
}

const UTIL_ELECTRIC: UtilTier[] = [
  { maxHp: 100, kNew: 49.56, kUsed: 82.08 },
  { maxHp: 130, kNew: 65.88, kUsed: 95.64 },
  { maxHp: 160, kNew: 78, kUsed: 111.36 },
  { maxHp: 190, kNew: 92.4, kUsed: 129.72 },
  { maxHp: 220, kNew: 109.68, kUsed: 151.2 },
  { maxHp: 250, kNew: 129.96, kUsed: 176.16 },
  { maxHp: 280, kNew: 153.96, kUsed: 205.2 },
  { maxHp: Infinity, kNew: 182.4, kUsed: 239.04 },
];

const UTIL_ICE: { maxVol: number; tiers: UtilTier[] }[] = [
  {
    maxVol: 1000,
    tiers: [
      { maxHp: 190, kNew: 15.36, kUsed: 28.44 },
      { maxHp: 220, kNew: 15.84, kUsed: 29.28 },
      { maxHp: 250, kNew: 16.2, kUsed: 30.12 },
      { maxHp: Infinity, kNew: 17.28, kUsed: 30.12 },
    ],
  },
  {
    maxVol: 2000,
    tiers: [
      { maxHp: 190, kNew: 45, kUsed: 74.64 },
      { maxHp: 220, kNew: 47.64, kUsed: 79.2 },
      { maxHp: 250, kNew: 50.52, kUsed: 83.88 },
      { maxHp: 280, kNew: 57.12, kUsed: 91.92 },
      { maxHp: 310, kNew: 64.56, kUsed: 100.56 },
      { maxHp: 340, kNew: 72.96, kUsed: 110.16 },
      { maxHp: 370, kNew: 83.16, kUsed: 120.6 },
      { maxHp: 400, kNew: 94.8, kUsed: 132 },
      { maxHp: 430, kNew: 108, kUsed: 144.6 },
      { maxHp: 460, kNew: 123.24, kUsed: 158.4 },
      { maxHp: 500, kNew: 140.4, kUsed: 173.4 },
      { maxHp: Infinity, kNew: 160.08, kUsed: 189.84 },
    ],
  },
  {
    maxVol: 3000,
    tiers: [
      { maxHp: 190, kNew: 115.34, kUsed: 172.8 },
      { maxHp: 220, kNew: 118.2, kUsed: 175.08 },
      { maxHp: 250, kNew: 120.12, kUsed: 177.6 },
      { maxHp: 280, kNew: 126, kUsed: 183 },
      { maxHp: 310, kNew: 131.04, kUsed: 188.52 },
      { maxHp: 340, kNew: 136.32, kUsed: 193.68 },
      { maxHp: 370, kNew: 141.72, kUsed: 199.08 },
      { maxHp: 400, kNew: 147.48, kUsed: 204.72 },
      { maxHp: 430, kNew: 153.36, kUsed: 210.48 },
      { maxHp: 460, kNew: 159.48, kUsed: 216.36 },
      { maxHp: 500, kNew: 165.84, kUsed: 222.36 },
      { maxHp: Infinity, kNew: 172.44, kUsed: 228.6 },
    ],
  },
  {
    maxVol: 3500,
    tiers: [
      { maxHp: 160, kNew: 129.2, kUsed: 197.81 },
      { maxHp: 190, kNew: 131.76, kUsed: 200.04 },
      { maxHp: 220, kNew: 134.4, kUsed: 202.2 },
      { maxHp: 250, kNew: 137.16, kUsed: 204.36 },
      { maxHp: 280, kNew: 140.52, kUsed: 207.24 },
      { maxHp: 310, kNew: 144, kUsed: 212.4 },
      { maxHp: 340, kNew: 151.92, kUsed: 217.8 },
      { maxHp: 370, kNew: 160.32, kUsed: 224.28 },
      { maxHp: 400, kNew: 169.2, kUsed: 231 },
      { maxHp: 430, kNew: 178.44, kUsed: 237.96 },
      { maxHp: 460, kNew: 188.28, kUsed: 245.04 },
      { maxHp: 500, kNew: 198.6, kUsed: 252.48 },
      { maxHp: Infinity, kNew: 209.52, kUsed: 260.04 },
    ],
  },
  {
    maxVol: Infinity,
    tiers: [
      { maxHp: 160, kNew: 164.53, kUsed: 216.29 },
      { maxHp: 190, kNew: 167.28, kUsed: 219.48 },
      { maxHp: 220, kNew: 170.16, kUsed: 222.84 },
      { maxHp: 250, kNew: 173.04, kUsed: 226.2 },
      { maxHp: 280, kNew: 176.52, kUsed: 231.36 },
      { maxHp: 310, kNew: 180, kUsed: 236.64 },
      { maxHp: 340, kNew: 186.36, kUsed: 249.6 },
      { maxHp: 370, kNew: 192.88, kUsed: 263.4 },
      { maxHp: 400, kNew: 199.68, kUsed: 277.92 },
      { maxHp: 430, kNew: 206.64, kUsed: 293.16 },
      { maxHp: 460, kNew: 213.84, kUsed: 309.36 },
      { maxHp: 500, kNew: 221.28, kUsed: 326.4 },
      { maxHp: Infinity, kNew: 229.08, kUsed: 344.28 },
    ],
  },
];

export function utilSbFor(s: ImportScenario): { amount: number; formula: string } {
  if (s.subject === "individual") {
    const ok =
      s.fuel === "petrol" || s.fuel === "diesel" || s.fuel === "parallelHybrid"
        ? s.volumeCm3 <= 3000 && s.powerHp <= 160
        : s.powerHp <= 80;
    if (ok) {
      const amount = s.ageYears < 3 ? 3400 : 5200;
      return { amount, formula: `льгота физлица: ${amount.toLocaleString("ru-RU")} ₽ (до 3 лет — 3 400 ₽, старше — 5 200 ₽)` };
    }
  }
  const k = commercialUtk(s);
  const amount = Math.round(20000 * k);
  return { amount, formula: `коммерческая шкала: 20 000 ₽ × ${k}` };
}

export function commercialUtk(s: { fuel: ImportScenario["fuel"]; volumeCm3: number; powerHp: number; ageYears: number }): number {
  const used = s.ageYears >= 3;
  const pick = (tiers: UtilTier[]) => {
    const t = tiers.find((x) => s.powerHp <= x.maxHp) ?? tiers[tiers.length - 1];
    return used ? t.kUsed : t.kNew;
  };
  if (s.fuel === "electric" || s.fuel === "sequentialHybrid") return pick(UTIL_ELECTRIC);
  const group = UTIL_ICE.find((g) => s.volumeCm3 <= g.maxVol) ?? UTIL_ICE[UTIL_ICE.length - 1];
  return pick(group.tiers);
}
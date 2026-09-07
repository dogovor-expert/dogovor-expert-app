import { ndflTax } from "./fin";

/** Имущественные вычеты при продаже (ст. 220 НК РФ, ред. 2022–2026). */
export const CAR_DEDUCTION = 250_000; // иное имущество
export const REALTY_DEDUCTION = 1_000_000; // недвижимое имущество
export const FAMILY_DEDUCTION_PER_CHILD = 1_000_000; // семьи с 2+ детьми (п. 2.1 ст. 220 НК)

/** Минимальный срок владения, лет (ст. 217.1 НК РФ). */
export const FREE_SALE_YEARS = 3; // иное имущество
export const FREE_SALE_YEARS_REALTY = 5; // недвижимость (общее правило)

/** Категории продаваемого имущества. */
export type NdflAssetType = "other" | "realty";

export interface NdflSaleInput {
  sellPrice: number;
  buyPrice: number | null;
  yearsOwned: number;
  /** Тип имущества. По умолчанию `other` — обратная совместимость. */
  assetType?: NdflAssetType;
  /** Кол-во детей до 18 лет (или до 24 при очном обучении) — для льготы
   *  семей с 2+ детьми (п. 2.1 ст. 220 НК). Льгота применяется ТОЛЬКО при
   *  наличии ≥ 2 детей и не чаще раза в год на ребёнка. */
  childrenCount?: number;
  /** Кадастровая стоимость (с коэффициентом 0.7) — при продаже недвижимости,
   *  если она выше цены договора, берётся она (ст. 214.10 НК). */
  cadastralValue?: number | null;
}

export interface NdflSaleResult {
  exempt: boolean;
  /** Причина освобождения: срок владения / семья с 2+ детьми. */
  exemptReason?: "ownership_term" | "family_with_children";
  taxableBase: number;
  deductionUsed: number;
  deductionType: "fixed" | "expenses" | "family" | "none";
  /** Нормативный вычет, использованный как «потолок» (для отображения в UI). */
  fixedDeductionNorm: number;
  tax: number;
  rate: number;
  mustFile: boolean;
  notes?: string[];
}

/** Возвращает минимальный срок владения для освобождения от НДФЛ. */
function getMinYears(assetType: NdflAssetType | undefined): number {
  return assetType === "realty" ? FREE_SALE_YEARS_REALTY : FREE_SALE_YEARS;
}

/** Нормативный (фиксированный) вычет по ст. 220 НК. */
function getFixedDeduction(assetType: NdflAssetType | undefined): number {
  return assetType === "realty" ? REALTY_DEDUCTION : CAR_DEDUCTION;
}

export function ndflSaleCalc(input: NdflSaleInput): NdflSaleResult {
  const sell = Math.max(0, input.sellPrice);
  const owned = input.yearsOwned ?? 0;
  const assetType = input.assetType ?? "other";
  const minYears = getMinYears(assetType);
  const fixedNorm = getFixedDeduction(assetType);
  const notes: string[] = [];

  // 1) Льгота для семей с 2+ детьми (п. 2.1 ст. 220 НК): срок владения
  //    НЕ применяется; вычет — до 1 000 000 ₽ на каждого ребёнка
  //    (в пределах суммы продажи). Условие: ≤ 18 (или 24 при очном обучении).
  //    Применяется не чаще раза в календарный год на ребёнка.
  if ((input.childrenCount ?? 0) >= 2) {
    const familyDeduction = Math.min(sell, FAMILY_DEDUCTION_PER_CHILD * (input.childrenCount ?? 0));
    const base = Math.max(0, sell - familyDeduction);
    const r = ndflTax(base, 0);
    const rate = base > 0 ? Math.round((r.tax / base) * 10000) / 100 : 0;
    notes.push(`Льгота семьи с 2+ детьми: вычет ${familyDeduction.toLocaleString("ru-RU")} ₽ (п. 2.1 ст. 220 НК).`);
    return {
      exempt: false,
      taxableBase: base,
      deductionUsed: familyDeduction,
      deductionType: "family",
      fixedDeductionNorm: fixedNorm,
      tax: Math.round(r.tax),
      rate,
      mustFile: true,
      notes,
    };
  }

  // 2) Освобождение по сроку владения
  if (owned >= minYears) {
    return {
      exempt: true,
      exemptReason: "ownership_term",
      taxableBase: 0,
      deductionUsed: 0,
      deductionType: "none",
      fixedDeductionNorm: fixedNorm,
      tax: 0,
      rate: 0,
      mustFile: false,
    };
  }

  // 3) Определяем цену для расчёта: для недвижимости — max(договорная,
  //    кадастровая × 0.7) (ст. 214.10 НК).
  let effectiveSell = sell;
  if (assetType === "realty" && input.cadastralValue && input.cadastralValue > 0) {
    const cadastral = input.cadastralValue * 0.7;
    if (cadastral > effectiveSell) {
      effectiveSell = cadastral;
      notes.push("Цена договора ниже кадастровой × 0.7 — база считается по кадастровой (ст. 214.10 НК).");
    }
  }

  // 4) Вычет: фиксированный (нормативный) ИЛИ фактические расходы
  const hasExpenses = !!input.buyPrice && input.buyPrice > 0;
  const fixed = Math.min(effectiveSell, fixedNorm);
  const expenses = hasExpenses ? Math.min(effectiveSell, input.buyPrice!) : 0;
  const useExpenses = expenses > fixed && expenses > 0;
  const deduction = useExpenses ? expenses : fixed;
  const base = Math.max(0, effectiveSell - deduction);

  const r = ndflTax(base, 0);
  const rate = base > 0 ? Math.round((r.tax / base) * 10000) / 100 : 0;

  if (useExpenses) {
    notes.push("Применён вычет по фактическим расходам на приобретение.");
  } else {
    notes.push(`Применён нормативный вычет ${fixedNorm.toLocaleString("ru-RU")} ₽ (ст. 220 НК).`);
  }
  if (owned < minYears && !useExpenses) {
    notes.push(`Минимальный срок владения для освобождения: ${minYears} лет (ст. 217.1 НК).`);
  }

  return {
    exempt: false,
    taxableBase: base,
    deductionUsed: deduction,
    deductionType: useExpenses ? "expenses" : "fixed",
    fixedDeductionNorm: fixedNorm,
    tax: Math.round(r.tax),
    rate,
    mustFile: true,
    notes,
  };
}
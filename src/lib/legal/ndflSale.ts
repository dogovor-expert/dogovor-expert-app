import { ndflTax } from "./fin";

/** Имущественные вычеты при продаже (ст. 220 НК РФ, ред. 2022–2026). */
export const CAR_DEDUCTION = 250_000; // иное имущество
export const REALTY_DEDUCTION = 1_000_000; // недвижимое имущество

/** Освобождение семей с 2+ детьми (п. 2.1 ст. 217.1 НК РФ, ФЗ № 179-ФЗ):
 *  это НЕ вычет, а полное освобождение от НДФЛ при продаже ЖИЛЬЯ,
 *  независимо от срока владения, при одновременном соблюдении условий. */
/** Кадастровая стоимость проданного жилья для льготы — не более 50 млн ₽ (п. 2.1 ст. 217.1 НК). */
export const FAMILY_EXEMPTION_MAX_CADASTRAL = 50_000_000;

/** Минимальный срок владения, лет (ст. 217.1 НК РФ). */
export const FREE_SALE_YEARS = 3; // иное имущество
export const FREE_SALE_YEARS_REALTY = 5; // недвижимость (общее правило)
/** Основания снижения срока для недвижимости до 3 лет (п. 3 ст. 217.1 НК). */
export type RealtyThreeYearReason = "sole-home" | "inheritance-or-relative" | "privatization" | "rent";

/** Категории продаваемого имущества. */
export type NdflAssetType = "other" | "realty";

export interface NdflSaleInput {
  sellPrice: number;
  buyPrice: number | null;
  yearsOwned: number;
  /** Тип имущества. По умолчанию `other` — обратная совместимость. */
  assetType?: NdflAssetType;
  /** Кол-во детей до 18 лет (или до 24 при очном обучении) — для льготы
   *  семей с 2+ детьми (п. 2.1 ст. 217.1 НК). Применяется ТОЛЬКО к продаже жилья. */
  childrenCount?: number;
  /** Подтверждено, что в течение 4 мес. после продажи покупается жильё
   *  БОЛЬШЕЙ площади/кадастровой стоимости — обязательное условие льготы п. 2.1 ст. 217.1 НК. */
  familyBuyBiggerHome?: boolean;
  /** Кадастровая стоимость (с коэффициентом 0.7) — при продаже недвижимости,
   *  если она выше цены договора, берётся она (ст. 214.10 НК). */
  cadastralValue?: number | null;
  /** Основание для минимального срока 3 года вместо 5 для недвижимости (п. 3 ст. 217.1 НК). */
  realtyThreeYearReason?: RealtyThreeYearReason;
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
function getMinYears(input: NdflSaleInput): number {
  if (input.assetType === "realty") {
    return input.realtyThreeYearReason ? 3 : FREE_SALE_YEARS_REALTY;
  }
  return FREE_SALE_YEARS;
}

/** Нормативный (фиксированный) вычет по ст. 220 НК. */
function getFixedDeduction(assetType: NdflAssetType | undefined): number {
  return assetType === "realty" ? REALTY_DEDUCTION : CAR_DEDUCTION;
}

export function ndflSaleCalc(input: NdflSaleInput): NdflSaleResult {
  const sell = Math.max(0, input.sellPrice);
  const owned = input.yearsOwned ?? 0;
  const assetType = input.assetType ?? "other";
  const minYears = getMinYears(input);
  const fixedNorm = getFixedDeduction(assetType);
  const notes: string[] = [];
  const children = input.childrenCount ?? 0;

  // 1) Освобождение семей с 2+ детьми (п. 2.1 ст. 217.1 НК РФ, ФЗ № 179-ФЗ):
  //    полное освобождение (не вычет) при продаже ЖИЛЬЯ независимо от срока
  //    владения. Условия: 2+ детей (до 18 / до 24 очно / нетрудоспособные);
  //    покупка жилья БОЛЬШЕЙ площади (или кадастровой стоимости) в течение
  //    4 мес. после продажи; продаваемое жильё ≤ 50 млн ₽ кадастровой (или
  //    ≤ 400 м² без кадастровой); нет другого жилья больше продаваемого;
  //    не чаще одного раза в год. Без явного подтверждения условий
  //    освобождение НЕ применяется — показываем памятку.
  if (children >= 2 && assetType === "realty") {
    if (input.familyBuyBiggerHome) {
      notes.push(
        "Льгота п. 2.1 ст. 217.1 НК: освобождение от НДФЛ при продаже жилья семьёй с 2+ детьми — при одновременном соблюдении условий (покупка большего жилья в течение 4 мес., кадастровая стоимость проданного ≤ 50 млн ₽, отсутствие другого превышающего жилья, не чаще раза в год). Проверьте их перед подачей."
      );
      return {
        exempt: true,
        exemptReason: "family_with_children",
        taxableBase: 0,
        deductionUsed: 0,
        deductionType: "family",
        fixedDeductionNorm: fixedNorm,
        tax: 0,
        rate: 0,
        mustFile: false,
        notes,
      };
    }
    notes.push(
      "Семьям с 2+ детьми доступно полное освобождение от НДФЛ при продаже жилья (п. 2.1 ст. 217.1 НК) — если в течение 4 месяцев покупается жильё большей площади/стоимости. Отметьте это условие выше, чтобы применить льготу."
    );
  } else if (children >= 2) {
    notes.push(
      "Льгота п. 2.1 ст. 217.1 НК (семьи с 2+ детьми) применяется только к продаже жилья — на автомобиль и иное имущество не распространяется."
    );
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
    mustFile: base > 0,
    notes,
  };
}
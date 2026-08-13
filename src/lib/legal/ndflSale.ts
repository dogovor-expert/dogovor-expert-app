import { ndflTax } from "./fin";

export const CAR_DEDUCTION = 250_000;
export const FREE_SALE_YEARS = 3;

export interface NdflSaleInput {
  sellPrice: number;
  buyPrice: number | null;
  yearsOwned: number;
}

export interface NdflSaleResult {
  exempt: boolean;
  taxableBase: number;
  deductionUsed: number;
  deductionType: "fixed" | "expenses" | "none";
  tax: number;
  rate: number;
  mustFile: boolean;
}

export function ndflSaleCalc(input: NdflSaleInput): NdflSaleResult {
  const sell = Math.max(0, input.sellPrice);
  const owned = input.yearsOwned ?? 0;

  if (owned >= FREE_SALE_YEARS) {
    return { exempt: true, taxableBase: 0, deductionUsed: 0, deductionType: "none", tax: 0, rate: 0, mustFile: false };
  }

  const hasExpenses = !!input.buyPrice && input.buyPrice > 0;
  const fixed = Math.min(sell, CAR_DEDUCTION);
  const expenses = hasExpenses ? Math.min(sell, input.buyPrice!) : 0;

  const useExpenses = expenses > fixed && expenses > 0;
  const deduction = useExpenses ? expenses : fixed;
  const base = Math.max(0, sell - deduction);

  const r = ndflTax(base, 0);
  const rate = base > 0 ? Math.round(r.tax / base * 10000) / 100 : 0;

  return {
    exempt: false,
    taxableBase: base,
    deductionUsed: deduction,
    deductionType: useExpenses ? "expenses" : deduction > 0 ? "fixed" : "none",
    tax: Math.round(r.tax),
    rate,
    mustFile: true,
  };
}
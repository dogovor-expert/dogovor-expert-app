export type NdsMode = "add" | "split" | "fromNds";

export const NDS_RATES: { value: number; label: string; note: string }[] = [
  { value: 22, label: "22%", note: "Основная ставка с 2026" },
  { value: 10, label: "10%", note: "Продовольствие, детские товары" },
  { value: 7, label: "7%", note: "УСН, доход 250–450 млн ₽" },
  { value: 5, label: "5%", note: "УСН, доход 20–250 млн ₽" },
  { value: 0, label: "0%", note: "Экспорт, международные перевозки" },
];

export interface NdsResult {
  base: number;
  tax: number;
  total: number;
}

export function ndsCalc(amount: number, rate: number, mode: NdsMode): NdsResult | null {
  if (isNaN(amount) || amount < 0) return null;
  const r = rate / 100;
  if (mode === "add") {
    const tax = Math.round(amount * r * 100) / 100;
    return { base: Math.round(amount * 100) / 100, tax, total: Math.round((amount + tax) * 100) / 100 };
  }
  if (mode === "split") {
    const tax = Math.round((amount * r / (100 + rate)) * 100) / 100;
    return { base: Math.round((amount - tax) * 100) / 100, tax, total: amount };
  }
  const base = Math.round((amount * 100 / rate) * 100) / 100;
  return { base, tax: amount, total: Math.round((base + amount) * 100) / 100 };
}
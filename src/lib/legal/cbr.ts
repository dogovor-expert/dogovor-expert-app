/**
 * Парсер официального XML-фидов курса ЦБ РФ (cbr.ru/scripts/XML_daily.asp).
 * Используется route /api/customs-rate (аудит 3.3): таможня считает пошлину
 * по курсу ЦБ на день регистрации декларации (ст. 52 ТК ЕАЭС, Решение КТС № 376).
 */

export const CBR_CODES = ["USD", "EUR", "CNY", "KRW", "JPY"] as const;
export type CbrCode = (typeof CBR_CODES)[number];

export function toCbrDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export function parseCbrXml(xml: string): { rates: Partial<Record<CbrCode, number>>; date: string } {
  // Реальный формат: <ValCurs Date="12.09.2026" name="Foreign Currency Market">…
  const dateMatch = /<ValCurs[^>]*\bDate="([^"]+)"/i.exec(xml);
  const rates: Partial<Record<CbrCode, number>> = {};
  const re = /<Valute[^>]*>[\s\S]*?<CharCode>([A-Z]{3})<\/CharCode>[\s\S]*?<Nominal>(\d+)<\/Nominal>[\s\S]*?<Value>([\d,.]+)<\/Value>[\s\S]*?<\/Valute>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    const code = m[1];
    if (!CBR_CODES.includes(code as CbrCode)) continue;
    const nominal = Number(m[2]) || 1;
    const value = Number(m[3].replace(",", "."));
    if (Number.isFinite(value) && value > 0) {
      rates[code as CbrCode] = Math.round((value / nominal) * 1e4) / 1e4;
    }
  }
  return { rates, date: dateMatch?.[1] ?? "" };
}

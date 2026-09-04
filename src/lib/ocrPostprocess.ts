/**
 * Пост-обработка OCR-текста документов.
 *
 * Приёмы из мировых эталонов (mrz autocorrect, ocr-text-extract-lib):
 *  - char-confusion: замена визуально похожих символов ТОЛЬКО в
 *    контекстах, где допустим один класс символов (числа, даты, VIN).
 *  - контекстные валидаторы: дата — существующая, ИНН — 10/12 цифр
 *    с контрольным числом, серия/номер паспорта — фиксированные длины.
 */

export const CYR_TO_LAT_DIGIT: Record<string, string> = {
  О: "0", о: "0",
  З: "3", з: "3",
  Э: "3",
  Ч: "4",
  Б: "6",
  Л: "4",
  Т: "7",
  Г: "1",
  Ь: "4",
};

const DIGIT_MAP: Record<string, string> = {
  О: "0", о: "0", O: "0",
  З: "3", з: "3",
  Ч: "4",
  Б: "6", б: "6",
  Т: "7",
  Г: "1",
  I: "1", l: "1", "|": "1",
  S: "5", s: "5",
  B: "8",
  Z: "2", z: "2",
  G: "6",
  q: "9", Q: "9",
};

/** Оставляет только символы, которые могут быть цифрами, и приводит их к цифрам. */
export function toDigits(s: string): string {
  return s
    .split("")
    .map((ch) => DIGIT_MAP[ch] ?? (/\d/.test(ch) ? ch : ""))
    .join("");
}

/** Универсальная замена латинских омоглифов в кириллическом контексте. */
export const LATIN_TO_CYR_MAP: Record<string, string> = {
  A: "А", B: "В", C: "С", E: "Е", H: "Н", K: "К", M: "М",
  O: "О", P: "Р", T: "Т", U: "У", X: "Х", Y: "У",
  a: "а", b: "в", c: "с", e: "е", h: "н", k: "к", m: "м",
  o: "о", p: "р", t: "т", u: "у", x: "х", y: "у",
};

export const latinToCyrillic = (s: string): string =>
  s.split("").map((ch) => LATIN_TO_CYR_MAP[ch] ?? ch).join("");

/**
 * Нормализует дату к формату ДД.ММ.ГГГГ. Пытается исправить O→0 и
 * перепутанные разделители. Возвращает "" если дату спасти нельзя.
 */
export function normalizeDate(raw: string): string {
  if (!raw) return "";
  const digits = toDigits(raw.replace(/\s/g, ""));
  // ДДММГГГГ
  if (digits.length === 8) {
    const d = digits.slice(0, 2);
    const m = digits.slice(2, 4);
    const y = digits.slice(4, 8);
    if (isValidDayMonth(Number(d), Number(m)) && Number(y) >= 1900 && Number(y) <= 2100) {
      return `${d}.${m}.${y}`;
    }
    return "";
  }
  // ДДММГГ — восстанавливаем век
  if (digits.length === 6) {
    const d = digits.slice(0, 2);
    const m = digits.slice(2, 4);
    const yy = digits.slice(4, 6);
    if (isValidDayMonth(Number(d), Number(m))) {
      const year = Number(yy) > 30 ? `19${yy}` : `20${yy}`;
      return `${d}.${m}.${year}`;
    }
    return "";
  }
  return "";
}

function isValidDayMonth(d: number, m: number): boolean {
  return d >= 1 && d <= 31 && m >= 1 && m <= 12;
}

/** Валидация ИНН (10 или 12 цифр) по контрольным числам. */
export function isValidInn(inn: string): boolean {
  const d = toDigits(inn);
  if (d.length === 10) {
    const c = [2, 4, 10, 3, 5, 9, 4, 6, 8];
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += Number(d[i]) * c[i];
    const ctrl = (sum % 11) % 10;
    return ctrl === Number(d[9]);
  }
  if (d.length === 12) {
    const c1 = [7, 2, 4, 10, 3, 5, 9, 4, 6, 8];
    const c2 = [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8];
    let s1 = 0;
    for (let i = 0; i < 10; i++) s1 += Number(d[i]) * c1[i];
    const ctrl1 = (s1 % 11) % 10;
    let s2 = 0;
    for (let i = 0; i < 11; i++) s2 += Number(d[i]) * c2[i];
    const ctrl2 = (s2 % 11) % 10;
    return ctrl1 === Number(d[10]) && ctrl2 === Number(d[11]);
  }
  return false;
}

/** Нормализация серии и номера паспорта РФ: "45 10 123456" → series "4510", number "123456". */
export function parsePassportSeriesNumber(text: string): {
  series?: string;
  number?: string;
} {
  // Ожидаем 10 цифр рядом (с пробелами/разделителями): 2+2+6
  const m = text.match(/(\d[\dОоOЗзЧБЛТГIlsS\s]{8,20}?\d{5,6})/);
  if (!m) {
    // fallback: ищем любые 9-11 «цифроподобных» подряд
    const loose = text.match(/[0-9ОоOЗзЧБЛТГIl|]{9,12}/);
    if (!loose) return {};
    const digits = toDigits(loose[0]);
    if (digits.length === 10) {
      return { series: digits.slice(0, 4), number: digits.slice(4) };
    }
    if (digits.length === 9) {
      return { number: digits };
    }
    return {};
  }
  const digits = toDigits(m[1]);
  if (digits.length >= 10) {
    return { series: digits.slice(0, 4), number: digits.slice(4, 10) };
  }
  return {};
}

/** VIN: 17 символов, запрещены I, O, Q. */
export function normalizeVin(raw: string): string | null {
  const v = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (v.length !== 17) return null;
  if (/[IOQ]/.test(v)) {
    // Попытка исправить типичные подмены в VIN-контексте: 0→O нельзя,
    // наоборот O→0 можно (I/O/Q запрещены в VIN вообще).
    const fixed = v.replace(/O/g, "0").replace(/Q/g, "0").replace(/I/g, "1");
    if (/[IOQ]/.test(fixed)) return null;
    return fixed;
  }
  return v;
}

/**
 * Валидация VIN по ISO 3779: check digit (9-я позиция).
 * Алгоритм: каждому символу присваивается числовое значение,
 * умножается на вес, сумма берётся по модулю 11, результат
 * сравнивается с 9-й позицией (0-9 или X=10).
 */
const VIN_VALUES: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8,
  J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9,
  S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9,
};
const VIN_WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];

export function isValidVin(vin: string): boolean {
  const v = vin.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (v.length !== 17 || /[IOQ]/.test(v)) return false;

  let sum = 0;
  for (let i = 0; i < 17; i++) {
    const ch = v[i];
    const val = /\d/.test(ch) ? Number(ch) : VIN_VALUES[ch];
    if (val === undefined) return false;
    sum += val * VIN_WEIGHTS[i];
  }
  const check = sum % 11;
  const expected = check === 10 ? "X" : String(check);
  return v[8] === expected;
}

/**
 * Нормализация российского телефона: принимает разные форматы,
 * возвращает +7XXXXXXXXXX (11 цифр).
 * Возвращает null если невалидно.
 */
export function normalizePhone(raw: string): string | null {
  // Убираем всё кроме цифр и +.
  let d = raw.replace(/[^\d+]/g, "");
  // Формат с 8: 8XXXXXXXXXX → +7XXXXXXXXXX.
  if (d.startsWith("8") && d.length === 11) d = "+7" + d.slice(1);
  // Формат без кода: XXXXXXXXXX → +7XXXXXXXXXX.
  if (d.length === 10 && !d.startsWith("+")) d = "+7" + d;
  // Формат с +7: +7XXXXXXXXXX (12 символов с +).
  if (d.startsWith("+7") && d.length === 12) {
    const num = d.slice(2);
    // Проверяем что первая цифра — не 0 или 1 (коды регионов РФ: 3xx-9xx).
    if (num[0] >= "3" && num[0] <= "9") return d;
  }
  return null;
}

/** ГРЗ (госномер РФ): X000XX000 / X000XX00. */
export function normalizePlate(raw: string): string | null {
  const s = raw.toUpperCase().replace(/[^АВЕКМНОРСТУХAВEKMHOPCTYX0-9]/g, "");
  const m = s.match(/([АВЕКМНОРСТУХA]\d{3}[АВЕКМНОРСТУХA]{2}\d{2,3})/);
  return m ? m[1] : null;
}

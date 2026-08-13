// Перевод чисел в сумму прописью (рубли/копейки) по правилам русской орфографии.

const ONES = ["ноль", "один", "два", "три", "четыре", "пять", "шесть", "семь", "восемь", "девять",
  "десять", "одиннадцать", "двенадцать", "тринадцать", "четырнадцать", "пятнадцать",
  "шестнадцать", "семнадцать", "восемнадцать", "девятнадцать"];

const TENS = ["", "десять", "двадцать", "тридцать", "сорок", "пятьдесят", "шестьдесят",
  "семьдесят", "восемьдесят", "девяносто"];

const HUNDREDS = ["", "сто", "двести", "триста", "четыреста", "пятьсот", "шестьсот",
  "семьсот", "восемьсот", "девятьсот"];

/** Слово для числа < 100 с учётом рода (1/2 в женском роде: одна/две). */
function underHundred(n: number, fem: boolean): string {
  if (n === 0) return "";
  if (n < 20) {
    const w = ONES[n];
    if (fem && n === 1) return "одна";
    if (fem && n === 2) return "две";
    return w;
  }
  const d = Math.floor(n / 10);
  const u = n % 10;
  return u ? `${TENS[d]} ${underHundred(u, fem)}` : TENS[d];
}

/** Слово для числа < 1000 с учётом рода. */
function underThousand(n: number, fem: boolean): string {
  const h = Math.floor(n / 100);
  const rest = n % 100;
  const parts: string[] = [];
  if (h) parts.push(HUNDREDS[h]);
  if (rest) parts.push(underHundred(rest, fem));
  return parts.join(" ");
}

function pluralForm(n: number, decl: { singular: string; few: string; plural: string }): string {
  if (n % 100 >= 11 && n % 100 <= 19) return decl.plural;
  const last = n % 10;
  if (last === 1) return decl.singular;
  if (last >= 2 && last <= 4) return decl.few;
  return decl.plural;
}

const RUB = { singular: "рубль", few: "рубля", plural: "рублей" };
const KOP = { singular: "копейка", few: "копейки", plural: "копеек" };
const THOUS = { singular: "тысяча", few: "тысячи", plural: "тысяч" };
const MILL = { singular: "миллион", few: "миллиона", plural: "миллионов" };
const BILL = { singular: "миллиард", few: "миллиарда", plural: "миллиардов" };
const TRIL = { singular: "триллион", few: "триллиона", plural: "триллионов" };

/** Разбор денежной строки: «1 234 567,89», «1200000», «1200000.50». */
export function parseMoney(value: string): { rub: number; kop: number } | null {
  const cleaned = value.replace(/[^\d.,]/g, "").replace(/,/g, ".");
  if (!cleaned) return null;
  let normalized = cleaned;
  if ((normalized.match(/\./g) || []).length > 1) {
    normalized = normalized.replace(/\.(?=.*\.)/g, "");
  }
  const num = Number(normalized);
  if (!Number.isFinite(num) || num < 0) return null;
  const rub = Math.floor(num);
  const kop = Math.round((num - rub) * 100);
  return { rub, kop };
}

/** Целое число (< 1e15) прописью. */
export function numberToWords(n: number): string {
  if (n === 0) return ONES[0];
  const levels: { n: number; decl: typeof MILL; fem?: boolean }[] = [
    { n: 1e12, decl: TRIL },
    { n: 1e9, decl: BILL },
    { n: 1e6, decl: MILL },
    { n: 1000, decl: THOUS, fem: true },
  ];
  let rem = n;
  const parts: string[] = [];
  for (const { n: unit, decl, fem } of levels) {
    if (rem >= unit) {
      const count = Math.floor(rem / unit);
      const words = count >= 1000 ? numberToWords(count) : underThousand(count, !!fem);
      parts.push(`${words} ${pluralForm(count, decl)}`);
      rem %= unit;
    }
  }
  if (rem > 0) {
    const words = underThousand(rem, false);
    if (words) parts.push(words);
  }
  return parts.join(" ");
}

/** «1 234 567,89» → «один миллион … рублей 89 копеек». null для пустого/битого ввода. */
export function rublesToWords(value: string): string | null {
  const parsed = parseMoney(value);
  if (!parsed) return null;
  const rubWords = parsed.rub === 0 ? "ноль" : numberToWords(parsed.rub);
  const kopStr = String(parsed.kop).padStart(2, "0");
  return `${rubWords} ${pluralForm(parsed.rub, RUB)} ${kopStr} ${pluralForm(parsed.kop, KOP)}`;
}
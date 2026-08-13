const UNITS: [string, string, string][] = [
  ["", "", ""],
  ["один", "одна", "одно"],
  ["два", "две", "два"],
  ["три", "три", "три"],
  ["четыре", "четыре", "четыре"],
  ["пять", "пять", "пять"],
  ["шесть", "шесть", "шесть"],
  ["семь", "семь", "семь"],
  ["восемь", "восемь", "восемь"],
  ["девять", "девять", "девять"],
  ["десять", "десять", "десять"],
  ["одиннадцать", "одиннадцать", "одиннадцать"],
  ["двенадцать", "двенадцать", "двенадцать"],
  ["тринадцать", "тринадцать", "тринадцать"],
  ["четырнадцать", "четырнадцать", "четырнадцать"],
  ["пятнадцать", "пятнадцать", "пятнадцать"],
  ["шестнадцать", "шестнадцать", "шестнадцать"],
  ["семнадцать", "семнадцать", "семнадцать"],
  ["восемнадцать", "восемнадцать", "восемнадцать"],
  ["девятнадцать", "девятнадцать", "девятнадцать"],
];

const TENS = ["", "", "двадцать", "тридцать", "сорок", "пятьдесят", "шестьдесят", "семьдесят", "восемьдесят", "девяносто"];

const HUNDREDS = ["", "сто", "двести", "триста", "четыреста", "пятьсот", "шестьсот", "семьсот", "восемьсот", "девятьсот"];

const THOUSAND_FORMS = ["тысяча", "тысячи", "тысяч"] as const;
const MILLION_FORMS = ["миллион", "миллиона", "миллионов"] as const;
const BILLION_FORMS = ["миллиард", "миллиарда", "миллиардов"] as const;
const RUB_FORMS = ["рубль", "рубля", "рублей"] as const;
const KOP_FORMS = ["копейка", "копейки", "копеек"] as const;

function pluralForm(n: number, forms: readonly [string, string, string]): string {
  const n10 = n % 10;
  const n100 = n % 100;
  if (n10 === 1 && n100 !== 11) return forms[0];
  if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return forms[1];
  return forms[2];
}

function triadWords(n: number, gender: 0 | 1 | 2): string {
  if (n === 0) return "";
  const parts: string[] = [];
  const h = Math.floor(n / 100);
  const rem = n % 100;
  const t = Math.floor(rem / 10);
  const u = rem % 10;
  if (h) parts.push(HUNDREDS[h]);
  if (t >= 2) {
    parts.push(TENS[t]);
    if (u) parts.push(UNITS[u][gender]);
  } else if (rem >= 1) {
    parts.push(UNITS[rem][gender]);
  }
  return parts.join(" ");
}

function splitTriads(n: number): [number, number, number, number] {
  const b = Math.floor(n / 1_000_000_000);
  n %= 1_000_000_000;
  const m = Math.floor(n / 1_000_000);
  n %= 1_000_000;
  const t = Math.floor(n / 1000);
  n %= 1000;
  return [b, m, t, n];
}

/** Сумма прописью: «сто двадцать три тысячи рублей 45 копеек». */
export function rublesInWords(amount: number): string {
  const rub = Math.floor(amount);
  const kop = Math.round((amount - rub) * 100);
  const [b, m, t, u] = splitTriads(rub);
  const parts: string[] = [];

  if (b) parts.push(`${triadWords(b, 0)} ${pluralForm(b, BILLION_FORMS)}`);
  if (m) parts.push(`${triadWords(m, 0)} ${pluralForm(m, MILLION_FORMS)}`);
  if (t) parts.push(`${triadWords(t, 1)} ${pluralForm(t, THOUSAND_FORMS)}`);
  const rubPart = u ? `${triadWords(u, 0)} ${pluralForm(rub, RUB_FORMS)}` : parts.length ? pluralForm(rub, RUB_FORMS) : `ноль ${pluralForm(rub, RUB_FORMS)}`;
  parts.push(rubPart);
  const kopStr = kop.toString().padStart(2, "0");
  return `${parts.join(" ")} ${kopStr} ${pluralForm(kop, KOP_FORMS)}`.replace(/\s+/g, " ");
}

/** Только рубли прописью (для договоров): «сто двадцать три тысячи рублей». */
export function rublesInWordsPart(amount: number): string {
  const rub = Math.floor(amount);
  const [b, m, t, u] = splitTriads(rub);
  const parts: string[] = [];
  if (b) parts.push(`${triadWords(b, 0)} ${pluralForm(b, BILLION_FORMS)}`);
  if (m) parts.push(`${triadWords(m, 0)} ${pluralForm(m, MILLION_FORMS)}`);
  if (t) parts.push(`${triadWords(t, 1)} ${pluralForm(t, THOUSAND_FORMS)}`);
  const rubPart = u ? `${triadWords(u, 0)} ${pluralForm(rub, RUB_FORMS)}` : parts.length ? pluralForm(rub, RUB_FORMS) : `ноль ${pluralForm(rub, RUB_FORMS)}`;
  parts.push(rubPart);
  return parts.join(" ").replace(/\s+/g, " ");
}
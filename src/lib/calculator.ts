export interface CostItem {
  label: string;
  amount: number;
  note?: string;
  type: "fixed" | "variable" | "total";
  pending?: boolean;
}

export interface CalculationResult {
  items: CostItem[];
  total: number;
}

const REGISTRATION_FEE = 2850;

export function calculateCosts(
  price: number,
  ownershipYears?: number
): CalculationResult {
  const items: CostItem[] = [];

  items.push({
    label: "Госпошлина за регистрацию ТС",
    amount: REGISTRATION_FEE,
    note: "Фиксированная ставка",
    type: "fixed",
  });

  let tax = 0;
  if (ownershipYears !== undefined && ownershipYears < 3) {
    const taxable = Math.max(0, price - 250000);
    tax = Math.round(taxable * 0.13);
    items.push({
      label: "Налог с продажи (НДФЛ)",
      amount: tax,
      note: `${ownershipYears} ${ownershipYears === 1 ? "год" : "года"} владения — облагается`,
      type: "variable",
    });
  } else {
    items.push({
      label: "Налог с продажи (НДФЛ)",
      amount: 0,
      note: ownershipYears !== undefined
        ? `${ownershipYears} лет владения — не облагается`
        : "Уточните срок владения",
      type: "variable",
      pending: ownershipYears === undefined,
    });
  }

  const total = REGISTRATION_FEE + tax;

  items.push({
    label: "Итого",
    amount: total,
    type: "total",
  });

  return { items, total };
}

export function numberToWords(n: number): string {
  n = Math.floor(Math.abs(n));
  if (n === 0) return "Ноль рублей";

  const ones = [
    "", "один", "два", "три", "четыре", "пять", "шесть", "семь", "восемь", "девять",
    "десять", "одиннадцать", "двенадцать", "тринадцать", "четырнадцать", "пятнадцать",
    "шестнадцать", "семнадцать", "восемнадцать", "девятнадцать",
  ];
  const onesF = [
    "", "одна", "две", "три", "четыре", "пять", "шесть", "семь", "восемь", "девять",
    "десять", "одиннадцать", "двенадцать", "тринадцать", "четырнадцать", "пятнадцать",
    "шестнадцать", "семнадцать", "восемнадцать", "девятнадцать",
  ];
  const tens = [
    "", "", "двадцать", "тридцать", "сорок", "пятьдесят",
    "шестьдесят", "семьдесят", "восемьдесят", "девяносто",
  ];
  const hundreds = [
    "", "сто", "двести", "триста", "четыреста", "пятьсот",
    "шестьсот", "семьсот", "восемьсот", "девятьсот",
  ];

  const threeDigits = (num: number, female = false): string => {
    if (num === 0) return "";
    const list = female ? onesF : ones;
    const h = Math.floor(num / 100);
    const rest = num % 100;
    const tail = rest < 20 ? list[rest] : tens[Math.floor(rest / 10)] + " " + list[rest % 10];
    return (h > 0 ? hundreds[h] + " " : "") + tail;
  };

  const plural = (count: number, forms: [string, string, string]): string => {
    const c = count % 100;
    if (c >= 11 && c <= 19) return forms[2];
    const u = c % 10;
    if (u === 1) return forms[0];
    if (u >= 2 && u <= 4) return forms[1];
    return forms[2];
  };

  const parts: string[] = [];
  const flat = (s: string) => s.trim().replace(/\s{2,}/g, " ");

  const billions = Math.floor(n / 1e9);
  const millions = Math.floor((n % 1e9) / 1e6);
  const thousands = Math.floor((n % 1e6) / 1000);
  const remainder = n % 1000;

  if (billions > 0) {
    parts.push(flat(threeDigits(billions)) + " " + plural(billions, ["миллиард", "миллиарда", "миллиардов"]));
  }
  if (millions > 0) {
    parts.push(flat(threeDigits(millions)) + " " + plural(millions, ["миллион", "миллиона", "миллионов"]));
  }
  if (thousands > 0) {
    parts.push(flat(threeDigits(thousands, true)) + " " + plural(thousands, ["тысяча", "тысячи", "тысяч"]));
  }
  if (remainder > 0) {
    parts.push(flat(threeDigits(remainder)));
  }

  return flat(parts.join(" ")) + " " + plural(n, ["рубль", "рубля", "рублей"]);
}

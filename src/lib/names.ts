// Склонение ФИО в родительный и творительный падежи.
// Правила — по классификации склонения русских фамилий (письмовник Грамоты.ру):
//   - мужские на -ов/-ев/-ёв/-ин/-ын склоняются как притяжательные прилагательные;
//   - фамилии на согласную склоняются как существительные 2-го склонения;
//   - женские на согласную, фамилии на -о/-е/-и/-у не склоняются;
//   - именные части — по окончаниям имён/отчеств.

export type CaseForm = "gen" | "ins";

const IRREGULAR_NAMES_R: Record<string, string> = {
  Пётр: "Петра",
  Петр: "Петра",
  Павел: "Павла",
  Лев: "Льва",
  Ким: "Кима",
};
const IRREGULAR_NAMES_T: Record<string, string> = {
  Пётр: "Петром",
  Петр: "Петром",
  Павел: "Павлом",
  Лев: "Львом",
};

function declineSurname(word: string, caseForm: CaseForm, male: boolean): string {
  if (word.length <= 2) return word;
  const last2 = word.slice(-2).toLowerCase();
  const last1 = word.slice(-1).toLowerCase();

  // Несклоняемые: -о/-е/-и/-у/-ю, -ых/-их, гласная -а/-я в женском роде уже склоняется.
  if ("оуиюе".includes(last1) || last2 === "ых" || last2 === "их") return word;

  // Женские фамилии на согласную и -ь не склоняются.
  if (!male && "бвгджзклмнпрстфхцчшщь".includes(last1)) return word;

  if (!male) {
    // Иванова → Ивановой (РП), Ивановой (ТП)
    if (/[ая]$/.test(word)) {
      return caseForm === "gen" ? word.slice(0, -1) + "ой" : word.slice(0, -1) + "ой";
    }
    return word;
  }

  const base = word.slice(0, -2);
  if (caseForm === "gen") {
    if (last2 === "ов" || last2 === "ев" || last2 === "ёв" || last2 === "ин" || last2 === "ын") {
      return word + "а";
    }
    if (last2 === "ий" || last2 === "ый" || last2 === "ой") {
      return word.slice(0, -2) + "ого";
    }
    if (last1 === "й") return word.slice(0, -1) + "я";
    if (last1 === "ь") return word.slice(0, -1) + "я";
    if (last1 === "а" || last1 === "я") {
      return word.slice(0, -1) + (last1 === "а" ? "ы" : "и");
    }
    return word + "а";
  }

  if (last2 === "ов" || last2 === "ев" || last2 === "ёв" || last2 === "ин" || last2 === "ын") {
    return word + "ым";
  }
  if (last2 === "ый" || last2 === "ий") return word.slice(0, -2) + "ым";
  if (last2 === "ой") return word.slice(0, -2) + "ым";
  if (last1 === "й") return word.slice(0, -1) + "ем";
  if (last1 === "ь") return word.slice(0, -1) + "ем";
  if (last1 === "а" || last1 === "я") {
    return word.slice(0, -1) + (last1 === "а" ? "ой" : "ей");
  }
  return word + "ом";
}

function declineGivenName(word: string, caseForm: CaseForm, male: boolean): string {
  if (word.length <= 2) return word;
  const last1 = word.slice(-1).toLowerCase();

  if (male) {
    if (IRREGULAR_NAMES_R[word] && caseForm === "gen") return IRREGULAR_NAMES_R[word];
    if (IRREGULAR_NAMES_T[word] && caseForm === "ins") return IRREGULAR_NAMES_T[word];
    if (last1 === "й") {
      return word.slice(0, -1) + (caseForm === "gen" ? "я" : "ем");
    }
    if (last1 === "ь") {
      return word.slice(0, -1) + (caseForm === "gen" ? "я" : "ем");
    }
    if (last1 === "а") {
      return word.slice(0, -1) + (caseForm === "gen" ? "ы" : "ой");
    }
    return word + (caseForm === "gen" ? "а" : "ом");
  }

  if (last1 === "а") {
    if (word.endsWith("ия") || word.endsWith("ея")) {
      return caseForm === "gen" ? word.slice(0, -2) + "ии" : word.slice(0, -2) + "ией";
    }
    const prev = word.charAt(word.length - 2);
    const hard = "гкхжшчщц".includes(prev);
    return word.slice(0, -1) + (caseForm === "gen" ? (hard ? "и" : "ы") : "ой");
  }
  if (last1 === "я") {
    if (word.endsWith("ия")) {
      return caseForm === "gen" ? word.slice(0, -2) + "ии" : word.slice(0, -2) + "ией";
    }
    return word.slice(0, -1) + (caseForm === "gen" ? "и" : "ей");
  }
  if (last1 === "ь") {
    return word.slice(0, -1) + (caseForm === "gen" ? "и" : "ью");
  }
  return word;
}

function declinePatronymic(word: string, caseForm: CaseForm, male: boolean): string {
  if (word.length <= 3) return word;
  const lower = word.toLowerCase();

  if (male && (lower.endsWith("ович") || lower.endsWith("евич") || lower.endsWith("ич"))) {
    return word + (caseForm === "gen" ? "а" : "ем");
  }
  if (!male) {
    const ending = lower.endsWith("овна") ? "овна" : lower.endsWith("евна") ? "евна" : lower.endsWith("инична") ? "инична" : lower.endsWith("ична") ? "ична" : null;
    if (ending) {
      const stem = word.slice(0, -ending.length);
      const suffix = ending.slice(0, -1);
      return stem + suffix + (caseForm === "gen" ? "ы" : "ой");
    }
  }
  return word;
}

/** Преобразует «Иванов Иван Иванович» / «Смирнова Ольга Андреевна» в нужный падеж. */
export function declineFullName(fio: string, caseForm: CaseForm): string {
  const parts = fio.trim().split(/\s+/);
  if (parts.length < 2 || parts.length > 3) return fio;

  const hasPatronymic = parts.length === 3;
  const male = hasPatronymic
    ? /вич$/i.test(parts[2])
    : !/[аяё]$/.test(parts[0]);

  const out = parts.map((w, i) => {
    if (i === 0) return declineSurname(w, caseForm, male);
    if (i === 1) return declineGivenName(w, caseForm, male);
    return declinePatronymic(w, caseForm, male);
  });
  return out.join(" ");
}

/** Проверка: похоже ли значение на ФИО (2–3 слова кириллицей с заглавной буквы). */
export function looksLikeFullName(value: string): boolean {
  const parts = value.trim().split(/\s+/);
  if (parts.length < 2 || parts.length > 3) return false;
  return parts.every((w) => /^[А-ЯЁ][а-яё-]+$/.test(w));
}
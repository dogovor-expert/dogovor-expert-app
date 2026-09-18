export interface FioCases {
  nom: string;
  gen: string;
  dat: string;
  acc: string;
  ins: string;
  pre: string;
}

const CASES = ["gen", "dat", "acc", "ins", "pre"] as const;

function isFemale(patronymic: string, first?: string): boolean {
  const p = patronymic.toLowerCase();
  if (p.endsWith("вна") || p.endsWith("чна") || p.endsWith("ишна")) return true;
  if (first) {
    const f = first.toLowerCase();
    return (f.endsWith("а") || f.endsWith("я")) && !f.endsWith("но") && !f.endsWith("ю");
  }
  return false;
}

function declineName(word: string, female: boolean): string[] {
  if (!word) return ["", "", "", "", "", ""];
  const last = word[word.length - 1];
  const lower = word.toLowerCase();
  if (last === "й") {
    const base = word.slice(0, -1);
    return [word, base + "я", base + "ю", base + "я", base + "ем", base + "е"];
  }
  if (last === "а" || last === "я") {
    if (lower.endsWith("ия") && female) {
      const b = word.slice(0, -2);
      return [word, b + "ии", b + "ии", word, b + "ией", b + "ии"];
    }
    const base = word.slice(0, -1);
    if (last === "а") {
      const prev = word.charAt(word.length - 2);
      const hard = "гкхжшчщц".includes(prev);
      return [word, base + (hard ? "и" : "ы"), base + "е", base + "у", base + "ой", base + "е"];
    }
    return [word, base + "и", base + "е", base + "ю", base + "ей", base + "е"];
  }
  if (last === "ь") {
    const base = word.slice(0, -1);
    if (female) return [word, base + "и", base + "и", base + "ь", base + "ью", base + "и"];
    return [word, base + "я", base + "ю", base + "я", base + "ем", base + "е"];
  }
  if (last === "о" || last === "е" || last === "и" || last === "у") {
    return [word, word, word, word, word, word];
  }
  const base = word;
  return [word, base + "а", base + "у", base + "а", base + "ом", base + "е"];
}

function declinePatronymic(word: string, _female: boolean): string[] {
  if (!word) return ["", "", "", "", "", ""];
  const last = word[word.length - 1];
  if (last === "а" || last === "я") {
    const base = word.slice(0, -1);
    if (last === "а") return [word, base + "ы", base + "е", base + "у", base + "ой", base + "е"];
    return [word, base + "и", base + "е", base + "ю", base + "ей", base + "е"];
  }
  const base = word;
  return [word, base + "а", base + "у", base + "а", base + "ем", base + "е"];
}

function declineSurname(word: string, female: boolean): string[] {
  if (!word) return ["", "", "", "", "", ""];
  const last = word[word.length - 1];
  const lower = word.toLowerCase();

  if (lower.endsWith("ево") || lower.endsWith("ово") || lower.endsWith("аго") || lower.endsWith("ых") || lower.endsWith("их") || lower.endsWith("ю")) {
    return [word, word, word, word, word, word];
  }

  if (female) {
    if (lower.endsWith("ова") || lower.endsWith("ева") || lower.endsWith("ёва")) {
      const b = word.slice(0, -1);
      return [word, b + "ой", b + "ой", b + "у", b + "ой", b + "ой"];
    }
    if (lower.endsWith("ина") || lower.endsWith("ына")) {
      const b = word.slice(0, -1);
      return [word, b + "ой", b + "ой", b + "у", b + "ой", b + "ой"];
    }
    if (lower.endsWith("ская") || lower.endsWith("цкая")) {
      const b = word.slice(0, -2);
      return [word, b + "ой", b + "ой", b + "ую", b + "ой", b + "ой"];
    }
    if (lower.endsWith("ая") || lower.endsWith("яя")) {
      const b = word.slice(0, -2);
      return [word, b + "ой", b + "ой", b + "ую", b + "ой", b + "ой"];
    }
    if (last === "а" || last === "я") {
      const b = word.slice(0, -1);
      if (last === "а") return [word, b + "ы", b + "е", b + "у", b + "ой", b + "е"];
      return [word, b + "и", b + "е", b + "ю", b + "ей", b + "е"];
    }
    return [word, word, word, word, word, word];
  }

  if (last === "й" && (lower.endsWith("ый") || lower.endsWith("ой") || lower.endsWith("ий"))) {
    const base = word.slice(0, -1);
    const end = lower.endsWith("ий") ? "его" : "ого";
    return [word, base + end, base + (end === "его" ? "ему" : "ому"), base + end, base + (end === "его" ? "им" : "ым"), base + (end === "его" ? "ем" : "ом")];
  }
  if (last === "а" || last === "я") {
    const base = word.slice(0, -1);
    if (last === "а") return [word, base + "ы", base + "е", base + "у", base + "ой", base + "е"];
    return [word, base + "и", base + "е", base + "ю", base + "ей", base + "е"];
  }
  if (lower.endsWith("ин") || lower.endsWith("ын")) {
    const base = word.slice(0, -2);
    return [base + "ин", base + "ина", base + "ину", base + "ина", base + "иным", base + "ине"];
  }
  if (lower.endsWith("ов") || lower.endsWith("ев")) {
    const base = word.slice(0, -2);
    return [base + "ов", base + "ова", base + "ову", base + "ова", base + "овым", base + "ове"];
  }
  if (last === "ь") {
    const base = word.slice(0, -1);
    return [word, base + "я", base + "ю", base + "я", base + "ем", base + "е"];
  }
  if (last === "г" || last === "к" || last === "х" || last === "ш" || last === "щ" || last === "ч" || last === "ц") {
    return [word, word + "а", word + "у", word + "а", word + "ом", word + "е"];
  }
  if (last === "л" || last === "м" || last === "н" || last === "р" || last === "т" || last === "з" || last === "с" || last === "б" || last === "в") {
    const base = word.slice(0, -1);
    return [word, base + "а", base + "у", base + "а", base + "ом", base + "е"];
  }
  return [word, word, word, word, word, word];
}

function splitFio(fio: string): { surname: string; given: string; patronymic: string } {
  const parts = fio.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 3) return { surname: parts[0], given: parts[1], patronymic: parts[2] };
  if (parts.length === 2) return { surname: parts[0], given: parts[1], patronymic: "" };
  return { surname: parts[0] || "", given: "", patronymic: "" };
}

function detectFemale(patronymic: string, given?: string): boolean {
  return isFemale(patronymic, given);
}

export function declineFullFio(fio: string): FioCases {
  const { surname, given, patronymic } = splitFio(fio);
  const female = detectFemale(patronymic, given);
  const surnameForms = declineSurname(surname, female);
  const nameForms = declineName(given, female);
  const patronymicForms = declinePatronymic(patronymic, female);

  const make = (idx: number) =>
    [surnameForms[idx] || surname, nameForms[idx] || given, patronymicForms[idx] || patronymic]
      .join(" ")
      .trim();

  const result = { nom: fio.trim() } as Partial<FioCases>;
  CASES.forEach((c, i) => {
    result[c] = make(i + 1) || fio.trim();
  });
  return result as FioCases;
}
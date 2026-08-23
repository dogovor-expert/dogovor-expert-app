export interface Scored<T> {
  item: T;
  score: number;
}

const RU_TO_LAT: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z",
  и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
  с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh",
  щ: "shch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

const LAT_TO_RU: Record<string, string> = {
  a: "а", b: "б", c: "к", d: "д", e: "е", f: "ф", g: "г", h: "х",
  i: "и", j: "дж", k: "к", l: "л", m: "м", n: "н", o: "о", p: "п",
  q: "к", r: "р", s: "с", t: "т", u: "у", v: "в", w: "в", x: "кс",
  y: "у", z: "з",
};

const SYNONYM_GROUPS: Record<string, string[]> = {
  дкп: ["дкп", "договор", "купли", "продажи", "купля", "продажа"],
  купля: ["купля", "купли", "продажа", "продажи", "договор"],
  продажа: ["продажа", "продажи", "купля", "купли", "договор"],
  аренда: ["аренда", "аренды", "найм", "найма", "арендовать"],
  найм: ["найм", "найма", "аренда", "аренды"],
  дарение: ["дарение", "дарения", "дарственная"],
  дарственная: ["дарственная", "дарение", "дарения"],
  займ: ["займ", "займа", "заем", "займа"],
  заем: ["заем", "займа", "займ", "займа"],
  расписка: ["расписка", "расписки", "долг", "деньги"],
  доверенность: ["доверенность", "доверенности"],
  осаго: ["осаго", "страховка", "страховой", "страхование", "полис"],
  страховка: ["страховка", "страховой", "страхование", "осаго"],
  дду: ["дду", "долевое", "участие", "дольщик"],
  ипотека: ["ипотека", "кредит", "залог"],
  завещание: ["завещание", "наследство", "наследник", "наследование"],
  увольнение: ["увольнение", "трудовой", "работодатель", "работник"],
  иск: ["иск", "исковое", "суд", "жалоба"],
  претензия: ["претензия", "жалоба", "возврат"],
  рвп: ["рвп", "разрешение", "временное", "проживание"],
  внж: ["внж", "вид", "жительство"],
  патент: ["патент", "трудовой", "миграция", "мигрант"],
  посылка: ["посылка", "почта", "отправление"],
  залог: ["залог", "залога", "ипотека", "кредит"],
  подряд: ["подряд", "подряда", "выполнение", "работ"],
  оказание: ["оказание", "услуги", "услуг", "услуга"],
  услуги: ["услуги", "услуг", "услуга", "оказание"],
  поставка: ["поставка", "поставки", "товар", "товара"],
  брачный: ["брачный", "брак", "раздел", "супругов"],
  алименты: ["алименты", "ребенок", "ребенка", "дети", "содержание"],
  найма: ["найма", "найм", "аренда", "аренды"],
  ссуда: ["ссуда", "безвозмездное", "пользование"],
};

export function translitRuToLat(input: string): string {
  let out = "";
  for (const ch of input.toLowerCase()) {
    out += RU_TO_LAT[ch] ?? ch;
  }
  return out;
}

export function translitLatToRu(input: string): string {
  let out = "";
  const lower = input.toLowerCase();
  let i = 0;
  while (i < lower.length) {
    const two = lower.slice(i, i + 2);
    if (two === "zh") { out += "ж"; i += 2; continue; }
    if (two === "kh") { out += "х"; i += 2; continue; }
    if (two === "ts") { out += "ц"; i += 2; continue; }
    if (two === "ch") { out += "ч"; i += 2; continue; }
    if (two === "sh") { out += "ш"; i += 2; continue; }
    if (two === "ya") { out += "я"; i += 2; continue; }
    if (two === "yu") { out += "ю"; i += 2; continue; }
    const one = LAT_TO_RU[lower[i]];
    out += one ?? lower[i];
    i += 1;
  }
  return out;
}

export function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[-\u2010-\u2015–—()«»"',.]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeToken(token: string): string {
  const norm = normalizeText(token);
  if (!norm) return "";
  const hasCyrillic = /[а-я]/.test(norm);
  return hasCyrillic ? norm : translitLatToRu(norm);
}

export function tokenizeQuery(query: string): string[] {
  const norm = normalizeText(query);
  if (!norm) return [];
  const tokens = norm.split(" ").map(normalizeToken).filter(Boolean);
  const expanded = new Set<string>();
  for (const t of tokens) {
    expanded.add(t);
    const group = SYNONYM_GROUPS[t];
    if (group) for (const g of group) expanded.add(normalizeToken(g));
  }
  return [...expanded];
}

export function tokenGroups(query: string): string[][] {
  const norm = normalizeText(query);
  if (!norm) return [];
  const groups: string[][] = [];
  for (const raw of norm.split(" ")) {
    const t = normalizeToken(raw);
    if (!t) continue;
    const group = SYNONYM_GROUPS[t] ?? [t];
    groups.push([...new Set(group.map(normalizeToken).filter(Boolean))]);
  }
  return groups;
}

function wordsMatch(a: string, b: string): boolean {
  if (a === b) return true;
  const la = translitRuToLat(a);
  const lb = translitRuToLat(b);
  if (la === lb) return true;
  if (la && lb && Math.min(la.length, lb.length) >= 3 && (la.includes(lb) || lb.includes(la))) return true;
  const short = a.length <= b.length ? a : b;
  const long = a.length <= b.length ? b : a;
  if (short.length >= 3 && long.startsWith(short)) return true;
  if (short.length >= 4 && long.includes(short)) return true;
  if (a.length >= 4 && b.length >= 4) {
    const minLen = Math.min(a.length, b.length);
    if (a.slice(0, minLen - 1) === b.slice(0, minLen - 1)) return true;
  }
  return false;
}

function textWords(text: string): string[] {
  const norm = normalizeText(text);
  return [
    ...new Set(
      [norm, translitRuToLat(norm)]
        .flatMap((v) => v.split(" ").filter(Boolean))
    ),
  ];
}

function groupMatched(g: string[], words: string[]): boolean {
  let count = 0;
  for (const t of g) {
    if (words.some((w) => wordsMatch(w, t))) count += 1;
  }
  if (count >= 2) return true;
  if (count === 1) return g[0] ? words.some((w) => wordsMatch(w, g[0])) : false;
  return false;
}

export function textMatchesTokens(text: string, groups: string[][]): boolean {
  if (groups.length === 0) return true;
  const words = textWords(text);
  return groups.every((g) => groupMatched(g, words));
}

export function scoreText(text: string, groups: string[][], exactPenalty = 0): number {
  if (groups.length === 0) return 0;
  const words = textWords(text);
  const norm = normalizeText(text);
  const queryNorm = normalizeText(groups.map((g) => g[0]).join(" "));
  if (queryNorm && norm === queryNorm) return 100 - exactPenalty;
  if (queryNorm && norm.startsWith(queryNorm)) return 90 - exactPenalty;
  let hit = 0;
  let partial = 0;
  let posPenalty = 0;
  for (const g of groups) {
    let idx = -1;
    const matched = groupMatched(g, words);
    if (matched) {
      hit += 1;
      for (const t of g) {
        const foundIdx = words.findIndex((w) => wordsMatch(w, t));
        if (foundIdx !== -1) {
          idx = foundIdx;
          break;
        }
      }
      posPenalty += Math.min(idx * 5, 20);
    } else if (g[0].length >= 3 && words.some((w) => w.startsWith(g[0].slice(0, 3)))) {
      partial += 0.5;
    }
  }
  const ratio = (hit + partial) / groups.length;
  return Math.max(Math.round(ratio * 70) - posPenalty, 0) - exactPenalty;
}

export function searchInText(text: string, query: string): number {
  return scoreText(text, tokenGroups(query));
}

export interface HighlightSegment {
  text: string;
  hit: boolean;
}

export function highlightSegments(text: string, query: string): HighlightSegment[] {
  const tokens = tokenizeQuery(query);
  if (tokens.length === 0) return [{ text, hit: false }];
  const norm = normalizeText(text);
  const segments: HighlightSegment[] = [];
  let pos = 0;
  const matches: { start: number; end: number }[] = [];
  const normWords = norm.split(" ").filter(Boolean);
  for (const t of tokens) {
    if (t.length === 0) continue;
    let idx = norm.indexOf(t);
    if (idx !== -1) {
      while (idx !== -1) {
        matches.push({ start: idx, end: idx + t.length });
        idx = norm.indexOf(t, idx + 1);
      }
      continue;
    }
    const lt = translitRuToLat(t);
    if (!lt || lt.length < 3) continue;
    for (const w of normWords) {
      const lw = translitRuToLat(w);
      if (lw.includes(lt) || (lw.length >= 3 && lt.includes(lw))) {
        const start = norm.indexOf(w);
        matches.push({ start, end: start + w.length });
        break;
      }
    }
  }
  matches.sort((a, b) => a.start - b.start);
  const merged: { start: number; end: number }[] = [];
  for (const m of matches) {
    const last = merged[merged.length - 1];
    if (last && m.start <= last.end) {
      last.end = Math.max(last.end, m.end);
    } else {
      merged.push({ ...m });
    }
  }
  for (const m of merged) {
    if (m.start > pos) segments.push({ text: text.slice(pos, m.start), hit: false });
    segments.push({ text: text.slice(m.start, m.end), hit: true });
    pos = m.end;
  }
  if (pos < text.length) segments.push({ text: text.slice(pos), hit: false });
  return segments;
}

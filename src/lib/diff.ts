/**
 * Дифф для сравнения редакций документов — без внешних зависимостей.
 *
 * Задача: показать, что изменилось между двумя редакциями договора, и
 * подготовить данные для «Протокола разногласий».
 *
 * Два уровня сравнения:
 *  1) блоки (пункты/абзацы) — выравниваются алгоритмом LCS;
 *  2) внутри изменённого блока — пословный дифф (тоже LCS).
 *
 * Защита от «тяжёлых» документов: LCS имеет сложность O(n·m); при
 * превышении порога сравнение деградирует до «весь блок изменён»,
 * чтобы браузер не завис (см. MAX_LCS_CELLS).
 */

export type DiffOp = "equal" | "insert" | "delete";

export interface DiffSegment {
  op: DiffOp;
  text: string;
}

export type BlockKind = "unchanged" | "added" | "removed" | "changed";

export interface DiffBlock {
  kind: BlockKind;
  /** Индекс в редакции A (null для added). */
  aIndex: number | null;
  /** Индекс в редакции B (null для removed). */
  bIndex: number | null;
  /** Текст редакции A (пусто для added). */
  a: string;
  /** Текст редакции B (пусто для removed). */
  b: string;
  /** Пословный дифф — только для changed. */
  segments?: DiffSegment[];
  /** Доля совпавших символов 0..1 — только для changed. */
  similarity?: number;
}

export interface DiffStats {
  total: number;
  unchanged: number;
  added: number;
  removed: number;
  changed: number;
}

export interface DiffReport {
  blocks: DiffBlock[];
  stats: DiffStats;
  /** Только изменённые блоки (added/removed/changed) — основа протокола. */
  changes: DiffBlock[];
}

/** Порог сложности LCS (клеток матрицы). Выше — деградируем безопасно. */
const MAX_LCS_CELLS = 4_000_000;

/** Приводит текст к единому виду: \r\n → \n, без хвостовых пробелов. */
export function normalizeText(text: string): string {
  return text
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((l) => l.replace(/[ \t]+$/g, ""))
    .join("\n")
    .trim();
}

/** Нормализованный ключ блока для сравнения (регистр/пробелы/кавычки). */
function blockKey(text: string): string {
  return normalizeText(text)
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[«»""]/g, '"')
    .replace(/[–—]/g, "-");
}

/** Строка начинается с номера пункта: «1.», «1.2», «3)», «4.1.5.». */
const CLAUSE_START = /^\s*(\d+(?:\.\d+)*)\s*[.)]?\s+\S/;

/** Номер пункта из начала блока («2.3» из «2.3. Исполнитель обязан…»). */
export function clauseNumber(text: string): string | null {
  const m = normalizeText(text).match(/^\s*(\d+(?:\.\d+)*)/);
  return m ? m[1] : null;
}

/**
 * Разбивает документ на блоки-пункты. Сначала по пустым строкам, а внутри
 * «слипшегося» текста (DOCX/PDF часто отдают каждую строку отдельно) —
 * по началу нумерованного пункта.
 */
export function splitBlocks(text: string): string[] {
  const lines = normalizeText(text).split("\n");
  const blocks: string[] = [];
  let current: string[] = [];
  const flush = () => {
    const t = current.join("\n").trim();
    if (t) blocks.push(t);
    current = [];
  };
  for (const line of lines) {
    if (!line.trim()) {
      flush();
      continue;
    }
    if (CLAUSE_START.test(line) && current.length > 0) flush();
    current.push(line.trim());
  }
  flush();
  return blocks;
}

/** LCS-выравнивание двух последовательностей. */
function lcsOps<T>(a: T[], b: T[], eq: (x: T, y: T) => boolean): DiffOp[] {
  const n = a.length;
  const m = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    new Array<number>(m + 1).fill(0)
  );
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = eq(a[i], b[j])
        ? dp[i + 1][j + 1] + 1
        : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const ops: DiffOp[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (eq(a[i], b[j])) {
      ops.push("equal");
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      ops.push("delete");
      i++;
    } else {
      ops.push("insert");
      j++;
    }
  }
  while (i < n) {
    ops.push("delete");
    i++;
  }
  while (j < m) {
    ops.push("insert");
    j++;
  }
  return ops;
}

export interface SeqOp {
  op: DiffOp;
  aIndex: number | null;
  bIndex: number | null;
}

/** Выравнивание с индексами исходных элементов. */
export function diffSequence<T>(
  a: T[],
  b: T[],
  eq: (x: T, y: T) => boolean
): SeqOp[] {
  const ops = lcsOps(a, b, eq);
  const out: SeqOp[] = [];
  let i = 0;
  let j = 0;
  for (const op of ops) {
    if (op === "equal") {
      out.push({ op, aIndex: i, bIndex: j });
      i++;
      j++;
    } else if (op === "delete") {
      out.push({ op, aIndex: i, bIndex: null });
      i++;
    } else {
      out.push({ op, aIndex: null, bIndex: j });
      j++;
    }
  }
  return out;
}

/** Токенизация: слова и пробелы отдельными токенами. */
function tokenize(text: string): string[] {
  return text.match(/\s+|[^\s]+/g) ?? [];
}

function tokenKey(token: string): string {
  if (/^\s+$/.test(token)) return " ";
  return token.toLowerCase().replace(/[«»""]/g, '"').replace(/[–—]/g, "-");
}

/** Пословный дифф двух строк (для подсветки внутри изменённого пункта). */
export function diffWords(a: string, b: string): DiffSegment[] {
  const ta = tokenize(a);
  const tb = tokenize(b);
  if (ta.length * tb.length > MAX_LCS_CELLS) {
    return [
      { op: "delete", text: a },
      { op: "insert", text: b },
    ];
  }
  const ops = diffSequence(ta, tb, (x, y) => tokenKey(x) === tokenKey(y));
  const segments: DiffSegment[] = [];
  for (const o of ops) {
    // Индекс операции гарантирован её типом; null-проверки — защитные.
    const text =
      o.op === "insert"
        ? o.bIndex === null
          ? ""
          : tb[o.bIndex]
        : o.aIndex === null
          ? ""
          : ta[o.aIndex];
    const last = segments[segments.length - 1];
    if (last && last.op === o.op) last.text += text;
    else segments.push({ op: o.op, text });
  }
  return segments;
}

/** Доля совпавших символов в пословном диффе (0..1). */
function similarityOf(segments: DiffSegment[]): number {
  let equal = 0;
  let total = 0;
  for (const s of segments) {
    const len = s.text.replace(/\s/g, "").length;
    total += len;
    if (s.op === "equal") equal += len;
  }
  return total === 0 ? 1 : equal / total;
}

/**
 * Полный отчёт сравнения: блоки, статистика и список изменений.
 */
export function buildDiffReport(aText: string, bText: string): DiffReport {
  const aBlocks = splitBlocks(aText);
  const bBlocks = splitBlocks(bText);

  const ops = diffSequence(
    aBlocks,
    bBlocks,
    (x, y) => blockKey(x) === blockKey(y)
  );

  const blocks: DiffBlock[] = [];
  let idx = 0;
  while (idx < ops.length) {
    const cur = ops[idx];
    if (cur.op === "equal") {
      blocks.push({
        kind: "unchanged",
        aIndex: cur.aIndex,
        bIndex: cur.bIndex,
        a: cur.aIndex === null ? "" : aBlocks[cur.aIndex],
        b: cur.bIndex === null ? "" : bBlocks[cur.bIndex],
      });
      idx++;
      continue;
    }

    // Собираем непрерывный «хунк» удалений/вставок.
    const dels: number[] = [];
    const ins: number[] = [];
    while (idx < ops.length && ops[idx].op !== "equal") {
      const o = ops[idx];
      if (o.op === "delete") {
        if (o.aIndex !== null) dels.push(o.aIndex);
      } else if (o.bIndex !== null) {
        ins.push(o.bIndex);
      }
      idx++;
    }

    if (dels.length > 0 && ins.length > 0) {
      // Одинаковое число блоков — парим 1:1 (точнее для протокола).
      if (dels.length === ins.length) {
        for (let k = 0; k < dels.length; k++) {
          const a = aBlocks[dels[k]];
          const b = bBlocks[ins[k]];
          const segments = diffWords(a, b);
          blocks.push({
            kind: "changed",
            aIndex: dels[k],
            bIndex: ins[k],
            a,
            b,
            segments,
            similarity: similarityOf(segments),
          });
        }
      } else {
        const a = dels.map((i) => aBlocks[i]).join("\n\n");
        const b = ins.map((j) => bBlocks[j]).join("\n\n");
        const segments = diffWords(a, b);
        blocks.push({
          kind: "changed",
          aIndex: dels[0],
          bIndex: ins[0],
          a,
          b,
          segments,
          similarity: similarityOf(segments),
        });
      }
    } else if (dels.length > 0) {
      for (const i of dels) {
        blocks.push({
          kind: "removed",
          aIndex: i,
          bIndex: null,
          a: aBlocks[i],
          b: "",
        });
      }
    } else {
      for (const j of ins) {
        blocks.push({
          kind: "added",
          aIndex: null,
          bIndex: j,
          a: "",
          b: bBlocks[j],
        });
      }
    }
  }

  const stats: DiffStats = {
    total: blocks.length,
    unchanged: blocks.filter((b) => b.kind === "unchanged").length,
    added: blocks.filter((b) => b.kind === "added").length,
    removed: blocks.filter((b) => b.kind === "removed").length,
    changed: blocks.filter((b) => b.kind === "changed").length,
  };

  return {
    blocks,
    stats,
    changes: blocks.filter((b) => b.kind !== "unchanged"),
  };
}

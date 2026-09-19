/**
 * Извлечение и реконструкция текста из PDF (клиент-сайд, на основе pdfjs).
 *
 * Два инструмента конвертера (PDF→Text и PDF→Word) используют одни и те же функции:
 * - clusterItemsToLines: группирует сырые TextItem'ы pdfjs в строки (по Y) и слова (по X);
 * - groupIntoParagraphs: собирает строки в абзацы по вертикальным зазорам;
 * - assemblePlainText: превращает абзацы в читаемый .txt.
 */

export interface TextLine {
  text: string;
  x: number;
  y: number;
  size: number;
  /** Ширина строки в pt (сумма ширин фрагментов) — для оценки пробелов. */
  width: number;
}

interface ItemLike {
  str?: string;
  transform?: number[];
  height?: number;
  width?: number;
}

function isItemLike(v: unknown): v is ItemLike {
  return typeof v === "object" && v !== null;
}

function normChar(ch: string): string {
  return ch.normalize("NFKC");
}

/** Группирует сырые items из getTextContent() в текстовые строки. */
export function clusterItemsToLines(items: ReadonlyArray<unknown>): TextLine[] {
  const frags: { str: string; x: number; y: number; size: number; width: number }[] = [];
  for (const it of items) {
    if (!isItemLike(it)) continue;
    const o: ItemLike = it;
    const str = typeof o.str === "string" ? o.str : "";
    if (!str) continue;
    const t = o.transform ?? [];
    frags.push({
      str,
      x: t[4] ?? 0,
      y: t[5] ?? 0,
      size: o.height ?? 10,
      width: o.width ?? str.length * (o.height ?? 10) * 0.5,
    });
  }
  if (!frags.length) return [];

  // По Y сверху вниз (в pdf Y растёт вверх), затем по X слева направо.
  frags.sort((a, b) => b.y - a.y || a.x - b.x);

  const lines: TextLine[] = [];
  let cur: typeof frags = [frags[0]];

  const flush = () => {
    const sorted = [...cur].sort((a, b) => a.x - b.x);
    let text = "";
    let prevRight = -Infinity;
    let prevW = 0;
    let maxSize = 0;
    let minX = Infinity;
    let minY = Infinity;
    for (const f of sorted) {
      const gap = f.x - prevRight;
      const needSpace = Number.isFinite(prevRight) && gap > prevW * 0.35;
      const lead = f.str[0];
      const noSpaceBefore =
        /^[.,:;!?)\]»"'…]/.test(lead) ||
        text === "" ||
        /[«([]$/.test(text);
      text += text && (noSpaceBefore || !needSpace) ? "" : " ";
      text += normChar(f.str);
      prevRight = f.x + f.width;
      prevW = f.width;
      maxSize = Math.max(maxSize, f.size);
      minX = Math.min(minX, f.x);
      minY = Math.min(minY, f.y);
    }
    const avg = cur.reduce((s, c) => s + c.width, 0);
    lines.push({
      text: text.replace(/\s+/g, " ").trim(),
      x: minX,
      y: minY,
      size: maxSize,
      width: avg,
    });
  };

  for (let i = 1; i < frags.length; i++) {
    const f = frags[i];
    const tol = Math.max(2, cur[0].size * 0.6);
    if (Math.abs(f.y - cur[0].y) <= tol) {
      cur.push(f);
    } else {
      flush();
      cur = [f];
    }
  }
  flush();
  return lines;
}

/** Собирает строки в абзацы по вертикальным зазорам (доля высоты строки). */
export function groupIntoParagraphs(lines: ReadonlyArray<TextLine>): TextLine[][] {
  const out: TextLine[][] = [];
  let cur: TextLine[] = [];
  for (const l of lines) {
    const prev = cur[cur.length - 1];
    const gapFactor = prev ? (prev.y - l.y) / Math.max(prev.size, 1) : 0;
    if (prev && gapFactor > 1.6) {
      out.push(cur);
      cur = [];
    }
    cur.push(l);
  }
  if (cur.length) out.push(cur);
  return out;
}

/** Абзацы → читаемый .txt (пустая строка между абзацами, страницы разбиваются \n\n). */
export function assemblePlainText(paragraphGroups: ReadonlyArray<ReadonlyArray<TextLine>>): string {
  const parts: string[] = [];
  for (const para of paragraphGroups) {
    const text = para.map((l) => l.text).join("\n").trim();
    if (text) parts.push(text);
  }
  return parts.join("\n\n");
}

/** Строки страницы → читаемый текст (абзацы, пустая строка между абзацами). */
export function paragraphsToPlainText(lines: ReadonlyArray<TextLine>): string {
  const groups = groupIntoParagraphs(lines);
  return assemblePlainText(groups);
}
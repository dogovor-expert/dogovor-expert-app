// Compact block-level diff used by the demo viewer. We work with paragraphs so
// that the visual result matches the way lawyers actually read documents.

export interface DiffBlock {
  type: "context" | "add" | "remove" | "changed";
  before?: string; // HTML of the previous version
  after?: string; // HTML of the newer version
  wordDiff?: WordToken[]; // populated for "changed" blocks
  riskLevel?: "info" | "watch" | "warning" | "critical";
}

export interface WordToken {
  text: string;
  kind: "same" | "add" | "remove";
}

const parser = typeof window !== "undefined" ? new DOMParser() : null;

const RISK_ATTRIBUTE = "data-risk";

const extractText = (html: string): string => {
  if (!parser) return html.replace(/<[^>]+>/g, " ");
  const doc = parser.parseFromString(`<div>${html}</div>`, "text/html");
  return doc.body.textContent?.trim() ?? "";
};

const extractRisk = (html: string): DiffBlock["riskLevel"] | undefined => {
  const match = html.match(new RegExp(`${RISK_ATTRIBUTE}="([a-z]+)"`));
  if (!match) return undefined;
  const value = match[1] as DiffBlock["riskLevel"];
  return value;
};

const splitBlocks = (html: string): string[] => {
  return html
    .split(/(<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>|<p[^>]*>[\s\S]*?<\/p>|<li[^>]*>[\s\S]*?<\/li>)/g)
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.length > 0 && !/^\s*$/.test(chunk));
};

const tokenizeWords = (text: string): string[] => {
  return text.match(/\p{L}[\p{L}\p{N}-]*|\d+[\d\s.,]*|[.,;:!?()"«»—-]/gu) ?? [];
};

// Classic longest-common-subsequence table. Complexity is quadratic but the
// demo blocks stay small (< 250 tokens) so this stays comfortable in the main
// thread.
const lcs = (a: string[], b: string[]): number[][] => {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const table: number[][] = Array.from({ length: rows }, () => new Array(cols).fill(0));
  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      table[i][j] = a[i - 1] === b[j - 1] ? table[i - 1][j - 1] + 1 : Math.max(table[i - 1][j], table[i][j - 1]);
    }
  }
  return table;
};

export const diffWords = (before: string, after: string): WordToken[] => {
  const beforeTokens = tokenizeWords(before);
  const afterTokens = tokenizeWords(after);
  const table = lcs(beforeTokens, afterTokens);
  const tokens: WordToken[] = [];
  let i = beforeTokens.length;
  let j = afterTokens.length;
  while (i > 0 && j > 0) {
    if (beforeTokens[i - 1] === afterTokens[j - 1]) {
      tokens.unshift({ text: beforeTokens[i - 1], kind: "same" });
      i--;
      j--;
    } else if (table[i - 1][j] >= table[i][j - 1]) {
      tokens.unshift({ text: beforeTokens[i - 1], kind: "remove" });
      i--;
    } else {
      tokens.unshift({ text: afterTokens[j - 1], kind: "add" });
      j--;
    }
  }
  while (i > 0) tokens.unshift({ text: beforeTokens[--i], kind: "remove" });
  while (j > 0) tokens.unshift({ text: afterTokens[--j], kind: "add" });
  return tokens;
};

export const diffBlocks = (previousHtml: string, currentHtml: string): DiffBlock[] => {
  const before = splitBlocks(previousHtml);
  const after = splitBlocks(currentHtml);
  const beforeText = before.map(extractText);
  const afterText = after.map(extractText);
  const table = lcs(beforeText, afterText);
  const blocks: DiffBlock[] = [];
  let i = beforeText.length;
  let j = afterText.length;
  while (i > 0 && j > 0) {
    if (beforeText[i - 1] === afterText[j - 1]) {
      blocks.unshift({ type: "context", before: before[i - 1], after: after[j - 1], riskLevel: extractRisk(after[j - 1]) });
      i--;
      j--;
    } else if (table[i - 1][j] >= table[i][j - 1]) {
      blocks.unshift({ type: "remove", before: before[i - 1], riskLevel: extractRisk(before[i - 1]) });
      i--;
    } else {
      blocks.unshift({ type: "add", before: undefined, after: after[j - 1], riskLevel: extractRisk(after[j - 1]) });
      j--;
    }
  }
  while (i > 0) {
    i--;
    blocks.unshift({ type: "remove", before: before[i], riskLevel: extractRisk(before[i]) });
  }
  while (j > 0) {
    j--;
    blocks.unshift({ type: "add", after: after[j], riskLevel: extractRisk(after[j]) });
  }

  // Pair immediately adjacent add/remove blocks with identical structure into
  // a single "changed" block so the viewer can highlight word-level diffs.
  const merged: DiffBlock[] = [];
  for (let k = 0; k < blocks.length; k++) {
    const current = blocks[k];
    const next = blocks[k + 1];
    const previous = merged[merged.length - 1];

    if (
      current.type === "remove" &&
      next?.type === "add" &&
      structurallySimilar(current.before ?? "", next.after ?? "")
    ) {
      merged.push({
        type: "changed",
        before: current.before,
        after: next.after,
        riskLevel: extractRisk(next.after ?? "") ?? current.riskLevel,
        wordDiff: diffWords(extractText(current.before ?? ""), extractText(next.after ?? "")),
      });
      k++;
      continue;
    }

    if (
      previous?.type === "remove" &&
      current.type === "add" &&
      structurallySimilar(previous.before ?? "", current.after ?? "")
    ) {
      merged.pop();
      merged.push({
        type: "changed",
        before: previous.before,
        after: current.after,
        riskLevel: extractRisk(current.after ?? "") ?? previous.riskLevel,
        wordDiff: diffWords(extractText(previous.before ?? ""), extractText(current.after ?? "")),
      });
      continue;
    }

    merged.push(current);
  }

  return merged;
};

const structurallySimilar = (a: string, b: string): boolean => {
  const tagA = a.match(/^<(\w+)/)?.[1];
  const tagB = b.match(/^<(\w+)/)?.[1];
  if (tagA !== tagB) return false;
  const textA = extractText(a);
  const textB = extractText(b);
  if (!textA || !textB) return false;
  const wordsA = tokenizeWords(textA);
  const wordsB = tokenizeWords(textB);
  const table = lcs(wordsA, wordsB);
  const common = table[wordsA.length][wordsB.length];
  return common / Math.max(wordsA.length, wordsB.length) >= 0.35;
};

export interface DiffSummary {
  added: number;
  removed: number;
  changed: number;
  criticalCount: number;
  warningCount: number;
}

export const summarizeDiff = (blocks: DiffBlock[]): DiffSummary => {
  const summary: DiffSummary = { added: 0, removed: 0, changed: 0, criticalCount: 0, warningCount: 0 };
  for (const block of blocks) {
    if (block.type === "add") summary.added++;
    if (block.type === "remove") summary.removed++;
    if (block.type === "changed") summary.changed++;
    if (block.riskLevel === "critical") summary.criticalCount++;
    if (block.riskLevel === "warning") summary.warningCount++;
  }
  return summary;
};

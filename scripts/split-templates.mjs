// Разбивает src/data/legalTemplates.ts (монолит) на файлы по категориям:
//   src/data/templates/<category>.ts + index.ts (сборка LEGAL_TEMPLATES).
// Блоки шаблонов переносятся байт-точно, без переформатирования.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const srcPath = path.join(root, "src", "data", "legalTemplates.ts");
const outDir = path.join(root, "src", "data", "templates");
const indexPath = path.join(outDir, "index.ts");
const BS = String.fromCharCode(92); // backslash

function skipString(text, i, quote) {
  i++;
  while (i < text.length) {
    if (text[i] === BS) { i += 2; continue; }
    if (text[i] === quote) return i + 1;
    i++;
  }
  return i;
}

function skipTemplate(text, i) {
  i++;
  while (i < text.length) {
    if (text[i] === BS) { i += 2; continue; }
    if (text[i] === "`") return i + 1;
    if (text[i] === "$" && text[i + 1] === "{") {
      let depth = 1;
      i += 2;
      while (i < text.length && depth > 0) {
        if (text[i] === "{") depth++;
        else if (text[i] === "}") depth--;
        i++;
      }
      continue;
    }
    i++;
  }
  return i;
}

function extractBlocks(text) {
  const blocks = [];
  let depth = 1; // корневой массив LEGAL_TEMPLATES = [ — уже открыт
  let start = -1;
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (ch === '"' || ch === "'") { i = skipString(text, i, ch); continue; }
    if (ch === "`") { i = skipTemplate(text, i); continue; }
    if (ch === "/" && text[i + 1] === "/") {
      const nl = text.indexOf("\n", i);
      i = nl === -1 ? text.length : nl + 1;
      continue;
    }
    if (ch === "/" && text[i + 1] === "*") {
      const end = text.indexOf("*/", i + 2);
      i = end === -1 ? text.length : end + 2;
      continue;
    }
    if (ch === "{") {
      if (depth === 1 && start === -1) start = i;
      depth++;
    } else if (ch === "}") {
      depth--;
      if (depth === 1 && start !== -1) {
        blocks.push(text.slice(start, i + 1));
        start = -1;
      }
    }
    i++;
  }
  return blocks;
}

const src = fs.readFileSync(srcPath, "utf8");
const blocks = extractBlocks(src);

const byCategory = new Map();
const categoryOrder = [];
const seenIds = new Set();
let missingMeta = 0;

for (const block of blocks) {
  const idM = block.match(/\n\s*id: "([^"]+)"/);
  const catM = block.match(/\n\s*category: "([^"]+)"/);
  if (!idM || !catM) { missingMeta++; continue; }
  const id = idM[1];
  const category = catM[1];
  if (seenIds.has(id)) {
    console.error("Дубликат id:", id);
    process.exit(1);
  }
  seenIds.add(id);
  if (!byCategory.has(category)) {
    byCategory.set(category, []);
    categoryOrder.push(category);
  }
  byCategory.get(category).push({ id, block });
}

const EXPECTED = 292;
if (seenIds.size !== EXPECTED) {
  console.error("Ожидалось " + EXPECTED + " шаблонов, найдено " + seenIds.size + " (без метаданных: " + missingMeta + ")");
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });

const perCategory = [];
for (const category of categoryOrder) {
  const items = byCategory.get(category);
  const upper = category.toUpperCase();
  const fileName = category + ".ts";
  const body = items.map((it) => it.block).join(",\n");
  const fileText =
    'import type { LegalTemplate } from "../types";\n' +
    "\n" +
    "export const TEMPLATES_" + upper + ": LegalTemplate[] = [\n" +
    body + "\n" +
    "];\n";
  fs.writeFileSync(path.join(outDir, fileName), fileText, "utf8");
  perCategory.push({ category, fileName, count: items.length, lines: fileText.split("\n").length });
  console.log(fileName + ": " + items.length + " шаблонов, " + fileText.split("\n").length + " строк");
}

const importLines = categoryOrder.map(
  (c) => 'import { TEMPLATES_' + c.toUpperCase() + ' } from "./' + c + '";'
);
const spreadLines = categoryOrder.map(
  (c) => "  ...TEMPLATES_" + c.toUpperCase() + ","
);
const indexText =
  'import type { LegalTemplate } from "../types";\n' +
  "\n" +
  importLines.join("\n") +
  "\n\n" +
  "export const LEGAL_TEMPLATES: LegalTemplate[] = [\n" +
  spreadLines.join("\n") +
  "\n];\n";
fs.writeFileSync(indexPath, indexText, "utf8");

const legalTemplatesStub =
  'import type { LegalTemplate } from "./types";\n' +
  "\n" +
  "// Монолит разбит на src/data/templates/<category>.ts (см. scripts/split-templates.mjs).\n" +
  'export { LEGAL_TEMPLATES } from "./templates";\n' +
  "export type { LegalTemplate };\n";
fs.writeFileSync(srcPath, legalTemplatesStub, "utf8");

const totalLines = perCategory.reduce((s, p) => s + p.lines, 0);
console.log("\nИтого: " + seenIds.size + " шаблонов, " + categoryOrder.length + " файлов категорий, " + totalLines + " строк (+index.ts).");
console.log("Порядок категорий в LEGAL_TEMPLATES:", categoryOrder.join(", "));

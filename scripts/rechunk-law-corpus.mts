// Перечанкинг уже скачанных снапшотов новым сплиттером (без повторного fetch).
// Использование: npx tsx scripts/rechunk-law-corpus.mts --dir=... --max-len=6000
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { buildLawChunks, LAW_CORPUS_PARSER_VERSION } from "../src/lib/legal/lawCorpus";

const dir = process.argv.find((a) => a.startsWith("--dir="))?.slice(6);
if (!dir) throw new Error("Укажите --dir=...");
const maxLen = Number(process.argv.find((a) => a.startsWith("--max-len="))?.slice(10) ?? "6000");

const files = (await readdir(dir)).filter((f) => f.endsWith(".json"));
let worst = 0;
for (const file of files) {
  const target = path.join(dir, file);
  const doc = JSON.parse(await readFile(target, "utf8"));
  doc.chunks = buildLawChunks(doc.text);
  doc.parserVersion = LAW_CORPUS_PARSER_VERSION;
  const localWorst = Math.max(...doc.chunks.map((c: { chunk: string }) => c.chunk.length));
  worst = Math.max(worst, localWorst);
  await writeFile(target, `${JSON.stringify(doc, null, 2)}\n`, "utf8");
  console.log(`${doc.code}: чанков ${doc.chunks.length}, макс. длина ${localWorst}`);
}
console.log(`Худший чанк по корпусу: ${worst} символов (лимит проверки: ${maxLen})`);
if (worst > maxLen) {
  console.error("ОШИБКА: остались чанки длиннее лимита");
  process.exit(1);
}

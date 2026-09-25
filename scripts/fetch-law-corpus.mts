// CLI-обёртка: скачивает и парсит официальные тексты НПА (pravo.gov.ru),
// сохраняет снапшоты в JSON. Запуск: npx tsx scripts/fetch-law-corpus.mts ...
// Активация в RAG — отдельный шаг (scripts/run-load-corpus.mjs).
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { LAW_DOCUMENTS, fetchOfficialDocument } from "../src/lib/legal/lawCorpus";

const args = new Set(process.argv.slice(2));
const requested = process.argv.find((arg) => arg.startsWith("--code="))?.slice(7);
const outputDir = process.argv.find((arg) => arg.startsWith("--out="))?.slice(6) ?? "data/law-corpus/raw";
const documents = requested ? LAW_DOCUMENTS.filter((item) => item.code === requested) : LAW_DOCUMENTS;

if (args.has("--help") || documents.length === 0) {
  console.log('Использование: npx tsx scripts/fetch-law-corpus.mts [--code="КоАП РФ"] [--out=data/law-corpus/raw]');
  console.log("Скрипт только скачивает и парсит официальный текст; активация в RAG не выполняется.");
  process.exit(documents.length === 0 ? 1 : 0);
}

await mkdir(outputDir, { recursive: true });
for (const document of documents) {
  console.log(`Получаю ${document.code} (ND ${document.nd})...`);
  const result = await fetchOfficialDocument(document);
  const target = path.join(outputDir, `${document.nd}.json`);
  await writeFile(target, `${JSON.stringify(result, null, 2)}\n`, "utf8");
  console.log(`  сохранено: ${target}; чанков: ${result.chunks.length}`);
}

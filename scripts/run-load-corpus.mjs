import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";
import { loadDocumentEdition } from "./load-law-corpus.mjs";

const args = process.argv.slice(2);
const help = args.includes("--help");
const dryRun = args.includes("--dry-run");
const activate = args.includes("--activate");
const reviewedByArg = args.find((a) => a.startsWith("--reviewed-by="));
const reviewedBy = reviewedByArg ? reviewedByArg.slice(14) : null;
const dirArg = args.find((a) => a.startsWith("--dir="));
const inputDir = dirArg ? dirArg.slice(6) : "data/law-corpus/raw";

if (help) {
  console.log(`
Использование: node scripts/run-load-corpus.mjs [опции]

Опции:
  --dir=ПУТЬ            Папка со скачанными JSON-файлами (по умолчанию: data/law-corpus/raw)
  --dry-run             Тестовый прогон без записи в БД и вызова API эмбеддингов
  --activate            Активировать редакции (перевести из draft в active для RAG-поиска)
  --reviewed-by=ФИО     ОБЯЗАТЕЛЬНО при --activate: кто проверил редакцию
  --help                Показать эту справку

Примеры:
  1. Тестовая проверка без записи:
     node scripts/run-load-corpus.mjs --dry-run

  2. Загрузка в статусе draft (НЕ участвует в поиске):
     node scripts/run-load-corpus.mjs

  3. Загрузка и немедленная активация:
     node scripts/run-load-corpus.mjs --activate --reviewed-by="Юрист / Проверено по publication.pravo.gov.ru"
`);
  process.exit(0);
}

if (activate && !reviewedBy) {
  console.error("ОШИБКА: Флаг --activate требует обязательного указания --reviewed-by=\"ФИО или должность\"");
  process.exit(1);
}

const dbUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
if (!dbUrl && !dryRun) {
  console.error("ОШИБКА: Требуется переменная окружения SUPABASE_DB_URL или DATABASE_URL");
  process.exit(1);
}

const files = (await readdir(inputDir)).filter((f) => f.endsWith(".json"));
if (files.length === 0) {
  console.log(`В папке ${inputDir} не найдено .json файлов.`);
  process.exit(0);
}

console.log(`Найдено документов для обработки: ${files.length}`);
console.log(`Режим: ${dryRun ? "DRY-RUN (без записи)" : activate ? "АКТИВАЦИЯ (active)" : "ЧЕРНОВИК (draft)"}`);
if (reviewedBy) console.log(`Рецензент: ${reviewedBy}`);

let client = null;
if (!dryRun) {
  // Self-hosted postgres без TLS: SSL включаем только явным флагом.
  const useSsl = process.env.SUPABASE_DB_SSL === "1";
  client = new pg.Client({
    connectionString: dbUrl,
    ...(useSsl ? { ssl: { rejectUnauthorized: false } } : {}),
  });
  await client.connect();
}

try {
  for (const file of files) {
    const raw = JSON.parse(await readFile(path.join(inputDir, file), "utf8"));
    await loadDocumentEdition(client, raw, { activate, reviewedBy, dryRun });
  }
  console.log("\n✓ Все документы успешно обработаны.");
} finally {
  if (client) await client.end();
}

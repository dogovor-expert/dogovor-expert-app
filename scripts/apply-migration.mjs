// Скрипт для применения миграций к Supabase БЕЗ сохранения service_role ключа
// Использование: 
//   1. node scripts/apply-migration.mjs
//   2. Введите ключ когда попросит (или задайте SUPABASE_DB_URL в .env.local)
//   3. Ключ НЕ сохраняется, используется только для этого запуска

import { createInterface } from "node:readline/promises";
import { stdin, stdout, exit } from "node:process";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MIGRATIONS_DIR = path.join(__dirname, "..", "supabase", "migrations");

function maskKey(key) {
  if (!key || key.length < 12) return "***";
  return key.substring(0, 8) + "..." + key.substring(key.length - 4);
}

async function loadKey() {
  if (process.env.SUPABASE_DB_URL) {
    return process.env.SUPABASE_DB_URL;
  }

  const rl = createInterface({ input: stdin, output: stdout });
  const key = await rl.question(
    "Введите Supabase connection string (postgresql://... или SUPABASE_SERVICE_ROLE_KEY): "
  );
  rl.close();

  if (!key.trim()) {
    console.error("Ошибка: ключ не может быть пустым");
    exit(1);
  }

  return key.trim();
}

async function listMigrations() {
  try {
    const files = await readdir(MIGRATIONS_DIR);
    return files.filter((f) => f.endsWith(".sql")).sort();
  } catch (e) {
    console.error(`Ошибка: не удалось прочитать ${MIGRATIONS_DIR}:`, e.message);
    exit(1);
  }
}

async function applyMigration(key, filename) {
  const filepath = path.join(MIGRATIONS_DIR, filename);
  const sql = await readFile(filepath, "utf-8");

  console.log(`\n📄 Применяю: ${filename} (${sql.length} байт)`);
  console.log(`🔑 Ключ: ${maskKey(key)}`);

  const url = key.startsWith("postgresql://")
    ? key
    : `postgresql://postgres:${encodeURIComponent(key)}@db.${process.env.SUPABASE_PROJECT_REF || "localhost"}.supabase.co:5432/postgres`;

  const { default: pg } = await import("pg").catch(() => ({ default: null }));
  if (!pg) {
    console.error("Ошибка: пакет 'pg' не установлен. Установите: npm i pg");
    exit(1);
  }

  const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();
    console.log("✅ Подключение установлено");
    await client.query(sql);
    console.log(`✅ Миграция ${filename} успешно применена`);
  } catch (e) {
    console.error(`❌ Ошибка применения ${filename}:`, e.message);
    throw e;
  } finally {
    await client.end();
  }
}

async function main() {
  console.log("🚀 Применение миграций Supabase\n");
  console.log("⚠️  БЕЗОПАСНОСТЬ:");
  console.log("   - service_role ключ обходит все RLS политики");
  console.log("   - используйте только для миграций, НЕ для production данных");
  console.log("   - после миграции сбросьте ключ в Supabase Dashboard\n");

  const args = process.argv.slice(2);
  const targetFile = args[0];

  const allMigrations = await listMigrations();
  const pending = allMigrations.filter((f) => f.startsWith("20260907_") || targetFile === f);

  if (pending.length === 0) {
    console.log("Нет миграций для применения");
    if (targetFile) {
      console.log(`  (искал: ${targetFile})`);
    }
    return;
  }

  console.log(`Будет применено ${pending.length} миграций:`);
  for (const m of pending) {
    console.log(`  - ${m}`);
  }

  const key = await loadKey();

  for (const migration of pending) {
    await applyMigration(key, migration);
  }

  console.log("\n✅ Готово!");
  console.log("\n⚠️  СБРОСИТЕ service_role ключ в Supabase Dashboard:");
  console.log("   Settings → API → Generate new service_role key");
}

main().catch((e) => {
  console.error("\n❌ Критическая ошибка:", e.message);
  exit(1);
});
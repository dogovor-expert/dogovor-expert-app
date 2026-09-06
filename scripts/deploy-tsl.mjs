#!/usr/bin/env node
// Полный деплой TSL интеграции:
// 1. Применяет миграцию к Supabase
// 2. Деплоит на Vercel
// 3. Настраивает ENV переменные
// 4. Проверяет работу cron
//
// Использование:
//   node scripts/deploy-tsl.mjs
//
// ВАЖНО: service_role ключ Supabase вводится интерактивно (НЕ сохраняется).
// Vercel использует уже авторизованный CLI.

import { createInterface } from "node:readline/promises";
import { stdin, stdout, exit } from "node:process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync, spawn } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, "..");
const MIGRATION_FILE = path.join(ROOT, "supabase", "migrations", "20260907_tsl_certificates.sql");

const COLORS = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(color, emoji, ...args) {
  console.log(`${color}${emoji} ${args.join(" ")}${COLORS.reset}`);
}

async function prompt(question) {
  const rl = createInterface({ input: stdin, output: stdout });
  const answer = await rl.question(question);
  rl.close();
  return answer.trim();
}

async function runCommand(cmd, options = {}) {
  return new Promise((resolve, reject) => {
    log(COLORS.cyan, "▶", cmd);
    const proc = spawn(cmd, { shell: true, stdio: "inherit", cwd: ROOT, ...options });
    proc.on("close", (code) => {
      if (code === 0) resolve(0);
      else reject(new Error(`Command failed with code ${code}: ${cmd}`));
    });
  });
}

async function checkVercelAuth() {
  try {
    const whoami = execSync("vercel whoami", { encoding: "utf-8", stdio: ["ignore", "pipe", "pipe"] });
    log(COLORS.green, "✅", "Vercel авторизован:", whoami.trim());
    return true;
  } catch (e) {
    log(COLORS.red, "❌", "Vercel CLI не авторизован");
    log(COLORS.yellow, "💡", "Запустите: vercel login");
    return false;
  }
}

async function getSupabaseProjectInfo() {
  const projectRef = await prompt("Введите SUPABASE_PROJECT_REF (например: abcdefghijklm): ");
  if (!projectRef) {
    log(COLORS.red, "❌", "Project ref обязателен");
    exit(1);
  }
  return projectRef;
}

async function applyMigration(projectRef, dbPassword) {
  log(COLORS.blue, "\n📦", "Шаг 1/4: Применение миграции к Supabase");
  const sql = await readFile(MIGRATION_FILE, "utf-8");
  log(COLORS.cyan, "📄", `Файл: ${path.basename(MIGRATION_FILE)} (${sql.length} байт)`);

  const connStr = `postgresql://postgres:${encodeURIComponent(dbPassword)}@db.${projectRef}.supabase.co:5432/postgres`;
  const tmpFile = path.join(ROOT, ".migration.tmp.sql");
  await import("node:fs/promises").then((fs) => fs.writeFile(tmpFile, sql));

  try {
    log(COLORS.yellow, "⚠️", "Попытка применить через psql...");
    try {
      await runCommand(`psql "${connStr}" -f "${tmpFile}"`);
      log(COLORS.green, "✅", "Миграция применена через psql");
    } catch {
      log(COLORS.yellow, "⚠️", "psql недоступен, пробуем через pg");
      try {
        await import("pg");
      } catch {
        log(COLORS.yellow, "⚠️", "Устанавливаю pg...");
        await runCommand("npm i --save-dev pg");
      }
      const { default: pg } = await import("pg");
      const client = new pg.Client({ connectionString: connStr, ssl: { rejectUnauthorized: false } });
      await client.connect();
      await client.query(sql);
      await client.end();
      log(COLORS.green, "✅", "Миграция применена через pg");
    }
  } finally {
    try {
      await import("node:fs/promises").then((fs) => fs.unlink(tmpFile));
    } catch {}
  }
}

async function deployToVercel() {
  log(COLORS.blue, "\n🚀", "Шаг 2/4: Деплой на Vercel");
  await runCommand("vercel --prod --yes");
  log(COLORS.green, "✅", "Деплой завершён");
}

async function setEnvVars(cronSecret) {
  log(COLORS.blue, "\n🔐", "Шаг 3/4: Настройка ENV переменных");
  log(COLORS.cyan, "•", `CRON_SECRET = ${cronSecret.substring(0, 8)}...`);
  await runCommand(`vercel env add CRON_SECRET production <<< "${cronSecret}"`);

  const useRemote = await prompt("Использовать удалённый TSL с e-trust.gosuslugi.ru? (Y/n): ");
  if (useRemote.toLowerCase() !== "n") {
    log(COLORS.cyan, "•", "TSL_USE_REMOTE = true (default)");
  } else {
    await runCommand(`vercel env add TSL_USE_REMOTE production <<< "false"`);
    const localFile = await prompt("Путь к локальному TSL файлу: ");
    if (localFile) {
      await runCommand(`vercel env add TSL_LOCAL_FILE production <<< "${localFile}"`);
    }
  }
  log(COLORS.green, "✅", "ENV переменные настроены");
}

async function testCron() {
  log(COLORS.blue, "\n🧪", "Шаг 4/4: Проверка работы cron");
  const domain = await prompt("Введите production домен (например: dogovor.expert): ");
  if (!domain) {
    log(COLORS.yellow, "⚠️", "Пропускаю тест cron");
    return;
  }

  const cronSecret = await prompt("Введите CRON_SECRET для теста: ");
  const url = `https://${domain}/api/cron/tsl-refresh?action=status`;

  log(COLORS.cyan, "🌐", `GET ${url}`);
  try {
    const result = execSync(
      `curl -sS -H "Authorization: Bearer ${cronSecret}" "${url}"`,
      { encoding: "utf-8", stdio: ["ignore", "pipe", "pipe"] }
    );
    console.log(result);
    log(COLORS.green, "✅", "Cron работает!");
  } catch (e) {
    log(COLORS.red, "❌", "Ошибка при проверке cron");
    log(COLORS.yellow, "💡", "Проверьте вручную через Vercel Dashboard → Logs");
  }
}

async function main() {
  console.log(`${COLORS.cyan}╔═══════════════════════════════════════════════╗`);
  console.log(`║   🚀 Деплой TSL интеграции (Trust Service List)   ║`);
  console.log(`╚═══════════════════════════════════════════════╝${COLORS.reset}\n`);

  log(COLORS.yellow, "⚠️", "БЕЗОПАСНОСТЬ:");
  log(COLORS.yellow, "  •", "service_role ключ Supabase вводится в терминале и НЕ сохраняется");
  log(COLORS.yellow, "  •", "Vercel CLI должен быть авторизован (vercel login)");
  log(COLORS.yellow, "  •", "После деплоя сбросьте ключ в Supabase Dashboard\n");

  const vercelOk = await checkVercelAuth();
  if (!vercelOk) {
    log(COLORS.yellow, "Запустите 'vercel login' и попробуйте снова");
    exit(1);
  }

  const projectRef = await getSupabaseProjectInfo();
  const dbPassword = await prompt("Введите пароль БД Supabase (Database password из Settings → Database): ");

  if (!dbPassword) {
    log(COLORS.red, "❌", "Пароль обязателен");
    exit(1);
  }

  let cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    log(COLORS.cyan, "🔑", "Генерирую CRON_SECRET...");
    cronSecret = execSync("node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"", { encoding: "utf-8" }).trim();
    log(COLORS.green, "✅", `CRON_SECRET = ${cronSecret}`);
  } else {
    log(COLORS.green, "✅", "CRON_SECRET из env");
  }

  await applyMigration(projectRef, dbPassword);
  await deployToVercel();
  await setEnvVars(cronSecret);
  await testCron();

  log(COLORS.green, "\n🎉", "Готово!");
  log(COLORS.yellow, "⚠️", "ВАЖНО: сбросьте service_role ключ в Supabase Dashboard");
  log(COLORS.yellow, "⚠️", "Settings → API → Generate new service_role key → Revoke old");
}

main().catch((e) => {
  log(COLORS.red, "❌", "Критическая ошибка:", e.message);
  exit(1);
});
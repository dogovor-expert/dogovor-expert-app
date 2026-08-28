#!/usr/bin/env node
// Настройка Telegram-моста чата поддержки.
// Использование:
//   node scripts/setup-telegram-webhook.mjs https://dogovor.expert
// Переменные окружения (взять из .env.local / Vercel):
//   TELEGRAM_BOT_TOKEN        — токен от @BotFather
//   TELEGRAM_WEBHOOK_SECRET   — любая случайная строка (>=16 символов)
//   TELEGRAM_SUPPORT_GROUP_ID — id супергруппы с включёнными Topics (вида -100...)

import { readFileSync } from "node:fs";

// Подхватим .env.local, если запущено локально без экспорта переменных.
try {
  const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  for (const line of env.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch {
  /* .env.local нет — полагаемся на переменные оболочки */
}

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;
const GROUP = process.env.TELEGRAM_SUPPORT_GROUP_ID;
const BASE = process.argv[2] || "https://dogovor.expert";

if (!TOKEN) {
  console.error("❌ Не задан TELEGRAM_BOT_TOKEN");
  process.exit(1);
}
if (!SECRET) {
  console.error("❌ Не задан TELEGRAM_WEBHOOK_SECRET (сгенерируйте: openssl rand -hex 16)");
  process.exit(1);
}
if (!GROUP) {
  console.error("❌ Не задан TELEGRAM_SUPPORT_GROUP_ID (id супергруппы с Topics)");
  process.exit(1);
}

const api = (method, body) =>
  fetch(`https://api.telegram.org/bot${TOKEN}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then((r) => r.json());

const me = await api("getMe");
if (!me.ok) {
  console.error("❌ Бот недоступен:", me.description);
  process.exit(1);
}
console.log(`✅ Бот: @${me.result.username} (id ${me.result.id})`);

const webhookUrl = `${BASE.replace(/\/$/, "")}/api/telegram/webhook`;
const set = await api("setWebhook", {
  url: webhookUrl,
  secret_token: SECRET,
  allowed_updates: ["message"],
  drop_pending_updates: true,
});
if (!set.ok) {
  console.error("❌ Не удалось установить webhook:", set.description);
  process.exit(1);
}
console.log(`✅ Webhook установлен: ${webhookUrl}`);

const info = await api("getWebhookInfo");
console.log("ℹ️ Webhook info:", JSON.stringify(info.result, null, 2));
console.log("\n📋 Не забудьте в BotFather / настройках группы:");
console.log("  • Бот добавлен в супергруппу админом с правами Manage Topics + Send");
console.log("  • В супергруппе включены Topics (General topics)");
console.log(`  • TELEGRAM_SUPPORT_GROUP_ID = ${GROUP}`);

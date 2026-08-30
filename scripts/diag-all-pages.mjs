// Диагностика: обходит все страницы сайта и собирает консольные ошибки/предупреждения.
// Запуск: node scripts/diag-all-pages.mjs [baseUrl]

import { chromium } from "playwright";

const baseUrl = process.argv[2] || "http://localhost:3000";

const pages = [
  "/",
  "/builder",
  "/preview",
  "/documents",
  "/connections",
  "/settings",
  "/billing",
  "/autoteka",
  "/osago",
  "/converter",
  "/utils",
  "/templates",
];

// фильтр «шумных» ошибок, которые не относятся к нашему коду
function isNoise(t) {
  return (
    t.includes("favicon") ||
    t.includes("net::ERR") ||
    t.includes("401") ||
    t.includes("Failed to load resource") && /googletagmanager|mc\.yandex|chat\/widget|tildacdn/i.test(t)
  );
}

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();

let totalErrors = 0;
let totalWarnings = 0;

for (const p of pages) {
  const errors = [];
  const warnings = [];
  const onConsole = (m) => {
    const t = m.text();
    if (m.type() === "error") errors.push(t);
    else if (m.type() === "warning") warnings.push(t);
  };
  const onPageError = (e) => errors.push("PAGEERROR: " + String(e));
  page.on("console", onConsole);
  page.on("pageerror", onPageError);

  const url = `${baseUrl}${p}`;
  process.stdout.write(`\n=== ${p} === `);
  try {
    await page.goto(url, { waitUntil: "load", timeout: 30000 });
    await page.waitForTimeout(2500);
    const realErrors = errors.filter((t) => !isNoise(t));
    const realWarnings = warnings.filter((t) => !isNoise(t));
    totalErrors += realErrors.length;
    totalWarnings += realWarnings.length;
    if (realErrors.length === 0 && realWarnings.length === 0) {
      process.stdout.write("OK (0 ошибок, 0 предупреждений)\n");
    } else {
      process.stdout.write(`ОШИБКИ: ${realErrors.length}, ПРЕДУПР: ${realWarnings.length}\n`);
      for (const e of realErrors.slice(0, 8)) console.log("    [E] " + e.slice(0, 300));
      for (const w of realWarnings.slice(0, 8)) console.log("    [W] " + w.slice(0, 300));
    }
  } catch (e) {
    console.log("    НЕ УДАЛОСЬ ЗАГРУЗИТЬ: " + String(e).slice(0, 200));
    totalErrors++;
  }
  page.off("console", onConsole);
  page.off("pageerror", onPageError);
}

console.log(`\n========== ИТОГО: ошибок ${totalErrors}, предупреждений ${totalWarnings} ==========`);
await browser.close();
process.exit(totalErrors > 0 ? 1 : 0);

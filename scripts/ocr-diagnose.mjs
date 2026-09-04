// Диагностика: что именно делает DocScanner на /builder после загрузки фото.
// Логирует: статус сканера, консольные ошибки, сетевые ответы, и снимок всех input-полей.
import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

function arg(name, fb) { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : fb; }

const stateArg = arg("--state") || "";
const DOC = resolve(arg("--doc") || "C:\\Users\\alikpc\\AppData\\Local\\Temp\\opencode\\docs\\Scan_20260831_002103.jpg");
const SLOT_LABEL = arg("--slot") || "Паспорт Продавца — стр. 2–3 (разворот)";

const browser = await chromium.launch({ headless: true, channel: "chromium" });
const ctx = await browser.newContext({ storageState: resolve(stateArg) });
const page = await ctx.newPage();

const logs = [];
const cspErrors = [];
const networkErrors = [];
page.on("console", (m) => {
  const text = m.text();
  logs.push(`[${m.type()}] ${text}`);
  if (m.type() === "error" && /Content Security|unsafe-eval|WebAssembly|CompileError/i.test(text)) cspErrors.push(text);
});
page.on("pageerror", (e) => logs.push(`[pageerror] ${e.message}`));
page.on("response", (r) => {
  const url = r.url();
  if (/ocr|tesseract|worker|supabase\.co\/rest|huggingface/i.test(url)) {
    logs.push(`[net ${r.status()}] ${url.slice(0, 200)}`);
  }
  if (r.status() >= 400) networkErrors.push(`${r.status()} ${url.slice(0, 200)}`);
});

const templateArg = "dkp-auto-short";
console.log(`→ goto /builder?template=${templateArg}`);
await page.goto(`https://dogovor.expert/builder?template=${templateArg}`, { waitUntil: "networkidle" });
await page.waitForTimeout(3000);

// открыть сканер
const showBtn = page.getByRole("button", { name: "Показать сканер документов" });
if (await showBtn.count()) {
  await showBtn.click();
  await page.waitForTimeout(1500);
  console.log("→ кликнул «Показать сканер документов»");
} else {
  console.log("⚠️ Кнопка «Показать сканер документов» не найдена");
}

// показать содержимое плиток слотов
const tiles = await page.locator("p.text-xs").allTextContents();
console.log("→ заголовки слотов:", JSON.stringify(tiles.filter(t => t && t.length < 80), null, 2));

// ищем нужный слот
const slotText = page.locator(`p:text-is("${SLOT_LABEL}")`).first();
if (!(await slotText.count())) {
  console.log("❌ слот не найден, беру первый попавшийся из списка");
  process.exit(1);
}
await slotText.scrollIntoViewIfNeeded();
// Плитка — это div, который содержит p с slot.label. Используем именно
// вложенный div с rounded-2xl border, чтобы поймать плитку целиком.
const tile = page
  .locator("div.rounded-2xl")
  .filter({ has: page.locator(`p:text-is("${SLOT_LABEL}")`) })
  .first();
const fileInput = tile.locator('input[type="file"]').first();

console.log(`→ setInputFiles ${DOC}`);
await fileInput.setInputFiles(DOC);

// Цикл наблюдения: 60 секунд, раз в 3с — статус-текст
console.log("→ мониторинг 60с...");
const startedAt = Date.now();
let lastSnap = "";
let lastSlotStatus = "";
let lastScanError = "";
while (Date.now() - startedAt < 60_000) {
  await page.waitForTimeout(3000);
  // содержимое плитки
  const tileNow = await tile.innerText().catch(() => "(нет)");
  const statusText = await page.locator('[role="status"]').allTextContents();
  const errText = await page.locator('text=/Ошибка|ошибка|Не удалось/i').allTextContents();
  const snap = JSON.stringify({ tile: tileNow.slice(0, 500), statuses: statusText, errors: errText });
  if (snap !== lastSnap) {
    lastSnap = snap;
    console.log(`  [t+${Math.round((Date.now() - startedAt) / 1000)}с] ${snap}`);
  }
  // если в плитке появилась FIO или серия паспорта — выходим
  if (/[А-ЯЁ]{2,}\s+[А-ЯЁ]+\s+[А-ЯЁ]+/.test(tileNow) || /4\d{2}\s*\d{6}/.test(tileNow)) {
    console.log("✅ похоже, OCR отработал");
    break;
  }
}

await page.waitForTimeout(2000);

// Если в плитке есть кнопка "Что распознано?" — кликнем, вытащим filledFields
const detailsBtn = tile.locator('button:has-text("Что распознано?")');
if (await detailsBtn.count()) {
  await detailsBtn.click();
  await page.waitForTimeout(300);
  const details = await tile.innerText().catch(() => "");
  console.log("\n=== РАСПОЗНАННЫЕ ПОЛЯ В ПЛИТКЕ ===");
  console.log(details);
}

// Снимок всех input-полей
const inputs = await page.evaluate(() => {
  const out = [];
  for (const inp of document.querySelectorAll("input,textarea")) {
    const id = inp.id || inp.name || inp.getAttribute("data-field") || "";
    const v = (inp.value || "").trim();
    if (id) out.push({ id, v, type: inp.type });
  }
  return out;
});
const filled = inputs.filter(i => i.v);
console.log("\n=== ЗАПОЛНЕННЫЕ INPUTS ===");
for (const i of filled) console.log(`  ${i.id} = "${i.v}" (${i.type})`);

console.log("\n=== СЕТЕВЫЕ ОШИБКИ (>=400) ===");
if (networkErrors.length) for (const e of networkErrors.slice(0, 20)) console.log("  " + e);
else console.log("  нет");

console.log("\n=== ОШИБКИ КОНСОЛИ (CSP) ===");
if (cspErrors.length) for (const e of cspErrors) console.log("  " + e);
else console.log("  нет");

console.log("\n=== ПОСЛЕДНИЕ 25 ЛОГОВ (разные типы) ===");
const filtered = logs.filter(l => !/Failed to load resource/.test(l));
for (const l of filtered.slice(-25)) console.log("  " + l.slice(0, 300));

await browser.close();

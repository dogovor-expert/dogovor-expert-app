// Диагностика флоу «Подключить Яндекс.Диск» на проде.
// Запуск: node scripts/diag-yandex-connect.mjs [baseUrl] [clientId]
import { chromium } from "playwright";

const baseUrl = process.argv[2] || "https://dogovor.expert";
const clientId = process.argv[3] || "test1234567890";
const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });

let popupUrl = null;
page.on("popup", async (p) => {
  try { popupUrl = p.url(); } catch { popupUrl = "<blocked-or-instant-close>"; }
});

console.log(`\n=== Открываю ${baseUrl}/connections ===`);
await page.goto(`${baseUrl}/connections`, { waitUntil: "networkidle" }).catch(() =>
  page.goto(`${baseUrl}/connections`, { waitUntil: "load" })
);
await page.waitForTimeout(2000);

// Ищем первую карточку (Яндекс) и поле Client ID внутри неё
const card = page.locator("div.border-b:has-text('Яндекс.Диск')").locator("..");
const input = card.locator("input[type=text]").first();

console.log("=== Ввожу тестовый Client ID ===");
await input.fill(clientId);

console.log("=== Кликаю «Подключить» ===");
const connectBtn = card.locator("button:has-text('Подключить')");
await connectBtn.click();

// Ждём либо попап, либо ошибку в UI (до 15 сек)
await page.waitForTimeout(15000);

console.log("\n--- РЕЗУЛЬТАТ ---");
console.log("popup URL:", popupUrl || "(не открылся)");
if (popupUrl && popupUrl.includes("oauth.yandex.ru")) {
  const u = new URL(popupUrl);
  console.log("oauth client_id:", u.searchParams.get("client_id"));
  console.log("redirect_uri:", u.searchParams.get("redirect_uri"));
}
// Текст ошибки/статуса в карточке
const errText = await card.locator(".text-red-700, .bg-red-50, [class*=error]").allInnerTexts().catch(() => []);
console.log("UI errors:", JSON.stringify(errText));
const btnDisabled = await connectBtn.isDisabled().catch(() => "?");
console.log("кнопка disabled:", btnDisabled);
const bodyErr = (await page.locator("body").innerText()).match(/Client ID[^.\n]*|попап[^.\n]*|заблокир[^.\n]*/gi);
console.log("подсказки в body:", bodyErr);

console.log("\n--- Консольные ошибки страницы ---");
console.log(JSON.stringify(errors.filter((e) => !e.includes("jivo") && !e.includes("net::")).slice(0, 5), null, 2));

await page.screenshot({ path: "C:/Users/alikpc/AppData/Local/Temp/opencode/yandex-connect-diag.png" });
await browser.close();
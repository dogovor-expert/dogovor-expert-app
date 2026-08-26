import { chromium } from "playwright";

const BASE = "https://dogovor.expert";
const browser = await chromium.launch({ headless: false });
const page = await (await browser.newContext()).newPage();

const log = (m) => console.log("[demo]", m);

// 1. Главная
log("открываю главную " + BASE);
await page.goto(BASE, { waitUntil: "load" });
await page.waitForTimeout(2500);

// 2. Конструктор
log("открываю /builder");
await page.goto(BASE + "/builder", { waitUntil: "load" });
await page.waitForTimeout(2000);

// 3. Предпросмотр документа (то, что печатаем)
log("открываю /preview?template=rental-flat");
await page.goto(BASE + "/preview?template=rental-flat", { waitUntil: "load" });
await page.waitForSelector("#print-root img", { timeout: 20000 });
const imgs = await page.locator("#print-root img").count();
log("страниц отрисовано в #print-root: " + imgs);
await page.waitForTimeout(2500);

// 4. Нажимаем «Печать» — покажется системное окно печати
log("нажимаю кнопку «Печать» (появится окно печати браузера)");
const printBtn = page.getByRole("button", { name: "Печать" });
await printBtn.click();
await page.waitForTimeout(4000);

// Закрываем окно печати (Esc), если пользователь не распечатал
await page.keyboard.press("Escape").catch(() => {});
await page.waitForTimeout(1000);

log("готово. Можете сами покликать в этом окне ~30с, затем оно закроется.");
await page.waitForTimeout(30000);
await browser.close();
console.log("[demo] closed");

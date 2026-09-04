// E2E сканера документов на проде (dogovor.expert).
// Использование:
//   node scripts/ocr-e2e.mjs --state <storage-state.json> --doc <photo-path> --slot "<label>"
//   node scripts/ocr-e2e.mjs --email <email> --password <password> --doc <photo-path> --slot "<label>"
//
// Что делает:
//   1. Открывает /builder?template=dkp-auto-short (или --template <id>).
//   2. Раскрывает панель сканера.
//   3. Загружает --doc в слот --slot.
//   4. Ждёт до 60с пока Tesseract/PaddleOCR не закончат (есть кнопка "Переснять" —
//      значит результат получен).
//   5. Если плитка показывает "Что распознано?" — раскрывает и собирает пары
//      label:value.
//   6. Собирает заполненные <input id value=...> в форме (все, не только поля паспорта).
//   7. Печатает: результат плитки, заполненные поля формы, CSP/сетевые ошибки.
import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

function arg(name, fallback) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : fallback;
}

const stateArg = arg("--state") || "";
const statePath = stateArg ? resolve(stateArg) : "";
const EMAIL = arg("--email") || "";
const PASSWORD = arg("--password") || "";
if (statePath && !existsSync(statePath)) {
  console.error("❌ storage state не найден:", statePath);
  process.exit(1);
}
if (!statePath && (!EMAIL || !PASSWORD)) {
  console.error("❌ нужен --state <file> или --email + --password");
  process.exit(1);
}

const DOC = resolve(arg("--doc") || "C:\\Users\\alikpc\\AppData\\Local\\Temp\\opencode\\docs\\passport-synthetic.png");
const SLOT_LABEL = arg("--slot") || "Паспорт Продавца — стр. 2–3 (разворот)";
const TEMPLATE = arg("--template") || "dkp-auto-short";
const MAX_WAIT_MS = 90 * 1000;
const BASE = "https://dogovor.expert";

const browser = await chromium.launch({ headless: true, channel: "chromium" });
const context = statePath
  ? await browser.newContext({ storageState: statePath })
  : await browser.newContext();
const page = await context.newPage();
page.setDefaultTimeout(MAX_WAIT_MS);

const cspErrors = [];
const networkErrors = [];
page.on("console", (m) => {
  if (m.type() === "error" && /Content Security|unsafe-eval|WebAssembly|CompileError/i.test(m.text())) {
    cspErrors.push(m.text().slice(0, 200));
  }
});
page.on("response", (r) => {
  if (r.status() >= 400 && /supabase\.co\/rest|dogovor\.expert\/api/.test(r.url())) {
    networkErrors.push(`${r.status()} ${r.url().slice(0, 180)}`);
  }
});

async function loginViaUI() {
  console.log(`→ ${BASE}/login`);
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  const havePw = page.getByRole("button", { name: /У меня есть пароль/ });
  if (await havePw.count()) { await havePw.click(); await page.waitForTimeout(500); }
  const emailInput = page.locator("#login-email").or(page.locator('input[type="email"]')).first();
  await emailInput.fill(EMAIL);
  const cont = page.getByRole("button", { name: /Продолжить/ });
  if (await cont.count()) await cont.click();
  await page.waitForTimeout(800);
  const pwInput = page.locator("#login-password").or(page.locator('input[type="password"]')).first();
  await pwInput.fill(PASSWORD);
  await page.locator('form button[type="submit"]').first().click();
  await page.waitForTimeout(2000);
}

async function main() {
  if (!statePath) await loginViaUI();

  console.log(`→ ${BASE}/builder?template=${TEMPLATE}`);
  await page.goto(`${BASE}/builder?template=${TEMPLATE}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(3500);

  // Открыть панель сканера
  const showBtn = page.getByRole("button", { name: "Показать сканер документов" });
  if (await showBtn.count()) {
    await showBtn.click();
    await page.waitForTimeout(1500);
  } else {
    console.log("⚠️  Кнопка «Показать сканер документов» не найдена (нет PRO или сканер скрыт).");
  }

  // Найти слот
  const slotText = page.locator(`p:text-is("${SLOT_LABEL}")`).first();
  if (!(await slotText.count())) {
    console.log(`❌ слот «${SLOT_LABEL}» не найден`);
    process.exit(2);
  }
  await slotText.scrollIntoViewIfNeeded();
  const tile = page.locator("div.rounded-2xl")
    .filter({ has: page.locator(`p:text-is("${SLOT_LABEL}")`) })
    .first();
  const fileInput = tile.locator('input[type="file"]').first();

  console.log(`→ загружаю ${DOC} в слот «${SLOT_LABEL}»`);
  await fileInput.setInputFiles(DOC);

  // Ждём появления результата (кнопка «Переснять» или «Поля не распознаны»)
  const start = Date.now();
  let lastSnap = "";
  while (Date.now() - start < MAX_WAIT_MS) {
    await page.waitForTimeout(2000);
    const t = await tile.innerText().catch(() => "");
    const hasResult = /Переснять|Поля не распознаны|Заполнено|Не найдено/.test(t);
    const snap = t.slice(0, 300);
    if (snap !== lastSnap && snap) {
      lastSnap = snap;
      console.log(`  [t+${Math.round((Date.now() - start) / 1000)}с] ${snap.replace(/\s+/g, " ").slice(0, 200)}`);
    }
    if (hasResult) break;
  }

  // Если есть «Что распознано?» — раскрываем и собираем
  const detailsBtn = tile.locator('button:has-text("Что распознано?")');
  if (await detailsBtn.count()) {
    await detailsBtn.click();
    await page.waitForTimeout(300);
    const details = await tile.innerText().catch(() => "");
    console.log("\n=== РАСПОЗНАННЫЕ ПОЛЯ (плитка) ===");
    console.log(details);
  }

  // Все input-ы формы
  const inputs = await page.evaluate(() => {
    const out = [];
    for (const inp of document.querySelectorAll("input,textarea")) {
      const id = inp.id || inp.name || inp.getAttribute("data-field") || "";
      const v = (inp.value || "").trim();
      if (id) out.push({ id, v, type: inp.type });
    }
    return out;
  });
  const filled = inputs.filter((i) => i.v);
  console.log("\n=== ЗАПОЛНЕННЫЕ INPUTS ФОРМЫ ===");
  for (const i of filled) console.log(`  ${i.id} = "${i.v}" (${i.type})`);

  // Проверки для ДКП (если шаблон dkp-auto-short)
  if (TEMPLATE === "dkp-auto-short") {
    const checks = ["seller_fio", "seller_passport", "seller_passport_issued", "seller_address",
                    "buyer_fio", "buyer_passport", "buyer_passport_issued", "buyer_address",
                    "car_brand", "car_vin", "car_sts", "contract_price"];
    console.log("\n=== ПРОВЕРКА ПОЛЕЙ DKP-AUTO-SHORT ===");
    for (const f of checks) {
      const v = filled.find((i) => i.id === f);
      console.log(`  ${v && v.v ? "✅" : "❌"} ${f} = "${v ? v.v : ""}"`);
    }
  }

  console.log("\n=== CSP/WASM ошибки ===");
  if (cspErrors.length) for (const e of cspErrors) console.log("  " + e);
  else console.log("  ✅ нет");

  console.log("\n=== Сетевые ошибки (api/rest) ===");
  if (networkErrors.length) for (const e of networkErrors) console.log("  " + e);
  else console.log("  ✅ нет");

  await browser.close();
}

main().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});

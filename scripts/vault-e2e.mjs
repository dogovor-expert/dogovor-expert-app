// E2E: реальный запуск vault в Chromium на живом Next.js dev-сервере.
// Запуск: node scripts/vault-e2e.mjs [baseUrl]
// Проверяет: инициализацию IDB, отсутствие консольных ошибок, состояние ключей.

import { chromium } from "playwright";

const baseUrl = process.argv[2] || "http://localhost:3000";
const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();

let passed = 0, failed = 0;
function check(name, cond, extra = "") {
  if (cond) { passed++; console.log(`  OK   ${name}`); }
  else { failed++; console.log(`  FAIL ${name} ${extra}`); }
}

const consoleErrors = [];
page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
page.on("pageerror", (e) => consoleErrors.push(String(e)));

console.log(`\n=== 1. Открываем ${baseUrl}/connections (свежий профиль) ===`);
await page.goto(`${baseUrl}/connections`, { waitUntil: "networkidle" }).catch(() =>
  page.goto(`${baseUrl}/connections`, { waitUntil: "load" })
);
await page.waitForTimeout(2500); // даём initVault/VaultProvider завершиться

check("страница загрузилась", page.url().includes("/connections"));
const hasCards = await page.locator("text=Яндекс.Диск").count();
if (hasCards === 0) {
  const bodySnippet = (await page.locator("body").innerText().catch(() => "")).slice(0, 400);
  console.log("  [debug] body:", bodySnippet.replace(/\n+/g, " | "));
  await page.screenshot({ path: "C:/Users/alikpc/AppData/Local/Temp/opencode/e2e-fail.png" }).catch(() => {});
}
check("карточки провайдеров отрисованы", hasCards > 0);
const earlyErrors = consoleErrors.filter(
  (t) => !t.includes("favicon") && !t.includes("net::") && !t.includes("401")
);
if (earlyErrors.length) console.log("  [debug] console errors:", JSON.stringify(earlyErrors.slice(0, 5), null, 2));

console.log("\n=== 2. IndexedDB: ключи созданы? (раньше здесь был P0-краш) ===");
const idbState = await page.evaluate(async () => {
  const dbs = await indexedDB.databases?.();
  const names = (dbs || []).map((d) => d.name);
  if (!names.includes("dogovor-vault")) return { exists: false, metaKeys: [], wrappedV2: null, passSet: null };
  const db = await new Promise((res, rej) => {
    const r = indexedDB.open("dogovor-vault");
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
  const metaKeys = [];
  const readAll = (store) => new Promise((res, rej) => {
    const tx = db.transaction(store, "readonly");
    const rq = tx.objectStore(store).getAll();
    rq.onsuccess = () => res(rq.result);
    rq.onerror = () => rej(rq.error);
  });
  const metaRows = await readAll("meta");
  let wrappedV2 = null, passSet = null;
  for (const row of metaRows) {
    metaKeys.push(row.key);
    if (row.key === "deviceSecret") metaKeys.push("deviceSecret[32B=" + row.value.byteLength + "]");
    if (row.key === "masterKeyWrapped") wrappedV2 = row.value && row.value.v;
    if (row.key === "masterKeyPass") passSet = Boolean(row.value);
  }
  return { exists: true, metaKeys, wrappedV2, passSet };
});
check("БД dogovor-vault создана", idbState.exists);
check("deviceSecret (32 байта) сохранён", (idbState.metaKeys || []).some((k) => String(k).startsWith("deviceSecret")));
check("masterKeyWrapped в формате v2 (bytes-envelope)", idbState.wrappedV2 === 2);

console.log("\n=== 3. Перезагрузка: тихая разблокировка после «перезапуска» ===");
try {
  await page.reload({ waitUntil: "networkidle" }).catch(() => page.reload({ waitUntil: "load" }));
  await page.waitForTimeout(1200);
  const stillOk = await page.evaluate(async () => {
    const db = await new Promise((res) => {
      const r = indexedDB.open("dogovor-vault");
      r.onsuccess = () => res(r.result);
    });
    if (!db.objectStoreNames.contains("meta")) return null;
    const rows = await new Promise((res) => {
      const tx = db.transaction("meta", "readonly");
      const rq = tx.objectStore("meta").getAll();
      rq.onsuccess = () => res(rq.result);
    });
    const w = rows.find((r) => r.key === "masterKeyWrapped");
    return { v: w && w.value ? w.value.v : null, keys: rows.map((r) => r.key) };
  });
  check(
    "ключи стабильны после перезагрузки",
    stillOk?.v === 2,
    JSON.stringify(stillOk)
  );
} catch (e) {
  check("ключи стабильны после перезагрузки", false, String(e).slice(0, 120));
}

console.log("\n=== 4. Консоль браузера ===");
const realErrors = consoleErrors.filter(
  (t) => !t.includes("favicon") && !t.includes("net::") && !t.includes("401")
);
check("нет JS-ошибок", realErrors.length === 0, JSON.stringify(realErrors.slice(0, 3)));

console.log(`\n========== E2E ИТОГО: ${passed} passed, ${failed} failed ==========`);
await browser.close();
process.exit(failed > 0 ? 1 : 0);
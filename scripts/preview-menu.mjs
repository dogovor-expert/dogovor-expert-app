import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
await p.goto("http://localhost:3000/dev-menu", { waitUntil: "networkidle" }).catch(() => {});
await p.waitForTimeout(1500);

// 1) меню с провайдерами
await p.locator("section").first().locator("button").first().click();
await p.waitForTimeout(500);
const menu1 = p.locator("[role=menu]").first();
console.log("menu1 visible:", await menu1.isVisible());
if (await menu1.isVisible().catch(() => false)) {
  await menu1.screenshot({ path: "C:/Users/alikpc/AppData/Local/Temp/opencode/menu-providers.png" });
}
// клик по «Бэкап» первого провайдера — меню должно закрыться, picked обновиться
const backupBtn = menu1.locator("button", { hasText: "Бэкап" }).first();
if (await backupBtn.isVisible().catch(() => () => false)) {
  await backupBtn.click();
  await p.waitForTimeout(300);
  console.log("picked after click:", await p.locator("text=picked:").innerText());
}
console.log("menu closed after pick:", !(await menu1.isVisible().catch(() => false)));

// 2) пустой список
await p.locator("section").nth(1).locator("button").first().click();
await p.waitForTimeout(400);
const menu2 = p.locator("[role=menu]").first();
if (await menu2.isVisible().catch(() => false)) {
  console.log("empty-state text:", (await menu2.innerText()).replace(/\n/g, " | ").slice(0, 120));
  await menu2.screenshot({ path: "C:/Users/alikpc/AppData/Local/Temp/opencode/menu-empty.png" });
}

// 3) у нижнего края — переворот
await p.locator("section").nth(2).locator("button").first().scrollIntoViewIfNeeded();
await p.locator("section").nth(2).locator("button").first().click();
await p.waitForTimeout(400);
const menu3 = p.locator("[role=menu]").last();
const box = await menu3.boundingBox().catch(() => null);
console.log("bottom-anchored menu box:", box ? `top=${Math.round(box.top)} h=${Math.round(box.height)}` : "not found");
if (box) await menu3.screenshot({ path: "C:/Users/alikpc/AppData/Local/Temp/opencode/menu-flip.png" });

// Esc закрывает
await p.keyboard.press("Escape");
await p.waitForTimeout(200);
console.log("esc closes:", !(await p.locator("[role=menu]").count()));

await b.close();
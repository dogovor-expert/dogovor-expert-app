import { chromium } from "playwright";
const BASE = process.argv[2] || "https://dogovor.expert";
const browser = await chromium.launch();
const page = await (await browser.newContext()).newPage();
const errs = [];
page.on("pageerror", (e) => errs.push(String(e)));
page.on("console", (m) => { if (m.type() === "error" && !m.text().includes("401") && !m.text().includes("503")) errs.push("C:" + m.text()); });

// ФОРМА (без предпросмотра) — именно тот случай, что был сломан
await page.goto(BASE + "/builder?template=rental-flat", { waitUntil: "load" });
await page.waitForSelector("#print-root img", { timeout: 25000 }).catch(() => {});
await page.waitForTimeout(800);

const info1 = await page.evaluate(() => {
  const root = document.getElementById("print-root");
  return { printRootExists: !!root, images: root ? root.querySelectorAll("img").length : 0 };
});
console.log("form view (no preview):", JSON.stringify(info1));

// Эмулируем печать
await page.emulateMedia({ media: "print" });
await page.waitForTimeout(400);
const info2 = await page.evaluate(() => {
  const root = document.getElementById("print-root");
  const cs = (el, p) => el ? getComputedStyle(el)[p] : "N/A";
  return { rootVisibility: cs(root, "visibility"), rootPosition: cs(root, "position"), rootDisplay: cs(root, "display"), imgs: root ? root.querySelectorAll("img").length : 0 };
});
console.log("print emu:", JSON.stringify(info2));
await page.pdf({ path: "C:/Users/alikpc/AppData/Local/Temp/opencode/builder-print.pdf", printBackground: true, preferCSSPageSize: true }).catch((e) => console.log("pdf err", String(e)));
const fs = await import("fs");
if (fs.existsSync("C:/Users/alikpc/AppData/Local/Temp/opencode/builder-print.pdf")) {
  const buf = fs.readFileSync("C:/Users/alikpc/AppData/Local/Temp/opencode/builder-print.pdf");
  const pages = (buf.toString("latin1").match(/\/Type\s*\/Page[^s]/g) || []).length;
  console.log("builder pdf:", buf.length, "bytes, pages~", pages);
}
console.log("errors:", errs.length ? errs : "none");
await browser.close();

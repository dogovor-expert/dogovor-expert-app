import { chromium } from "playwright";
const baseUrl = process.argv[2] || "http://localhost:3000";
const browser = await chromium.launch();
const page = await (await browser.newContext()).newPage();
const errs = [];
page.on("pageerror", (e) => errs.push(String(e)));
page.on("console", (m) => { if (m.type() === "error") errs.push("CONSOLE: " + m.text()); });
await page.goto(`${baseUrl}/preview?template=rental-flat`, { waitUntil: "load", timeout: 30000 });
await page.waitForSelector("#print-root img", { timeout: 20000 }).catch(() => {});
const imgCount = await page.locator("#print-root img").count();
// Эмулируем печать
await page.emulateMedia({ media: "print" });
await page.waitForTimeout(500);
const info = await page.evaluate(() => {
  const root = document.getElementById("print-root");
  const header = document.querySelector("header");
  const cs = (el, p) => el ? getComputedStyle(el)[p] : "N/A";
  return {
    matchMediaPrint: window.matchMedia("print").matches,
    printRootVisibility: cs(root, "visibility"),
    printRootPosition: root ? getComputedStyle(root).position : "N/A",
    printRootDisplay: root ? getComputedStyle(root).display : "N/A",
    headerVisibility: cs(header, "visibility"),
    headerDisplay: cs(header, "display"),
    images: root ? root.querySelectorAll("img").length : 0,
  };
});
console.log("imgCount(onload):", imgCount);
console.log("print media info:", JSON.stringify(info, null, 2));
await page.screenshot({ path: "C:/Users/alikpc/AppData/Local/Temp/opencode/print-emu.png", fullPage: true });
console.log("errors:", errs.length ? errs : "none");
// Реальная генерация PDF (Playwright рендерит именно в print-медиа) —
// это то, что увидит принтер.
const pdfPath = "C:/Users/alikpc/AppData/Local/Temp/opencode/print-out.pdf";
await page.pdf({ path: pdfPath, printBackground: true, preferCSSPageSize: true }).catch((e) => console.log("pdf error:", String(e)));
const fs = await import("fs");
if (fs.existsSync(pdfPath)) {
  const buf = fs.readFileSync(pdfPath);
  const pages = (buf.toString("latin1").match(/\/Type\s*\/Page[^s]/g) || []).length;
  console.log("pdf:", buf.length, "bytes, pages~", pages);
}
await browser.close();

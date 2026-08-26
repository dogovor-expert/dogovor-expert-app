import { chromium } from "playwright";

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto("http://localhost:3000/preview?template=rental-flat", { waitUntil: "networkidle" }).catch(() => {});
await page.waitForTimeout(5000);

// Check if images are rendered in #print-root
const imgs = await page.locator("#print-root img").count();
console.log("Images in print-root:", imgs);

if (imgs > 0) {
  const src = await page.locator("#print-root img").first().getAttribute("src");
  console.log("First image src length:", src?.length || 0);
}

const pages = await page.locator("#print-root img").count();
console.log("Total pages rendered:", pages);

// Check for console errors
const consoleErrors = [];
page.on("console", (msg) => {
  if (msg.type() === "error") console.log("CONSOLE ERROR:", msg.text());
});
page.on("pageerror", (e) => console.log("PAGE ERROR:", String(e)));

await page.waitForTimeout(2000);
console.log("Done");
await browser.close();
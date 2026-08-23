import { chromium } from "playwright";
const path = "file:///D:/scanner-concepts.html";
const errors = [];
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 414, height: 860 } });
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", (e) => errors.push("PAGEERR: " + e.message));
await page.goto(path, { waitUntil: "load" });

// Concept 1: shutter -> sheet
await page.click("#shot1");
await page.waitForTimeout(1600);
const c1sheet = await page.$eval("#c1-sheet", (el) => el.classList.contains("on"));
const c1fields = await page.$$eval("#c1-body .field", (els) => els.length);
await page.click("#c1-sheet .x");

// Concept 2: scan (good)
await page.click('#switcher button[data-c="2"]');
await page.click("#c2scan");
await page.waitForTimeout(1500);
const c2on = await page.$eval("#c2result", (el) => el.classList.contains("on"));
const c2rows = await page.$$eval("#c2result .frow", (els) => els.length);

// Concept 2 with poor quality
await page.click("#qbadge");
await page.click("#c2scan");
await page.waitForTimeout(1500);
const c2err = await page.$eval("#c2result .err-card", (el) => !!el).catch(() => false);

// Concept 3 wizard (drive via evaluate to avoid visibility race)
await page.click("#qbadge"); // poor off
await page.click('#switcher button[data-c="3"]');
await page.evaluate(() => wizGo(2));
await page.waitForTimeout(300);
const wiz2vis = await page.$eval("#wiz2", (el) => el.style.display !== "none");
await page.evaluate(() => capture(3));
await page.waitForTimeout(1600);
const wiz3vis = await page.$eval("#wiz3", (el) => el.style.display !== "none");
const wiz3fields = await page.$$eval("#wiz3body .field", (els) => els.length);

// Concept 3 wizard with poor quality -> error path
await page.evaluate(() => { document.getElementById("qbadge").click(); }); // poor on
await page.evaluate(() => wizGo(2));
await page.waitForTimeout(300);
await page.evaluate(() => capture(3));
await page.waitForTimeout(1600);
const wiz3err = await page.$eval("#wiz3body .err-card", (el) => !!el).catch(() => false);

console.log(JSON.stringify({
  c1sheet, c1fields, c2on, c2rows, c2err, wiz2vis, wiz3vis, wiz3fields, wiz3err, errors,
}, null, 1));
await browser.close();

import { chromium } from "playwright";
const PROXY = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
const proxyOpt = PROXY ? (() => { const m = PROXY.match(/^https?:\/\/([^:@]+):([^@]+)@(.+)$/); return m ? { server: "http://" + m[3], username: m[1], password: m[2] } : { server: PROXY }; })() : undefined;
const browser = await chromium.launch({ headless: true, proxy: proxyOpt });
const page = await browser.newPage();
const errs = [];
page.on("pageerror", e => errs.push("PAGEERR: " + e.message));
page.on("console", m => { if (m.type() === "error") errs.push("CONSOLE: " + m.text()); });
const url = "file:///" + process.cwd().replace(/\\/g, "/") + "/builder-panels-redesign.html";
await page.goto(url, { waitUntil: "load", timeout: 30000 });
await page.waitForTimeout(800);

async function snap(tag){
  const info = await page.evaluate(() => ({
    panelLen: document.getElementById("panel").innerHTML.length,
    tabs: document.querySelectorAll("[data-tab]").length,
    variantBtns: document.querySelectorAll(".var-btn").length,
  }));
  console.log(tag, JSON.stringify(info));
}

// A / tools (default)
await snap("A/tools");
// click first upload tile
await page.click("[data-upload]");
await page.waitForTimeout(300);
const afterUpload = await page.evaluate(() => document.querySelectorAll("[data-reshoot]").length);
console.log("UPLOAD_TILES_AFTER_CLICK:", afterUpload);

// switch to audit tab
await page.click('[data-tab="audit"]');
await page.waitForTimeout(200);
await snap("A/audit");

// switch variant B
await page.click('[data-variant="B"]');
await page.waitForTimeout(200);
await snap("B/tools");
await page.click('[data-tab="audit"]');
await page.waitForTimeout(200);
await snap("B/audit");

// variant C
await page.click('[data-variant="C"]');
await page.waitForTimeout(200);
await page.click('[data-tab="tools"]');
await page.waitForTimeout(200);
await snap("C/tools");
await page.click('[data-upload]');
await page.waitForTimeout(200);
const cUpload = await page.evaluate(() => document.querySelectorAll("[data-reshoot]").length);
console.log("C_UPLOAD_TILES:", cUpload);

console.log("ERRORS:", errs.length ? JSON.stringify(errs) : "none");
await browser.close();

import { chromium } from "playwright";

const PROXY = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
const proxyOpt = PROXY ? (() => { const m = PROXY.match(/^https?:\/\/([^:@]+):([^@]+)@(.+)$/); return m ? { server: "http://" + m[3], username: m[1], password: m[2] } : { server: PROXY }; })() : undefined;

const browser = await chromium.launch({ headless: true, proxy: proxyOpt });
const page = await browser.newPage();

const allReq = [];
const consoleMsgs = [];
page.on("response", (r) => {
  const u = r.url();
  if (u.includes("inzuro") || u.includes("polis.online") || u.includes("widget")) {
    allReq.push({ url: u, status: r.status(), ct: r.headers()["content-type"] });
  }
});
page.on("requestfailed", (r) => {
  allReq.push({ url: r.url(), failed: true, err: r.failure()?.errorText });
});
page.on("console", (m) => consoleMsgs.push(`[${m.type()}] ${m.text()}`));
page.on("pageerror", (e) => consoleMsgs.push(`[pageerror] ${e.message}`));

await page.goto("https://dogovor.expert/osago", { waitUntil: "domcontentloaded", timeout: 45000 });
await page.waitForTimeout(1200);
try {
  await page.check('input[type="checkbox"]', { timeout: 5000 });
  await page.click('button:has-text("Открыть калькулятор ОСАГО")', { timeout: 5000 });
} catch (e) { console.log("CONSENT_ERR:", e.message); }

await page.waitForTimeout(9000);

const el = await page.evaluate(() => {
  const e = document.querySelector("polis-online-widget-osago");
  if (!e) return { present: false };
  const sr = e.shadowRoot;
  return {
    present: true,
    defined: !!customElements.get("polis-online-widget-osago"),
    hasShadow: !!sr,
    shadowHTML: sr ? sr.innerHTML.slice(0, 500) : null,
    childCount: e.children.length,
  };
});

console.log("ELEMENT:", JSON.stringify(el, null, 2));
console.log("REQUESTS:", JSON.stringify(allReq, null, 2));
console.log("CONSOLE:", JSON.stringify(consoleMsgs, null, 2));
await browser.close();

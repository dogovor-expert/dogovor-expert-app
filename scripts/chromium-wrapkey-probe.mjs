// Проверка поведения wrapKey(non-extractable) в реальном Chromium.
// Запуск: node scripts/chromium-wrapkey-probe.mjs
import { chromium } from "playwright";

const browser = await chromium.launch();
const result = await (async () => {
  const page = await browser.newPage();
  await page.goto("http://localhost:3000/connections", { waitUntil: "domcontentloaded" });
  return await page.evaluate(async () => {
    const out = {};
    const subtle = window.crypto.subtle;
    // Точно как в keyManager.ts: extractable=false
    let master, device;
    try {
      device = await subtle.generateKey({ name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt", "wrapKey", "unwrapKey"]);
      master = await subtle.generateKey({ name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt", "wrapKey", "unwrapKey"]);
    } catch (e) { out.generate = String(e); return out; }
    try {
      const iv = crypto.getRandomValues(new Uint8Array(12));
      await subtle.wrapKey("raw", master, device, { name: "AES-GCM", iv });
      out.wrapNonExtractable = "OK";
    } catch (e) {
      out.wrapNonExtractable = String(e && e.name ? `${e.name}: ${e.message}` : e);
    }
    // Контроль: extractable=true — работает ли wrapKey вообще
    try {
      const m2 = await subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt", "wrapKey", "unwrapKey"]);
      const iv2 = crypto.getRandomValues(new Uint8Array(12));
      await subtle.wrapKey("raw", m2, device, { name: "AES-GCM", iv: iv2 });
      out.wrapExtractable = "OK";
    } catch (e) { out.wrapExtractable = String(e); }
    out.userAgent = navigator.userAgent;
    return out;
  });
})();

await browser.close();
console.log(JSON.stringify(result, null, 2));
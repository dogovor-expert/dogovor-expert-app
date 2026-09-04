// Перехватчик: загружает /builder, грузит фото в слот, перехватывает
// все Web Worker'ы и логирует их postMessage в window.__postLog.
// Особенно интересуют сообщения, у которых в data.type === "result"
// — это и есть распознанный текст от tesseract-воркера.
import { chromium } from "playwright";
import { resolve } from "node:path";

function arg(name, fb) { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : fb; }

const stateArg = arg("--state") || "";
const DOC = resolve(arg("--doc") || "C:\\Users\\alikpc\\AppData\\Local\\Temp\\opencode\\docs\\Scan_20260831_002103.jpg");
const SLOT_LABEL = arg("--slot") || "Паспорт Продавца — стр. 2–3 (разворот)";

const browser = await chromium.launch({ headless: true, channel: "chromium" });
const ctx = await browser.newContext({ storageState: resolve(stateArg) });

// init-script ПЕРЕД загрузкой страницы — патчит Worker И postMessage
await ctx.addInitScript(() => {
  const OrigWorker = window.Worker;
  window.__postLog = [];
  function logMessage(d) {
    try {
      if (d && (d.type === "result" || d.type === "error" || d.text || d.confidence != null)) {
        window.__postLog.push({
          when: Date.now(),
          type: d.type,
          text_len: d.text?.length ?? 0,
          text: d.text ?? null,
          confidence: d.confidence ?? null,
          words: d.words?.length ?? 0,
          errorText: d.errorText ?? null,
          ok: d.ok ?? null,
          filled: d.filled ?? null,
          missing: d.missing ?? null,
          filledFields: d.filledFields ?? null,
        });
      }
    } catch {}
  }
  function Patched(url, opts) {
    const w = new OrigWorker(url, opts);
    // addEventListener
    const origAdd = w.addEventListener.bind(w);
    w.addEventListener = function (type, fn, ...rest) {
      if (type === "message") {
        return origAdd(type, (e) => { logMessage(e.data); return fn(e); }, ...rest);
      }
      return origAdd(type, fn, ...rest);
    };
    // onmessage setter
    let _onmsg = null;
    Object.defineProperty(w, "onmessage", {
      get() { return _onmsg; },
      set(fn) {
        _onmsg = fn;
        origAdd("message", (e) => { logMessage(e.data); return fn(e); });
      },
    });
    return w;
  }
  Patched.prototype = OrigWorker.prototype;
  window.Worker = Patched;
});

const page = await ctx.newPage();
page.on("console", (m) => {
  if (m.type() === "error" || m.type() === "warning") {
    console.log(`[browser ${m.type()}]`, m.text().slice(0, 200));
  }
});

console.log("→ /builder?template=dkp-auto-short");
await page.goto("https://dogovor.expert/builder?template=dkp-auto-short", { waitUntil: "networkidle" });
await page.waitForTimeout(3000);

const showBtn = page.getByRole("button", { name: "Показать сканер документов" });
if (await showBtn.count()) { await showBtn.click(); await page.waitForTimeout(1500); }

const slotText = page.locator(`p:text-is("${SLOT_LABEL}")`).first();
await slotText.scrollIntoViewIfNeeded();
const tile = page.locator("div.rounded-2xl").filter({ has: page.locator(`p:text-is("${SLOT_LABEL}")`) }).first();
const fileInput = tile.locator('input[type="file"]').first();

console.log(`→ setInputFiles ${DOC}`);
await fileInput.setInputFiles(DOC);

console.log("→ ждём 30с…");
await page.waitForTimeout(30_000);

const postLog = await page.evaluate(() => window.__postLog);
console.log("\n=== ПЕРЕХВАЧЕННЫЕ СООБЩЕНИЯ ВОРКЕРА ===");
for (const m of postLog) {
  console.log(JSON.stringify({
    when: new Date(m.when).toISOString().slice(11, 19),
    type: m.type,
    ok: m.ok,
    filled: m.filled,
    confidence: m.confidence,
    text_len: m.text_len,
    text_preview: m.text?.slice(0, 400),
    words: m.words,
    missing: m.missing,
    filledFields: m.filledFields,
    errorText: m.errorText,
  }, null, 2));
}

await browser.close();

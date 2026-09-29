// Растеризация PDF в PNG для визуальной проверки.
// Важно: @napi-rs/canvas падает с 0xC0000005 (сегфолт) на встроенных
// картинках, поэтому рендерим pdf.js прямо в Chromium через Playwright.
// Использование: node scripts/pdf-rasterize.mjs [фильтр]
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "playwright";

const SRC = "C:\\Users\\alikpc\\seo-tmp\\exports";
const OUT = "C:\\Users\\alikpc\\seo-tmp\\pdfpng";
await mkdir(OUT, { recursive: true });

const pdfjsSrc = await readFile("node_modules/pdfjs-dist/build/pdf.min.mjs", "utf8");
const workerSrc = await readFile("node_modules/pdfjs-dist/build/pdf.worker.min.mjs", "utf8");

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 1700 } });
await page.goto("about:blank");

const files = (await readdir(SRC)).filter((f) => f.endsWith(".pdf")).sort();
const only = process.argv[2];
for (const f of files) {
  if (only && !f.includes(only)) continue;
  try {
    const b64 = (await readFile(join(SRC, f))).toString("base64");
    const png = await page.evaluate(
      async ({ b64, pdfjsSrc, workerSrc }) => {
        const mk = (src) => URL.createObjectURL(new Blob([src], { type: "text/javascript" }));
        const pdfjs = await import(mk(pdfjsSrc));
        pdfjs.GlobalWorkerOptions.workerSrc = mk(workerSrc);
        const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
        const doc = await pdfjs.getDocument({ data: bin }).promise;
        const pg = await doc.getPage(1);
        const vp = pg.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        canvas.width = Math.ceil(vp.width);
        canvas.height = Math.ceil(vp.height);
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await pg.render({ canvasContext: ctx, viewport: vp, canvas }).promise;
        return {
          url: canvas.toDataURL("image/png"),
          pages: doc.numPages,
          w: Math.round(vp.width / 2),
          h: Math.round(vp.height / 2),
        };
      },
      { b64, pdfjsSrc, workerSrc },
    );
    await writeFile(join(OUT, f.replace(/\.pdf$/, ".png")), Buffer.from(png.url.split(",")[1], "base64"));
    console.log(`OK ${f}  страниц:${png.pages}  ${png.w}x${png.h}pt`);
  } catch (e) {
    console.log(`ERR ${f}: ${String(e && e.message ? e.message : e).slice(0, 300)}`);
  }
}
await browser.close();
console.log("готово");



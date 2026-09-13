/**
 * Генерация статических превью-картинок для /blanks/[slug].
 *
 * Идея: превью должно быть побайтово тем же, что скачает пользователь.
 * Поэтому мы используем ТОТ ЖЕ движок, что кнопка «Скачать PDF»
 * (renderTemplateDocument(blank) -> buildPdf(design:"classic")), и
 * растеризуем страницы PDF в JPG на этапе генерации (здесь, один раз),
 * а не в браузере пользователя. Результат кладётся в public/blank-previews/
 * и коммитится — страница /blanks/[slug] отдаёт обычный <img>, оставаясь
 * полностью статической (SEO, слабый интернет, без лишнего JS).
 *
 * Запуск:  npx tsx scripts/generate-blank-previews.mts
 *          LIMIT=5 npx tsx scripts/generate-blank-previews.mts   (для проверки)
 */
import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { pathToFileURL, fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { JSDOM } from "jsdom";
import sharp from "sharp";
import { createCanvas } from "@napi-rs/canvas";

// --- полифилы DOM, нужные buildPdf в Node ---
const { window } = new JSDOM("");
for (const k of ["DOMParser", "document", "Node", "HTMLElement", "Element", "Image"]) {
  (globalThis as any)[k] = (window as any)[k];
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const OUT_DIR = resolve(root, "public/blank-previews");

const { LEGAL_TEMPLATES } = await import("@/data/templates");
const { TEMPLATE_PREVIEWS } = await import("@/data/templatePreviews");
const { renderTemplateDocument } = await import("@/lib/renderDocument");
const { buildPdf } = await import("@/lib/exportPdf");

// --- шрифты читаем локально (buildPdf иначе делает fetch относительного URL) ---
const fontDir = resolve(root, "public/fonts");
const readFont = async (n: string) => new Uint8Array(await readFile(resolve(fontDir, n)));
const CLASSIC_FONTS = {
  regular: await readFont("pt-serif-regular.ttf"),
  bold: await readFont("pt-serif-bold.ttf"),
  italic: await readFont("pt-serif-italic.ttf"),
  bolditalic: await readFont("pt-serif-bolditalic.ttf"),
};

// --- pdfjs (Node) + @napi-rs/canvas ---
const pdfjs: any = await import("pdfjs-dist/legacy/build/pdf.mjs");
const workerPath = resolve(root, "node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs");
pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).href;

async function rasterizeFirstPages(pdfBytes: Uint8Array): Promise<Buffer[]> {
  const doc = await pdfjs.getDocument({ data: pdfBytes }).promise;
  const out: Buffer[] = [];
  const canvasFactory: any = pdfjs.canvasFactory;
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale: 1.5 });
    const w = Math.floor(viewport.width);
    const h = Math.floor(viewport.height);
    const cc =
      canvasFactory && canvasFactory.create
        ? canvasFactory.create(w, h)
        : (() => {
            const c = createCanvas(w, h);
            return { canvas: c, context: c.getContext("2d") };
          })();
    const ctx = cc.context;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, cc.canvas.width, cc.canvas.height);
    await page.render({ canvasContext: ctx, viewport, canvas: cc.canvas }).promise;
    out.push((cc.canvas as any).toBuffer("image/png"));
    page.cleanup();
  }
  // Явная очистка транспорта/воркера, т.к. doc.destroy() в v6 убран,
  // иначе при 369 итерациях воркеры накапливаются.
  try {
    await (doc as any)._transport?.destroy?.();
  } catch {}
  try {
    await (doc as any).destroy?.();
  } catch {}
  if (typeof (globalThis as any).gc === "function") (globalThis as any).gc();
  return out;
}

async function main() {
  const LIMIT = process.env.LIMIT ? parseInt(process.env.LIMIT, 10) : Infinity;
  await mkdir(OUT_DIR, { recursive: true });

  const templates = LEGAL_TEMPLATES.slice(0, Math.min(LIMIT, LEGAL_TEMPLATES.length));
  const manifest: Record<string, number> = {};

  let done = 0;
  for (const t of templates) {
    const previewTemplate = TEMPLATE_PREVIEWS[t.id] ?? (t as any).previewTemplate;
    if (!previewTemplate) {
      console.warn(`! нет previewTemplate для ${t.id} — пропускаем`);
      continue;
    }
    const html = renderTemplateDocument(t, {}, { previewTemplate, blank: true, blankMode: "pdf" });
    const { blob } = await buildPdf(html, { design: "classic", pageNumbers: true, fonts: CLASSIC_FONTS });
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const pages = await rasterizeFirstPages(bytes);
    for (let i = 0; i < pages.length; i++) {
      const avif = await sharp(pages[i], { limitInputPixels: false })
        .avif({ quality: 60, effort: 5 })
        .toBuffer();
      await writeFile(resolve(OUT_DIR, `${t.id}-${i + 1}.avif`), avif);
    }
    manifest[t.id] = pages.length;
    done++;
    if (done % 25 === 0 || done === templates.length) {
      console.log(`  ${done}/${templates.length} -> ${t.id} (${pages.length} стр.)`);
    }
  }

  await writeFile(resolve(OUT_DIR, "index.json"), JSON.stringify(manifest, null, 2));
  console.log(`Готово. Сгенерировано превью для ${done} шаблонов -> public/blank-previews/`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

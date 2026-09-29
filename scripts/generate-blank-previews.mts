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
 *          LIMIT=5 npx tsx scripts/generate-blank-previews.mts          (проверка)
 *          ONLY_MISSING=1 npx tsx scripts/generate-blank-previews.mts   (догенерация)
 *
 * ONLY_MISSING дополняет существующий index.json и не трогает уже
 * сгенерированные бланки — иначе каждый новый шаблон перетирал бы все 570
 * бинарников в диффе.
 */
import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { pathToFileURL, fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { JSDOM } from "jsdom";
import sharp from "sharp";
import { createCanvas, Path2D as NapiPath2D, DOMMatrix as NapiDOMMatrix } from "@napi-rs/canvas";

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

// --- Path2D/DOMMatrix: ЕДИНЫЙ экземпляр классов ---
// pdfjs-dist при загрузке в Node сам полифиллит `globalThis.Path2D` /
// `globalThis.DOMMatrix`, но делает это через CJS `require("@napi-rs/canvas")`.
// Из-за dual-package hazard это ДРУГИЕ объекты классов, чем те, что отдаёт
// ESM-импорт, из которого мы берём `createCanvas`. pdfjs рисует глифы
// через `ctx.fill(path2D)`, @napi-rs/canvas проверяет `instanceof` и падает
// с «Value is none of these types `String`, `Path`».
// Поэтому назначаем глобали из ESM-импорта ДО загрузки pdf.mjs — его
// `if (!globalThis.Path2D)` тогда просто ничего не перезаписывает.
for (const [key, value] of [["Path2D", NapiPath2D], ["DOMMatrix", NapiDOMMatrix]] as const) {
  if (!(globalThis as any)[key]) (globalThis as any)[key] = value;
}

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
  // ONLY_MISSING=1 — догенерировать только шаблоны без превью.
  // Полная перегенерация всех 570 бланков при добавлении одного шаблона
  // даёт ~570 изменённых бинарников в диффе, поэтому по умолчанию
  // пропускаем то, что уже сгенерировано.
  const ONLY_MISSING = process.env.ONLY_MISSING === "1";
  await mkdir(OUT_DIR, { recursive: true });

  // Существующий манифест — база: скрипт дополняет его, а не перезаписывает.
  const manifest: Record<string, number> = {};
  try {
    const prev = JSON.parse(await readFile(resolve(OUT_DIR, "index.json"), "utf8"));
    Object.assign(manifest, prev);
  } catch {}

  const existingFiles = new Set(await readdir(OUT_DIR));
  const hasPreview = (id: string) => manifest[id] > 0 && existingFiles.has(`${id}-1.avif`);

  const templates = ONLY_MISSING
    ? LEGAL_TEMPLATES.filter((t) => !hasPreview(t.id))
    : LEGAL_TEMPLATES;

  let done = 0;
  for (const t of templates) {
    if (done >= LIMIT) break;
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
    if (done % 25 === 0) {
      console.log(`  ${done} сгенерировано... последний: ${t.id} (${pages.length} стр.)`);
    }
  }

  await writeFile(resolve(OUT_DIR, "index.json"), JSON.stringify(manifest, null, 2));
  console.log(
    `Готово. Сгенерировано превью для ${done} шаблонов ` +
      `(всего в манифесте ${Object.keys(manifest).length}) -> public/blank-previews/`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

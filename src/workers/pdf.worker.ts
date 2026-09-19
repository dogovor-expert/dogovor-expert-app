/**
 * Web Worker для тяжёлых клиентских PDF-операций
 * (merge/split/imagesToPdf/organize/watermark/pageNumbers).
 * Изолирует pdf-lib (≈400 KB) от main thread — UI не зависает на 5-15 секунд
 * при работе с большими файлами. Списывает с UI-потока все блокирующие операции
 * (PDFDocument.create, copyPages, save, embedPng/Jpg, embedFont) и шлёт прогресс обратно.
 *
 * NB: Web Workers не имеют доступа к DOM. Все данные — через transferable objects
 * (ArrayBuffer / Uint8Array) с минимальной сериализацией.
 */
/// <reference lib="webworker" />

import {
  PDFDocument,
  degrees,
  rgb,
  PDFRawStream,
  PDFDict,
  PDFName,
  PDFNumber,
  PDFArray,
  PDFBool,
} from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

export type PdfWorkerRequest =
  | {
      type: "merge";
      jobId: string;
      files: { name: string; bytes: ArrayBuffer }[];
    }
  | {
      type: "split";
      jobId: string;
      bytes: ArrayBuffer;
      ranges: { from: number; to: number; suffix: string }[];
    }
  | {
      type: "imagesToPdf";
      jobId: string;
      images: { name: string; bytes: ArrayBuffer; mime: string }[];
      orientation: "auto" | "portrait" | "landscape";
      marginMm: number;
    }
  | {
      type: "organize";
      jobId: string;
      bytes: ArrayBuffer;
      pages: { index: number; rotate: number }[];
    }
  | {
      type: "watermark";
      jobId: string;
      bytes: ArrayBuffer;
      text: string;
      fontSize: number;
      opacity: number;
      angleDeg: number;
      color: { r: number; g: number; b: number };
      tile: boolean;
      fontUrl: string;
    }
  | {
      type: "pageNumbers";
      jobId: string;
      bytes: ArrayBuffer;
      position:
        | "bottom-center"
        | "bottom-right"
        | "bottom-left"
        | "top-center"
        | "top-right"
        | "top-left";
      startNumber: number;
      fontSize: number;
      format: "n" | "n-of-total" | "dash";
      fontUrl: string;
    }
  | {
      type: "compress";
      jobId: string;
      bytes: ArrayBuffer;
      /** Режим: "inplace" — пережать встроенные изображения, текст остаётся текстом;
       *  "scan" — растеризовать страницы в JPEG (для сканов/фото). */
      mode: "inplace" | "scan";
      /** Для inplace: максимальная сторона изображения в px (уменьшение DPI). */
      maxDimensionPx: number;
      /** Качество JPEG при перекодировании (0–1). */
      jpegQuality: number;
    }
  | {
      type: "textToPdf";
      jobId: string;
      /** Исходный текст (UTF-8, кириллица поддерживается). */
      text: string;
      /** Имя итогового файла (без расширения). */
      fileName: string;
      /** URL шрифта с кириллицей. */
      fontUrl: string;
    };

export type PdfWorkerResponse =
  | { type: "progress"; jobId: string; current: number; total: number; phase: string }
  | { type: "result"; jobId: string; payload: ArrayBuffer; meta?: { name?: string; info?: Record<string, unknown> } }
  | { type: "results"; jobId: string; outputs: { name: string; bytes: ArrayBuffer }[] }
  | { type: "error"; jobId: string; message: string };

const ctx: DedicatedWorkerGlobalScope = self as unknown as DedicatedWorkerGlobalScope;

function post(msg: PdfWorkerResponse, transfer: Transferable[] = []): void {
  ctx.postMessage(msg, transfer);
}

function toArrayBuffer(saved: Uint8Array): ArrayBuffer {
  return saved.buffer.slice(saved.byteOffset, saved.byteOffset + saved.byteLength) as ArrayBuffer;
}

/** Загружает и встраивает шрифт с кириллицей по URL (для подписей/водяных знаков). */
async function embedCyrillicFont(doc: PDFDocument, fontUrl: string) {
  doc.registerFontkit(fontkit);
  const res = await fetch(fontUrl);
  if (!res.ok) throw new Error(`font_load_failed: ${res.status}`);
  const fontBytes = await res.arrayBuffer();
  return doc.embedFont(fontBytes, { subset: true });
}

async function handleMerge(
  jobId: string,
  files: { name: string; bytes: ArrayBuffer }[]
): Promise<void> {
  try {
    const out = await PDFDocument.create();
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      post({ type: "progress", jobId, current: i, total: files.length, phase: "merge" });
      const src = await PDFDocument.load(f.bytes, { ignoreEncryption: true });
      const indices = src.getPageIndices();
      const pages = await out.copyPages(src, indices);
      pages.forEach((p) => out.addPage(p));
    }
    post({ type: "progress", jobId, current: files.length, total: files.length, phase: "save" });
    const saved = await out.save({ useObjectStreams: true });
    // Копируем в ArrayBuffer (transferable), освобождая underlying ArrayBuffer.
    const ab = toArrayBuffer(saved);
    post({ type: "result", jobId, payload: ab, meta: { name: "merged.pdf" } }, [ab]);
  } catch (e) {
    post({ type: "error", jobId, message: e instanceof Error ? e.message : "merge_failed" });
  }
}

async function handleSplit(
  jobId: string,
  bytes: ArrayBuffer,
  ranges: { from: number; to: number; suffix: string }[]
): Promise<void> {
  try {
    const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const outputs: { name: string; bytes: ArrayBuffer }[] = [];
    for (let i = 0; i < ranges.length; i++) {
      const { from, to, suffix } = ranges[i];
      post({ type: "progress", jobId, current: i, total: ranges.length, phase: "split" });
      const out = await PDFDocument.create();
      const indices: number[] = [];
      for (let p = from; p <= to; p++) indices.push(p);
      const pages = await out.copyPages(src, indices);
      pages.forEach((p) => out.addPage(p));
      const saved = await out.save({ useObjectStreams: true });
      outputs.push({ name: `${suffix}.pdf`, bytes: toArrayBuffer(saved) });
    }
    const transfers = outputs.map((o) => o.bytes);
    post({ type: "results", jobId, outputs }, transfers);
  } catch (e) {
    post({ type: "error", jobId, message: e instanceof Error ? e.message : "split_failed" });
  }
}

async function handleImagesToPdf(
  jobId: string,
  images: { name: string; bytes: ArrayBuffer; mime: string }[],
  orientation: "auto" | "portrait" | "landscape",
  marginMm: number
): Promise<void> {
  try {
    const A4_W = 595.28;
    const A4_H = 841.89;
    const MARGIN_PT = marginMm * 2.835; // 1mm = 2.835pt
    const out = await PDFDocument.create();
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      post({ type: "progress", jobId, current: i, total: images.length, phase: "embed" });
      let embedded;
      if (img.mime === "image/png") {
        embedded = await out.embedPng(img.bytes);
      } else if (img.mime === "image/jpeg" || img.mime === "image/jpg") {
        embedded = await out.embedJpg(img.bytes);
      } else {
        throw new Error(`unsupported_image_type: ${img.mime}`);
      }
      const { width, height } = embedded.scale(1);
      const isLandscape = width > height;
      const useLandscape = orientation === "landscape" || (orientation === "auto" && isLandscape);
      const pageW = useLandscape ? A4_H : A4_W;
      const pageH = useLandscape ? A4_W : A4_H;
      const page = out.addPage([pageW, pageH]);
      const maxW = pageW - MARGIN_PT * 2;
      const maxH = pageH - MARGIN_PT * 2;
      const ratio = Math.min(maxW / width, maxH / height, 1);
      const w = width * ratio;
      const h = height * ratio;
      page.drawImage(embedded, {
        x: (pageW - w) / 2,
        y: (pageH - h) / 2,
        width: w,
        height: h,
      });
    }
    post({ type: "progress", jobId, current: images.length, total: images.length, phase: "save" });
    const saved = await out.save({ useObjectStreams: true });
    const ab = toArrayBuffer(saved);
    post({ type: "result", jobId, payload: ab, meta: { name: "images.pdf" } }, [ab]);
  } catch (e) {
    post({ type: "error", jobId, message: e instanceof Error ? e.message : "images_to_pdf_failed" });
  }
}

/** Сборка нового документа из выбранных страниц в заданном порядке (+ поворот каждой). */
async function handleOrganize(
  jobId: string,
  bytes: ArrayBuffer,
  plan: { index: number; rotate: number }[]
): Promise<void> {
  try {
    const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const out = await PDFDocument.create();
    const indices = plan.map((p) => p.index);
    const copied = await out.copyPages(src, indices);
    for (let i = 0; i < copied.length; i++) {
      post({ type: "progress", jobId, current: i, total: copied.length, phase: "pages" });
      const page = copied[i];
      const rotate = plan[i].rotate;
      if (rotate) {
        const base = page.getRotation().angle;
        page.setRotation(degrees((((base + rotate) % 360) + 360) % 360));
      }
      out.addPage(page);
    }
    post({ type: "progress", jobId, current: copied.length, total: copied.length, phase: "save" });
    const saved = await out.save({ useObjectStreams: true });
    const ab = toArrayBuffer(saved);
    post({ type: "result", jobId, payload: ab, meta: { name: "pages.pdf" } }, [ab]);
  } catch (e) {
    post({ type: "error", jobId, message: e instanceof Error ? e.message : "organize_failed" });
  }
}

async function handleWatermark(
  jobId: string,
  bytes: ArrayBuffer,
  opts: {
    text: string;
    fontSize: number;
    opacity: number;
    angleDeg: number;
    color: { r: number; g: number; b: number };
    tile: boolean;
    fontUrl: string;
  }
): Promise<void> {
  try {
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const font = await embedCyrillicFont(doc, opts.fontUrl);
    const pages = doc.getPages();
    for (let i = 0; i < pages.length; i++) {
      post({ type: "progress", jobId, current: i, total: pages.length, phase: "watermark" });
      const page = pages[i];
      const { width, height } = page.getSize();
      const textWidth = font.widthOfTextAtSize(opts.text, opts.fontSize);
      const draw = (x: number, y: number) =>
        page.drawText(opts.text, {
          x,
          y,
          size: opts.fontSize,
          font,
          color: rgb(opts.color.r, opts.color.g, opts.color.b),
          opacity: opts.opacity,
          rotate: degrees(opts.angleDeg),
        });
      if (opts.tile) {
        const stepX = textWidth + opts.fontSize * 4;
        const stepY = opts.fontSize * 7;
        for (let y = -height; y < height * 2; y += stepY) {
          for (let x = -width; x < width * 2; x += stepX) draw(x, y);
        }
      } else {
        draw((width - textWidth) / 2, (height - opts.fontSize) / 2);
      }
    }
    post({ type: "progress", jobId, current: pages.length, total: pages.length, phase: "save" });
    const saved = await doc.save({ useObjectStreams: true });
    const ab = toArrayBuffer(saved);
    post({ type: "result", jobId, payload: ab, meta: { name: "watermark.pdf" } }, [ab]);
  } catch (e) {
    post({ type: "error", jobId, message: e instanceof Error ? e.message : "watermark_failed" });
  }
}

async function handlePageNumbers(
  jobId: string,
  bytes: ArrayBuffer,
  opts: {
    position:
      | "bottom-center"
      | "bottom-right"
      | "bottom-left"
      | "top-center"
      | "top-right"
      | "top-left";
    startNumber: number;
    fontSize: number;
    format: "n" | "n-of-total" | "dash";
    fontUrl: string;
  }
): Promise<void> {
  try {
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const font = await embedCyrillicFont(doc, opts.fontUrl);
    const pages = doc.getPages();
    const total = pages.length;
    const margin = 30;
    for (let i = 0; i < total; i++) {
      post({ type: "progress", jobId, current: i, total, phase: "numbers" });
      const page = pages[i];
      const n = opts.startNumber + i;
      let label = String(n);
      if (opts.format === "n-of-total") label = `${n} из ${total}`;
      else if (opts.format === "dash") label = `— ${n} —`;
      const { width, height } = page.getSize();
      const w = font.widthOfTextAtSize(label, opts.fontSize);
      let x = (width - w) / 2;
      let y = margin;
      if (opts.position.startsWith("top")) y = height - margin - opts.fontSize;
      if (opts.position.endsWith("left")) x = margin;
      if (opts.position.endsWith("right")) x = width - w - margin;
      page.drawText(label, {
        x,
        y,
        size: opts.fontSize,
        font,
        color: rgb(0.25, 0.25, 0.28),
      });
    }
    post({ type: "progress", jobId, current: total, total, phase: "save" });
    const saved = await doc.save({ useObjectStreams: true });
    const ab = toArrayBuffer(saved);
    post({ type: "result", jobId, payload: ab, meta: { name: "numbered.pdf" } }, [ab]);
  } catch (e) {
    post({ type: "error", jobId, message: e instanceof Error ? e.message : "page_numbers_failed" });
  }
}

/**
 * Сжатие PDF клиент-сайд.
 *
 * mode="inplace" — ПРАВИЛЬНЫЙ путь для обычных (текстовых) PDF: пережимаем встроенные
 * изображения in-place (декод → уменьшение → JPEG → подмена потока под той же ссылкой
 * объекта через context.assign). Слой текста/ссылок/выделяемости НЕ трогается — файл
 * реально уменьшается, при этом контент остаётся текстом. Пропускаем опасные случаи
 * (SMask/альфа, Decode-массивы, ImageMask/color-key Mask, 16-бит, JPX/CCITTFax/JBIG2,
 * Indexed-экзотику, multi-filter) и подменяем поток ТОЛЬКО если результат меньше.
 *
 * mode="scan" — честный режим «для сканов/фото»: растеризация страниц в JPEG через pdfjs
 * (текст теряется, подходит только когда PDF по сути и так из сканов).
 */
async function handleCompress(
  jobId: string,
  bytes: ArrayBuffer,
  opts: { mode: "inplace" | "scan"; maxDimensionPx: number; jpegQuality: number }
): Promise<void> {
  if (opts.mode === "scan") {
    await handleCompressScan(jobId, bytes, opts.maxDimensionPx, opts.jpegQuality);
    return;
  }
  try {
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true, updateMetadata: false });
    const context = doc.context;
    const entries = context.enumerateIndirectObjects();
    let replaced = 0;
    for (let i = 0; i < entries.length; i++) {
      post({ type: "progress", jobId, current: i, total: entries.length, phase: "images" });
      const [ref, obj] = entries[i];
      if (!(obj instanceof PDFRawStream)) continue;
      const dict = obj.dict;
      const subtype = dict.lookup(PDFName.of("Subtype"));
      if (!(subtype instanceof PDFName) || subtype !== PDFName.of("Image")) continue;
      // --- Безопасность: не трогаем маски/альфу/декодированные палитры. ---
      if (dict.has(PDFName.of("SMask"))) continue;
      if (dict.has(PDFName.of("Decode"))) continue;
      if (dict.has(PDFName.of("Mask"))) continue;
      const imgMask = dict.get(PDFName.of("ImageMask"));
      if (imgMask instanceof PDFBool && imgMask.asBoolean()) continue;

      const widthNum = dict.get(PDFName.of("Width"));
      const heightNum = dict.get(PDFName.of("Height"));
      if (!(widthNum instanceof PDFNumber) || !(heightNum instanceof PDFNumber)) continue;
      const w = widthNum.asNumber();
      const h = heightNum.asNumber();
      const bitsNum = dict.get(PDFName.of("BitsPerComponent"));
      if (bitsNum instanceof PDFNumber && bitsNum.asNumber() !== 8) continue; // 16-бит

      const filter = dict.get(PDFName.of("Filter"));
      if (!(filter instanceof PDFName)) continue; // multi-filter / неизвестно
      const fs = filter.asString();

      const colorSpace = dict.get(PDFName.of("ColorSpace"));
      let components: number;
      if (colorSpace instanceof PDFName) {
        const cs = colorSpace.asString();
        if (cs === "DeviceRGB") components = 3;
        else if (cs === "DeviceGray") components = 1;
        else continue;
      } else if (colorSpace instanceof PDFArray && colorSpace.size() > 0) {
        const first = colorSpace.get(0);
        if (first instanceof PDFName && first.asString() === "ICCBased") {
          // Читаем N (кол-во компонент) из профиля: [/ICCBased ref N]
          const nObj = colorSpace.get(colorSpace.size() - 1);
          components = nObj instanceof PDFNumber ? nObj.asNumber() : 3;
          if (components !== 1 && components !== 3) continue;
        } else {
          continue; // Indexed / CalRGB и прочая экзотика
        }
      } else {
        continue;
      }

      // --- Декодируем пиксели. ---
      const buf = obj.getContents();
      let bitmap: ImageBitmap;
      try {
        if (fs === "DCTDecode") {
          bitmap = await createImageBitmap(new Blob([buf as unknown as BlobPart], { type: "image/jpeg" }));
        } else if (fs === "FlateDecode") {
          const inflated = await inflateDeflate(buf);
          const raw = reversePredictor(inflated, w, h, components, dict);
          const rgba = components === 1 ? grayToRgba(raw) : rgbToRgba(raw);
          bitmap = await createImageBitmap(new ImageData(rgba, w, h));
        } else {
          continue; // JPX/CCITTFax/JBIG2 — декодера в браузере нет
        }
      } catch {
        continue; // битые/неподдерживаемые — оставляем как есть
      }

      // --- Уменьшаем и пережимаем. ---
      const scale = Math.min(1, opts.maxDimensionPx / Math.max(bitmap.width, bitmap.height));
      const nw = Math.max(1, Math.round(bitmap.width * scale));
      const nh = Math.max(1, Math.round(bitmap.height * scale));
      const oc = new OffscreenCanvas(nw, nh);
      const g = oc.getContext("2d");
      if (!g) { bitmap.close(); continue; }
      g.drawImage(bitmap, 0, 0, nw, nh);
      bitmap.close();
      const blob = await oc.convertToBlob({ type: "image/jpeg", quality: opts.jpegQuality });
      const newBytes = new Uint8Array(await blob.arrayBuffer());
      // Подменяем ТОЛЬКО если реально меньше.
      if (newBytes.length >= buf.length) continue;

      // --- Строим новый поток под той же ссылкой объекта. ---
      const newDict = PDFDict.withContext(context);
      for (const [k, v] of dict.entries()) {
        if (k === PDFName.of("Length")) continue;
        if (k === PDFName.of("Filter") || k === PDFName.of("DecodeParms")) continue;
        if (k === PDFName.of("Width") || k === PDFName.of("Height")) continue;
        newDict.set(k, v);
      }
      newDict.set(PDFName.of("Width"), PDFNumber.of(nw));
      newDict.set(PDFName.of("Height"), PDFNumber.of(nh));
      newDict.set(PDFName.of("BitsPerComponent"), PDFNumber.of(8));
      newDict.set(PDFName.of("Filter"), PDFName.of("DCTDecode"));
      newDict.set(
        PDFName.of("ColorSpace"),
        components === 1 ? PDFName.of("DeviceGray") : PDFName.of("DeviceRGB")
      );
      context.assign(ref, PDFRawStream.of(newDict, newBytes));
      replaced++;
    }
    post({ type: "progress", jobId, current: entries.length, total: entries.length, phase: "save" });
    const saved = await doc.save({ useObjectStreams: true });
    const ab = toArrayBuffer(saved);
    post({ type: "result", jobId, payload: ab, meta: { name: "compressed.pdf", info: { replaced } } }, [ab]);
  } catch (e) {
    post({ type: "error", jobId, message: e instanceof Error ? e.message : "compress_failed" });
  }
}

/** Растеризация страниц в JPEG (mode="scan") — только для PDF из сканов/фото. */
async function handleCompressScan(
  jobId: string,
  bytes: ArrayBuffer,
  maxDimensionPx: number,
  jpegQuality: number
): Promise<void> {
  try {
    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = "/workers/pdf.worker.min.mjs";
    const srcDoc = await pdfjs.getDocument({ data: bytes }).promise;
    const out = await PDFDocument.create();
    const total = srcDoc.numPages;
    for (let i = 1; i <= total; i++) {
      post({ type: "progress", jobId, current: i, total, phase: "raster" });
      const page = await srcDoc.getPage(i);
      const base = page.getViewport({ scale: 1 });
      const target = maxDimensionPx / Math.max(base.width, base.height);
      const scale = target > 0 && target < 1 ? target : 1;
      const vp = page.getViewport({ scale });
      const canvas = new OffscreenCanvas(Math.ceil(vp.width), Math.ceil(vp.height));
      const g = canvas.getContext("2d");
      if (!g) { page.cleanup(); throw new Error("canvas_unavailable"); }
      g.fillStyle = "#ffffff";
      g.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvas: canvas as unknown as HTMLCanvasElement, viewport: vp }).promise;
      page.cleanup();
      const blob = await canvas.convertToBlob({ type: "image/jpeg", quality: jpegQuality });
      const img = await out.embedJpg(new Uint8Array(await blob.arrayBuffer()));
      const p = out.addPage([base.width, base.height]);
      p.drawImage(img, { x: 0, y: 0, width: base.width, height: base.height });
    }
    await srcDoc.loadingTask.destroy();
    const saved = await out.save({ useObjectStreams: true });
    const ab = toArrayBuffer(saved);
    post({ type: "result", jobId, payload: ab, meta: { name: "compressed-scan.pdf" } }, [ab]);
  } catch (e) {
    post({ type: "error", jobId, message: e instanceof Error ? e.message : "compress_scan_failed" });
  }
}

/** Разворачивает zlib-сжатые данные (DecompressionStream, raw deflate). */
async function inflateDeflate(data: Uint8Array): Promise<Uint8Array> {
  const ds = new DecompressionStream("deflate");
  const stream = new Blob([data as unknown as BlobPart]).stream().pipeThrough(ds);
  const ab = await new Response(stream).arrayBuffer();
  return new Uint8Array(ab);
}

/** Обратные PNG-предикторы (Predictor 10–15): None/Sub/Up/Average/Paeth. */
function reversePredictor(
  data: Uint8Array,
  width: number,
  height: number,
  components: number,
  dict: PDFDict
): Uint8Array {
  const decParms = dict.get(PDFName.of("DecodeParms"));
  let predictor = 1;
  let colors = components;
  let columns = width;
  if (decParms instanceof PDFDict) {
    const p = decParms.get(PDFName.of("Predictor"));
    if (p instanceof PDFNumber) predictor = p.asNumber();
    const c = decParms.get(PDFName.of("Colors"));
    if (c instanceof PDFNumber) colors = c.asNumber();
    const col = decParms.get(PDFName.of("Columns"));
    if (col instanceof PDFNumber) columns = col.asNumber();
  }
  if (predictor === 1 || predictor === 2) return data; // None / TIFF — как есть
  if (predictor < 10 || predictor > 15 || colors !== components) {
    // PNG-предикторы с неподдерживаемой раскладкой — как есть.
    return data;
  }
  const bpp = Math.max(1, Math.ceil((colors * 8) / 8));
  const stride = columns * bpp + 1;
  const out = new Uint8Array(width * height * bpp);
  const prevRow = new Uint8Array(width * bpp);
  for (let y = 0; y < height; y++) {
    const rowStart = y * stride;
    const filterType = data[rowStart];
    const src = data.subarray(rowStart + 1, rowStart + 1 + columns * bpp);
    const dst = out.subarray(y * width * bpp, (y + 1) * width * bpp);
    for (let x = 0; x < columns * bpp; x++) {
      const left = x >= bpp ? dst[x - bpp] : 0;
      const up = prevRow[x];
      const upLeft = x >= bpp ? prevRow[x - bpp] : 0;
      let raw = src[x];
      switch (filterType) {
        case 1: raw += left; break;                       // Sub
        case 2: raw += up; break;                          // Up
        case 3: raw += (left + up) >> 1; break;            // Average
        case 4: {                                        // Paeth
          const p = left + up - upLeft;
          const pa = Math.abs(p - left);
          const pb = Math.abs(p - up);
          const pc = Math.abs(p - upLeft);
          raw += pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft;
          break;
        }
        default: break;                                    // None
      }
      const v = raw & 0xff;
      dst[x] = v;
      prevRow[x] = v;
    }
  }
  return out;
}

function rgbToRgba(rgbData: Uint8Array): Uint8ClampedArray<ArrayBuffer> {
  const n = rgbData.length / 3;
  const rgba = new Uint8ClampedArray(n * 4);
  for (let i = 0; i < n; i++) {
    rgba[i * 4] = rgbData[i * 3];
    rgba[i * 4 + 1] = rgbData[i * 3 + 1];
    rgba[i * 4 + 2] = rgbData[i * 3 + 2];
    rgba[i * 4 + 3] = 255;
  }
  return rgba;
}

function grayToRgba(gray: Uint8Array): Uint8ClampedArray<ArrayBuffer> {
  const n = gray.length;
  const rgba = new Uint8ClampedArray(n * 4);
  for (let i = 0; i < n; i++) {
    const v = gray[i];
    rgba[i * 4] = v;
    rgba[i * 4 + 1] = v;
    rgba[i * 4 + 2] = v;
    rgba[i * 4 + 3] = 255;
  }
  return rgba;
}

/**
 * Текст → PDF: обычный текстовый документ A4 с переносами и кириллицей.
 * Разбивает на страницы автоматически (шрифт измеряется через fontkit).
 */
async function handleTextToPdf(
  jobId: string,
  text: string,
  opts: { fileName: string; fontUrl: string }
): Promise<void> {
  try {
    const doc = await PDFDocument.create();
    doc.registerFontkit(fontkit);
    const font = await embedCyrillicFont(doc, opts.fontUrl);

    const PAGE_W = 595.28;
    const PAGE_H = 841.89;
    const MARGIN = 56.7; // 2 см
    const fontSize = 11;
    const lineHeight = fontSize * 1.5;
    const maxWidth = PAGE_W - MARGIN * 2;

    // Нормализуем текст: CRLF → LF, убираем лишние пробелы в конце строк.
    const rawLines = String(text ?? "").replace(/\r\n?/g, "\n").split("\n");

    // Перенос строк по ширине (word wrap) на абзацах:
    // пустая строка = разделитель абзацев, иначе — продолжение.
    const paragraphs: string[] = [];
    let buf = "";
    const flush = () => {
      if (buf.trim() !== "") paragraphs.push(buf.trim());
      buf = "";
    };
    for (const raw of rawLines) {
      if (raw.trim() === "") {
        flush();
        continue;
      }
      buf += (buf ? "\n" : "") + raw.trim();
    }
    flush();

    // Шифт абзаца — 1.25 см на первой строке (как в Word), остальное — ровно.
    const INDENT = 35.4;
    let page = doc.addPage([PAGE_W, PAGE_H]);
    let y = PAGE_H - MARGIN;

    const ensureSpace = (h: number) => {
      if (y - h < MARGIN) {
        page = doc.addPage([PAGE_W, PAGE_H]);
        y = PAGE_H - MARGIN;
      }
    };
    const drawLine = (l: string, x: number) => {
      page.drawText(l, { x, y, size: fontSize, font, color: rgb(0, 0, 0), lineHeight });
      y -= lineHeight;
    };

    // Жадный перенос абзаца на строки по ширине; первая строка с красной строкой.
    const wrapParagraph = (para: string): string[] => {
      const words = para.split(/\s+/);
      const lines: string[] = [];
      let cur = "";
      let first = true;
      const avail = (isFirst: boolean) => maxWidth - (isFirst ? INDENT : 0);
      for (const w of words) {
        const candidate = cur ? `${cur} ${w}` : w;
        const fits = font.widthOfTextAtSize(candidate, fontSize) <= avail(first && cur === "");
        if (!fits && cur) {
          lines.push(cur);
          cur = w;
          first = false;
        } else {
          cur = candidate;
        }
      }
      if (cur) lines.push(cur);
      return lines;
    };

    for (const para of paragraphs) {
      const lines = wrapParagraph(para);
      for (let i = 0; i < lines.length; i++) {
        ensureSpace(lineHeight);
        drawLine(lines[i], MARGIN + (i === 0 ? INDENT : 0));
      }
      ensureSpace(lineHeight * 0.6); // отбивка между абзацами
      y -= lineHeight * 0.6;
    }

    const saved = await doc.save({ useObjectStreams: true });
    const ab = toArrayBuffer(saved);
    post({ type: "result", jobId, payload: ab, meta: { name: `${opts.fileName || "text"}.pdf` } }, [ab]);
  } catch (e) {
    post({ type: "error", jobId, message: e instanceof Error ? e.message : "text_to_pdf_failed" });
  }
}

ctx.addEventListener("message", (ev: MessageEvent<PdfWorkerRequest>) => {
  const msg = ev.data;
  void (async () => {
    if (msg.type === "merge") {
      await handleMerge(msg.jobId, msg.files);
    } else if (msg.type === "split") {
      await handleSplit(msg.jobId, msg.bytes, msg.ranges);
    } else if (msg.type === "imagesToPdf") {
      await handleImagesToPdf(msg.jobId, msg.images, msg.orientation, msg.marginMm);
    } else if (msg.type === "organize") {
      await handleOrganize(msg.jobId, msg.bytes, msg.pages);
    } else if (msg.type === "watermark") {
      await handleWatermark(msg.jobId, msg.bytes, msg);
    } else if (msg.type === "pageNumbers") {
      await handlePageNumbers(msg.jobId, msg.bytes, msg);
    } else if (msg.type === "compress") {
      await handleCompress(msg.jobId, msg.bytes, msg);
    } else if (msg.type === "textToPdf") {
      await handleTextToPdf(msg.jobId, msg.text, msg);
    }
  })();
});

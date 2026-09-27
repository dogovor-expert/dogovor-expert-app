/**
 * Извлечение текста из файла договора для аудита — ЦЕЛИКОМ В БРАУЗЕРЕ.
 *
 * Поддержка: PDF (текстовый слой + OCR-фолбэк для сканов), DOCX (mammoth),
 * изображения-сканы/фото (PaddleOCR), TXT/MD/CSV/JSON/XML/HTML/RTF и любые
 * текстовые файлы. Файл НЕ отправляется на сервер: это принципиально для
 * договоров с персональными данными и коммерческой тайной.
 *
 * Тяжёлые библиотеки (pdfjs, mammoth, PaddleOCR) грузятся динамически,
 * чтобы не попадать в основной бандл.
 */

import { docExt, extractDocText, htmlToText } from "@/lib/docText";

/** Форматы, которые принимает input[type=file]. */
export const AUDIT_FILE_ACCEPT = [
  ".pdf",
  ".docx",
  ".txt",
  ".md",
  ".rtf",
  ".csv",
  ".json",
  ".xml",
  ".html",
  ".htm",
  ".log",
  ".yaml",
  ".yml",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".bmp",
  ".tif",
  ".tiff",
  "application/pdf",
  "image/*",
  "text/*",
].join(",");

/** Максимальный размер файла для извлечения текста в браузере. */
export const AUDIT_FILE_MAX_BYTES = 20 * 1024 * 1024; // 20 МБ

/** Сколько страниц сканированного PDF распознавать (защита от «вечных» файлов). */
const PDF_OCR_MAX_PAGES = 8;

/** Минимум непустых символов, ниже которого PDF считается сканом без текста. */
const PDF_MIN_TEXT_CHARS = 200;

export type AuditFileKind = "pdf" | "docx" | "text" | "html" | "image" | "unknown";

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tif", ".tiff", ".gif"]);
const TEXT_EXT = new Set([
  ".txt",
  ".md",
  ".markdown",
  ".rtf",
  ".csv",
  ".json",
  ".xml",
  ".log",
  ".yaml",
  ".yml",
  ".ini",
  ".conf",
]);
const HTML_EXT = new Set([".html", ".htm", ".xhtml"]);

/** Определяет способ извлечения текста по расширению и MIME-типу файла. */
export function auditFileKind(file: { name: string; type?: string }): AuditFileKind {
  const ext = docExt(file.name);
  const mime = (file.type || "").toLowerCase();
  if (ext === ".pdf" || mime === "application/pdf") return "pdf";
  if (ext === ".docx") return "docx";
  if (IMAGE_EXT.has(ext) || mime.startsWith("image/")) return "image";
  if (HTML_EXT.has(ext) || mime === "text/html") return "html";
  if (TEXT_EXT.has(ext) || mime.startsWith("text/")) return "text";
  return "unknown";
}

export type AuditExtractStage = "reading" | "ocr" | "done";

export interface AuditExtractProgress {
  stage: AuditExtractStage;
  label: string;
  /** 0..100 — только для многостраничного OCR. */
  percent?: number;
}

/** Человекопонятная подсказка для формата, который не удалось прочитать. */
export function unsupportedFileHint(fileName: string): string {
  const ext = docExt(fileName);
  if (ext === ".doc") {
    return "Старый формат Word (.doc) не поддерживается. Сохраните документ как .docx или .pdf и загрузите снова.";
  }
  if (ext === ".odt" || ext === ".ott") {
    return "Формат OpenDocument (.odt) не поддерживается. Сохраните документ как .docx или .pdf.";
  }
  if (ext === ".pages" || ext === ".wps") {
    return "Этот формат не поддерживается. Экспортируйте документ в .docx или .pdf.";
  }
  if (ext === ".rtf") {
    return "Не удалось прочитать RTF. Сохраните документ как .docx или .pdf.";
  }
  return "Формат не поддерживается. Загрузите PDF, DOCX, фото/скан или текстовый файл — либо вставьте текст вручную.";
}

/** Нормализует извлечённый текст: единые переводы строк, без пустых «хвостов». */
export function normalizeText(s: string): string {
  return s
    .replaceAll("\u0000", "")
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Грубая эвристика «это похоже на текст, а не на бинарник». */
export function looksLikeText(s: string): boolean {
  if (!s) return false;
  const sample = s.slice(0, 4000);
  let bad = 0;
  for (let i = 0; i < sample.length; i++) {
    const c = sample.charCodeAt(i);
    if (c === 0 || c === 0xfffd || c < 9 || (c > 13 && c < 32)) bad++;
  }
  return bad / sample.length < 0.02;
}

/** Одиночный байт cp1251 → строка (для \'hh в RTF). */
function decodeCp1251Byte(b: number): string {
  try {
    return new TextDecoder("windows-1251").decode(new Uint8Array([b]));
  } catch {
    return String.fromCharCode(b);
  }
}

/** Грубое преобразование RTF в текст: убираем разметку, декодируем кириллицу. */
export function rtfToText(rtf: string): string {
  let s = rtf;
  s = s.replace(/\\\*\\[a-z]+/gi, "");
  s = s.replace(/\\u(-?\d+)\s?\??/g, (_m, d: string) => {
    const code = ((Number(d) % 65536) + 65536) % 65536;
    return String.fromCharCode(code);
  });
  s = s.replace(/\\'([0-9a-f]{2})/gi, (_m, h: string) => decodeCp1251Byte(parseInt(h, 16)));
  s = s.replace(/\\par[d]? ?/gi, "\n").replace(/\\line ?/gi, "\n").replace(/\\tab ?/gi, "\t");
  s = s.replace(/\\[a-z]+-?\d* ?/gi, "");
  s = s.replace(/\\[^a-z]/gi, "");
  s = s.replace(/[{}]/g, "");
  return s;
}

/** OCR изображения-скана: подготовка кадра + распознавание PaddleOCR. */
async function ocrImageFile(
  file: File,
  onProgress?: (p: AuditExtractProgress) => void
): Promise<string> {
  onProgress?.({ stage: "ocr", label: "Готовим изображение…" });
  let prepared: { ocrRaw: string; ocrBinary: string };
  try {
    const { prepareDocumentImage } = await import("@/lib/docImage");
    prepared = await prepareDocumentImage(file);
  } catch {
    throw new Error("IMAGE_DECODE");
  }

  const { paddleRecognize } = await import("@/lib/paddleOcr");
  onProgress?.({ stage: "ocr", label: "Распознаём текст на скане…" });
  let best = "";
  let bestConf = -1;
  for (const src of [prepared.ocrRaw, prepared.ocrBinary]) {
    try {
      const r = await paddleRecognize(src);
      if (r.text?.trim() && (r.confidence ?? 0) > bestConf) {
        best = r.text;
        bestConf = r.confidence ?? 0;
      }
      // Уверенный результат с первой (небинаризованной) версии — второй проход не нужен.
      if (bestConf >= 60) break;
    } catch {
      /* пробуем следующую версию кадра */
    }
  }
  if (!best.trim()) throw new Error("OCR_FAILED");
  return best;
}

/** OCR страниц PDF без текстового слоя (сканы). */
async function ocrPdfPages(
  file: File,
  onProgress?: (p: AuditExtractProgress) => void
): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/workers/pdf.worker.min.mjs";
  const task = pdfjs.getDocument({ data: await file.arrayBuffer() });
  const doc = await task.promise;
  const { paddleRecognize } = await import("@/lib/paddleOcr");
  const pages = Math.min(doc.numPages, PDF_OCR_MAX_PAGES);
  const out: string[] = [];
  try {
    for (let p = 1; p <= pages; p++) {
      onProgress?.({
        stage: "ocr",
        label: `Распознаём страницу ${p} из ${pages}…`,
        percent: Math.round(((p - 1) / pages) * 100),
      });
      const page = await doc.getPage(p);
      const base = page.getViewport({ scale: 1 });
      const scale = Math.min(2.5, 2200 / Math.max(base.width, base.height));
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      const ctx = canvas.getContext("2d");
      if (!ctx) continue;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvas, viewport }).promise;
      page.cleanup();
      try {
        const r = await paddleRecognize(canvas.toDataURL("image/jpeg", 0.9));
        if (r.text?.trim()) out.push(r.text.trim());
      } catch {
        /* страница не распозналась — пропускаем */
      }
    }
  } finally {
    await task.destroy();
  }
  if (out.length === 0) throw new Error("OCR_FAILED");
  return out.join("\n\n");
}

/** PDF: сначала текстовый слой, при его отсутствии — OCR страниц скана. */
async function extractPdfSmart(
  file: File,
  onProgress?: (p: AuditExtractProgress) => void
): Promise<string> {
  onProgress?.({ stage: "reading", label: "Читаем PDF…" });
  let text = "";
  try {
    text = await extractDocText(file);
  } catch {
    text = "";
  }
  if (text.replace(/\s+/g, "").length >= PDF_MIN_TEXT_CHARS) return text;
  onProgress?.({ stage: "ocr", label: "PDF без текста — распознаём скан…" });
  return ocrPdfPages(file, onProgress);
}

/**
 * Извлекает текст из файла договора. Бросает Error с кодом:
 *  - "UNSUPPORTED" — формат не распознаётся;
 *  - "IMAGE_DECODE" — не удалось открыть изображение;
 *  - "OCR_FAILED" — скан не распознан.
 */
export async function extractAuditText(
  file: File,
  onProgress?: (p: AuditExtractProgress) => void
): Promise<string> {
  const kind = auditFileKind(file);
  switch (kind) {
    case "pdf":
      return normalizeText(await extractPdfSmart(file, onProgress));
    case "docx":
      onProgress?.({ stage: "reading", label: "Читаем документ Word…" });
      return normalizeText(await extractDocText(file));
    case "html":
      onProgress?.({ stage: "reading", label: "Читаем документ…" });
      return normalizeText(htmlToText(await file.text()));
    case "text": {
      onProgress?.({ stage: "reading", label: "Читаем текст…" });
      const raw = await file.text();
      return normalizeText(docExt(file.name) === ".rtf" ? rtfToText(raw) : raw);
    }
    case "image":
      return normalizeText(await ocrImageFile(file, onProgress));
    default: {
      // Неизвестный формат: пробуем прочитать как текст, иначе — понятная ошибка.
      const raw = await file.text().catch(() => "");
      if (looksLikeText(raw)) return normalizeText(raw);
      throw new Error("UNSUPPORTED");
    }
  }
}

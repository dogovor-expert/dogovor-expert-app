/**
 * @typedef {import("tesseract.js").Worker} TesseractWorker
 * @typedef {{type: "recognize", file: File, lang?: string} | {type: "terminate"} OcrMessage
 * @typedef {{type: "progress", progress: number} | {type: "result", text: string} | {type: "error", message: string} | {type: "ready"}} OcrResponse
 */

import { createWorker } from "tesseract.js";

/** @type {TesseractWorker | null} */
let tesseractWorker = null;

/**
 * Инициализирует persistent worker с русским языком.
 * Использует локальные языковые данные из /workers/tessdata/
 * @returns {Promise<TesseractWorker>}
 */
async function initWorker() {
  if (tesseractWorker) return tesseractWorker;

  // Используем локальные языковые данные (только rus доступен в /workers/tessdata/)
  // workerPath и langPath указывают на локальные файлы, а не CDN
  tesseractWorker = await createWorker("rus", 1, {
    workerPath: "/workers/",
    langPath: "/workers/tessdata/",
    corePath: "/workers/",
    logger: (m) => {
      if (m.status === "recognizing text") {
        self.postMessage({ type: "progress", progress: Math.round(m.progress * 100) });
      }
    },
  });

  return tesseractWorker;
}

self.onmessage = async /** @param {MessageEvent<OcrMessage>} e */ (e) => {
  const msg = e.data;

  if (msg.type === "terminate") {
    if (tesseractWorker) {
      await tesseractWorker.terminate();
      tesseractWorker = null;
    }
    return;
  }

  if (msg.type === "recognize") {
    try {
      const w = await initWorker();
      const { data } = await w.recognize(msg.file);
      self.postMessage({ type: "result", text: data.text });
    } catch (err) {
      self.postMessage({ type: "error", message: err instanceof Error ? err.message : String(err) });
    }
  }
};

// Готовность worker'а
self.postMessage({ type: "ready" });
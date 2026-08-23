/**
 * @typedef {import("tesseract.js").Worker} TesseractWorker
 * @typedef {{type: "recognize", file: File, lang: string} | {type: "terminate"}} OcrMessage
 * @typedef {{type: "progress", progress: number} | {type: "result", text: string} | {type: "error", message: string} | {type: "ready"}} OcrResponse
 */

import { createWorker } from "tesseract.js";

/** @type {TesseractWorker | null} */
let tesseractWorker = null;

/**
 * @param {string} lang
 * @returns {Promise<TesseractWorker>}
 */
async function initWorker(lang) {
  if (tesseractWorker) await tesseractWorker.terminate();
  tesseractWorker = await createWorker(lang);
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
      /** @type {TesseractWorker} */
      const w = await initWorker(msg.lang);
      // В tesseract.js v5 logger передаётся через setLogger
      w.setLogger((m) => {
        if (m.status === "recognizing text") {
          self.postMessage({ type: "progress", progress: Math.round(m.progress * 100) });
        }
      });
      const { data } = await w.recognize(msg.file);
      self.postMessage({ type: "result", text: data.text });
    } catch (err) {
      self.postMessage({ type: "error", message: err instanceof Error ? err.message : String(err) });
    }
  }
};

// Готовность worker'а
self.postMessage({ type: "ready" });
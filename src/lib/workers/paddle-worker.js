/**
 * PaddleOCR PP-OCRv5 Web Worker.
 *
 * Изолирует тяжёлые ONNX-инференции от main thread.
 * Принимает dataURL → OffscreenCanvas → PP-OCRv5 → результат.
 *
 * Fallback: если ppu-paddle-ocr/web не работает в Worker (Safari <16,
 * отсутствие OffscreenCanvas), main thread使用 paddleOcr.ts напрямую.
 */

import { PaddleOcrService, V5_CYRILLIC_MOBILE_MODEL } from "ppu-paddle-ocr/web";

/** @type {PaddleOcrService | null} */
let service = null;

/**
 * Конвертирует dataURL в OffscreenCanvas (Worker-safe).
 * @param {string} dataUrl
 * @returns {Promise<OffscreenCanvas>}
 */
async function dataUrlToOffscreenCanvas(dataUrl) {
  const resp = await fetch(dataUrl);
  const blob = await resp.blob();
  const bitmap = await createImageBitmap(blob);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  return canvas;
}

async function init() {
  if (service) return;
  service = new PaddleOcrService({
    model: V5_CYRILLIC_MOBILE_MODEL,
  });
  await service.initialize();
}

self.onmessage = async (e) => {
  const msg = e.data;

  if (msg.type === "terminate") {
    service = null;
    self.close();
    return;
  }

  if (msg.type === "warmup") {
    try {
      await init();
      self.postMessage({ type: "ready" });
    } catch (err) {
      self.postMessage({
        type: "error",
        message: err instanceof Error ? err.message : String(err),
      });
    }
    return;
  }

  if (msg.type === "recognize") {
    try {
      await init();
      const canvas = await dataUrlToOffscreenCanvas(msg.imageDataUrl);
      const result = await service.recognize(canvas, { flatten: true });
      const text = result?.text ?? "";
      const confidence = result?.confidence ?? 0;
      const lines = (result && "results" in result ? result.results : []);
      self.postMessage({
        type: "result",
        text,
        confidence: Math.round(confidence * 100),
        lines: lines.map((l) => ({
          text: l.text,
          score: Math.round((l.confidence ?? 0) * 100),
        })),
      });
    } catch (err) {
      self.postMessage({
        type: "error",
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }
};

self.postMessage({ type: "ready" });

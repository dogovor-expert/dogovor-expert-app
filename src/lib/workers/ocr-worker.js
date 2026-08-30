/**
 * OCR-воркер: tesseract.js в изолированном Web Worker.
 *
 * Все ассеты лежат локально в /workers и отдаются same-origin:
 *  - /workers/tesseract-worker.min.js   — скрипт вложенного воркера tesseract
 *  - /workers/tesseract-core/           — wasm-ядра (выбор по возможностям CPU)
 *  - /workers/tessdata/rus.traineddata.gz — языковая модель (LSTM)
 *
 * ВАЖНО: workerPath требует ПОЛНЫЙ путь до файла — tesseract.js не
 * подставляет имя сам. corePath, наоборот, ожидает папку (ядро выбирается
 * динамически: relaxedsimd/simd/базовое, lstm/полное).
 */

/** @typedef {import("tesseract.js").Worker} TesseractWorker */

import { createWorker } from "tesseract.js";

/** @type {TesseractWorker | null} */
let tesseractWorker = null;

let lastProgress = 0;

/**
 * Инициализирует persistent worker с русским языком (OEM 1 — LSTM).
 * После первой загрузки модель кэшируется в IndexedDB — повторные
 * запуски стартуют мгновенно.
 * @returns {Promise<TesseractWorker>}
 */
async function initWorker() {
  if (tesseractWorker) return tesseractWorker;

  lastProgress = 0;
  tesseractWorker = await createWorker("rus", 1, {
    workerPath: "/workers/tesseract-worker.min.js",
    corePath: "/workers/tesseract-core/",
    langPath: "/workers/tessdata/",
    // Прямой same-origin worker без blob-обёртки — надёжнее под строгим CSP.
    workerBlobURL: false,
    logger: (m) => {
      // Отдаём все стадии: загрузка ядра → языковой модели → распознавание.
      const progress = typeof m.progress === "number" ? m.progress : 0;
      if (m.status !== "recognizing text") {
        // Стадии загрузки идут вперемешку — дубликаты не нужны.
        if (progress === lastProgress) return;
      }
      lastProgress = progress;
      self.postMessage({
        type: "progress",
        status: m.status,
        progress,
      });
    },
  });

  return tesseractWorker;
}

self.onmessage = async (e) => {
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
      // У камерных фото DPI не задан — без user_defined_dpi tesseract
      // хуже оценивает масштаб строк. preserve_interword_spaces держит
      // расстояния между колонками документа.
      await w.setParameters({
        user_defined_dpi: "300",
        preserve_interword_spaces: "1",
      });
      const { data } = await w.recognize(msg.file);
      self.postMessage({ type: "result", text: data.text });
    } catch (err) {
      self.postMessage({
        type: "error",
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }
};

// Сигнал готовности внешнего воркера.
self.postMessage({ type: "ready" });

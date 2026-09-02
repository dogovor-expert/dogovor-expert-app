/* eslint-env worker */
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
 *
 * Multi-pass (эталон ocr-text-extract-lib): распознаём исходник и
 * бинаризованную версию, возвращаем результат с лучшим confidence.
 * Для слотов ПТС/СТС дополнительно второй проход по VIN-строке с
 * whitelist символов (VIN не содержит I, O, Q).
 */

/** @typedef {import("tesseract.js").Worker} TesseractWorker */

import { createWorker } from "tesseract.js";

/** @type {TesseractWorker | null} */
let tesseractWorker = null;

let lastProgress = 0;

const VIN_ALLOWED = "ABCDEFGHJKLMNPRSTUVWXYZ0123456789";

/**
 * Инициализирует persistent worker с русским языком (OEM 1 — LSTM).
 * Модель кэшируется в IndexedDB после первой загрузки.
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
      const progress = typeof m.progress === "number" ? m.progress : 0;
      if (m.status !== "recognizing text") {
        if (progress === lastProgress) return;
      }
      lastProgress = progress;
      self.postMessage({ type: "progress", status: m.status, progress });
    },
  });

  return tesseractWorker;
}

/**
 * Один проход распознавания с заданными параметрами.
 * @param {TesseractWorker} w
 * @param {string} imageDataUrl
 * @param {Record<string, string>} params
 * @param {boolean} withWords — вернуть слова с боксами
 */
async function recognizePass(w, imageDataUrl, params, withWords) {
  await w.setParameters({
    user_defined_dpi: "300",
    preserve_interword_spaces: "1",
    ...params,
  });
  const { data } = await w.recognize(imageDataUrl, {}, withWords ? { text: true, blocks: true } : {});
  const words = [];
  if (withWords && data.blocks) {
    for (const block of data.blocks ?? []) {
      for (const paragraph of block.paragraphs ?? []) {
        for (const line of paragraph.lines ?? []) {
          for (const word of line.words ?? []) {
            if (word.text && word.text.trim()) {
              words.push({
                text: word.text,
                confidence: word.confidence,
                bbox: word.bbox,
              });
            }
          }
        }
      }
    }
  }
  return {
    text: data.text || "",
    confidence: typeof data.confidence === "number" ? data.confidence : 0,
    words,
  };
}

/** Ищет 17-символьный VIN в тексте (без I/O/Q). */
function findVinLine(text) {
  const m = text.match(/\b[A-HJ-NPR-Z0-9]{17}\b/);
  return m ? m[0] : null;
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

  if (msg.type === "warmup") {
    try {
      await initWorker();
      self.postMessage({ type: "ready-warm" });
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
      const w = await initWorker();
      const wantWords = Boolean(msg.wantWords);

      // Проход 1: обычное фото (грейскейл делаем здесь силами tesseract
      // через параметр — входной dataURL уже подготовлен вызывающей стороной).
      const pass1 = await recognizePass(w, msg.file, {}, wantWords);

      // Проход 2: бинаризованная версия (готовится на главном потоке и
      // передаётся вторым полем). Может отсутствовать (старый вызов).
      let best = pass1;
      if (msg.binary) {
        const pass2 = await recognizePass(w, msg.binary, {}, false);
        // Бинаризация обычно выигрывает на фото с тенями; на чистых
        // сканах может проигрывать — выбираем по confidence.
        if (pass2.confidence > pass1.confidence) best = pass2;
      }

      // Проход 3 (VIN): если в лучшем тексте найден VIN-кандидат, но
      // confidence низкий — перераспознаём строку с whitelist.
      if (msg.vinRetry) {
        const vin = findVinLine(best.text);
        if (vin) {
          try {
            const vinPass = await recognizePass(w, msg.file, {
              tessedit_char_whitelist: VIN_ALLOWED,
              tessedit_pageseg_mode: "7", // SINGLE_LINE
            }, false);
            const vin2 = findVinLine(vinPass.text);
            if (vin2 && vin2 !== vin && (vinPass.confidence >= best.confidence || vinPass.confidence > 70)) {
              best = { ...best, text: best.text.replace(vin, vin2) };
            }
          } catch {
            // VIN-повтор опционален — ошибка не проваливает основной результат.
          }
        }
      }

      self.postMessage({
        type: "result",
        text: best.text,
        confidence: best.confidence,
        words: wantWords ? best.words : [],
      });
      if (msg.debugLog) {
        // Временный канал отладки: включается вызывающей стороной в e2e.
        console.log("[ocr-worker] confidence:", best.confidence);
        console.log("[ocr-worker] text:", JSON.stringify(best.text));
      }
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

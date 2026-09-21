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

/** Алфавит машиночитаемой зоны (ICAO 9303): A–Z, цифры и заполнитель '<'. */
const MRZ_ALLOWED = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<";

/** Нормализует токен OCR к алфавиту MRZ (для поиска полосы и фильтра строк). */
function mrzNormalize(text) {
  return (text || "")
    .toUpperCase()
    .replace(/О/g, "0")
    .replace(/[^A-Z0-9<]/g, "");
}

/** Похоже ли, что в тексте уже есть строка MRZ (тогда повтор не нужен). */
function looksLikeMrzText(text) {
  return (text || "").split("\n").some((l) => {
    const s = mrzNormalize(l);
    return s.length >= 28 && s.length <= 46;
  });
}

/**
 * Оценка полосы MRZ по словам первого прохода: MRZ-подобные слова в нижней
 * половине кадра объединяются в один bbox. Возвращает bbox или null.
 */
function findMrzBand(words) {
  if (!words || words.length === 0) return null;
  const maxY = Math.max(...words.map((w) => w.bbox.y1));
  const hits = words.filter((w) => {
    const t = mrzNormalize(w.text);
    return t.length >= 3 && w.bbox.y0 >= maxY * 0.5;
  });
  if (hits.length < 1) return null;
  return {
    x0: Math.min(...hits.map((w) => w.bbox.x0)),
    y0: Math.min(...hits.map((w) => w.bbox.y0)),
    x1: Math.max(...hits.map((w) => w.bbox.x1)),
    y1: Math.max(...hits.map((w) => w.bbox.y1)),
  };
}

/** Размер изображения — для фолбэк-полосы, когда слов нет вовсе. */
async function imageSize(dataUrl) {
  const resp = await fetch(dataUrl);
  const blob = await resp.blob();
  const bmp = await createImageBitmap(blob);
  const size = { w: bmp.width, h: bmp.height };
  bmp.close();
  return size;
}

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
    corePath: "/workers/tesseract-core/tesseract-core-simd.wasm.js",
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

/**
 * Находит bbox слова, содержащего VIN-кандидат, в массиве слов pass1.
 * Ищет слово с ≥10 символами, внутри которого есть 17-символьный VIN.
 * @param {Array<{text: string, bbox: {x0: number, y0: number, x1: number, y1: number}}>} words
 * @param {string} vin — найденный VIN-кандидат
 * @returns {{x0: number, y0: number, x1: number, y1: number} | null}
 */
function findVinBbox(words, vin) {
  if (!words || words.length === 0) return null;

  // 1) Точное совпадение: слово целиком == VIN
  for (const w of words) {
    const clean = w.text.replace(/[^A-HJ-NPR-Z0-9]/gi, "");
    if (clean === vin) return w.bbox;
  }

  // 2) Подстрока: VIN содержится в слове (Tesseract иногда разбивает)
  for (const w of words) {
    const normalized = w.text.replace(/[^A-HJ-NPR-Z0-9]/gi, "");
    if (normalized.length >= 10 && normalized.includes(vin.slice(0, 8))) {
      return w.bbox;
    }
  }

  // 3) Fuzzy: слово на той же строке (y-координаты ≤15px) с похожим текстом
  if (words.length > 0) {
    const vinChars = vin.split("");
    let bestScore = 0;
    let bestBbox = null;
    for (const w of words) {
      if (w.text.length < 8) continue;
      const wChars = w.text.replace(/[^A-HJ-NPR-Z0-9]/gi, "").split("");
      let score = 0;
      for (const c of wChars) {
        if (vinChars.includes(c)) score++;
      }
      const ratio = score / Math.max(vinChars.length, 1);
      if (ratio > bestScore && ratio > 0.5) {
        bestScore = ratio;
        bestBbox = w.bbox;
      }
    }
    if (bestBbox) return bestBbox;
  }

  return null;
}

/**
 * Кропает регион изображения по bbox с padding.
 * Использует OffscreenCanvas (доступен в Web Workers).
 * @param {string} imageDataUrl — dataURL исходного изображения
 * @param {{x0: number, y0: number, x1: number, y1: number}} bbox
 * @param {number} pad — padding в пикселях
 * @returns {Promise<string>} dataURL кропнутого изображения (PNG)
 */
async function cropImageRegion(imageDataUrl, bbox, pad = 15) {
  const left = Math.max(0, Math.round(bbox.x0) - pad);
  const top = Math.max(0, Math.round(bbox.y0) - pad);
  const right = Math.round(bbox.x1) + pad;
  const bottom = Math.round(bbox.y1) + pad;
  const width = right - left;
  const height = bottom - top;

  if (width <= 0 || height <= 0) return imageDataUrl;

  // dataURL → Blob → ImageBitmap (поддерживается в Web Workers)
  const resp = await fetch(imageDataUrl);
  const blob = await resp.blob();
  const bmp = await createImageBitmap(blob);

  // Кроп +2x放大 для提高OCR精度
  const scale = 2;
  const canvas = new OffscreenCanvas(width * scale, height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return imageDataUrl;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    bmp,
    left, top, width, height,
    0, 0, width * scale, height * scale
  );
  bmp.close();

  const resultBlob = await canvas.convertToBlob({ type: "image/png" });
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(resultBlob);
  });
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

      // Проход 1: обычное фото. Всегда запрашиваем слова с bbox —
      // они нужны для VIN retry (кроп по региону VIN).
      const pass1 = await recognizePass(w, msg.file, msg.params || {}, true);

      // Проход 2: бинаризованная версия (готовится на главном потоке и
      // передаётся вторым полем). Может отсутствовать (старый вызов).
      let best = pass1;
      if (msg.binary) {
        const pass2 = await recognizePass(w, msg.binary, msg.params || {}, false);
        // Бинаризация обычно выигрывает на фото с тенями; на чистых
        // сканах может проигрывать — выбираем по confidence.
        if (pass2.confidence > pass1.confidence) best = pass2;
      }

      // Проход 3 (VIN): если в лучшем тексте найден VIN-кандидат, но
      // confidence низкий — перераспознаём строку с whitelist.
      // Используем bbox из pass1 для кропа VIN-региона — SINGLE_LINE (PSM 7)
      // работает корректно только на узкой полосе, а не на всём изображении.
      if (msg.vinRetry) {
        const vin = findVinLine(best.text);
        if (vin) {
          try {
            let vinImage = msg.file;

            // Ищем bbox VIN-кандидата в словах pass1 (всегда доступны)
            const vinBbox = findVinBbox(pass1.words, vin);
            if (vinBbox) {
              vinImage = await cropImageRegion(msg.file, vinBbox, 20);
            }

            const vinPass = await recognizePass(w, vinImage, {
              tessedit_char_whitelist: VIN_ALLOWED,
              tessedit_pageseg_mode: "7", // SINGLE_LINE — теперь на кропе ОК
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

      // Проход 4 (MRZ): загранпаспорта. Общий OCR часто рвёт моношрифтовую
      // строку MRZ, поэтому нижнюю полосу распознаём отдельно с whitelist
      // алфавита MRZ (как VIN). Найденные строки ДОБАВЛЯЕМ к тексту, а не
      // заменяем — парсер MRZ на клиенте их найдёт, основной текст цел.
      if (msg.mrzRetry && !looksLikeMrzText(best.text)) {
        try {
          let band = findMrzBand(pass1.words);
          if (!band) {
            const size = await imageSize(msg.file);
            band = {
              x0: 0,
              y0: Math.round(size.h * 0.7),
              x1: size.w,
              y1: size.h,
            };
          }
          if (band && band.y1 - band.y0 >= 8 && band.x1 - band.x0 >= 8) {
            const mrzImage = await cropImageRegion(msg.file, band, 10);
            const mrzPass = await recognizePass(
              w,
              mrzImage,
              {
                tessedit_char_whitelist: MRZ_ALLOWED,
                tessedit_pageseg_mode: "6",
              },
              false
            );
            const extra = (mrzPass.text || "")
              .split("\n")
              .map((s) => mrzNormalize(s))
              .filter((s) => s.length >= 28 && s.length <= 46);
            if (extra.length > 0) {
              best = { ...best, text: `${best.text}\n${extra.join("\n")}` };
            }
          }
        } catch {
          // MRZ-повтор опционален — ошибка не проваливает основной результат.
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

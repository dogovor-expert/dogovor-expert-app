/**
 * PaddleOCR PP-OCRv5 (Cyrillic) — резервный OCR-движок в Web Worker.
 *
 * Стратегия (мировой эталон): Tesseract — быстрый дефолт. Когда его
 * confidence низкий (< THRESHOLD), текст повторно распознаёт PaddleOCR
 * (`v5-cyrillic-mobile`), который заметно точнее на реальных фото паспортов
 * с фоном, наклоном и сложным светом. Используем `ppu-paddle-ocr/web` —
 * его браузерная сборка работает на `canvas-native` (без OpenCV.js),
 * а сам движок можно запускать внутри Web Worker, не блокируя UI.
 *
 * Модели (~6 МБ) загружаются лениво и кэшируются браузером.
 * Единственный инстанс живёт до выгрузки страницы.
 *
 * Требование сборки: в next.config.mjs для onnxruntime-web и opencv.js
 * нужен `resolve.fallback = { fs: false, path: false, crypto: false }`
 * (см. headers/webpack — стандартный фикс Emscripten в Next.js).
 */

import { PaddleOcrService, V5_CYRILLIC_MOBILE_MODEL } from "ppu-paddle-ocr/web";
import type { CanvasLike } from "ppu-ocv/web";

type RecognizeInput = ArrayBuffer | CanvasLike;

let servicePromise: Promise<PaddleOcrService> | null = null;

/** Приводит dataURL-строку к canvas — ppu принимает только canvas/буфер. */
async function toCanvas(dataUrl: string): Promise<CanvasLike> {
  const img = new Image();
  img.decoding = "async";
  img.src = dataUrl;
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Не удалось декодировать кадр"));
  });
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.drawImage(img, 0, 0);
  return canvas;
}

/** Ленивая инициализация единственного инстанса PP-OCRv5 Cyrillic. */
async function getPaddle(): Promise<PaddleOcrService> {
  if (!servicePromise) {
    servicePromise = (async () => {
      const service = new PaddleOcrService({
        model: V5_CYRILLIC_MOBILE_MODEL,
      });
      await service.initialize();
      return service;
    })();
  }
  return servicePromise;
}

export interface FallbackOcrResult {
  text: string;
  confidence: number;
  lines: { text: string; score: number }[];
}

/**
 * Распознаёт изображение (canvas/blob/dataURL) через PP-OCRv5 Cyrillic.
 * Строки объединяются в чтении — итоговый текст идёт по порядку.
 */
export async function paddleRecognize(
  image: string | Blob | HTMLCanvasElement | OffscreenCanvas | ArrayBuffer
): Promise<FallbackOcrResult> {
  const service = await getPaddle();
  const source: RecognizeInput = await normalizeInput(image);
  const result = await service.recognize(source, { flatten: true });
  const text = result?.text ?? "";
  const confidence = result?.confidence ?? 0;
  const lines = (result && "results" in result ? result.results : []) as {
    text: string;
    confidence?: number;
  }[];
  return {
    text,
    confidence: Math.round(confidence * 100),
    lines: lines.map((l) => ({
      text: l.text,
      score: Math.round((l.confidence ?? 0) * 100),
    })),
  };
}

/** Приводит любые входные форматы DocScanner к тому, что ждёт ppu. */
async function normalizeInput(
  image: string | Blob | HTMLCanvasElement | OffscreenCanvas | ArrayBuffer
): Promise<RecognizeInput> {
  if (typeof image === "string") return toCanvas(image);
  return image as RecognizeInput;
}

/** Прогрев движка (загрузка моделей) — вызывать при открытии сканера. */
export async function paddleWarmup(): Promise<void> {
  try {
    await getPaddle();
  } catch {
    // Фолбэк-движок опционален: без сети/CDN не будет second pass.
    servicePromise = null;
  }
}

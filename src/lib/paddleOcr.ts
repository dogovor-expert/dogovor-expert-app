/**
 * PaddleOCR PP-OCRv5 (Cyrillic) — резервный OCR-движок.
 *
 * Стратегия: Tesseract — быстрый дефолт. Когда confidence низкий (< THRESHOLD),
 * текст повторно распознаёт PaddleOCR, точнее на фото паспортов.
 *
 * Реализация: Worker-first с fallback на main thread.
 *  1) Пробуем Web Worker (не блокирует UI).
 *  2) Если Worker недоступен/упал — main thread ( ppup-paddle-ocr/web напрямую).
 *
 * Модели (~6 МБ) загружаются лениво и кэшируются браузером.
 */

import type { FallbackOcrResult } from "./paddleOcrShared";

// ---------- Shared types ----------
export type { FallbackOcrResult };

// ---------- Worker-first path ----------
let paddleWorker: Worker | null = null;
let workerReady = false;
let workerInitPromise: Promise<void> | null = null;
let workerFailed = false;

function createPaddleWorker(): Worker | null {
  try {
    return new Worker(
      new URL("./workers/paddle-worker.js", import.meta.url),
      { type: "module" }
    );
  } catch {
    return null;
  }
}

function initWorkerOnce(): Promise<void> {
  if (workerInitPromise) return workerInitPromise;
  workerInitPromise = new Promise<void>((resolve) => {
    const w = createPaddleWorker();
    if (!w) {
      workerFailed = true;
      resolve();
      return;
    }
    paddleWorker = w;
    const timeout = setTimeout(() => {
      workerFailed = true;
      w.terminate();
      paddleWorker = null;
      resolve();
    }, 15_000); // 15s на загрузку моделей

    w.onmessage = (e: MessageEvent<{ type?: string }>) => {
      if (e.data?.type === "ready") {
        workerReady = true;
        clearTimeout(timeout);
        resolve();
      }
    };
    w.onerror = () => {
      workerFailed = true;
      clearTimeout(timeout);
      paddleWorker = null;
      resolve();
    };
    w.postMessage({ type: "warmup" });
  });
  return workerInitPromise;
}

function recognizeViaWorker(
  imageDataUrl: string,
  timeoutMs = 30_000
): Promise<FallbackOcrResult> {
  return new Promise((resolve, reject) => {
    if (!paddleWorker || !workerReady) {
      reject(new Error("PaddleOCR worker not ready"));
      return;
    }
    const w = paddleWorker;
    const timer = setTimeout(() => {
      w.onmessage = null;
      reject(new Error("PaddleOCR worker timeout"));
    }, timeoutMs);

    w.onmessage = (e: MessageEvent<{ type?: string; text?: string; confidence?: number; lines?: { text: string; confidence: number; quad: number[][] }[]; message?: string }>) => {
      clearTimeout(timer);
      w.onmessage = null;
      const msg = e.data;
      if (msg.type === "result") {
        resolve({
          text: msg.text ?? "",
          confidence: msg.confidence ?? 0,
          lines: msg.lines ?? [],
        });
      } else if (msg.type === "error") {
        reject(new Error(msg.message || "PaddleOCR worker error"));
      }
    };
    w.postMessage({ type: "recognize", imageDataUrl });
  });
}

// ---------- Main thread fallback (original implementation) ----------
import { PaddleOcrService, V5_CYRILLIC_MOBILE_MODEL } from "ppu-paddle-ocr/web";
import type { CanvasLike } from "ppu-ocv/web";

type RecognizeInput = ArrayBuffer | CanvasLike;

let servicePromise: Promise<PaddleOcrService> | null = null;

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

async function normalizeInput(
  image: string | Blob | HTMLCanvasElement | OffscreenCanvas | ArrayBuffer
): Promise<RecognizeInput> {
  if (typeof image === "string") return toCanvas(image);
  return image as RecognizeInput;
}

async function recognizeOnMainThread(
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
      confidence: Math.round((l.confidence ?? 0) * 100),
      quad: [] as number[][],
    })),
  };
}

// ---------- Public API ----------

/**
 * Распознаёт изображение через PP-OCRv5 Cyrillic.
 * Сначала пробует Worker (не блокирует UI), при неудаче — main thread.
 */
export async function paddleRecognize(
  image: string | Blob | HTMLCanvasElement | OffscreenCanvas | ArrayBuffer
): Promise<FallbackOcrResult> {
  // Пробуем Worker (только для dataURL — Worker конвертирует в OffscreenCanvas)
  if (typeof image === "string" && !workerFailed) {
    try {
      await initWorkerOnce();
      if (workerReady && paddleWorker) {
        return await recognizeViaWorker(image);
      }
    } catch {
      // Worker не справился — fallback на main thread
      workerFailed = true;
    }
  }

  // Fallback: main thread
  return recognizeOnMainThread(image);
}

/** Прогрев движка (загрузка моделей) — вызывать при открытии сканера. */
export async function paddleWarmup(): Promise<void> {
  // Прогреваем Worker (если доступен) И main thread (как fallback)
  const workerWarmup = initWorkerOnce().catch(() => {});
  const mainWarmup = getPaddle().catch(() => {});
  await Promise.allSettled([workerWarmup, mainWarmup]);
}

/**
 * Подготовка изображений документов для OCR.
 *
 * Пайплайн основан на мировых эталонах (Tesseract ImproveQuality,
 * ocr-text-extract-lib, turbo-barnacle):
 *  1) Длинная сторона 2000px (900px теряет мелкий текст — главная
 *     причина «Не удалось распознать»).
 *  2) CLAHE (Contrast Limited Adaptive Histogram Equalization) —
 *     локальный контраст убирает тени/блики, +8–12% точности OCR.
 *  3) Sauvola-подобный adaptive threshold через локальные средние
 *     (интегральное изображение) — убирает тени и неравномерный свет.
 *  4) Quality gates ДО OCR: яркость, блюр (дисперсия Лапласиана),
 *     блики — чтобы дать пользователю конкретный совет.
 */

import {
  clahe,
  extractGrayFromRgba,
  writeGrayBackToRgba,
} from "@/lib/clahe";

export interface ImageQuality {
  brightness: number; // 0..255 средняя яркость
  blurScore: number; // дисперсия Лапласиана (нормирована)
  glareRatio: number; // доля пересвеченных пикселей 0..1
  dark: boolean;
  blurry: boolean;
  glare: boolean;
}

export interface PreparedImage {
  /** DataURL для превью/миниатюр (JPEG, сжатый). */
  preview: string;
  /** OCR-версия: upscale + grayscale + contrast, БЕЗ бинаризации. */
  ocrRaw: string;
  /** OCR-версия с adaptive threshold (для второго прохода). */
  ocrBinary: string;
  quality: ImageQuality;
  width: number;
  height: number;
  /** Документ был автообрезан (Scanic) и повернут к прямоугольнику. */
  cropped: boolean;
  /** Изображение было выпрямлено по перекосу (deskew). */
  deskewed: boolean;
}

const OCR_LONG_EDGE = 2000;
const PREVIEW_LONG_EDGE = 900;

/** Загружает File/Blob в ImageBitmap (быстрее Image + FileReader). */
async function decode(file: Blob): Promise<ImageBitmap> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file);
    } catch {
      /* fallback ниже */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("image"));
      img.src = url;
    });
    return img as unknown as ImageBitmap;
  } finally {
    // Откладываем revoke: в fallback-ветке bitmap ещё используется.
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
}

function drawScaled(
  source: CanvasImageSource,
  longEdge: number,
  allowUpscale = false
): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; w: number; h: number } {
  const sw =
    (source as HTMLCanvasElement).width ??
    (source as HTMLImageElement).naturalWidth ??
    (source as ImageBitmap).width;
  const sh =
    (source as HTMLCanvasElement).height ??
    (source as HTMLImageElement).naturalHeight ??
    (source as ImageBitmap).height;
  const scale = allowUpscale
    ? longEdge / Math.max(sw, sh)
    : Math.min(1, longEdge / Math.max(sw, sh));
  const w = Math.max(1, Math.round(sw * scale));
  const h = Math.max(1, Math.round(sh * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("canvas");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, w, h);
  return { canvas, ctx, w, h };
}

/** Оценка качества по пикселям (быстрая, на уменьшенной копии). */
export function assessQuality(
  data: Uint8ClampedArray,
  w: number,
  h: number
): ImageQuality {
  const n = w * h;
  let sum = 0;
  let glareCount = 0;
  const gray = new Float32Array(n);
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    const g = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    gray[p] = g;
    sum += g;
    if (data[i] > 245 && data[i + 1] > 245 && data[i + 2] > 245) glareCount++;
  }
  const mean = sum / n;

  // Дисперсия Лапласиана — стандартная метрика резкости.
  let lapSum = 0;
  let lapSqSum = 0;
  let lapCount = 0;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const lap =
        4 * gray[i] - gray[i - 1] - gray[i + 1] - gray[i - w] - gray[i + w];
      lapSum += lap;
      lapSqSum += lap * lap;
      lapCount++;
    }
  }
  const lapMean = lapCount ? lapSum / lapCount : 0;
  const lapVar = lapCount ? lapSqSum / lapCount - lapMean * lapMean : 0;

  const glareRatio = glareCount / n;
  // Белый лист на весь кадр даёт много «пересветов» — это не блик.
  // Блик = локальные пересветы при нормальной общей яркости.
  const isGlare = glareRatio > 0.08 && mean < 215 && glareRatio < 0.5;
  return {
    brightness: Math.round(mean),
    blurScore: Math.round(lapVar),
    glareRatio: Math.round(glareRatio * 1000) / 1000,
    // Пороги подобраны под документы: <90 явно темно; блюр <35 — смазано
    // (для текста дисперсия Лапласиана у резкого кадра обычно >100).
    dark: mean < 90,
    blurry: lapVar < 35,
    glare: isGlare,
  };
}

/**
 * Grayscale + contrast stretch (перцентили 2..98) на месте, в data.
 */
function contrastStretch(data: Uint8ClampedArray): void {
  const hist = new Uint32Array(256);
  const n = data.length / 4;
  for (let i = 0; i < data.length; i += 4) {
    const g = Math.round(
      0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
    );
    hist[g]++;
  }
  let lo = 0;
  let hi = 255;
  let acc = 0;
  const loCut = n * 0.02;
  const hiCut = n * 0.98;
  for (let v = 0; v < 256; v++) {
    acc += hist[v];
    if (acc >= loCut) {
      lo = v;
      break;
    }
  }
  acc = 0;
  for (let v = 0; v < 256; v++) {
    acc += hist[v];
    if (acc >= hiCut) {
      hi = v;
      break;
    }
  }
  if (hi - lo < 20) return; // уже контрастно, не трогаем
  const scale = 255 / (hi - lo);
  const lut = new Uint8ClampedArray(256);
  for (let v = 0; v < 256; v++) {
    lut[v] = Math.max(0, Math.min(255, Math.round((v - lo) * scale)));
  }
  for (let i = 0; i < data.length; i += 4) {
    const g = Math.round(
      0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
    );
    const v = lut[g];
    data[i] = v;
    data[i + 1] = v;
    data[i + 2] = v;
  }
}

/**
 * Unsharp mask (лёгкое повышение резкости) для grayscale-данных на месте.
 *
 * Читает канал яркости из RGBA, считает box-blur 3x3 как «нерезкую» версию
 * и делает: out = clamp(g + amount * (g - blur)). Усиливает края штрихов без
 * введения сильных ореолов — полезно после CLAHE для мелкого текста (СТС/ПТС).
 */
function unsharpMask(data: Uint8ClampedArray, w: number, h: number): void {
  const amount = 0.6;
  const n = w * h;
  const gray = new Float32Array(n);
  for (let p = 0, i = 0; p < n; p++, i += 4) {
    gray[p] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }
  const blur = new Float32Array(n);
  for (let y = 0; y < h; y++) {
    const row = y * w;
    const y0 = y > 0 ? y - 1 : y;
    const y1 = y < h - 1 ? y + 1 : y;
    for (let x = 0; x < w; x++) {
      const x0 = x > 0 ? x - 1 : x;
      const x1 = x < w - 1 ? x + 1 : x;
      const acc =
        gray[y0 * w + x0] +
        gray[y0 * w + x] +
        gray[y0 * w + x1] +
        gray[y * w + x0] +
        gray[y * w + x] +
        gray[y * w + x1] +
        gray[y1 * w + x0] +
        gray[y1 * w + x] +
        gray[y1 * w + x1];
      blur[row + x] = acc / 9;
    }
  }
  for (let p = 0, i = 0; p < n; p++, i += 4) {
    const v = gray[p] + amount * (gray[p] - blur[p]);
    const c = v < 0 ? 0 : v > 255 ? 255 : v | 0;
    data[i] = c;
    data[i + 1] = c;
    data[i + 2] = c;
  }
}

/**
 * Adaptive threshold (вариант Sauvola через интегральное изображение):
 * порог = mean * (1 + k * ((std / R) - 1)), k=0.2, R=128, окно ~ 1/40 кадра.
 * Текст остаётся чёрным, тени и фон — белыми.
 */
function adaptiveThreshold(data: Uint8ClampedArray, w: number, h: number): void {
  const n = w * h;
  const gray = new Float64Array(n);
  for (let p = 0, i = 0; p < n; p++, i += 4) {
    gray[p] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }
  // Интегральные изображения суммы и суммы квадратов.
  const integral = new Float64Array((w + 1) * (h + 1));
  const integralSq = new Float64Array((w + 1) * (h + 1));
  for (let y = 0; y < h; y++) {
    let rowSum = 0;
    let rowSq = 0;
    for (let x = 0; x < w; x++) {
      const p = y * w + x;
      rowSum += gray[p];
      rowSq += gray[p] * gray[p];
      integral[(y + 1) * (w + 1) + (x + 1)] = integral[y * (w + 1) + (x + 1)] + rowSum;
      integralSq[(y + 1) * (w + 1) + (x + 1)] = integralSq[y * (w + 1) + (x + 1)] + rowSq;
    }
  }
  const win = Math.max(15, Math.round(Math.min(w, h) / 40)) | 1; // нечётное
  const half = (win - 1) >> 1;
  const k = 0.2;
  const R = 128;
  for (let y = 0; y < h; y++) {
    const y0 = Math.max(0, y - half);
    const y1 = Math.min(h - 1, y + half);
    for (let x = 0; x < w; x++) {
      const x0 = Math.max(0, x - half);
      const x1 = Math.min(w - 1, x + half);
      const area = (y1 - y0 + 1) * (x1 - x0 + 1);
      const s =
        integral[(y1 + 1) * (w + 1) + (x1 + 1)] -
        integral[y0 * (w + 1) + (x1 + 1)] -
        integral[(y1 + 1) * (w + 1) + x0] +
        integral[y0 * (w + 1) + x0];
      const sq =
        integralSq[(y1 + 1) * (w + 1) + (x1 + 1)] -
        integralSq[y0 * (w + 1) + (x1 + 1)] -
        integralSq[(y1 + 1) * (w + 1) + x0] +
        integralSq[y0 * (w + 1) + x0];
      const mean = s / area;
      const std = Math.sqrt(Math.max(0, sq / area - mean * mean));
      const t = mean * (1 + k * (std / R - 1));
      const p = y * w + x;
      const i = p * 4;
      const v = gray[p] <= t ? 0 : 255;
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
      data[i + 3] = 255;
    }
  }
}

function canvasToDataUrl(canvas: HTMLCanvasElement, type: string, q?: number): string {
  return canvas.toDataURL(type, q);
}

/**
 * Готовит из файла пару картинок: превью (сжатое JPEG) и OCR-версии
 * (raw grayscale+contrast и binary threshold). Перед обработкой пытается
 * автообрезать документ (Scanic, ~100 КБ WASM): детект границ →
 * перспективная коррекция. При неудаче работает с полным кадром.
 */
export async function prepareDocumentImage(file: File): Promise<PreparedImage> {
  const bmp = await decode(file);
  try {
    // 0) Автообрезка документа (опционально, с безопасным фолбэком).
    let source: CanvasImageSource = bmp;
    let cropped = false;
    try {
      const { scanDocument } = await import("scanic");
      // Scanic принимает только DOM-элементы — рисуем ImageBitmap в canvas.
      const srcCanvas = document.createElement("canvas");
      srcCanvas.width = (bmp).width;
      srcCanvas.height = (bmp).height;
      const srcCtx = srcCanvas.getContext("2d");
      if (!srcCtx) throw new Error("canvas");
      srcCtx.drawImage(bmp, 0, 0);
      const detect = await scanDocument(srcCanvas, {
        mode: "extract",
        output: "canvas",
        maxProcessingDimension: 1200,
      });
      if (detect.success && detect.output) {
        const out = detect.output as HTMLCanvasElement;
        // Sanity check: Scanic иногда возвращает success:true, но
        // координаты corners указаны неверно (документ на контрастном
        // фоне, блики, и т.п.) и output обрезан в 0 или в крошечную
        // область. Если после кропа осталось <20% исходной площади
        // — отбрасываем и работаем с полным кадром.
        const srcArea = (bmp).width * (bmp).height;
        const outArea = (out.width || 0) * (out.height || 0);
        if (srcArea > 0 && outArea >= srcArea * 0.2) {
          source = out;
          cropped = true;
        }
      }
    } catch {
      // Scanic недоступен/не нашёл документ — идём с полным кадром.
    }

    // 0.5) Deskew: авто-выпрямление перекоса текста (ppu-ocv DeskewService).
    //      На фотографиях под углом OCR существенно теряет точность;
    //      поворот изображения обычно даёт +5–10% к попаданию полей.
    let deskewed = false;
    if (cropped && "getContext" in source) {
      try {
        const { DeskewService, ImageProcessor } = await import("ppu-ocv/web");
        await ImageProcessor.initRuntime();
        const deskew = new DeskewService();
        // source структурно совместим с ppu-ocv CanvasLike (HTMLCanvasElement).
        const canvasLike = source as unknown as {
          width: number;
          height: number;
          getContext(contextId: "2d"): unknown;
        };
        const angle = await deskew.calculateSkewAngle(canvasLike);
        // Поворачиваем только при заметном перекосе (> 1°, но < 20° —
        // иначе это, скорее всего, вертикальный документ, не шум).
        if (Math.abs(angle) > 1 && Math.abs(angle) < 20) {
          const rotated = await deskew.deskewImage(canvasLike);
          if (rotated && typeof (rotated as HTMLCanvasElement).getContext === "function") {
            source = rotated as unknown as HTMLCanvasElement;
            deskewed = true;
          }
        }
      } catch {
        // Дескев опционален — при ошибке (CSP/сеть/OpenCV) идём дальше.
      }
    }

    // 1) Маленькая копия для оценки качества и превью.
    const small = drawScaled(source, PREVIEW_LONG_EDGE);
    const smallData = small.ctx.getImageData(0, 0, small.w, small.h);
    const quality = assessQuality(smallData.data, small.w, small.h);
    const preview = canvasToDataUrl(small.canvas, "image/jpeg", 0.8);

    // 2) Большая копия для OCR: CLAHE + grayscale + contrast stretch.
    const big = drawScaled(source, OCR_LONG_EDGE, true);
    const bigData = big.ctx.getImageData(0, 0, big.w, big.h);
    // CLAHE: локальный контраст (убирает тени/бики на неравномерном свете).
    const gray = extractGrayFromRgba(bigData.data);
    const cl = clahe(gray, big.w, big.h, { clipLimit: 40 });
    writeGrayBackToRgba(bigData.data, cl);
    // Лёгкий глобальный контраст-стретч поверх CLAHE (довесок).
    contrastStretch(bigData.data);
    // Unsharp mask: усиление краёв штрихов после CLAHE (мелкий текст).
    unsharpMask(bigData.data, big.w, big.h);
    big.ctx.putImageData(bigData, 0, 0);
    const ocrRaw = canvasToDataUrl(big.canvas, "image/png");

    // 3) Вторая версия — adaptive threshold (тени/неравномерный свет).
    adaptiveThreshold(bigData.data, big.w, big.h);
    big.ctx.putImageData(bigData, 0, 0);
    const ocrBinary = canvasToDataUrl(big.canvas, "image/png");

    return {
      preview,
      ocrRaw,
      ocrBinary,
      quality,
      width: big.w,
      height: big.h,
      cropped,
      deskewed,
    };
  } finally {
    if ("close" in bmp && typeof bmp.close === "function") bmp.close();
  }
}

/** Простой сжатый dataURL (миниатюра) — используется как fallback. */
export async function compressImage(file: File): Promise<string> {
  const bmp = await decode(file);
  try {
    const s = drawScaled(bmp, PREVIEW_LONG_EDGE);
    return canvasToDataUrl(s.canvas, "image/jpeg", 0.8);
  } finally {
    if ("close" in bmp && typeof bmp.close === "function") bmp.close();
  }
}

/**
 * Web Worker для тяжёлых клиентских PDF-операций (merge/split/imagesToPdf).
 * Изолирует pdf-lib (≈400 KB) от main thread — UI не зависает на 5-15 секунд
 * при работе с большими файлами. Списывает с UI-потока все блокирующие операции
 * (PDFDocument.create, copyPages, save, embedPng/Jpg) и шлёт прогресс обратно.
 *
 * NB: Web Workers не имеют доступа к DOM. Все данные — через transferable objects
 * (ArrayBuffer / Uint8Array) с минимальной сериализацией.
 */
/// <reference lib="webworker" />

import { PDFDocument } from "pdf-lib";

export type PdfWorkerRequest =
  | {
      type: "merge";
      jobId: string;
      files: { name: string; bytes: ArrayBuffer }[];
    }
  | {
      type: "split";
      jobId: string;
      bytes: ArrayBuffer;
      ranges: { from: number; to: number; suffix: string }[];
    }
  | {
      type: "imagesToPdf";
      jobId: string;
      images: { name: string; bytes: ArrayBuffer; mime: string }[];
      orientation: "auto" | "portrait" | "landscape";
      marginMm: number;
    };

export type PdfWorkerResponse =
  | { type: "progress"; jobId: string; current: number; total: number; phase: string }
  | { type: "result"; jobId: string; payload: ArrayBuffer; meta?: { name?: string } }
  | { type: "results"; jobId: string; outputs: { name: string; bytes: ArrayBuffer }[] }
  | { type: "error"; jobId: string; message: string };

const ctx: DedicatedWorkerGlobalScope = self as unknown as DedicatedWorkerGlobalScope;

function post(msg: PdfWorkerResponse, transfer: Transferable[] = []): void {
  ctx.postMessage(msg, transfer);
}

async function handleMerge(
  jobId: string,
  files: { name: string; bytes: ArrayBuffer }[]
): Promise<void> {
  try {
    const out = await PDFDocument.create();
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      post({ type: "progress", jobId, current: i, total: files.length, phase: "merge" });
      const src = await PDFDocument.load(f.bytes, { ignoreEncryption: true });
      const indices = src.getPageIndices();
      const pages = await out.copyPages(src, indices);
      pages.forEach((p) => out.addPage(p));
    }
    post({ type: "progress", jobId, current: files.length, total: files.length, phase: "save" });
    const saved = await out.save({ useObjectStreams: true });
    // Копируем в ArrayBuffer (transferable), освобождая underlying ArrayBuffer.
    const ab = saved.buffer.slice(saved.byteOffset, saved.byteOffset + saved.byteLength) as ArrayBuffer;
    post({ type: "result", jobId, payload: ab, meta: { name: "merged.pdf" } }, [ab]);
  } catch (e) {
    post({ type: "error", jobId, message: e instanceof Error ? e.message : "merge_failed" });
  }
}

async function handleSplit(
  jobId: string,
  bytes: ArrayBuffer,
  ranges: { from: number; to: number; suffix: string }[]
): Promise<void> {
  try {
    const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const outputs: { name: string; bytes: ArrayBuffer }[] = [];
    for (let i = 0; i < ranges.length; i++) {
      const { from, to, suffix } = ranges[i];
      post({ type: "progress", jobId, current: i, total: ranges.length, phase: "split" });
      const out = await PDFDocument.create();
      const indices: number[] = [];
      for (let p = from; p <= to; p++) indices.push(p);
      const pages = await out.copyPages(src, indices);
      pages.forEach((p) => out.addPage(p));
      const saved = await out.save({ useObjectStreams: true });
      const ab = saved.buffer.slice(saved.byteOffset, saved.byteOffset + saved.byteLength) as ArrayBuffer;
      outputs.push({ name: `${suffix}.pdf`, bytes: ab });
    }
    const transfers = outputs.map((o) => o.bytes);
    post({ type: "results", jobId, outputs }, transfers);
  } catch (e) {
    post({ type: "error", jobId, message: e instanceof Error ? e.message : "split_failed" });
  }
}

async function handleImagesToPdf(
  jobId: string,
  images: { name: string; bytes: ArrayBuffer; mime: string }[],
  orientation: "auto" | "portrait" | "landscape",
  marginMm: number
): Promise<void> {
  try {
    const A4_W = 595.28;
    const A4_H = 841.89;
    const MARGIN_PT = marginMm * 2.835; // 1mm = 2.835pt
    const out = await PDFDocument.create();
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      post({ type: "progress", jobId, current: i, total: images.length, phase: "embed" });
      let embedded;
      if (img.mime === "image/png") {
        embedded = await out.embedPng(img.bytes);
      } else if (img.mime === "image/jpeg" || img.mime === "image/jpg") {
        embedded = await out.embedJpg(img.bytes);
      } else {
        throw new Error(`unsupported_image_type: ${img.mime}`);
      }
      const { width, height } = embedded.scale(1);
      const isLandscape = width > height;
      const useLandscape = orientation === "landscape" || (orientation === "auto" && isLandscape);
      const pageW = useLandscape ? A4_H : A4_W;
      const pageH = useLandscape ? A4_W : A4_H;
      const page = out.addPage([pageW, pageH]);
      const maxW = pageW - MARGIN_PT * 2;
      const maxH = pageH - MARGIN_PT * 2;
      const ratio = Math.min(maxW / width, maxH / height, 1);
      const w = width * ratio;
      const h = height * ratio;
      page.drawImage(embedded, {
        x: (pageW - w) / 2,
        y: (pageH - h) / 2,
        width: w,
        height: h,
      });
    }
    post({ type: "progress", jobId, current: images.length, total: images.length, phase: "save" });
    const saved = await out.save({ useObjectStreams: true });
    const ab = saved.buffer.slice(saved.byteOffset, saved.byteOffset + saved.byteLength) as ArrayBuffer;
    post({ type: "result", jobId, payload: ab, meta: { name: "images.pdf" } }, [ab]);
  } catch (e) {
    post({ type: "error", jobId, message: e instanceof Error ? e.message : "images_to_pdf_failed" });
  }
}

ctx.addEventListener("message", (ev: MessageEvent<PdfWorkerRequest>) => {
  const msg = ev.data;
  void (async () => {
    if (msg.type === "merge") {
      await handleMerge(msg.jobId, msg.files);
    } else if (msg.type === "split") {
      await handleSplit(msg.jobId, msg.bytes, msg.ranges);
    } else if (msg.type === "imagesToPdf") {
      await handleImagesToPdf(msg.jobId, msg.images, msg.orientation, msg.marginMm);
    }
  })();
});

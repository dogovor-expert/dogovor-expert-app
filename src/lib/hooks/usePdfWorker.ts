"use client";
/**
 * React-хук для безопасного использования Web Worker из pdf.worker.ts.
 *
 * Преимущества перед прямым new Worker():
 * - Lazy-инстанс: создаётся только при первом вызове, не на каждом рендере
 * - Auto-cleanup: terminate() при unmount компонента
 * - Fallback: если Worker API недоступен (старый браузер/SSR) — возвращает false
 *   и компонент сам решает: или блокирующий main-thread, или показать "не поддерживается"
 * - Прогресс-репортинг через колбэк
 *
 * Использование:
 *   const { run, progress, supported } = usePdfWorker();
 *   const result = await run({ type: 'merge', jobId: '...', files: [...] });
 */
import { useCallback, useEffect, useRef, useState } from "react";
import type {
  PdfWorkerRequest,
  PdfWorkerResponse,
} from "@/workers/pdf.worker";

type RunResult =
  | { kind: "single"; payload: ArrayBuffer; name?: string }
  | { kind: "multi"; outputs: { name: string; bytes: ArrayBuffer }[] };

type WorkerJobInput<T extends PdfWorkerRequest["type"]> = Extract<PdfWorkerRequest, { type: T }> extends infer U
  ? Omit<U, "jobId">
  : never;

interface UsePdfWorker {
  /**
   * Запустить операцию в Web Worker.
   * Generic T — один из типов операций ("merge" | "split" | "imagesToPdf").
   * Пример: runPdf<"merge">({ type: "merge", files: [...] })
   */
  run: <T extends PdfWorkerRequest["type"]>(req: WorkerJobInput<T>) => Promise<RunResult>;
  progress: { current: number; total: number; phase: string } | null;
  supported: boolean;
}

let workerSingleton: Worker | null = null;
let nextJobId = 0;
const pending = new Map<string, {
  resolve: (r: RunResult) => void;
  reject: (e: Error) => void;
  onProgress?: (p: { current: number; total: number; phase: string }) => void;
}>();

function getWorker(): Worker | null {
  if (typeof window === "undefined" || typeof Worker === "undefined") return null;
  if (workerSingleton) return workerSingleton;
  workerSingleton = new Worker(new URL("../../workers/pdf.worker.ts", import.meta.url), {
    type: "module",
    name: "pdf-worker",
  });
  workerSingleton.addEventListener("message", (ev: MessageEvent<PdfWorkerResponse>) => {
    const msg = ev.data;
    const job = pending.get(msg.jobId);
    if (!job) return;
    if (msg.type === "progress") {
      job.onProgress?.({ current: msg.current, total: msg.total, phase: msg.phase });
      return;
    }
    pending.delete(msg.jobId);
    if (msg.type === "result") {
      job.resolve({ kind: "single", payload: msg.payload, name: msg.meta?.name });
    } else if (msg.type === "results") {
      job.resolve({ kind: "multi", outputs: msg.outputs });
    } else {
      job.reject(new Error(msg.message));
    }
  });
  workerSingleton.addEventListener("error", (e) => {
    // Глобальная ошибка — рвём все pending
    for (const [jobId, job] of pending) {
      job.reject(new Error(e.message || "worker_error"));
      pending.delete(jobId);
    }
  });
  return workerSingleton;
}

export function usePdfWorker(): UsePdfWorker {
  const [progress, setProgress] = useState<{ current: number; total: number; phase: string } | null>(null);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    workerRef.current = getWorker();
    return () => {
      // Не terminate singleton — другие компоненты могут использовать.
      // Браузер сам убьёт при unload.
    };
  }, []);

  const run = useCallback(
    async <T extends PdfWorkerRequest["type"]>(req: WorkerJobInput<T>): Promise<RunResult> => {
      const w = workerRef.current ?? getWorker();
      if (!w) {
        throw new Error("worker_unsupported");
      }
      const jobId = `job-${++nextJobId}-${Date.now()}`;
      setProgress({ current: 0, total: 0, phase: "start" });
      return new Promise<RunResult>((resolve, reject) => {
        pending.set(jobId, {
          resolve: (r) => {
            setProgress(null);
            resolve(r);
          },
          reject: (e) => {
            setProgress(null);
            reject(e);
          },
          onProgress: (p) => setProgress(p),
        });
        // Сборка финального сообщения с jobId (TS-distributive Omit не сохраняет literal type
        // на стороне вызова, поэтому делаем явное приведение в полный PdfWorkerRequest).
        w.postMessage({ ...req, jobId });
      });
    },
    []
  );

  return { run, progress, supported: workerRef.current !== null || typeof Worker !== "undefined" };
}

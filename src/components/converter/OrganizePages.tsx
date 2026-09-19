"use client";
/**
 * Редактор страниц PDF: порядок, поворот, удаление.
 * Превью через pdfjs-dist, сборка — в pdf.worker (pdf-lib).
 */
import { useRef, useState } from "react";
import { LayoutGrid, X, Check, AlertTriangle, RotateCw, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { usePdfWorker } from "@/lib/hooks/usePdfWorker";
import { downloadBytes, formatBytes, baseName } from "@/lib/converter/download";

const MAX_FILE_SIZE_MB = 50;

let pdfjsReady = false;
async function getPdfjs() {
  const pdfjs = await import("pdfjs-dist");
  if (!pdfjsReady) {
    pdfjs.GlobalWorkerOptions.workerSrc = "/workers/pdf.worker.min.mjs";
    pdfjsReady = true;
  }
  return pdfjs;
}

type PageItem = { index: number; rotate: number; url: string };

export default function OrganizePages() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const { run, progress, supported } = usePdfWorker();

  const loadThumbs = async (f: File) => {
    setLoading(true);
    setPages([]);
    try {
      const pdfjs = await getPdfjs();
      const task = pdfjs.getDocument({ data: await f.arrayBuffer() });
      const doc = await task.promise;
      const out: PageItem[] = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const vp = page.getViewport({ scale: 0.35 });
        const canvas = document.createElement("canvas");
        canvas.width = Math.floor(vp.width);
        canvas.height = Math.floor(vp.height);
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas не поддерживается браузером");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvas, viewport: vp }).promise;
        out.push({ index: i - 1, rotate: 0, url: canvas.toDataURL("image/jpeg", 0.7) });
        page.cleanup();
      }
      await task.destroy();
      setFile(f);
      setPages(out);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось открыть PDF");
    } finally {
      setLoading(false);
    }
  };

  const onFile = (list: FileList | null) => {
    const f = list?.[0];
    if (!f) return;
    if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) {
      setError("Нужен файл PDF");
      return;
    }
    if (f.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`Файл больше ${MAX_FILE_SIZE_MB} МБ (${formatBytes(f.size)})`);
      return;
    }
    setError(null);
    setDone(false);
    void loadThumbs(f);
  };

  const reset = () => {
    setFile(null);
    setPages([]);
    setError(null);
    setDone(false);
  };

  const move = (i: number, dir: -1 | 1) => {
    setPages((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const a = [...prev];
      const tmp = a[i];
      a[i] = a[j];
      a[j] = tmp;
      return a;
    });
  };
  const rotate = (i: number) =>
    setPages((prev) => prev.map((p, k) => (k === i ? { ...p, rotate: (p.rotate + 90) % 360 } : p)));
  const remove = (i: number) => setPages((prev) => prev.filter((_, k) => k !== i));

  const apply = async () => {
    if (!file || busy || !supported || pages.length === 0) return;
    setBusy(true);
    setError(null);
    setDone(false);
    try {
      const bytes = await file.arrayBuffer();
      const result = await run<"organize">({
        type: "organize",
        bytes,
        pages: pages.map((p) => ({ index: p.index, rotate: p.rotate })),
      });
      if (result.kind === "single") {
        downloadBytes(
          new Uint8Array(result.payload),
          result.name ?? `${baseName(file.name)}-pages.pdf`,
        );
        setDone(true);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось сохранить PDF");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(e) => {
          onFile(e.target.files);
          e.target.value = "";
        }}
      />

      {!file && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full border-2 border-dashed border-gray-200 rounded-xl p-10 flex flex-col items-center gap-3 transition-colors hover:border-brand-400 hover:bg-brand-50/30 cursor-pointer"
        >
          <span className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600">
            <LayoutGrid className="w-6 h-6" />
          </span>
          <span className="text-sm font-semibold text-gray-800">Выберите PDF</span>
          <span className="text-xs text-gray-500">Порядок, поворот и удаление страниц — до {MAX_FILE_SIZE_MB} МБ</span>
        </button>
      )}

      {loading && <p className="text-xs text-gray-500">Загрузка страниц…</p>}

      {file && (
        <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
          <LayoutGrid className="w-4 h-4 text-brand-500 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-gray-800 truncate">{file.name}</p>
            <p className="text-[10.5px] text-gray-500">
              {formatBytes(file.size)} · {pages.length || "…"} стр.
            </p>
          </div>
          <button
            type="button"
            onClick={reset}
            className="p-1.5 rounded-lg hover:bg-gray-200 cursor-pointer"
            aria-label="Убрать файл"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      )}

      {pages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {pages.map((p, i) => (
            <div key={`${p.index}-${i}`} className="relative rounded-xl border border-gray-200 bg-white p-1.5">
              <div className="relative overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element -- миниатюра страницы из canvas (data-URL), next/image неприменим */}
                <img
                  src={p.url}
                  alt={`Страница ${i + 1}`}
                  className="w-full h-auto"
                  style={{ transform: `rotate(${p.rotate}deg)` }}
                />
              </div>
              <span className="absolute top-2 left-2 text-[10px] font-mono bg-gray-900/75 text-white rounded px-1.5 py-0.5">
                {i + 1}
              </span>
              <div className="mt-1.5 flex items-center justify-between gap-1">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    className="p-1 rounded-lg hover:bg-gray-200 disabled:opacity-30 cursor-pointer"
                    aria-label="Переместить влево"
                  >
                    <ArrowUp className="w-3.5 h-3.5 text-gray-600" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === pages.length - 1}
                    className="p-1 rounded-lg hover:bg-gray-200 disabled:opacity-30 cursor-pointer"
                    aria-label="Переместить вправо"
                  >
                    <ArrowDown className="w-3.5 h-3.5 text-gray-600" />
                  </button>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => rotate(i)}
                    className="p-1 rounded-lg hover:bg-gray-200 cursor-pointer"
                    aria-label="Повернуть на 90°"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-gray-600" />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    disabled={pages.length <= 1}
                    className="p-1 rounded-lg hover:bg-red-50 text-red-400 disabled:opacity-30 cursor-pointer"
                    aria-label="Удалить страницу"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!supported && pages.length > 0 && (
        <p className="text-xs text-amber-600">Обработка недоступна в этом браузере — попробуйте Chrome, Edge или Firefox.</p>
      )}

      {busy && progress && (
        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full bg-brand-500 transition-all duration-200"
            style={{ width: `${progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0}%` }}
            role="progressbar"
            aria-valuenow={progress.current}
            aria-valuemin={0}
            aria-valuemax={progress.total}
          />
        </div>
      )}

      {done && (
        <div className="rounded-xl p-3 flex items-center gap-2.5 text-xs bg-emerald-50 border border-emerald-200 text-emerald-700">
          <Check className="w-4 h-4 shrink-0" />
          <span>Готово — PDF сохранён.</span>
        </div>
      )}
      {error && (
        <div className="rounded-xl p-3 flex items-center gap-2.5 text-xs bg-red-50 border border-red-200 text-red-700">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          void apply();
        }}
        disabled={busy || !file || pages.length === 0 || !supported}
        className="w-full py-2.5 bg-brand-500 text-white rounded-xl hover:bg-brand-600 font-bold text-sm disabled:opacity-50 cursor-pointer"
      >
        {busy && progress
          ? `Сохранение… ${progress.current}/${progress.total}`
          : "Сохранить PDF"}
      </button>
    </div>
  );
}

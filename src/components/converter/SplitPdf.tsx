"use client";
import { useRef, useState } from "react";
import { Scissors, Loader2, Download, Check, X } from "lucide-react";
import { downloadBytes, formatBytes } from "@/lib/converter/download";
import { usePdfWorker } from "@/lib/hooks/usePdfWorker";

export default function SplitPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [mode, setMode] = useState<"range" | "all">("range");
  const [range, setRange] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { run: runPdf, progress, supported: workerSupported } = usePdfWorker();

  const onFile = async (list: FileList | null) => {
    const f = list?.[0];
    if (!f) return;
    const MAX_FILE_SIZE_MB = 50; // PDF-файлы обычно крупнее фото, лимит выше чем в OCR
    if (f.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`Файл слишком большой (${(f.size / 1024 / 1024).toFixed(1)} МБ). Максимальный размер — ${MAX_FILE_SIZE_MB} МБ.`);
      return;
    }
    setFile(f);
    setError(null);
    setDone(false);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const bytes = new Uint8Array(await f.arrayBuffer());
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      setPageCount(doc.getPageCount());
    } catch {
      setPageCount(0);
      setError("Не удалось прочитать PDF — файл повреждён или защищён паролем");
    }
  };

  const parseRange = (raw: string, max: number): number[] | null => {
    const pages = new Set<number>();
    for (const part of raw.split(",")) {
      const t = part.trim();
      if (!t) continue;
      const m = t.match(/^(\d+)(?:\s*-\s*(\d+))?$/);
      if (!m) return null;
      const a = parseInt(m[1], 10);
      const b = m[2] ? parseInt(m[2], 10) : a;
      if (a < 1 || b > max || a > b) return null;
      for (let i = a; i <= b; i++) pages.add(i);
    }
    return pages.size ? Array.from(pages).sort((x, y) => x - y) : null;
  };

  const split = async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    setDone(false);
    try {
      const indices = mode === "all"
        ? Array.from({ length: pageCount }, (_, i) => i + 1)
        : parseRange(range, pageCount);
      if (!indices) {
        setError("Укажите страницы в формате: 1-3, 5, 8-10");
        return;
      }
      const base = file.name.replace(/\.pdf$/i, "");
      const ranges = indices.length > 0
        ? [{ from: indices[0], to: indices[indices.length - 1], suffix: `${base}-pages-${indices[0]}-${indices[indices.length - 1]}` }]
        : [];
      if (ranges.length === 0) {
        setError("Не выбрано ни одной страницы");
        return;
      }

      // Основной путь — Web Worker.
      if (workerSupported) {
        const result = await runPdf<"split">({
          type: "split",
          bytes: await file.arrayBuffer(),
          ranges,
        });
        if (result.kind === "multi") {
          for (const o of result.outputs) {
            downloadBytes(new Uint8Array(o.bytes), o.name);
          }
          setDone(true);
          return;
        }
      }
      // Fallback: main-thread.
      const { PDFDocument } = await import("pdf-lib");
      const src = await PDFDocument.load(new Uint8Array(await file.arrayBuffer()), { ignoreEncryption: true });
      const out = await PDFDocument.create();
      const pages = await out.copyPages(src, indices.map((i) => i - 1));
      pages.forEach((p) => out.addPage(p));
      const saved = await out.save({ useObjectStreams: true });
      const suffix = mode === "all" ? `-pages-${indices[0]}-${indices[indices.length - 1]}` : "-selected";
      downloadBytes(saved, `${base}${suffix}.pdf`);
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось разделить PDF");
    } finally {
      setBusy(false);
    }
  };

  const splitAll = async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    setDone(false);
    try {
      const base = file.name.replace(/\.pdf$/i, "");
      const ranges = Array.from({ length: pageCount }, (_, i) => ({
        from: i + 1,
        to: i + 1,
        suffix: `${base}-стр-${i + 1}`,
      }));

      // Основной путь — Web Worker.
      if (workerSupported) {
        const result = await runPdf<"split">({
          type: "split",
          bytes: await file.arrayBuffer(),
          ranges,
        });
        if (result.kind === "multi") {
          for (const o of result.outputs) {
            downloadBytes(new Uint8Array(o.bytes), o.name);
          }
          setDone(true);
          return;
        }
      }
      // Fallback: main-thread.
      const { PDFDocument } = await import("pdf-lib");
      const src = await PDFDocument.load(new Uint8Array(await file.arrayBuffer()), { ignoreEncryption: true });
      for (let i = 0; i < pageCount; i++) {
        const out = await PDFDocument.create();
        const [page] = await out.copyPages(src, [i]);
        out.addPage(page);
        const saved = await out.save({ useObjectStreams: true });
        downloadBytes(saved, `${base}-стр-${i + 1}.pdf`);
      }
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось разделить PDF");
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
        onChange={(e) => { onFile(e.target.files); e.target.value = ""; }}
      />

      {!file ? (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full border-2 border-dashed border-gray-200 rounded-xl p-10 flex flex-col items-center gap-3 hover:border-brand-400 hover:bg-brand-50/30 transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center group-hover:bg-brand-100 transition-colors">
            <Scissors className="w-6 h-6 text-brand-500" />
          </div>
          <div className="text-sm font-semibold text-gray-900">Выберите PDF-файл</div>
          <div className="text-xs text-gray-600">Максимум 100 страниц. Обработка происходит в вашем браузере.</div>
        </button>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">{file.name}</p>
              <p className="text-[10px] text-gray-600">{formatBytes(file.size)} · {pageCount} стр.</p>
            </div>
            <button onClick={() => { setFile(null); setPageCount(0); setRange(""); setDone(false); }}
              className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 cursor-pointer" title="Удалить">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setMode("range")}
              className={`flex-1 py-2.5 rounded-xl border text-xs font-medium transition cursor-pointer ${
                mode === "range" ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >Выбрать страницы</button>
            <button
              onClick={() => setMode("all")}
              className={`flex-1 py-2.5 rounded-xl border text-xs font-medium transition cursor-pointer ${
                mode === "all" ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >Разделить на один файл на страницу</button>
          </div>

          {mode === "range" && (
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-gray-600 uppercase">Страницы (например: 1-3, 5, 8-10)</label>
              <input
                value={range}
                onChange={(e) => setRange(e.target.value)}
                placeholder="1-3, 5, 8-10"
                className="w-full bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-mono"
              />
            </div>
          )}

          {mode === "range" ? (
            <button onClick={split} disabled={busy}
              className="w-full py-2.5 bg-brand-500 text-white rounded-xl hover:bg-brand-600 font-bold text-sm transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {busy
                ? progress && progress.total > 0
                  ? `Разделение ${progress.current}/${progress.total}...`
                  : "Разделение..."
                : "Скачать выделенные страницы"}
            </button>
          ) : (
            <button onClick={splitAll} disabled={busy}
              className="w-full py-2.5 bg-brand-500 text-white rounded-xl hover:bg-brand-600 font-bold text-sm transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {busy
                ? progress && progress.total > 0
                  ? `Разделение ${progress.current}/${progress.total}...`
                  : "Разделение..."
                : `Скачать ${pageCount} файл(ов) по странице`}
            </button>
          )}
          {busy && progress && progress.total > 0 && (
            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-brand-500 transition-all duration-200"
                style={{ width: `${Math.round((progress.current / progress.total) * 100)}%` }}
                role="progressbar"
                aria-valuenow={progress.current}
                aria-valuemin={0}
                aria-valuemax={progress.total}
              />
            </div>
          )}
        </div>
      )}

      {done && (
        <div className="rounded-xl p-3 flex items-center gap-2.5 text-xs bg-emerald-50 border border-emerald-200 text-emerald-700">
          <Check className="w-4 h-4 text-emerald-500" />
          Файл(ы) скачаны. При разделении на один файл на страницу браузер может запросить разрешение на несколько загрузок.
        </div>
      )}
      {error && (
        <div className="rounded-xl p-3 text-xs bg-red-50 border border-red-200 text-red-700">{error}</div>
      )}
    </div>
  );
}

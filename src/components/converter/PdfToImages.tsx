"use client";
import { useRef, useState } from "react";
import { FileImage, Loader2, Download, Check, X, AlertTriangle } from "lucide-react";
import { downloadBlob, formatBytes, baseName } from "@/lib/converter/download";

let pdfjsReady = false;

async function getPdfjs() {
  const pdfjs = await import("pdfjs-dist");
  if (!pdfjsReady) {
    pdfjs.GlobalWorkerOptions.workerSrc = "/workers/pdf.worker.min.mjs";
    pdfjsReady = true;
  }
  return pdfjs;
}

export default function PdfToImages() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [dpi, setDpi] = useState(150);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
    setPageCount(0);
    try {
      const pdfjs = await getPdfjs();
      const task = pdfjs.getDocument({ data: await f.arrayBuffer() });
      const doc = await task.promise;
      setPageCount(doc.numPages);
      await task.destroy();
    } catch {
      setError("Не удалось открыть PDF — файл повреждён, защищён паролем или слишком большой");
    }
  };

  const convert = async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    setDone(false);
    try {
      const pdfjs = await getPdfjs();
      const task = pdfjs.getDocument({ data: await file.arrayBuffer() });
      const doc = await task.promise;
      const base = baseName(file.name);
      const total = doc.numPages;
      for (let i = 1; i <= total; i++) {
        const page = await doc.getPage(i);
        const scale = dpi / 72;
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas не поддерживается браузером");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const renderTask = page.render({ canvas, viewport });
        await renderTask.promise;
        const blob = await new Promise<Blob>((resolve, reject) =>
          canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/jpeg", 0.92)
        );
        downloadBlob(blob, `${base}-стр-${i}.jpg`);
        page.cleanup();
      }
      await task.destroy();
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось конвертировать PDF");
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
        onChange={(e) => { void onFile(e.target.files); e.target.value = ""; }}
      />

      {!file ? (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full border-2 border-dashed border-gray-200 rounded-xl p-10 flex flex-col items-center gap-3 hover:border-brand-400 hover:bg-brand-50/30 transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center group-hover:bg-brand-100 transition-colors">
            <FileImage className="w-6 h-6 text-brand-500" />
          </div>
          <div className="text-sm font-semibold text-gray-900">Выберите PDF-файл</div>
          <div className="text-xs text-gray-600">Каждая страница станет отдельным JPG. Конвертация происходит в вашем браузере.</div>
        </button>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">{file.name}</p>
              <p className="text-[10px] text-gray-600">{formatBytes(file.size)} · {pageCount || "…"} стр.</p>
            </div>
            <button onClick={() => { setFile(null); setPageCount(0); setDone(false); }}
              className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 cursor-pointer" title="Удалить">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-gray-600 uppercase">Качество (DPI)</label>
            <div className="grid grid-cols-3 gap-2">
              {[100, 150, 300].map((d) => (
                <button key={d} onClick={() => setDpi(d)}
                  className={`py-2.5 rounded-xl border text-xs font-medium transition cursor-pointer ${
                    dpi === d ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}>
                  {d} DPI{d === 100 ? " (эконом)" : d === 300 ? " (печать)" : ""}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-gray-600 pt-1">300 DPI — для печати и распознавания, 100 DPI — для веба. Чем выше DPI, тем больше файлы.</p>
          </div>

          <button onClick={() => { void convert(); }} disabled={busy}
            className="w-full py-2.5 bg-brand-500 text-white rounded-xl hover:bg-brand-600 font-bold text-sm transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {busy ? "Конвертация..." : `Скачать ${pageCount || ""} JPG`}
          </button>
        </div>
      )}

      {done && (
        <div className="rounded-xl p-3 flex items-center gap-2.5 text-xs bg-emerald-50 border border-emerald-200 text-emerald-700">
          <Check className="w-4 h-4 text-emerald-500" />
          Изображения скачаны
        </div>
      )}
      {error && (
        <div className="rounded-xl p-3 flex items-start gap-2 text-xs bg-red-50 border border-red-200 text-red-700">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />{error}
        </div>
      )}
    </div>
  );
}

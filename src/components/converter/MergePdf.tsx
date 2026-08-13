"use client";
import { useRef, useState } from "react";
import { Files, Loader2, X, Download, Check } from "lucide-react";
import { downloadBytes, formatBytes, baseName } from "@/lib/converter/download";

export default function MergePdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const pdfs = Array.from(list).filter(
      (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
    );
    setFiles((prev) => [...prev, ...pdfs]);
    setError(null);
    setDone(false);
  };

  const removeFile = (i: number) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
    setDone(false);
  };

  const move = (i: number, dir: -1 | 1) => {
    setFiles((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
    setDone(false);
  };

  const merge = async () => {
    if (files.length < 2) return;
    setBusy(true);
    setError(null);
    setDone(false);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const out = await PDFDocument.create();
      for (const file of files) {
        const bytes = new Uint8Array(await file.arrayBuffer());
        const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
        const pages = await out.copyPages(src, src.getPageIndices());
        pages.forEach((p) => out.addPage(p));
      }
      const saved = await out.save({ useObjectStreams: true });
      downloadBytes(saved, `merged-${baseName(files[0].name)}.pdf`);
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось объединить файлы");
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
        multiple
        className="hidden"
        onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }}
      />

      {files.length === 0 ? (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full border-2 border-dashed border-gray-200 rounded-xl p-10 flex flex-col items-center gap-3 hover:border-brand-400 hover:bg-brand-50/30 transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center group-hover:bg-brand-100 transition-colors">
            <Files className="w-6 h-6 text-brand-500" />
          </div>
          <div className="text-sm font-semibold text-gray-900">Выберите PDF-файлы</div>
          <div className="text-xs text-gray-500">Можно выбрать несколько файлов. Файлы обрабатываются только в вашем браузере.</div>
        </button>
      ) : (
        <div className="space-y-2">
          {files.map((f, i) => (
            <div key={`${f.name}-${i}`} className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
              <span className="text-[10px] font-mono text-gray-400 w-6">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 truncate">{f.name}</p>
                <p className="text-[10px] text-gray-400">{formatBytes(f.size)}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => move(i, -1)} disabled={i === 0}
                  className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 disabled:opacity-30 text-xs font-bold cursor-pointer" title="Вверх">↑</button>
                <button onClick={() => move(i, 1)} disabled={i === files.length - 1}
                  className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 disabled:opacity-30 text-xs font-bold cursor-pointer" title="Вниз">↓</button>
                <button onClick={() => removeFile(i)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 cursor-pointer" title="Удалить">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          <div className="flex gap-2 pt-1">
            <button onClick={() => inputRef.current?.click()}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium text-sm transition cursor-pointer">
              + Добавить
            </button>
            <button onClick={merge} disabled={busy || files.length < 2}
              className="flex-1 py-2.5 bg-brand-500 text-white rounded-xl hover:bg-brand-600 font-bold text-sm transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {busy ? "Объединение..." : `Объединить (${files.length} файл.)`}
            </button>
          </div>
        </div>
      )}

      {done && (
        <div className="rounded-xl p-3 flex items-center gap-2.5 text-xs bg-emerald-50 border border-emerald-200 text-emerald-700">
          <Check className="w-4 h-4 text-emerald-500" />
          Файл объединён и скачан
        </div>
      )}
      {error && (
        <div className="rounded-xl p-3 text-xs bg-red-50 border border-red-200 text-red-700">{error}</div>
      )}
    </div>
  );
}

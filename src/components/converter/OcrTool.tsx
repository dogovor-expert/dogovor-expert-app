"use client";
import { useRef, useState, useCallback } from "react";
import { ScanText, Loader2, Copy, Check, AlertTriangle, X, FileText } from "lucide-react";
import { formatBytes } from "@/lib/converter/download";

let pdfjsReady = false;

async function getPdfjs() {
  const pdfjs = await import("pdfjs-dist");
  if (!pdfjsReady) {
    pdfjs.GlobalWorkerOptions.workerSrc = "/workers/pdf.worker.min.mjs";
    pdfjsReady = true;
  }
  return pdfjs;
}

let workerPromise: Promise<any> | null = null;

function getWorker() {
  if (!workerPromise) {
    workerPromise = (async () => {
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("rus", 1, {
        workerPath: "/workers/tesseract-worker.min.js",
        corePath: "/workers/tesseract-core/",
        langPath: "/workers/tessdata/",
        logger: () => {},
      });
      return worker;
    })();
  }
  return workerPromise;
}

export default function OcrTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [pages, setPages] = useState<number[]>([]);
  const [progress, setProgress] = useState<string | null>(null);
  const [result, setResult] = useState<{ text: string; file: string; ms: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const onFile = async (list: FileList | null) => {
    const f = list?.[0];
    if (!f) return;
    setFile(f);
    setError(null);
    setResult(null);
    setPageCount(0);
    setPages([]);
    if (f.type.startsWith("image/")) {
      setPageCount(1);
      setPages([1]);
      return;
    }
    try {
      const pdfjs = await getPdfjs();
      const task = pdfjs.getDocument({ data: await f.arrayBuffer() });
      const doc = await task.promise;
      const n = doc.numPages;
      setPageCount(n);
      setPages(n > 5 ? [1, 2, 3, 4, 5] : Array.from({ length: n }, (_, i) => i + 1));
      await task.destroy();
    } catch {
      setError("Не удалось открыть файл — PDF повреждён, защищён паролем или слишком большой");
    }
  };

  const togglePage = (n: number) => {
    setPages((prev) => (prev.includes(n) ? prev.filter((p) => p !== n) : [...prev, n].sort((a, b) => a - b)));
  };

  const selectAll = () => setPages(Array.from({ length: pageCount }, (_, i) => i + 1));

  const recognize = useCallback(async () => {
    if (!file || !pages.length) return;
    setBusy(true);
    setError(null);
    setResult(null);
    setCopied(false);
    const started = performance.now();
    try {
      const worker = await getWorker();
      let img: HTMLImageElement | CanvasImageSource;
      if (file.type.startsWith("image/")) {
        setProgress("Подготовка изображения...");
        img = await createImageBitmap(file);
      } else {
        const pdfjs = await getPdfjs();
        setProgress("Рендер страниц PDF...");
        const task = pdfjs.getDocument({ data: await file.arrayBuffer() });
        const doc = await task.promise;
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;
        const parts: string[] = [];
        for (let i = 1; i <= doc.numPages; i++) {
          if (!pages.includes(i)) continue;
          const page = await doc.getPage(i);
          const viewport = page.getViewport({ scale: 3.5 });
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          const renderTask = page.render({ canvas, viewport });
          await renderTask.promise;
          setProgress(`Распознавание страницы ${i} из ${pages.length}...`);
          const { data } = await worker.recognize(canvas, {}, { text: true });
          parts.push(data.text.trim());
          page.cleanup();
        }
        await task.destroy();
        setResult({ text: parts.join("\n\n--- Страница ---\n\n"), file: file.name, ms: performance.now() - started });
        setProgress(null);
        setBusy(false);
        return;
      }
      setProgress("Распознавание текста...");
      const { data } = await worker.recognize(img, {}, { text: true });
      setResult({ text: data.text.trim(), file: file.name, ms: performance.now() - started });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка распознавания. Попробуйте изображение лучшего качества.");
    } finally {
      setProgress(null);
      setBusy(false);
    }
  }, [file, pages]);

  const copyText = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      textRef.current?.select();
      document.execCommand("copy");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadTxt = () => {
    if (!result) return;
    const blob = new Blob([result.text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${result.file.replace(/\.[^.]+$/, "")}-ocr.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf,image/jpeg,image/png,image/webp,image/bmp,.jpg,.jpeg,.png,.webp,.bmp"
        className="hidden"
        onChange={(e) => { onFile(e.target.files); e.target.value = ""; }}
      />

      {!file ? (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full border-2 border-dashed border-gray-200 rounded-xl p-10 flex flex-col items-center gap-3 hover:border-brand-400 hover:bg-brand-50/30 transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center group-hover:bg-brand-100 transition-colors">
            <ScanText className="w-6 h-6 text-brand-500" />
          </div>
          <div className="text-sm font-semibold text-gray-900">Скан договора или PDF → текст</div>
          <div className="text-xs text-gray-500">PDF, JPG, PNG, WEBP. Распознавание русского текста (tesseract.js) прямо в браузере — документ никуда не загружается.</div>
        </button>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">{file.name}</p>
              <p className="text-[10px] text-gray-400">{formatBytes(file.size)} · {pageCount} стр.</p>
            </div>
            <button onClick={() => { setFile(null); setResult(null); setPageCount(0); setPages([]); }}
              className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 cursor-pointer" title="Удалить">
              <X className="w-4 h-4" />
            </button>
          </div>

          {pageCount > 1 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-mono text-gray-500 uppercase">Страницы для распознавания</label>
                <button onClick={selectAll} className="text-[10px] text-brand-600 hover:underline cursor-pointer font-medium">Все ({pageCount})</button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                  <button key={n} onClick={() => togglePage(n)}
                    className={`w-9 h-9 rounded-lg border text-xs font-mono transition cursor-pointer ${
                      pages.includes(n)
                        ? "border-brand-500 bg-brand-50 text-brand-700 font-bold"
                        : "border-gray-200 text-gray-400 hover:border-gray-300"
                    }`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button onClick={recognize} disabled={busy || !pages.length}
            className="w-full py-2.5 bg-brand-500 text-white rounded-xl hover:bg-brand-600 font-bold text-sm transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ScanText className="w-4 h-4" />}
            {busy ? progress || "Распознавание..." : "Распознать текст"}
          </button>

          <div className="rounded-xl p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Первый запуск скачивает модель русского языка (~8 МБ) и занимает 10–20 секунд. Далее модель кэшируется в браузере. Качество зависит от чёткости скана — рекомендуем 300 DPI.</span>
          </div>
        </div>
      )}

      {result && (
        <div className="space-y-3">
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-700 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-500" />
            Готово за {(result.ms / 1000).toFixed(1)} с
          </div>
          <textarea
            ref={textRef}
            readOnly
            value={result.text}
            className="w-full h-64 bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-900 outline-none font-mono resize-y focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
          <div className="flex gap-2">
            <button onClick={copyText}
              className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium text-sm transition flex items-center justify-center gap-2 cursor-pointer">
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              {copied ? "Скопировано" : "Копировать"}
            </button>
            <button onClick={downloadTxt}
              className="flex-1 py-2.5 bg-brand-500 text-white rounded-xl hover:bg-brand-600 font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer">
              <FileText className="w-4 h-4" />
              Скачать .txt
            </button>
          </div>
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

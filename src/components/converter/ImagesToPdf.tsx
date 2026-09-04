"use client";
import { useRef, useState } from "react";
import { Image as ImageIcon, Loader2, Download, Check, X } from "lucide-react";
import { downloadBytes, formatBytes } from "@/lib/converter/download";
import { usePdfWorker } from "@/lib/hooks/usePdfWorker";

const A4 = { width: 595.28, height: 841.89 };

export default function ImagesToPdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [orientation, setOrientation] = useState<"auto" | "portrait" | "landscape">("auto");
  const [margin, setMargin] = useState(12);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { run: runPdf, progress, supported: workerSupported } = usePdfWorker();

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const MAX_FILE_SIZE_MB = 50; // PDF-файлы обычно крупнее фото, лимит выше чем в OCR
    const imgs = Array.from(list).filter((f) => f.type.startsWith("image/"));
    for (const f of imgs) {
      if (f.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setError(`Файл «${f.name}» слишком большой (${(f.size / 1024 / 1024).toFixed(1)} МБ). Максимальный размер — ${MAX_FILE_SIZE_MB} МБ.`);
        setDone(false);
        return;
      }
    }
    const nextTotal = files.reduce((s, f) => s + f.size, 0) + imgs.reduce((s, f) => s + f.size, 0);
    if (nextTotal > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`Суммарный размер изображений превышает ${MAX_FILE_SIZE_MB} МБ. Добавьте изображения меньшими партиями.`);
      setDone(false);
      return;
    }
    setFiles((prev) => [...prev, ...imgs]);
    setError(null);
    setDone(false);
  };

  const removeFile = (i: number) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
    setDone(false);
  };

  const convert = async () => {
    if (!files.length) return;
    setBusy(true);
    setError(null);
    setDone(false);
    try {
      // Worker умеет только PNG/JPEG; если есть WebP/BMP — fallback в main thread.
      const onlyPngJpg = files.every((f) => f.type === "image/png" || f.type === "image/jpeg" || f.type === "image/jpg");
      if (workerSupported && onlyPngJpg) {
        const result = await runPdf<"imagesToPdf">({
          type: "imagesToPdf",
          images: await Promise.all(
            files.map(async (f) => ({ name: f.name, bytes: await f.arrayBuffer(), mime: f.type }))
          ),
          orientation,
          marginMm: margin,
        });
        if (result.kind === "single") {
          downloadBytes(new Uint8Array(result.payload), result.name ?? "images.pdf");
          setDone(true);
          return;
        }
      }
      // Fallback: main-thread (WebP/BMP или нет Worker).
      const { PDFDocument } = await import("pdf-lib");
      const doc = await PDFDocument.create();
      for (const file of files) {
        const bytes = new Uint8Array(await file.arrayBuffer());
        let img;
        if (file.type === "image/png") {
          img = await doc.embedPng(bytes);
        } else if (file.type === "image/jpeg" || file.type === "image/jpg") {
          img = await doc.embedJpg(bytes);
        } else {
          // WebP/BMP: конвертируем через Canvas → PNG
          const pngBytes = await imageToPngBytes(file);
          img = await doc.embedPng(pngBytes);
        }
        const { width, height } = img.scale(1);
        const isLandscape = width > height;
        const useLandscape = orientation === "landscape" || (orientation === "auto" && isLandscape);
        const page = doc.addPage(useLandscape ? [A4.height, A4.width] : [A4.width, A4.height]);
        const maxW = page.getWidth() - margin * 2;
        const maxH = page.getHeight() - margin * 2;
        const scale = Math.min(maxW / width, maxH / height, 1);
        const w = width * scale;
        const h = height * scale;
        page.drawImage(img, {
          x: (page.getWidth() - w) / 2,
          y: (page.getHeight() - h) / 2,
          width: w,
          height: h,
        });
      }
      const saved = await doc.save({ useObjectStreams: true });
      downloadBytes(saved, "images.pdf");
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось создать PDF");
    } finally {
      setBusy(false);
    }
  };

  /**
   * Конвертация WebP/BMP → PNG через Canvas (для fallback, когда worker не подходит).
   * PNG поддерживается pdf-lib embedPng нативно без потерь.
   */
  async function imageToPngBytes(file: File): Promise<Uint8Array> {
    const blobUrl = URL.createObjectURL(file);
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new window.Image();
        el.onload = () => resolve(el);
        el.onerror = () => reject(new Error("image_load_failed"));
        el.src = blobUrl;
      });
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx2d = canvas.getContext("2d");
      if (!ctx2d) throw new Error("canvas_unavailable");
      ctx2d.drawImage(img, 0, 0);
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob_failed"))), "image/png");
      });
      return new Uint8Array(await blob.arrayBuffer());
    } finally {
      URL.revokeObjectURL(blobUrl);
    }
  }

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/bmp,.jpg,.jpeg,.png,.webp,.bmp"
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
            <ImageIcon className="w-6 h-6 text-brand-500" />
          </div>
          <div className="text-sm font-semibold text-gray-900">Выберите изображения</div>
          <div className="text-xs text-gray-600">JPG, PNG, WEBP. Каждая картинка — на отдельной странице A4. Данные не покидают ваш браузер.</div>
        </button>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {files.map((f, i) => (
              <div key={`${f.name}-${i}`} className="relative bg-gray-50 border border-gray-200 rounded-xl p-3 group">
                <p className="text-[11px] font-medium text-gray-800 truncate pr-5">{f.name}</p>
                <p className="text-[10px] text-gray-600">{formatBytes(f.size)}</p>
                <button onClick={() => removeFile(i)}
                  className="absolute top-1.5 right-1.5 p-1 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-gray-600 uppercase">Ориентация страницы</label>
              <select value={orientation} onChange={(e) => setOrientation(e.target.value as typeof orientation)}
                className="w-full bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500">
                <option value="auto">По изображению</option>
                <option value="portrait">Книжная</option>
                <option value="landscape">Альбомная</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-gray-600 uppercase">Поля (мм) — {margin}</label>
              <input type="range" min={0} max={30} value={margin} onChange={(e) => setMargin(Number(e.target.value))}
                className="w-full accent-brand-500" />
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => inputRef.current?.click()}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium text-sm transition cursor-pointer">
              + Добавить
            </button>
            <button onClick={convert} disabled={busy}
              className="flex-1 py-2.5 bg-brand-500 text-white rounded-xl hover:bg-brand-600 font-bold text-sm transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {busy
                ? progress && progress.total > 0
                  ? `${progress.phase === "save" ? "Сохранение" : "Создание"} ${progress.current}/${progress.total}...`
                  : "Создание PDF..."
                : "Создать PDF"}
            </button>
          </div>
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
          PDF создан и скачан
        </div>
      )}
      {error && (
        <div className="rounded-xl p-3 text-xs bg-red-50 border border-red-200 text-red-700">{error}</div>
      )}
    </div>
  );
}

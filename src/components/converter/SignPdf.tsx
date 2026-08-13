"use client";
import { useRef, useState, useCallback, useEffect } from "react";
import { PenLine, Loader2, Download, Check, X, AlertTriangle } from "lucide-react";
import { downloadBytes, formatBytes } from "@/lib/converter/download";

export default function SignPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [sign, setSign] = useState<{ url: string; w: number; h: number } | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [signScale, setSignScale] = useState(40);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const pdfInput = useRef<HTMLInputElement>(null);
  const signInput = useRef<HTMLInputElement>(null);

  const onPdf = async (list: FileList | null) => {
    const f = list?.[0];
    if (!f) return;
    setFile(f);
    setError(null);
    setDone(false);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const doc = await PDFDocument.load(new Uint8Array(await f.arrayBuffer()), { ignoreEncryption: true });
      setPageCount(doc.getPageCount());
      setPage(1);
      setPos({ x: 50, y: 50 });
    } catch {
      setError("Не удалось прочитать PDF — файл повреждён или защищён паролем");
    }
  };

  const onSign = (list: FileList | null) => {
    const f = list?.[0];
    if (!f || !f.type.startsWith("image/")) return;
    const img = new Image();
    img.onload = () => setSign({ url: URL.createObjectURL(f), w: img.naturalWidth, h: img.naturalHeight });
    img.src = URL.createObjectURL(f);
    setDone(false);
  };

  const dragRef = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawPreview = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !file) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        const { GlobalWorkerOptions } = pdfjs;
        GlobalWorkerOptions.workerSrc = "/workers/pdf.worker.min.mjs";
        const task = pdfjs.getDocument({ data: await file.arrayBuffer() });
        const doc = await task.promise;
        const pg = await doc.getPage(page);
        const baseW = canvas.width / 1;
        const scale = baseW / pg.getViewport({ scale: 1 }).width;
        const viewport = pg.getViewport({ scale: scale * 1 });
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await pg.render({ canvas, viewport }).promise;
        if (sign) {
          const w = canvas.width * (signScale / 100) * (sign.w / Math.max(sign.w, sign.h));
          const h = canvas.width * (signScale / 100) * (sign.h / Math.max(sign.w, sign.h));
          const img = new Image();
          img.src = sign.url;
          await new Promise((res) => (img.onload = res));
          const px = (pos.x / 100) * canvas.width;
          const py = (pos.y / 100) * canvas.height;
          ctx.drawImage(img, px, py, w, h);
        }
        await task.destroy();
      } catch {
        /* preview errors are non-fatal */
      }
    })();
  }, [file, page, pos, sign, signScale]);

  useEffect(() => {
    drawPreview();
  }, [drawPreview]);

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!sign) return;
    const rect = e.currentTarget.getBoundingClientRect();
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      originX: pos.x,
      originY: pos.y,
    };
    const canvas = e.currentTarget;
    const move = (ev: PointerEvent) => {
      const dx = ((ev.clientX - rect.left) / rect.width) * 100;
      const dy = ((ev.clientY - rect.top) / rect.height) * 100;
      setPos({
        x: Math.min(95, Math.max(0, dx)),
        y: Math.min(95, Math.max(0, dy)),
      });
    };
    const up = () => {
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointerleave", up);
    };
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointerleave", up);
  };

  const apply = async () => {
    if (!file || !sign) return;
    setBusy(true);
    setError(null);
    setDone(false);
    try {
      const { PDFDocument, degrees } = await import("pdf-lib");
      const doc = await PDFDocument.load(new Uint8Array(await file.arrayBuffer()), { ignoreEncryption: true });
      const pg = doc.getPage(page - 1);
      const { width, height } = pg.getSize();
      const rot = pg.getRotation().angle;
      const imgBytes = await fetch(sign.url).then((r) => r.arrayBuffer());
      const img = sign.url.startsWith("data:image/png") || sign.url.includes(".png") || sign.url.startsWith("blob:") 
        ? await doc.embedPng(imgBytes) : await doc.embedJpg(imgBytes);
      const maxDim = Math.max(sign.w, sign.h);
      const targetW = width * (signScale / 100) * (sign.w / maxDim);
      const targetH = height * (signScale / 100) * (sign.h / maxDim);
      const x = (pos.x / 100) * width;
      const y = height - (pos.y / 100) * height - targetH;
      pg.drawImage(img, { x, y, width: targetW, height: targetH });
      const saved = await doc.save({ useObjectStreams: true });
      downloadBytes(saved, file.name.replace(/\.pdf$/i, "") + "-signed.pdf");
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось подписать PDF");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <input ref={pdfInput} type="file" accept="application/pdf,.pdf" className="hidden"
        onChange={(e) => { onPdf(e.target.files); e.target.value = ""; }} />
      <input ref={signInput} type="file" accept="image/png,image/jpeg,.png,.jpg,.jpeg" className="hidden"
        onChange={(e) => { onSign(e.target.files); e.target.value = ""; }} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <button
          onClick={() => pdfInput.current?.click()}
          className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center gap-2 hover:border-brand-400 hover:bg-brand-50/30 transition-all cursor-pointer"
        >
          <span className="text-xs font-semibold text-gray-900">1. PDF для подписи</span>
          <span className="text-[11px] text-gray-500">{file ? file.name : "Выберите файл"}</span>
        </button>
        <button
          onClick={() => signInput.current?.click()}
          className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center gap-2 hover:border-brand-400 hover:bg-brand-50/30 transition-all cursor-pointer"
        >
          <span className="text-xs font-semibold text-gray-900">2. Изображение подписи</span>
          <span className="text-[11px] text-gray-500">{sign ? "Подпись загружена ✓" : "PNG или JPG (подпись с прозрачным фоном — лучше PNG)"}</span>
        </button>
      </div>

      {sign && (
        <div className="flex items-center gap-2 rounded-xl bg-gray-50 border border-gray-200 px-3 py-2">
          <img src={sign.url} alt="Подпись" className="h-10 object-contain" />
          <button onClick={() => setSign(null)}
            className="p-1 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 cursor-pointer ml-auto" title="Убрать">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {file && (
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="space-y-1 flex-1">
              <label className="text-[10px] font-mono text-gray-500 uppercase">Страница — {page} из {pageCount}</label>
              <input type="range" min={1} max={pageCount} value={page}
                onChange={(e) => setPage(Number(e.target.value))}
                className="w-full accent-brand-500" />
            </div>
            <div className="space-y-1 flex-1">
              <label className="text-[10px] font-mono text-gray-500 uppercase">Размер — {signScale}%</label>
              <input type="range" min={10} max={100} value={signScale}
                onChange={(e) => setSignScale(Number(e.target.value))}
                className="w-full accent-brand-500" />
            </div>
          </div>

          <canvas
            ref={canvasRef}
            onPointerDown={onPointerDown}
            className={`w-full rounded-xl border border-gray-200 bg-white ${sign ? "cursor-move" : "cursor-default"}`}
            style={{ touchAction: "none" }}
          />

          <div className="text-[10px] text-gray-400 text-center">Подпись можно перетащить мышью на нужное место. Подписанный документ скачается без загрузки на сервер.</div>

          <button onClick={apply} disabled={busy || !sign}
            className="w-full py-2.5 bg-brand-500 text-white rounded-xl hover:bg-brand-600 font-bold text-sm transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <PenLine className="w-4 h-4" />}
            {busy ? "Подписание..." : "Подписать и скачать"}
          </button>
        </div>
      )}

      {done && (
        <div className="rounded-xl p-3 flex items-center gap-2.5 text-xs bg-emerald-50 border border-emerald-200 text-emerald-700">
          <Check className="w-4 h-4 text-emerald-500" />
          Подписанный PDF скачан
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

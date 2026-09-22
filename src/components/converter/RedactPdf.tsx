"use client";
/**
 * Анонимайзер PDF: пользователь рисует чёрные прямоугольники поверх страниц,
 * затем закрашиваемые страницы растеризуются (текст физически удаляется),
 * а регионы заливаются чёрным. Всё локально в браузере, файл не отправляется.
 */
import { useRef, useState } from "react";
import { Eraser, X, Check, AlertTriangle, Trash2, Undo2 } from "lucide-react";
import { usePdfWorker } from "@/lib/hooks/usePdfWorker";
import { downloadBytes, formatBytes, baseName } from "@/lib/converter/download";

const MAX_FILE_SIZE_MB = 50;
const PREVIEW_SCALE = 1.1;

let pdfjsReady = false;
async function getPdfjs() {
  const pdfjs = await import("pdfjs-dist");
  if (!pdfjsReady) {
    pdfjs.GlobalWorkerOptions.workerSrc = "/workers/pdf.worker.min.mjs";
    pdfjsReady = true;
  }
  return pdfjs;
}

/** Нормализованный регион заливки (0..1 от размеров страницы). */
type Region = { x: number; y: number; w: number; h: number };
type PagePreview = { url: string; width: number; height: number };

export default function RedactPdf() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previews, setPreviews] = useState<PagePreview[]>([]);
  const [regions, setRegions] = useState<Region[][]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const drawing = useRef<{ page: number; startX: number; startY: number } | null>(null);
  const { run, progress, supported } = usePdfWorker();

  const loadPages = async (f: File) => {
    setLoading(true);
    setPreviews([]);
    setRegions([]);
    setError(null);
    setDone(false);
    try {
      const pdfjs = await getPdfjs();
      const task = pdfjs.getDocument({ data: await f.arrayBuffer() });
      const doc = await task.promise;
      const outPages: PagePreview[] = [];
      const outRegions: Region[][] = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const vp = page.getViewport({ scale: PREVIEW_SCALE });
        const canvas = document.createElement("canvas");
        canvas.width = Math.floor(vp.width);
        canvas.height = Math.floor(vp.height);
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas не поддерживается браузером");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvas, viewport: vp }).promise;
        outPages.push({ url: canvas.toDataURL("image/jpeg", 0.82), width: canvas.width, height: canvas.height });
        outRegions.push([]);
        page.cleanup();
      }
      await task.destroy();
      setFile(f);
      setPreviews(outPages);
      setRegions(outRegions);
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
    void loadPages(f);
  };

  const reset = () => {
    setFile(null);
    setPreviews([]);
    setRegions([]);
    setError(null);
    setDone(false);
  };

  // --- Взаимодействие со страницей: рисование прямоугольника мышью. ---
  const onPointerDown = (pageIdx: number, e: React.PointerEvent<HTMLDivElement>) => {
    if (drawing.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    drawing.current = {
      page: pageIdx,
      startX: ((e.clientX - rect.left) / rect.width) * 100,
      startY: ((e.clientY - rect.top) / rect.height) * 100,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const draw = drawing.current;
    if (!draw) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const page = draw.page;
    const curX = ((e.clientX - rect.left) / rect.width) * 100;
    const curY = ((e.clientY - rect.top) / rect.height) * 100;
    setRegions((prev) => {
      const next = prev.map((r, i) => (i === page ? [...r] : r));
      const list = next[page];
      // последний элемент — «рисуемый» прямоугольник (перерисовываем его)
      const last = list[list.length - 1] ?? { x: 0, y: 0, w: 0, h: 0 };
      const rectGeo = {
        x: Math.min(draw.startX, curX),
        y: Math.min(draw.startY, curY),
        w: Math.abs(curX - draw.startX),
        h: Math.abs(curY - draw.startY),
      };
      if (last.w === 0 && last.h === 0) {
        next[page] = [...list.slice(0, -1), rectGeo];
      } else {
        next[page] = [...list.slice(0, -1), rectGeo];
      }
      return next;
    });
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const draw = drawing.current;
    if (!draw) return;
    const page = draw.page;
    const rect = e.currentTarget.getBoundingClientRect();
    const curX = ((e.clientX - rect.left) / rect.width) * 100;
    const curY = ((e.clientY - rect.top) / rect.height) * 100;
    const w = Math.abs(curX - draw.startX);
    const h = Math.abs(curY - draw.startY);
    if (w > 1.5 && h > 1.5) {
      setRegions((prev) => {
        const next = prev.map((r, i) => (i === page ? [...r] : r));
        next[page].push({
          x: Math.min(draw.startX, curX) / 100,
          y: Math.min(draw.startY, curY) / 100,
          w: w / 100,
          h: h / 100,
        });
        return next;
      });
    }
    drawing.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const removeRegion = (pageIdx: number, regIdx: number) =>
    setRegions((prev) => prev.map((r, i) => (i === pageIdx ? r.filter((_, k) => k !== regIdx) : r)));

  const clearPage = (pageIdx: number) =>
    setRegions((prev) => prev.map((r, i) => (i === pageIdx ? [] : r)));

  const totalRegions = regions.reduce((s, r) => s + r.length, 0);

  const apply = async () => {
    if (!file || busy || !supported) return;
    if (totalRegions === 0) {
      setError("Сначала выделите области, которые нужно закрасить");
      return;
    }
    setBusy(true);
    setError(null);
    setDone(false);
    try {
      const bytes = await file.arrayBuffer();
      const result = await run<"redact">({
        type: "redact",
        bytes,
        regions,
      });
      if (result.kind === "single") {
        downloadBytes(new Uint8Array(result.payload), `${baseName(file.name)}-аноним.pdf`);
        setDone(true);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось обработать PDF");
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
            <Eraser className="w-6 h-6" />
          </span>
          <span className="text-sm font-semibold text-gray-800">Выберите PDF</span>
          <span className="text-xs text-gray-500 italic">Файл до {MAX_FILE_SIZE_MB} МБ · обработка в браузере</span>
        </button>
      )}

      {loading && <p className="text-xs text-gray-500">Загрузка страниц…</p>}

      {file && (
        <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
          <Eraser className="w-4 h-4 text-brand-500 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-gray-800 truncate">{file.name}</p>
            <p className="text-[10.5px] text-gray-500">
              {formatBytes(file.size)} · {previews.length} стр. · выделено заливок: {totalRegions}
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

      {previews.length > 0 && (
        <>
          <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-800 leading-relaxed">
            <b>Как закрасить данные:</b> зажмите левую кнопку мыши и обведите нужную область
            (паспортные данные, ИНН, подпись). Можно сделать несколько областей на одной странице.
            Закрашенные страницы растеризуются — текст под заливкой физически удаляется.
          </div>

          <div className="space-y-3">
            {previews.map((p, i) => (
              <div key={i} className="rounded-xl border border-gray-200 bg-white p-2">
                <div className="flex items-center justify-between px-1 pb-1.5">
                  <p className="text-[11px] font-mono text-gray-500">
                    Страница {i + 1} · заливок: {regions[i]?.length ?? 0}
                  </p>
                  {(regions[i]?.length ?? 0) > 0 && (
                    <button
                      type="button"
                      onClick={() => clearPage(i)}
                      className="inline-flex items-center gap-1 text-[11px] text-gray-500 hover:text-red-500 cursor-pointer"
                    >
                      <Undo2 className="w-3 h-3" /> сбросить
                    </button>
                  )}
                </div>
                <div
                  className="relative overflow-hidden rounded-lg bg-gray-100 cursor-crosshair select-none"
                  style={{ touchAction: "none" }}
                  onPointerDown={(e) => onPointerDown(i, e)}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerLeave={() => { if (!drawing.current) return; }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- страница из canvas (data-URL) */}
                  <img src={p.url} alt={`Страница ${i + 1}`} className="w-full h-auto pointer-events-none" draggable={false} />
                  {(regions[i] ?? []).map((r, k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeRegion(i, k);
                      }}
                      className="absolute bg-black/90 hover:bg-red-600 transition-colors rounded-sm"
                      style={{
                        left: `${r.x * 100}%`,
                        top: `${r.y * 100}%`,
                        width: `${r.w * 100}%`,
                        height: `${r.h * 100}%`,
                      }}
                      aria-label={`Удалить заливку ${k + 1} на странице ${i + 1}`}
                    />
                  ))}
                  <span className="absolute top-2 left-2 text-[10px] font-mono bg-gray-900/70 text-white rounded px-1.5 py-0.5 pointer-events-none">
                    {i + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {totalRegions > 0 && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Trash2 className="w-3.5 h-3.5 text-gray-400" />
              Клик по чёрной заливке удалит её
            </div>
          )}
        </>
      )}

      {!supported && file && (
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
          <span>Готово — файл с закрашенными данными скачан.</span>
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
        disabled={busy || !file || totalRegions === 0 || !supported}
        className="w-full py-2.5 bg-brand-500 text-white rounded-xl hover:bg-brand-600 font-bold text-sm disabled:opacity-50 cursor-pointer"
      >
        {busy && progress ? `Обработка… ${progress.current}/${progress.total}` : "Закрасить и скачать PDF"}
      </button>
    </div>
  );
}
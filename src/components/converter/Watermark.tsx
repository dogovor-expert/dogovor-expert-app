"use client";
/**
 * Водяной знак в PDF: текст, размер, прозрачность, угол, цвет, «плиткой» или по центру.
 * Всё локально в браузере (pdf-lib в Web Worker), файл никуда не отправляется.
 */
import { useRef, useState } from "react";
import { Droplets, X, Check, AlertTriangle } from "lucide-react";
import { usePdfWorker } from "@/lib/hooks/usePdfWorker";
import { downloadBytes, formatBytes } from "@/lib/converter/download";

const MAX_FILE_SIZE_MB = 50;
const FONT_URL = "/fonts/inter-regular.ttf";

const COLORS: { id: string; label: string; rgb: { r: number; g: number; b: number } }[] = [
  { id: "red", label: "Красный", rgb: { r: 0.86, g: 0.15, b: 0.15 } },
  { id: "gray", label: "Серый", rgb: { r: 0.45, g: 0.45, b: 0.45 } },
  { id: "blue", label: "Синий", rgb: { r: 0.15, g: 0.31, b: 0.85 } },
  { id: "green", label: "Зелёный", rgb: { r: 0.02, g: 0.59, b: 0.41 } },
];

export default function Watermark() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("ОБРАЗЕЦ");
  const [fontSize, setFontSize] = useState(48);
  const [opacity, setOpacity] = useState(15);
  const [angleDeg, setAngleDeg] = useState(45);
  const [colorId, setColorId] = useState("red");
  const [tile, setTile] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { run, progress, supported } = usePdfWorker();

  const onFile = (list: FileList | null) => {
    const f = list?.[0];
    if (!f) return;
    setDone(false);
    if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) {
      setError(`«${f.name}» — не PDF. Выберите файл .pdf`);
      return;
    }
    if (f.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`«${f.name}» — ${formatBytes(f.size)}. Лимит ${MAX_FILE_SIZE_MB} МБ`);
      return;
    }
    setError(null);
    setFile(f);
  };

  const apply = async () => {
    if (!file || !supported) return;
    if (!text.trim()) {
      setError("Введите текст водяного знака");
      return;
    }
    const color = COLORS.find((c) => c.id === colorId)?.rgb ?? COLORS[0].rgb;
    setBusy(true);
    setError(null);
    setDone(false);
    try {
      const bytes = await file.arrayBuffer();
      const result = await run<"watermark">({
        type: "watermark",
        bytes,
        text: text.trim(),
        fontSize,
        opacity: Math.min(Math.max(opacity, 1), 100) / 100,
        angleDeg,
        color,
        tile,
        fontUrl: FONT_URL,
      });
      if (result.kind === "single") {
        downloadBytes(new Uint8Array(result.payload), result.name ?? "watermark.pdf");
        setDone(true);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось добавить водяной знак");
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
          void onFile(e.target.files);
          e.target.value = "";
        }}
      />

      {!file ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full border-2 border-dashed border-gray-200 rounded-xl p-10 flex flex-col items-center gap-3 hover:border-brand-400 hover:bg-brand-50/30 transition-colors cursor-pointer"
        >
          <span className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600">
            <Droplets className="w-6 h-6" />
          </span>
          <span className="text-sm font-semibold text-gray-900">Выберите PDF</span>
          <span className="text-xs text-gray-500">Файл до 50 МБ · обработка в браузере</span>
        </button>
      ) : (
        <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
          <span className="text-xs text-gray-700 truncate flex-1">
            {file.name} · {formatBytes(file.size)}
          </span>
          <button
            type="button"
            onClick={() => {
              setFile(null);
              setDone(false);
            }}
            className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500"
            aria-label="Убрать файл"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        <label className="space-y-1.5">
          <span className="text-[11px] font-mono text-gray-600 uppercase">Текст</span>
          <input
            type="text"
            value={text}
            maxLength={40}
            onChange={(e) => setText(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 text-sm py-2.5 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-200"
            placeholder="ОБРАЗЕЦ"
          />
        </label>
        <label className="space-y-1.5">
          <span className="text-[11px] font-mono text-gray-600 uppercase">Размер: {fontSize} pt</span>
          <input
            type="range"
            min={12}
            max={120}
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-full accent-brand-500"
          />
        </label>
        <label className="space-y-1.5">
          <span className="text-[11px] font-mono text-gray-600 uppercase">Прозрачность: {opacity}%</span>
          <input
            type="range"
            min={5}
            max={100}
            value={opacity}
            onChange={(e) => setOpacity(Number(e.target.value))}
            className="w-full accent-brand-500"
          />
        </label>
        <label className="space-y-1.5">
          <span className="text-[11px] font-mono text-gray-600 uppercase">Угол: {angleDeg}°</span>
          <input
            type="range"
            min={-90}
            max={90}
            step={15}
            value={angleDeg}
            onChange={(e) => setAngleDeg(Number(e.target.value))}
            className="w-full accent-brand-500"
          />
        </label>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <span className="text-[11px] font-mono text-gray-600 uppercase block mb-1.5">Цвет</span>
          <div className="grid grid-cols-4 gap-2">
            {COLORS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setColorId(c.id)}
                className={`py-2 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                  colorId === c.id
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-gray-200 bg-white hover:border-brand-300"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <span className="text-[11px] font-mono text-gray-600 uppercase block mb-1.5">Расположение</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setTile(true)}
              className={`py-2 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                tile ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 bg-white hover:border-brand-300"
              }`}
            >
              Плиткой
            </button>
            <button
              type="button"
              onClick={() => setTile(false)}
              className={`py-2 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                !tile ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 bg-white hover:border-brand-300"
              }`}
            >
              По центру
            </button>
          </div>
        </div>
      </div>

      {progress && busy && (
        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden" role="progressbar" aria-valuenow={progress.current} aria-valuemin={0} aria-valuemax={progress.total}>
          <div
            className="h-full bg-brand-500 transition-all duration-200"
            style={{ width: `${progress.total ? Math.round((progress.current / progress.total) * 100) : 0}%` }}
          />
        </div>
      )}

      {error && (
        <div className="rounded-xl p-3 flex items-start gap-2.5 text-xs bg-red-50 border border-red-200 text-red-700">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      {done && (
        <div className="rounded-xl p-3 flex items-center gap-2.5 text-xs bg-emerald-50 border border-emerald-200 text-emerald-700">
          <Check className="w-4 h-4 shrink-0" />
          <span>Готово — файл скачан</span>
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          void apply();
        }}
        disabled={!file || busy || !supported}
        className="w-full py-2.5 bg-brand-500 text-white rounded-xl hover:bg-brand-600 font-bold text-sm disabled:opacity-50 cursor-pointer disabled:cursor-default"
      >
        {busy && progress ? `Обработка… ${progress.current}/${progress.total}` : "Добавить водяной знак"}
      </button>

      {!supported && (
        <p className="text-[11px] text-gray-500">
          Браузер не поддерживает фоновую обработку — откройте страницу в актуальном Chrome, Firefox или Safari.
        </p>
      )}
    </div>
  );
}

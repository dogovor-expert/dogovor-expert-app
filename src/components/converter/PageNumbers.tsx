"use client";
import { useRef, useState } from "react";
import { FileText, X, Check, AlertTriangle, Hash } from "lucide-react";
import { usePdfWorker } from "@/lib/hooks/usePdfWorker";
import { downloadBytes, formatBytes } from "@/lib/converter/download";

const MAX_FILE_SIZE_MB = 50;
const FONT_URL = "/fonts/inter-regular.ttf";

type Position =
  | "bottom-center" | "bottom-right" | "bottom-left"
  | "top-center" | "top-right" | "top-left";
type Format = "n" | "n-of-total" | "dash";

const POSITIONS: { id: Position; label: string }[] = [
  { id: "bottom-center", label: "Снизу по центру" },
  { id: "bottom-right", label: "Снизу справа" },
  { id: "bottom-left", label: "Снизу слева" },
  { id: "top-center", label: "Сверху по центру" },
  { id: "top-right", label: "Сверху справа" },
  { id: "top-left", label: "Сверху слева" },
];

const FORMATS: { id: Format; label: string }[] = [
  { id: "n", label: "1" },
  { id: "n-of-total", label: "1 из 10" },
  { id: "dash", label: "— 1 —" },
];

export default function PageNumbers() {
  const [file, setFile] = useState<File | null>(null);
  const [position, setPosition] = useState<Position>("bottom-center");
  const [format, setFormat] = useState<Format>("n-of-total");
  const [startNumber, setStartNumber] = useState(1);
  const [fontSize, setFontSize] = useState(11);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { run, progress, supported } = usePdfWorker();

  const onFile = (list: FileList | null) => {
    setError(null);
    setDone(false);
    const f = list?.[0];
    if (!f) return;
    if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) {
      setError("Выберите PDF-файл");
      return;
    }
    if (f.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`Файл больше ${MAX_FILE_SIZE_MB} МБ (${formatBytes(f.size)})`);
      return;
    }
    setFile(f);
  };

  const apply = async () => {
    if (!file) return;
    if (!supported) {
      setError("Ваш браузер не поддерживает Web Worker");
      return;
    }
    setBusy(true);
    setError(null);
    setDone(false);
    try {
      const bytes = await file.arrayBuffer();
      const result = await run<"pageNumbers">({
        type: "pageNumbers",
        bytes,
        position,
        startNumber,
        fontSize,
        format,
        fontUrl: FONT_URL,
      });
      if (result.kind === "single") {
        downloadBytes(new Uint8Array(result.payload), result.name ?? "numbered.pdf");
        setDone(true);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось добавить нумерацию");
    } finally {
      setBusy(false);
    }
  };

  const pct = progress && progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

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
            <Hash className="w-6 h-6" />
          </span>
          <span className="text-sm font-semibold text-gray-800">Выберите PDF или перетащите сюда</span>
          <span className="text-xs text-gray-500">До {MAX_FILE_SIZE_MB} МБ · нумерация страниц</span>
        </button>
      ) : (
        <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
          <FileText className="w-5 h-5 text-brand-500 shrink-0" />
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium text-gray-800 truncate">{file.name}</span>
            <span className="block text-[11px] text-gray-500">{formatBytes(file.size)}</span>
          </span>
          <button
            type="button"
            onClick={() => {
              setFile(null);
              setDone(false);
              setError(null);
            }}
            aria-label="Убрать файл"
            className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {file && (
        <div className="space-y-4">
          <div>
            <span className="block text-[10px] font-mono uppercase tracking-wide text-gray-500 mb-1.5">Положение</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {POSITIONS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPosition(p.id)}
                  className={`py-2.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                    position === p.id
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "border-gray-200 bg-white text-gray-700 hover:border-brand-300"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <span className="block text-[10px] font-mono uppercase tracking-wide text-gray-500 mb-1.5">Формат</span>
              <div className="grid grid-cols-3 gap-2">
                {FORMATS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFormat(f.id)}
                    className={`py-2.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                      format === f.id
                        ? "border-brand-500 bg-brand-50 text-brand-700"
                        : "border-gray-200 bg-white text-gray-700 hover:border-brand-300"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-4">
              <label className="flex-1">
                <span className="block text-[10px] font-mono uppercase tracking-wide text-gray-500 mb-1.5">Старт</span>
                <input
                  type="number"
                  min={1}
                  max={9999}
                  value={startNumber}
                  onChange={(e) => setStartNumber(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full bg-gray-50 border border-gray-200 text-sm py-2.5 px-3 rounded-xl focus:outline-none focus:border-brand-400"
                />
              </label>
              <label className="flex-1">
                <span className="block text-[10px] font-mono uppercase tracking-wide text-gray-500 mb-1.5">Размер, pt</span>
                <input
                  type="number"
                  min={7}
                  max={28}
                  value={fontSize}
                  onChange={(e) => setFontSize(Math.min(28, Math.max(7, Number(e.target.value) || 11)))}
                  className="w-full bg-gray-50 border border-gray-200 text-sm py-2.5 px-3 rounded-xl focus:outline-none focus:border-brand-400"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {progress && busy && (
        <div
          role="progressbar"
          aria-valuenow={progress.current}
          aria-valuemin={0}
          aria-valuemax={progress.total || 0}
          className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden"
        >
          <div className="h-full bg-brand-500 transition-all duration-200" style={{ width: `${pct}%` }} />
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
        onClick={() => void apply()}
        disabled={!file || busy}
        className="w-full py-2.5 bg-brand-500 text-white rounded-xl hover:bg-brand-600 font-bold text-sm disabled:opacity-50 transition-colors cursor-pointer"
      >
        {busy ? `Обработка… ${progress ? `${progress.current}/${progress.total}` : ""}` : "Добавить нумерацию"}
      </button>
    </div>
  );
}

"use client";
/**
 * Сжатие PDF клиент-сайд (без сервера).
 *
 * Режим "inplace" (по умолчанию) — пережимаем встроенные изображения внутри PDF:
 * текст, ссылки и выделяемость остаются текстом. Режим "scan" — растеризация
 * страниц в JPEG, подходит только когда документ по сути и так состоит из сканов.
 */
import { useRef, useState } from "react";
import { Archive, X, Check, AlertTriangle, ScanLine } from "lucide-react";
import { usePdfWorker } from "@/lib/hooks/usePdfWorker";
import { downloadBytes, formatBytes, baseName } from "@/lib/converter/download";

const MAX_FILE_SIZE_MB = 100;

const MODES = [
  {
    id: "inplace",
    label: "Сохранить текст",
    hint: "Пережатие изображений in-place",
    description:
      "Встроенные изображения пережимаются, а слой текста/ссылок полностью сохраняется. Рекомендуется для договоров и документов.",
  },
  {
    id: "scan",
    label: "Для сканов",
    hint: "Растеризация в JPEG",
    description:
      "Страницы пересобираются в изображения — текстовый слой при этом теряется. Подходит только для PDF, состоящих из сканов или фото.",
  },
] as const;
type ModeId = (typeof MODES)[number]["id"];

const LEVELS = [
  { id: "light", label: "Экономно", hint: "до 2000 px · JPEG 85%", maxDimensionPx: 2000, jpegQuality: 0.85 },
  { id: "balanced", label: "Баланс", hint: "до 1500 px · JPEG 75%", maxDimensionPx: 1500, jpegQuality: 0.75 },
  { id: "strong", label: "Сильно", hint: "до 1000 px · JPEG 60%", maxDimensionPx: 1000, jpegQuality: 0.6 },
] as const;
type LevelId = (typeof LEVELS)[number]["id"];

export default function CompressPdf() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [modeId, setModeId] = useState<ModeId>("inplace");
  const [levelId, setLevelId] = useState<LevelId>("balanced");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ before: number; after: number } | null>(null);
  const { run, progress } = usePdfWorker();

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
    setDone(null);
    setFile(f);
  };

  const apply = async () => {
    if (!file || busy) return;
    const level = LEVELS.find((l) => l.id === levelId) ?? LEVELS[1];
    setBusy(true);
    setError(null);
    setDone(null);
    try {
      const bytes = await file.arrayBuffer();
      const result = await run<"compress">({
        type: "compress",
        bytes,
        mode: modeId,
        maxDimensionPx: level.maxDimensionPx,
        jpegQuality: level.jpegQuality,
      });
      if (result.kind === "multi") {
        result.outputs.forEach((o) => downloadBytes(new Uint8Array(o.bytes), o.name));
        setDone({ before: file.size, after: result.outputs.reduce((s, o) => s + o.bytes.byteLength, 0) });
      } else {
        downloadBytes(new Uint8Array(result.payload), `${baseName(file.name)}-compressed.pdf`);
        setDone({ before: file.size, after: result.payload.byteLength });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось сжать PDF");
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
            <Archive className="w-6 h-6" />
          </span>
          <span className="text-sm font-semibold text-gray-800">Выберите PDF</span>
          <span className="text-xs text-gray-500">Уменьшить размер — до {MAX_FILE_SIZE_MB} МБ</span>
        </button>
      )}

      {file && (
        <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
          <Archive className="w-4 h-4 text-brand-500 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-gray-800 truncate">{file.name}</p>
            <p className="text-[10.5px] text-gray-500">{formatBytes(file.size)}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setFile(null);
              setDone(null);
            }}
            className="p-1.5 rounded-lg hover:bg-gray-200 cursor-pointer"
            aria-label="Убрать файл"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      )}

      <div>
        <p className="text-xs font-semibold text-gray-700 mb-2">Способ сжатия</p>
        <div className="grid grid-cols-2 gap-2">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setModeId(m.id)}
              className={`py-2.5 px-3 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                modeId === m.id
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-gray-200 bg-white text-gray-600 hover:border-brand-300"
              }`}
            >
              <span className="flex items-center gap-1.5 font-semibold">
                {m.id === "inplace" ? <Check className="w-3.5 h-3.5" /> : <ScanLine className="w-3.5 h-3.5" />}
                {m.label}
              </span>
              <span className="block text-[9.5px] text-gray-500 mt-0.5">{m.hint}</span>
            </button>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-gray-500 leading-relaxed">{MODES.find((m) => m.id === modeId)?.description}</p>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-700 mb-2">Уровень сжатия</p>
        <div className="grid grid-cols-3 gap-2">
          {LEVELS.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => setLevelId(l.id)}
              className={`py-2.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                levelId === l.id
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-gray-200 bg-white text-gray-600 hover:border-brand-300"
              }`}
            >
              <span className="block font-semibold">{l.label}</span>
              <span className="block text-[9.5px] text-gray-500 mt-0.5">{l.hint}</span>
            </button>
          ))}
        </div>
      </div>

      {busy && progress && (
        <div className="space-y-1">
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
          <p className="text-[11px] text-gray-500">
            {progress.phase === "images"
              ? `Пережатие изображений… ${progress.current}/${progress.total}`
              : progress.phase === "raster"
                ? `Растеризация страниц… ${progress.current}/${progress.total}`
                : "Сохранение…"}
          </p>
        </div>
      )}

      {done && (
        <div className="rounded-xl p-3 flex items-center gap-2.5 text-xs bg-emerald-50 border border-emerald-200 text-emerald-700">
          <Check className="w-4 h-4 shrink-0" />
          <span>
            Готово: {formatBytes(done.before)} → {formatBytes(done.after)}
            {done.after < done.before ? ` (−${Math.round((1 - done.after / done.before) * 100)}%)` : ""}
          </span>
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
        disabled={busy || !file}
        className="w-full py-2.5 bg-brand-500 text-white rounded-xl hover:bg-brand-600 font-bold text-sm disabled:opacity-50 cursor-pointer"
      >
        {busy ? "Сжатие…" : "Сжать PDF"}
      </button>
    </div>
  );
}
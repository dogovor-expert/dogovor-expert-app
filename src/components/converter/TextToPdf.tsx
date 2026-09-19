"use client";
import { useRef, useState } from "react";
import { Loader2, Download, Check, AlertTriangle, Upload, X } from "lucide-react";
import { usePdfWorker } from "@/lib/hooks/usePdfWorker";
import { downloadBytes, baseName } from "@/lib/converter/download";

const FONT_URL = "/fonts/times.ttf";
const MAX_CHARS = 500_000;

export default function TextToPdf() {
  const { run, progress } = usePdfWorker();
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("текст");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ chars: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const onFile = async (list: FileList | null) => {
    const f = list?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      setError("Файл слишком большой. Максимум — 5 МБ текста.");
      return;
    }
    try {
      const txt = await f.text();
      setText((prev) => (prev ? `${prev}\n\n${txt}` : txt));
      setFileName(baseName(f.name) || "текст");
      setError(null);
      setDone(null);
    } catch {
      setError("Не удалось прочитать файл. Поддерживаются .txt, .md и другие текстовые форматы.");
    }
  };

  const convert = async () => {
    if (!text.trim()) {
      setError("Введите текст или загрузите файл .txt");
      return;
    }
    if (text.length > MAX_CHARS) {
      setError(`Текст слишком большой (${text.length.toLocaleString("ru-RU")} символов). Максимум — 500 000.`);
      return;
    }
    setBusy(true);
    setError(null);
    setDone(null);
    try {
      const result = await run<"textToPdf">({
        type: "textToPdf",
        text,
        fileName,
        fontUrl: FONT_URL,
      });
      if (result.kind !== "single") throw new Error("unexpected_result");
      downloadBytes(new Uint8Array(result.payload), `${result.name ?? fileName}.pdf`);
      setDone({ chars: text.length });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось создать PDF");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept=".txt,.md,.text,text/plain,text/markdown"
        className="hidden"
        onChange={(e) => { void onFile(e.target.files); e.target.value = ""; }}
      />

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-[11px] font-semibold text-gray-600 hover:border-brand-300 hover:text-brand-700 cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5" /> Загрузить .txt
        </button>
        {text && (
          <button
            onClick={() => { setText(""); setFileName("текст"); setDone(null); }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-[11px] font-semibold text-red-500 hover:border-red-300 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" /> Очистить
          </button>
        )}
        <span className="ml-auto text-[10px] text-gray-400">{text.length.toLocaleString("ru-RU")} / {MAX_CHARS.toLocaleString("ru-RU")} символов</span>
      </div>

      <textarea
        value={text}
        onChange={(e) => { setText(e.target.value); setDone(null); setError(null); }}
        placeholder={"Вставьте текст сюда…\n\nФормат А4, первая строка абзаца с отступом, пустая строка разделяет абзацы. Кириллица поддерживается."}
        className="w-full h-52 bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-800 focus:border-brand-400 focus:bg-white outline-none resize-y scrollbar-thin"
      />

      {progress && progress.phase === "text" && busy && (
        <div className="rounded-xl p-3 flex items-center gap-2 text-xs bg-brand-50 border border-brand-200 text-brand-700">
          <Loader2 className="w-4 h-4 animate-spin" />
          Создание PDF…
        </div>
      )}

      <button onClick={() => { void convert(); }} disabled={busy || !text.trim()}
        className="w-full py-2.5 bg-brand-500 text-white rounded-xl hover:bg-brand-600 font-bold text-sm transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
        {busy ? "Создание PDF..." : "Скачать .pdf"}
      </button>

      {done && (
        <div className="rounded-xl p-3 flex items-center gap-2.5 text-xs bg-emerald-50 border border-emerald-200 text-emerald-700">
          <Check className="w-4 h-4 text-emerald-500" />
          PDF скачан — {done.chars.toLocaleString("ru-RU")} символов, формат А4
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
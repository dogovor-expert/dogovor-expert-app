"use client";
import { useRef, useState } from "react";
import { FileText, Loader2, Printer, Check, X, AlertTriangle } from "lucide-react";
import { formatBytes } from "@/lib/converter/download";

// Санитизация HTML, который пришёл из DOCX, перед записью в iframe.
// mammoth.browser не имеет доступа к файловой системе (externalFileAccess не
// применим в браузерной сборке), но может собрать href/src и атрибуты
// событий из содержимого документа — потенциальный вектор DOM-XSS.
function sanitizeHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/(\shref|\ssrc)\s*=\s*(?:"\s*javascript:[^"]*"|'\s*javascript:[^']*')/gi, " $1='#'");
}

export default function DocxToPrint() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const onFile = async (list: FileList | null) => {
    const f = list?.[0];
    if (!f) return;
    const isDocx = f.name.toLowerCase().endsWith(".docx");
    if (!isDocx) {
      setError("Поддерживается только формат DOCX (Word 2007+)");
      return;
    }
    const MAX_FILE_SIZE_MB = 50; // PDF-файлы обычно крупнее фото, лимит выше чем в OCR
    if (f.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`Файл слишком большой (${(f.size / 1024 / 1024).toFixed(1)} МБ). Максимальный размер — ${MAX_FILE_SIZE_MB} МБ.`);
      return;
    }
    setFile(f);
    setError(null);
    setDone(false);
  };

  const convertAndPrint = async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    setDone(false);
    try {
      const mammoth = await import("mammoth/mammoth.browser");
      const { value } = await mammoth.convertToHtml({ arrayBuffer: await file.arrayBuffer() });
      const sanitized = sanitizeHtml(value);
      const iframe = iframeRef.current;
      if (!iframe) throw new Error("iframe unavailable");
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) throw new Error("doc unavailable");
      doc.open();
      doc.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${file.name}</title>
<style>
  @page { size: A4; margin: 2cm; }
  body { font-family: "Times New Roman", Georgia, serif; font-size: 12pt; line-height: 1.5; color: #000; }
  h1, h2, h3 { font-family: inherit; }
  table { border-collapse: collapse; width: 100%; }
  td, th { border: 1px solid #333; padding: 4px 8px; }
  img { max-width: 100%; }
</style></head><body>${sanitized}</body></html>`);
      doc.close();
      await new Promise((r) => setTimeout(r, 300));
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось конвертировать DOCX");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        onChange={(e) => { onFile(e.target.files); e.target.value = ""; }}
      />
      <iframe ref={iframeRef} className="hidden" title="docx-preview" />

      {!file ? (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full border-2 border-dashed border-gray-200 rounded-xl p-10 flex flex-col items-center gap-3 hover:border-brand-400 hover:bg-brand-50/30 transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center group-hover:bg-brand-100 transition-colors">
            <FileText className="w-6 h-6 text-brand-500" />
          </div>
          <div className="text-sm font-semibold text-gray-900">Выберите файл DOCX (Word)</div>
          <div className="text-xs text-gray-600">Конвертируется в HTML и открывается в окне печати — сохраните как PDF через принтер. Файл не покидает ваш браузер.</div>
        </button>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">{file.name}</p>
              <p className="text-[10px] text-gray-600">{formatBytes(file.size)}</p>
            </div>
            <button onClick={() => { setFile(null); setDone(false); }}
              className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 cursor-pointer" title="Удалить">
              <X className="w-4 h-4" />
            </button>
          </div>
          <button onClick={convertAndPrint} disabled={busy}
            className="w-full py-2.5 bg-brand-500 text-white rounded-xl hover:bg-brand-600 font-bold text-sm transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
            {busy ? "Конвертация..." : "Открыть для печати / сохранить как PDF"}
          </button>
          <div className="rounded-xl p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>В окне печати выберите «Сохранить как PDF». Колонтитулы, сложные колонки и точное позиционирование Word не переносятся — для идеальной вёрстки используйте исходный DOCX.</span>
          </div>
        </div>
      )}

      {done && (
        <div className="rounded-xl p-3 flex items-center gap-2.5 text-xs bg-emerald-50 border border-emerald-200 text-emerald-700">
          <Check className="w-4 h-4 text-emerald-500" />
          Готово — документ открыт в окне печати
        </div>
      )}
      {error && (
        <div className="rounded-xl p-3 text-xs bg-red-50 border border-red-200 text-red-700">{error}</div>
      )}
    </div>
  );
}

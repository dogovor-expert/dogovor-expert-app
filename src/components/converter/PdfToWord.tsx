"use client";
import { useRef, useState } from "react";
import { FileDown, Loader2, Download, Check, X, AlertTriangle } from "lucide-react";
import { downloadBlob, formatBytes, baseName } from "@/lib/converter/download";
import { clusterItemsToLines, groupIntoParagraphs, type TextLine } from "@/lib/converter/pdf-text";

let pdfjsReady = false;

async function getPdfjs() {
  const pdfjs = await import("pdfjs-dist");
  if (!pdfjsReady) {
    pdfjs.GlobalWorkerOptions.workerSrc = "/workers/pdf.worker.min.mjs";
    pdfjsReady = true;
  }
  return pdfjs;
}

export default function PdfToWord() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ paras: number; words: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const onFile = async (list: FileList | null) => {
    const f = list?.[0];
    if (!f) return;
    if (f.size > 50 * 1024 * 1024) {
      setError(`Файл слишком большой (${(f.size / 1024 / 1024).toFixed(1)} МБ). Максимальный размер — 50 МБ.`);
      return;
    }
    setFile(f);
    setError(null);
    setDone(null);
    setPageCount(0);
    try {
      const pdfjs = await getPdfjs();
      const task = pdfjs.getDocument({ data: await f.arrayBuffer() });
      const doc = await task.promise;
      setPageCount(doc.numPages);
      await task.destroy();
    } catch {
      setError("Не удалось открыть PDF — файл повреждён, защищён паролем или слишком большой");
    }
  };

  /** Реконструкция абзацев: строки → абзацы; заголовок = крупный шрифт на своём месте. */
  const rebuildParas = (pageLines: TextLine[][]): { text: string; heading?: boolean }[] => {
    const pgs = pageLines.map((lines) => groupIntoParagraphs(lines));
    const paras: { text: string; heading?: boolean }[] = [];
    for (const p of pgs) {
      for (const group of p) {
        const text = group.map((l) => l.text).join(" ").trim();
        if (!text) continue;
        if (group.length === 1 && group[0].size >= 16) {
          paras.push({ text, heading: true });
        } else {
          paras.push({ text });
        }
      }
    }
    return paras;
  };

  const convert = async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    setDone(null);
    try {
      const [{ Document, Packer, Paragraph, TextRun }, pdfjs] = await Promise.all([
        import("docx"),
        getPdfjs(),
      ]);
      const task = pdfjs.getDocument({ data: await file.arrayBuffer() });
      const doc = await task.promise;
      const pageLines: TextLine[][] = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        pageLines.push(clusterItemsToLines(content.items));
        page.cleanup();
      }
      await task.destroy();

      const paras = rebuildParas(pageLines);
      if (!paras.length) {
        setError("В PDF не найден текстовый слой. Это сканированный документ — сначала используйте «Скан → текст» (OCR).");
        return;
      }

      const children = paras.map((p) =>
        new Paragraph({
          children: [new TextRun(p.text)],
          spacing: { after: p.heading ? 240 : 200 },
          heading: p.heading ? "Heading1" : undefined,
        }),
      );

      const msDoc = new Document({
        sections: [{ properties: {}, children }],
      });
      const blob = await Packer.toBlob(msDoc);
      downloadBlob(blob, `${baseName(file.name)}.docx`);
      setDone({
        paras: paras.filter((p) => !p.heading).length,
        words: paras.reduce((s, p) => s + p.text.split(/\s+/).length, 0),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось конвертировать в Word");
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
        onChange={(e) => { void onFile(e.target.files); e.target.value = ""; }}
      />

      {!file ? (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full border-2 border-dashed border-gray-200 rounded-xl p-10 flex flex-col items-center gap-3 hover:border-brand-400 hover:bg-brand-50/30 transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center group-hover:bg-brand-100 transition-colors">
            <FileDown className="w-6 h-6 text-brand-500" />
          </div>
          <div className="text-sm font-semibold text-gray-900">Выберите PDF-файл</div>
          <div className="text-xs text-gray-600">Преобразуем в редактируемый документ Word (.docx). Всё в браузере.</div>
        </button>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">{file.name}</p>
              <p className="text-[10px] text-gray-600">{formatBytes(file.size)} · {pageCount || "…"} стр.</p>
            </div>
            <button onClick={() => { setFile(null); setDone(null); }}
              className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 cursor-pointer" title="Удалить">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="rounded-xl p-3 text-[11px] leading-relaxed bg-amber-50 border border-amber-200 text-amber-800">
            Текст и абзацы сохраняются, заголовки выделяются крупным шрифтом. Сложная вёрстка, таблицы и изображения
            могут отличаться от оригинала.
          </div>

          <button onClick={() => { void convert(); }} disabled={busy}
            className="w-full py-2.5 bg-brand-500 text-white rounded-xl hover:bg-brand-600 font-bold text-sm transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {busy ? "Создание документа..." : "Скачать .docx"}
          </button>
        </div>
      )}

      {done && (
        <div className="rounded-xl p-3 flex items-start gap-2.5 text-xs bg-emerald-50 border border-emerald-200 text-emerald-700">
          <Check className="w-4 h-4 mt-0.5 text-emerald-500" />
          <span>
            Word-документ скачан — {done.paras.toLocaleString("ru-RU")} абзацев,
            {done.words.toLocaleString("ru-RU")} слов
          </span>
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
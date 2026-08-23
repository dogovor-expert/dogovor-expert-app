"use client";
import { useState, useEffect } from "react";
import { Files, Scissors, Image as ImageIcon, FileImage, ScanText, PenLine, FileText, ShieldCheck } from "lucide-react";
import dynamic from "next/dynamic";

const MergePdf = dynamic(() => import("@/components/converter/MergePdf"), { ssr: false });
const SplitPdf = dynamic(() => import("@/components/converter/SplitPdf"), { ssr: false });
const ImagesToPdf = dynamic(() => import("@/components/converter/ImagesToPdf"), { ssr: false });
const PdfToImages = dynamic(() => import("@/components/converter/PdfToImages"), { ssr: false });
const OcrTool = dynamic(() => import("@/components/converter/OcrTool"), { ssr: false });
const SignPdf = dynamic(() => import("@/components/converter/SignPdf"), { ssr: false });
const DocxToPrint = dynamic(() => import("@/components/converter/DocxToPrint"), { ssr: false });

const tools = [
  { id: "merge", label: "Объединить PDF", icon: Files, desc: "Склеить несколько PDF в один", comp: MergePdf },
  { id: "split", label: "Разделить PDF", icon: Scissors, desc: "Извлечь страницы в отдельный файл", comp: SplitPdf },
  { id: "img2pdf", label: "JPG → PDF", icon: ImageIcon, desc: "Фото и сканы в документ A4", comp: ImagesToPdf },
  { id: "pdf2img", label: "PDF → JPG", icon: FileImage, desc: "Каждая страница — отдельная картинка", comp: PdfToImages },
  { id: "ocr", label: "Скан → текст", icon: ScanText, desc: "Распознавание русского текста (OCR)", comp: OcrTool },
  { id: "sign", label: "Подпись в PDF", icon: PenLine, desc: "Поставить подпись в документ", comp: SignPdf },
  { id: "docx", label: "DOCX → PDF", icon: FileText, desc: "Word в печать / PDF в браузере", comp: DocxToPrint },
] as const;

type ToolId = (typeof tools)[number]["id"];

export default function ConverterPage() {
  const [active, setActive] = useState<ToolId>("merge");

  // №15 аудита: инструмент можно открыть ссылкой /converter?tool=split
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("tool");
    if (t && tools.some((x) => x.id === t)) setActive(t as ToolId);
  }, []);

  const selectTool = (id: ToolId) => {
    setActive(id);
    const url = new URL(window.location.href);
    url.searchParams.set("tool", id);
    window.history.replaceState(null, "", url.pathname + "?" + url.searchParams.toString());
  };

  const current = tools.find((t) => t.id === active)!;
  const Component = current.comp;
  const Icon = current.icon;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-500">
          <Files className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Конвертер документов</h1>
          <p className="text-sm text-gray-600">PDF, JPG, Word, распознавание текста</p>
        </div>
      </div>

      <div className="rounded-xl p-3 flex items-start gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
        <ShieldCheck className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-500" />
        <span>
          <b>Все конвертации выполняются прямо в вашем браузере.</b> Файлы никуда не загружаются и не передаются на сервер — это безопасно для договоров и персональных данных (152-ФЗ).
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {tools.map((t) => {
          const Icon = t.icon;
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              onClick={() => selectTool(t.id)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                isActive
                  ? "border-brand-500 bg-brand-50 shadow-soft"
                  : "border-gray-200 bg-white hover:border-brand-300 hover:bg-gray-50"
              }`}
            >
              <Icon className={`w-5 h-5 mb-2 ${isActive ? "text-brand-600" : "text-gray-600"}`} />
              <p className={`text-xs font-semibold ${isActive ? "text-brand-700" : "text-gray-800"}`}>{t.label}</p>
              <p className="text-[10px] text-gray-600 mt-0.5 leading-snug">{t.desc}</p>
            </button>
          );
        })}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Icon className="w-4 h-4 text-brand-500" />
          <h2 className="text-sm font-bold text-gray-900">{current.label}</h2>
        </div>
        <Component />
      </div>

      <div className="text-xs text-gray-600 leading-relaxed">
        <p className="font-semibold text-gray-600 mb-1">Полезно при работе с договорами:</p>
        <p>
          • Объедините сканы страниц договора в один PDF для отправки или нотариуса<br />
          • Распознайте скан подписанного договора в текст для хранения в CRM<br />
          • Поставьте подпись в PDF перед отправкой по электронной почте<br />
          • Переведите DOCX в PDF для печати в типографии без искажений вёрстки
        </p>
      </div>
    </div>
  );
}

import {
  ArrowLeft,
  Check,
  ChevronDown,
  Copy,
  Download,
  Eye,
  FileImage,
  FileText,
  Loader2,
  Mail,
  Printer,
} from "lucide-react";
import type { LegalTemplate } from "@/data/types";
import PdfPreview from "@/components/PdfPreview";
import type { RefObject } from "react";
import { useState, useRef, useEffect } from "react";

interface PreviewStageProps {
  template: LegalTemplate;
  packTemplates: LegalTemplate[];
  isExporting: boolean;
  exportPages: number;
  printRef: RefObject<HTMLDivElement | null>;
  flatRef: RefObject<HTMLDivElement | null>;
  renderPreview: (t?: LegalTemplate) => string;
  onPrint: () => void;
  onCopyJson: () => void;
  onExportPdf: () => void;
  onExportPdfCurrent?: () => void;
  onExportDocx: () => void;
  onOpenEmailModal: () => void;
  emailSending: boolean;
  onBackToForm: () => void;
  /** Водяной знак бесплатного тарифа для превью (зеркалит PDF). */
  watermark?: string;
  /** Число страниц в сгенерированном PDF. */
  onPagesChange?: (n: number) => void;
  /** HTML обложки пакета (SHA-256 таблица) */
  coverHtml?: string | null;
  /** HTML листа подписей/соглашения на ПЭП */
  signHtml?: string | null;
}

export default function PreviewStage({
  template,
  packTemplates,
  isExporting,
  exportPages,
  printRef,
  flatRef,
  renderPreview,
  onPrint,
  onCopyJson,
  onExportPdf,
  onExportPdfCurrent,
  onExportDocx,
  onOpenEmailModal,
  emailSending,
  onBackToForm,
  watermark,
  onPagesChange,
  coverHtml,
  signHtml,
}: PreviewStageProps) {
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setExportMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
          <Check className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-emerald-800">
            Документ заполнен и проверен
          </p>
          <p className="text-xs text-emerald-600 mt-0.5">
            Все обязательные поля заполнены. Проверьте итоговый документ и скачайте.
          </p>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToForm}
              className="inline-flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              title="Вернуться к форме"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Вернуться к форме
            </button>
            <div className="flex items-center gap-3">
              <Eye className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-semibold text-gray-900">
                Предварительный просмотр
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onPrint}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
              title="Печать"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onCopyJson}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
              title="Копировать JSON"
            >
              <Copy className="w-4 h-4" />
            </button>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setExportMenuOpen(!exportMenuOpen)}
                disabled={isExporting}
                className="inline-flex items-center justify-center font-medium transition-all px-4 py-2 text-sm rounded-xl gap-2 bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50"
                aria-expanded={exportMenuOpen}
                aria-haspopup="true"
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : exportPages > 0 ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Скачать
                <ChevronDown className={`w-3 h-3 transition-transform ${exportMenuOpen ? "rotate-180" : ""}`} />
              </button>
              {exportMenuOpen && (
                <div className="absolute right-0 mt-1 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-10 animate-in fade-in-0 zoom-in-95">
                  <button
                    onClick={() => { onExportPdf(); setExportMenuOpen(false); }}
                    disabled={isExporting}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 rounded-t-xl transition-colors"
                  >
                    <FileImage className="w-3.5 h-3.5 text-red-500" />
                    Скачать PDF
                    {exportPages > 0 && (
                      <span className="ml-auto text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                        {exportPages} стр.
                      </span>
                    )}
                  </button>
                  {packTemplates.length > 1 && onExportPdfCurrent && (
                    <button
                      onClick={() => { onExportPdfCurrent(); setExportMenuOpen(false); }}
                      disabled={isExporting}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <FileImage className="w-3.5 h-3.5 text-red-400" />
                      PDF — только текущий документ
                    </button>
                  )}
                  <button
                    onClick={() => { onExportDocx(); setExportMenuOpen(false); }}
                    disabled={isExporting}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-500" />
                    Скачать DOCX
                  </button>
                  <button
                    onClick={() => { onOpenEmailModal(); setExportMenuOpen(false); }}
                    disabled={emailSending}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 rounded-b-xl transition-colors"
                  >
                    {emailSending ? (
                      <Loader2 className="w-3.5 h-3.5 text-emerald-500 animate-spin" />
                    ) : (
                      <Mail className="w-3.5 h-3.5 text-emerald-500" />
                    )}
                    Отправить на email
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        {template.printInstruction && (
          <div className="px-5 py-2 bg-amber-50 border-b border-amber-100">
            <p className="text-[11px] text-amber-700">
              {template.printInstruction}
            </p>
          </div>
        )}
        <div className="overflow-x-auto">
          <div ref={printRef}>
            <PdfPreview
              rootId="preview-stage"
              docs={[
                ...(coverHtml ? [coverHtml] : []),
                ...packTemplates.map((t) => renderPreview(t)),
                ...(signHtml ? [signHtml] : []),
              ]}
              design="classic"
              watermark={watermark}
              onPagesChange={onPagesChange}
            />
          </div>
        </div>
        <div
          ref={flatRef}
          className="hidden"
          dangerouslySetInnerHTML={{ __html: renderPreview() }}
        />
        <div className="px-5 py-4 flex items-center justify-between border-t border-gray-100">
          <button
            onClick={onBackToForm}
            className="inline-flex items-center justify-center font-medium transition-all px-4 py-2 text-sm rounded-xl gap-2 bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Вернуться к форме
          </button>
          <span className="text-xs text-gray-600">
            {packTemplates.length > 1
              ? `Пакет: ${packTemplates.length} документов`
              : "Экспорт — кнопка вверху"}
          </span>
        </div>
      </div>
    </>
  );
}

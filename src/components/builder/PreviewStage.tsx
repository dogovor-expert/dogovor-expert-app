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
  Printer,
} from "lucide-react";
import type { LegalTemplate } from "@/data/types";
import DocPreview from "@/components/DocPreview";
import type { RefObject } from "react";

interface PreviewStageProps {
  template: LegalTemplate;
  packTemplates: LegalTemplate[];
  isExporting: boolean;
  exportPages: number;
  printRef: RefObject<HTMLDivElement>;
  flatRef: RefObject<HTMLDivElement>;
  renderPreview: (t?: LegalTemplate) => string;
  onPrint: () => void;
  onCopyJson: () => void;
  onExportPdf: () => void;
  onExportDocx: () => void;
  onBackToForm: () => void;
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
  onExportDocx,
  onBackToForm,
}: PreviewStageProps) {
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
            <Eye className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-semibold text-gray-900">
              Предварительный просмотр
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onPrint}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
              title="Печать"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onCopyJson}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
              title="Копировать JSON"
            >
              <Copy className="w-4 h-4" />
            </button>
            <div className="relative group">
              <button
                onClick={onExportPdf}
                disabled={isExporting}
                className="inline-flex items-center justify-center font-medium transition-all px-4 py-2 text-sm rounded-xl gap-2 bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50"
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : exportPages > 0 ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Скачать
                <ChevronDown className="w-3 h-3" />
              </button>
              <div className="absolute right-0 mt-1 w-52 bg-white border border-gray-200 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <button
                  onClick={onExportPdf}
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
                <button
                  onClick={onExportDocx}
                  disabled={isExporting}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 rounded-b-xl transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-500" />
                  Скачать DOCX
                </button>
              </div>
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
            {packTemplates.map((t, i) => (
              <div key={t.id}>
                {packTemplates.length > 1 && (
                  <div className="doc-toolbar px-3 pt-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200">
                      <span className="text-[11px] font-semibold text-gray-500">
                        {i + 1}/{packTemplates.length}
                      </span>
                      <span className="text-[11px] font-medium text-gray-600 truncate">
                        {t.name}
                      </span>
                    </div>
                  </div>
                )}
                <DocPreview html={renderPreview(t)} />
              </div>
            ))}
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
          <button
            onClick={onExportPdf}
            disabled={isExporting}
            className="inline-flex items-center justify-center font-medium transition-all px-4 py-2 text-sm rounded-xl gap-2 bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {packTemplates.length > 1
              ? `Скачать пакет (${packTemplates.length})`
              : "Скачать документ"}
          </button>
        </div>
      </div>
    </>
  );
}

"use client";
import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import DocPreview from "@/components/DocPreview";
import { LEGAL_TEMPLATES } from "@/data/legalTemplates";
import { loadDraft } from "@/lib/autosave";
import { renderTemplateDocument } from "@/lib/renderDocument";
import { Download, Printer, ChevronLeft, FileText } from "lucide-react";

export default function PreviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-gray-500">
          Загрузка документа…
        </div>
      }
    >
      <PreviewContent />
    </Suspense>
  );
}

function PreviewContent() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get("template") || "dkp-auto";
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [loaded, setLoaded] = useState(false);
  const [html, setHtml] = useState("");
  const [notFound, setNotFound] = useState(false);

  const template = useMemo(
    () => LEGAL_TEMPLATES.find((t) => t.id === templateId) || LEGAL_TEMPLATES[0],
    [templateId]
  );

  useEffect(() => {
    const draft = loadDraft(templateId);
    if (!draft) {
      setNotFound(true);
      setLoaded(true);
      return;
    }
    try {
      const esignSeller = localStorage.getItem("esign_seller");
      const esignBuyer = localStorage.getItem("esign_buyer");
      setHtml(
        renderTemplateDocument(template, draft.values, {
          qrSvg: null,
          signSeller: esignSeller,
          signBuyer: esignBuyer,
        })
      );
    } finally {
      setLoaded(true);
    }
  }, [template, templateId]);

  const handlePrint = () => {
    const printRoot = document.getElementById("print-root");
    if (printRoot) window.print();
  };

  const handleDownload = () => {
    window.location.href = `/builder?template=${template.id}`;
  };

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md bg-white rounded-2xl border border-gray-200 p-10 shadow-soft">
          <FileText className="w-10 h-10 text-gray-300 mx-auto mb-4" />
          <h1 className="text-lg font-bold text-gray-900 mb-2">
            Черновик не найден
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Сначала заполните форму в конструкторе — документ автоматически
            сохранится, и предпросмотр станет доступен.
          </p>
          <a
            href={`/builder?template=${template.id}`}
            className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-colors"
          >
            Открыть конструктор <ChevronLeft className="w-4 h-4 rotate-180" />
          </a>
        </div>
      </div>
    );
  }

  if (!loaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">
        Загрузка документа…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 h-14 flex-shrink-0">
        <div className="flex items-center gap-3">
          <a
            href={`/builder?template=${template.id}`}
            className="flex items-center gap-1 p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700 transition-colors"
            title="Вернуться к заполнению"
          >
            <ChevronLeft className="w-5 h-5" />
          </a>
          <div>
            <h1 className="text-sm font-semibold text-gray-900">
              {template.name} — предпросмотр
            </h1>
            <p className="text-xs text-gray-400">
              {pageCount > 0 ? `Страница ${page} из ${pageCount}` : "Формирование страниц…"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleDownload}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Download className="w-4 h-4" />
            Редактировать
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Печать
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6 sm:p-10">
        <DocPreview html={html} onPagesChange={setPageCount} />
      </div>

      <footer className="bg-white border-t border-gray-200 flex items-center justify-between px-4 sm:px-6 h-14 flex-shrink-0">
        <span className="text-xs text-gray-400">
          Черновик хранится локально в вашем браузере
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 transition-colors"
          >
            ← Назад
          </button>
          <span className="text-sm text-gray-600">
            {page} / {pageCount}
          </span>
          <button
            onClick={() => setPage(Math.min(pageCount, page + 1))}
            disabled={page >= pageCount}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 transition-colors"
          >
            Вперёд →
          </button>
        </div>
        <span className="text-xs text-gray-400">Подготовлено в Dogovor.fun</span>
      </footer>
    </div>
  );
}
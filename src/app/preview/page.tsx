"use client";
import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import DocPreview from "@/components/DocPreview";
import { LEGAL_TEMPLATES } from "@/data/legalTemplates";
import { TEMPLATE_PREVIEWS } from "@/data/templatePreviews";
import { loadDraft } from "@/lib/autosave";
import { renderTemplateDocument } from "@/lib/renderDocument";
import { buildTemplateDefaults } from "@/lib/format";
import { Download, Printer, ChevronLeft } from "lucide-react";

export default function PreviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-gray-600">
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
  const [noDraft, setNoDraft] = useState(false);

  const template = useMemo(
    () => LEGAL_TEMPLATES.find((t) => t.id === templateId) || LEGAL_TEMPLATES[0],
    [templateId]
  );

  useEffect(() => {
    const draft = loadDraft(templateId);
    // Черновик хранится в localStorage и привязан к устройству. На другом
    // устройстве/в приватном режиме его нет — вместо «Черновик не найден»
    // показываем документ с дефолтными значениями шаблона, чтобы предпросмотр
    // и печать всегда работали.
    const values = draft ? draft.values : buildTemplateDefaults(template);
    setNoDraft(!draft);
    try {
      const esignSeller = localStorage.getItem("esign_seller");
      const esignBuyer = localStorage.getItem("esign_buyer");
      setHtml(
        renderTemplateDocument(template, values, {
          qrSvg: null,
          signSeller: esignSeller,
          signBuyer: esignBuyer,
          previewTemplate: TEMPLATE_PREVIEWS[template.id],
        })
      );
    } finally {
      setLoaded(true);
    }
  }, [template, templateId]);

  const handlePrint = () => {
    // Профессиональный подход (react-to-print / Google Docs): печатаем из
    // выделенного iframe, в который копируем только #print-root + стили
    // страницы. Тогда сторонние виджеты (Jivo и т.п., висящие в body
    // родительской страницы) в печать не попадают.
    //
    // Важно: iframe должен иметь РЕАЛЬНЫЕ размеры. Chromium масштабирует
    // печать iframe по ширине самого фрейма — при width/height:0 контент
    // схлопывается в 0 и печатается пустым. display:none тоже ломает
    // contentWindow.print() в Chrome 65+, поэтому прячем через
    // visibility:hidden + вынос за экран.
    const printRoot = document.getElementById("print-root");
    if (!printRoot) {
      window.print();
      return;
    }
    const iframe = document.createElement("iframe");
    iframe.setAttribute("aria-hidden", "true");
    iframe.style.cssText =
      "position:fixed;left:-10000px;top:0;width:210mm;height:297mm;border:0;visibility:hidden;z-index:-1;";
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument;
    if (!doc) {
      iframe.remove();
      window.print();
      return;
    }

    const origin = window.location.origin;
    const styles = Array.from(
      document.querySelectorAll('style, link[rel="stylesheet"]')
    )
      // Во фрейме базовый URL — страница сайта, но для надёжности делаем
      // пути /_next/... абсолютными относительно origin.
      .map((el) => el.outerHTML.replace(/(href|src)="\//g, `$1="${origin}/`))
      .join("\n");

    // Нейтрализуем глобальный @media print из globals.css (он прячет контент
    // через visibility:hidden). Здесь печатаем ТОЛЬКО документ, поэтому
    // принудительно делаем всё видимым и задаём A4-раскладку.
    const resetStyle = `
      <style>
        @page { size: A4; margin: 0; }
        html, body { margin: 0; padding: 0; background: #fff !important; }
        @media print { body * { visibility: visible !important; } }
        #print-root { width: 210mm; margin: 0; padding: 0 !important; display: block !important; }
        .a4-sheet { page-break-after: always; break-after: page; box-shadow: none !important; border: none !important; border-radius: 0 !important; }
        .a4-sheet:last-child { page-break-after: auto; break-after: auto; }
        .doc-toolbar, .doc-preview-caption, .no-print { display: none !important; }
      </style>`;

    doc.open();
    doc.write(
      `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8" />` +
        `<title>${template.name} — печать</title>${styles}${resetStyle}` +
        `</head><body>${printRoot.outerHTML}</body></html>`
    );
    doc.close();

    let printed = false;
    const cleanup = () => iframe.remove();
    const doPrint = () => {
      if (printed) return;
      printed = true;
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } finally {
        // Удаляем фрейм чуть позже, чтобы печать успела стартовать.
        setTimeout(cleanup, 500);
      }
    };

    if (doc.readyState === "complete") {
      setTimeout(doPrint, 300);
    } else {
      iframe.onload = () => setTimeout(doPrint, 300);
      // fallback, если событие load не наступило (например, упал один из стилей)
      setTimeout(doPrint, 2000);
    }
  };

  const handleDownload = () => {
    window.location.href = `/builder?template=${template.id}`;
  };

  if (!loaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-600">
        Загрузка документа…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 h-14 flex-shrink-0 print:hidden">
        <div className="flex items-center gap-3">
          <a
            href={`/builder?template=${template.id}`}
            className="flex items-center gap-1 p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-700 transition-colors"
            title="Вернуться к заполнению"
          >
            <ChevronLeft className="w-5 h-5" />
          </a>
          <div>
            <h1 className="text-sm font-semibold text-gray-900">
              {template.name} — предпросмотр
            </h1>
            <p className="text-xs text-gray-600">
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

      {noDraft && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-800 text-xs px-4 sm:px-6 py-2 print:hidden">
          Предпросмотр шаблона: данные не заполнены (черновик не найден в этом
          браузере). Откройте конструктор, чтобы подставить свои значения.
        </div>
      )}

      <div className="flex-1 overflow-auto p-6 sm:p-10">
        <DocPreview html={html} onPagesChange={setPageCount} />
      </div>

      <footer className="bg-white border-t border-gray-200 flex items-center justify-between px-4 sm:px-6 h-14 flex-shrink-0 print:hidden">
        <span className="text-xs text-gray-600">
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
        <span className="text-xs text-gray-600">Подготовлено в Dogovor.expert</span>
      </footer>
    </div>
  );
}
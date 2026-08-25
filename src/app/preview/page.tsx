"use client";
import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import DocPreview from "@/components/DocPreview";
import { LEGAL_TEMPLATES } from "@/data/legalTemplates";
import { TEMPLATE_PREVIEWS } from "@/data/templatePreviews";
import { loadDraft } from "@/lib/autosave";
import { renderTemplateDocument } from "@/lib/renderDocument";
import { buildTemplateDefaults } from "@/lib/format";
import { encodeShareState, decodeShareState, type SharePayload } from "@/lib/shareState";
import { Download, Printer, ChevronLeft, Share2, Check } from "lucide-react";

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
  const [fromShare, setFromShare] = useState(false);
  const [shared, setShared] = useState<SharePayload | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [esignSeller, setEsignSeller] = useState<string | null>(null);
  const [esignBuyer, setEsignBuyer] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const template = useMemo(
    () => LEGAL_TEMPLATES.find((t) => t.id === templateId) || LEGAL_TEMPLATES[0],
    [templateId]
  );

  // Share-ссылка (d=...) декодируется синхронно до рендера — контент
  // появляется мгновенно, без fetch, как в serverless-share паттерне.
  useEffect(() => {
    const decoded = decodeShareState(searchParams.get("d"));
    setShared(decoded);
  }, [searchParams]);

  useEffect(() => {
    // Черновик хранится в localStorage и привязан к устройству. На другом
    // устройстве/в приватном режиме его нет. Приоритет источников:
    //   1) share-ссылка (d=) — перенос между устройствами
    //   2) localStorage черновик
    //   3) дефолтные значения шаблона
    // иначе предпросмотр и печать всегда работают.
    const draft = loadDraft(templateId);
    let srcValues: Record<string, string>;
    let isShare = false;
    if (shared) {
      srcValues = { ...buildTemplateDefaults(template), ...shared.values };
      isShare = true;
    } else if (draft) {
      srcValues = draft.values;
    } else {
      srcValues = buildTemplateDefaults(template);
    }
    setValues(srcValues);
    setFromShare(isShare);
    setNoDraft(!draft && !shared);

    try {
      const lsSeller = localStorage.getItem("esign_seller");
      const lsBuyer = localStorage.getItem("esign_buyer");
      const seller = shared?.signSeller ?? lsSeller;
      const buyer = shared?.signBuyer ?? lsBuyer;
      setEsignSeller(seller);
      setEsignBuyer(buyer);
      setHtml(
        renderTemplateDocument(template, srcValues, {
          qrSvg: null,
          signSeller: seller,
          signBuyer: buyer,
          previewTemplate: TEMPLATE_PREVIEWS[template.id],
        })
      );
    } finally {
      setLoaded(true);
    }
  }, [template, templateId, shared]);

  // Печать: используем нативный window.print() + корректный @media print в
  // globals.css (там #print-root изолируется, body * прячется, .a4-sheet
  // получает A4-раскладку). Это стандарт для SPA, без хрупких off-screen
  // iframe и гонок загрузки внешнего CSS, которые давали пустую печать.
  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const encoded = encodeShareState({
      values,
      signSeller: esignSeller,
      signBuyer: esignBuyer,
    });
    const url = `${window.location.origin}${window.location.pathname}?template=${template.id}&d=${encoded}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // clipboard может быть недоступен (http / старый браузер) — даём
      // пользователю самому скопировать через prompt.
      window.prompt("Скопируйте ссылку:", url);
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            title="Скопировать ссылку на документ (откроется на любом устройстве)"
          >
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Share2 className="w-4 h-4" />}
            {copied ? "Скопировано" : "Поделиться"}
          </button>
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

      {fromShare && (
        <div className="bg-blue-50 border-b border-blue-200 text-blue-800 text-xs px-4 sm:px-6 py-2 print:hidden">
          Документ открыт по общей ссылке — его можно сразу распечатать или
          скопировать/отредактировать в конструкторе.
        </div>
      )}

      {noDraft && !fromShare && (
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
          {fromShare ? "Открыто по общей ссылке" : "Черновик хранится локально в вашем браузере"}
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
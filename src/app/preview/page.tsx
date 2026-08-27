"use client";
import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PdfPreview from "@/components/PdfPreview";
import { LEGAL_TEMPLATES } from "@/data/legalTemplates";
import { TEMPLATE_PREVIEWS } from "@/data/templatePreviews";
import { loadDraft } from "@/lib/autosave";
import { renderTemplateDocument } from "@/lib/renderDocument";
import { buildTemplateDefaults, todayStr } from "@/lib/format";
import { buildPdf } from "@/lib/exportPdf";
import { saveAs } from "file-saver";
import {
  encodeShareState,
  decodeShareState,
  encodeShareStateV2,
  decodeShareStateV2,
  isEncryptedShare,
  type SharePayload,
  type EncryptedShareLink,
} from "@/lib/shareState";
import { Download, Printer, ChevronLeft, Share2, Check, FileDown, Loader2 } from "lucide-react";

// Кастомные шрифты документа — предзагружаем перед печатью, чтобы в PDF/
// на бумаге не было подмены шрифта (FOUT) и архивная вёрстка совпадала
// с экраном (подход react-to-print: проп fonts гарантирует загрузку).
type PrintFont = { family: string; source: string; weight?: string; style?: string };
const PRINT_FONTS: PrintFont[] = [
  { family: "PT Astra Sans", source: "/fonts/pt-astra-regular.ttf", weight: "400", style: "normal" },
  { family: "PT Astra Sans", source: "/fonts/pt-astra-bold.ttf", weight: "700", style: "normal" },
  { family: "PT Astra Sans", source: "/fonts/pt-astra-italic.ttf", weight: "400", style: "italic" },
  { family: "PT Astra Sans", source: "/fonts/pt-astra-bolditalic.ttf", weight: "700", style: "italic" },
  { family: "PT Serif", source: "/fonts/pt-serif-regular.ttf", weight: "400", style: "normal" },
  { family: "PT Serif", source: "/fonts/pt-serif-bold.ttf", weight: "700", style: "normal" },
];

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
  const [copied, setCopied] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);

  const template = useMemo(
    () => LEGAL_TEMPLATES.find((t) => t.id === templateId) || LEGAL_TEMPLATES[0],
    [templateId]
  );

  // Share-ссылка (d=...) декодируется до рендера — контент появляется
  // мгновенно, без fetch, как в serverless-share паттерне.
  //   • legacy (?d=<lz-string>) — ПД видны в query (оставлено для старых ссылок)
  //   • v2 (?d=<aes-gcm>&#k=<key>) — zero-knowledge: ключ только во фрагменте,
  //     который браузер НЕ отправляет на сервер, сервер видит лишь ciphertext.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const d = searchParams.get("d");
      const k = window.location.hash.startsWith("#k=")
        ? decodeURIComponent(window.location.hash.slice(3))
        : null;
      let decoded: SharePayload | null = null;
      if (d && isEncryptedShare(d)) {
        decoded = await decodeShareStateV2(d, k);
      } else {
        decoded = decodeShareState(d);
      }
      if (!cancelled) setShared(decoded);
    })();
    return () => {
      cancelled = true;
    };
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
      setHtml(
        renderTemplateDocument(template, srcValues, {
          qrSvg: null,
          previewTemplate: TEMPLATE_PREVIEWS[template.id],
        })
      );
    } finally {
      setLoaded(true);
    }
  }, [template, templateId, shared]);

  // Печать: используем уже отрисованные страницы-картинки в #print-root
  // (они рисуются PdfPreview через pdf.js и идентичны скачанному PDF).
  // Печатаем прямым window.print() внутри жеста пользователя — без iframe
  // и нативного PDF-плагина, которые ненадёжны (display:none ломает
  // рендер плагина, мобильные браузеры не умеют programmatic print плагина).
  const handlePrint = () => {
    window.print();
  };

  // Архивный PDF клиентским движком (pdf-lib, buildPdf) — как в Google Docs
  // по качеству, но генерится в браузере, без сервера. Переиспользуем тот же
  // renderTemplateDocument + те же значения/подписи, что и на экране.
  const handleDownloadPdf = async () => {
    if (pdfBusy) return;
    setPdfBusy(true);
    try {
      const html = renderTemplateDocument(template, values, {
        qrSvg: null,
        previewTemplate: TEMPLATE_PREVIEWS[template.id],
      });
      const { blob } = await buildPdf(html, {
        design: "classic",
        pageNumbers: true,
      });
      saveAs(blob, `${template.name}_${todayStr()}.pdf`);
    } catch (e) {
      console.error("PDF export error:", e);
    } finally {
      setPdfBusy(false);
    }
  };

  const handleShare = async () => {
    // Zero-knowledge share: шифруем AES-256-GCM случайным ключом, ключ
    // кладём в #фрагмент URL (никогда не уходит на сервер). Сервер видит
    // только ciphertext в ?d= — ПД не покидают браузер в открытом виде.
    const link: EncryptedShareLink = await encodeShareStateV2({
      values,
    });
    const url = `${window.location.origin}${window.location.pathname}?template=${template.id}&d=${link.d}#k=${encodeURIComponent(link.k)}`;
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
    <div id="preview-app" className="min-h-screen bg-gray-100 flex flex-col">
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
            onClick={handleDownloadPdf}
            disabled={pdfBusy}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
            title="Скачать документ в виде PDF (архивное качество)"
          >
            <FileDown className="w-4 h-4" />
            {pdfBusy ? "Готовим PDF…" : "Скачать PDF"}
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
        <div>
          <PdfPreview
            docs={[html]}
            design="classic"
            onPagesChange={setPageCount}
          />
        </div>
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
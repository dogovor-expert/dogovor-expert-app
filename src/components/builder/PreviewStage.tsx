import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  ChevronDown,
  Copy,
  Download,
  Eye,
  FileImage,
  FileText,
  Loader2,
  Mail,
  Maximize2,
  Minus,
  Pencil,
  Plus,
  Printer,
  X,
} from "lucide-react";
import type { LegalTemplate, TemplateField } from "@/data/types";
import PdfPreview from "@/components/PdfPreview";
import { type RefObject, useState, useRef, useEffect } from "react";
import { saveAs } from "file-saver";
import { buildIcs, isDeadlineField, type IcsEvent } from "@/lib/ics";

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
  /** Быстрое редактирование: список заполненных полей + правка без выхода из превью. */
  quickEditFields?: TemplateField[];
  quickEditValues?: Record<string, string>;
  onQuickEditChange?: (fieldId: string, value: string) => void;
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
  quickEditFields,
  quickEditValues,
  onQuickEditChange,
}: PreviewStageProps) {
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [quickEditOpen, setQuickEditOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [pageImgs, setPageImgs] = useState<string[]>([]);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIdx, setViewerIdx] = useState(0);
  const [zoom, setZoom] = useState(1);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!viewerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setViewerOpen(false);
      if (e.key === "ArrowRight") setViewerIdx((i) => Math.min(i + 1, pageImgs.length - 1));
      if (e.key === "ArrowLeft") setViewerIdx((i) => Math.max(i - 1, 0));
    };
    document.addEventListener("keydown", onKey);
    const prevBody = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevBody;
    };
  }, [viewerOpen, pageImgs.length]);

  const handleCopyJson = () => {
    onCopyJson();
    setCopied(true);
    if (copiedTimer.current) clearTimeout(copiedTimer.current);
    copiedTimer.current = setTimeout(() => setCopied(false), 2000);
  };

  const icsEvents = (): IcsEvent[] => {
    if (!template || !quickEditValues) return [];
    const events: IcsEvent[] = [];
    for (const f of template.fields) {
      if (f.type !== "date") continue;
      const value = (quickEditValues[f.id] ?? "").trim();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) continue;
      const uid = `${template.id}-${f.id}-${value}@dogovor.expert`;
      events.push({
        uid,
        summary: f.label,
        start: value,
        description: template.name,
        alarmsMin: isDeadlineField(f.id) ? [1440, 2880] : [],
      });
    }
    return events;
  };

  const handleExportIcs = () => {
    const events = icsEvents();
    if (events.length === 0) return;
    const ics = buildIcs({ events, name: template.name });
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    saveAs(blob, `${template.name}_напоминания.ics`);
    setExportMenuOpen(false);
  };

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
              onClick={handleCopyJson}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors relative"
              title="Экспорт данных формы (JSON)"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {copied && (
                <span className="absolute top-full right-0 mt-1 whitespace-nowrap text-xs bg-gray-900 text-white px-2 py-1 rounded-md shadow-lg z-10">
                  Скопировано
                </span>
              )}
            </button>
            {quickEditFields && quickEditFields.length > 0 && onQuickEditChange && (
              <button
                onClick={() => setQuickEditOpen(!quickEditOpen)}
                className={`p-2 rounded-lg transition-colors ${
                  quickEditOpen
                    ? "bg-brand-50 text-brand-600"
                    : "hover:bg-gray-100 text-gray-600"
                }`}
                title="Быстрое редактирование полей"
                aria-expanded={quickEditOpen}
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
            {pageImgs.length > 0 && (
              <button
                onClick={() => { setViewerIdx(0); setZoom(1); setViewerOpen(true); }}
                className="inline-flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                title="Полноэкранный просмотр (удобно на телефоне)"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                Просмотр
              </button>
            )}
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
                  {template && quickEditValues && icsEvents().length > 0 && (
                    <button
                      onClick={handleExportIcs}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Calendar className="w-3.5 h-3.5 text-violet-500" />
                      Скачать .ics (календарь)
                      <span className="ml-auto text-[10px] text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded-full">
                        {icsEvents().length}
                      </span>
                    </button>
                  )}
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
        {quickEditOpen && quickEditFields && quickEditFields.length > 0 && onQuickEditChange && (
          <div className="px-5 py-3 bg-brand-50/50 border-b border-brand-100">
            <p className="text-xs font-medium text-gray-700 mb-2">
              Быстрое редактирование — изменения сразу видны в документе
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
              {quickEditFields.map((f) => (
                <label key={f.id} className="block">
                  <span className="block text-[11px] text-gray-600 truncate">
                    {f.label}
                  </span>
                  <input
                    type="text"
                    value={quickEditValues?.[f.id] ?? ""}
                    onChange={(e) => onQuickEditChange(f.id, e.target.value)}
                    className="w-full px-2.5 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-400 focus:border-brand-400 outline-none"
                  />
                </label>
              ))}
            </div>
          </div>
        )}
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
              onImagesReady={setPageImgs}
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
      {viewerOpen && pageImgs.length > 0 && (
        <div
          className="fixed inset-0 z-[70] bg-black/95 flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-label="Просмотр страниц документа"
        >
          <div className="flex items-center justify-between px-4 py-3 text-white/90 bg-black/60">
            <span className="text-sm font-medium tabular-nums">
              {viewerIdx + 1} / {pageImgs.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setZoom((z) => Math.max(1, +(z - 0.25).toFixed(2)))}
                disabled={zoom <= 1}
                className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-40"
                aria-label="Уменьшить"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-xs w-12 text-center tabular-nums">{Math.round(zoom * 100)}%</span>
              <button
                onClick={() => setZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)))}
                disabled={zoom >= 3}
                className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-40"
                aria-label="Увеличить"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewerOpen(false)}
                className="p-2 rounded-lg hover:bg-white/10 ml-2"
                aria-label="Закрыть просмотр"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div
            className="relative flex-1 overflow-auto"
            onTouchStart={(e) => {
              touchX.current = e.touches[0]?.clientX ?? null;
            }}
            onTouchEnd={(e) => {
              if (touchX.current === null || zoom > 1) return;
              const dx = (e.changedTouches[0]?.clientX ?? 0) - touchX.current;
              if (dx < -60) setViewerIdx((i) => Math.min(i + 1, pageImgs.length - 1));
              if (dx > 60) setViewerIdx((i) => Math.max(i - 1, 0));
              touchX.current = null;
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pageImgs[Math.min(viewerIdx, pageImgs.length - 1)]}
              alt={`Страница ${viewerIdx + 1}`}
              className="block mx-auto my-4 bg-white shadow-xl"
              style={{ width: `${zoom * 100}%`, maxWidth: "none", height: "auto" }}
            />
          </div>
          {pageImgs.length > 1 && (
            <div className="flex items-center justify-center gap-6 py-3 bg-black/60">
              <button
                onClick={() => setViewerIdx((i) => Math.max(i - 1, 0))}
                disabled={viewerIdx === 0}
                className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-30"
                aria-label="Предыдущая страница"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewerIdx((i) => Math.min(i + 1, pageImgs.length - 1))}
                disabled={viewerIdx >= pageImgs.length - 1}
                className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-30"
                aria-label="Следующая страница"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { LEGAL_TEMPLATES } from "@/data/legalTemplates";
import type { LegalTemplate } from "@/data/types";
import { renderTemplateDocument } from "@/lib/renderDocument";
import { buildTemplateDefaults, todayStr } from "@/lib/format";
import { saveAs } from "file-saver";
import { Loader2, Download, X } from "lucide-react";

function ExportPdfInner() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [template, setTemplate] = useState<LegalTemplate | null>(null);
  const [packTemplates, setPackTemplates] = useState<LegalTemplate[]>([]);
  const [design, setDesign] = useState<string>("classic");
  const [watermark, setWatermark] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const templateParam = searchParams.get("template");
        const packParam = searchParams.get("pack");
        const designParam = searchParams.get("design");
        const watermarkParam = searchParams.get("watermark");

        if (!templateParam) {
          setError("Не указан шаблон для экспорта");
          setLoading(false);
          return;
        }

        const t = LEGAL_TEMPLATES.find((x) => x.id === templateParam);
        if (!t) {
          setError("Шаблон не найден");
          setLoading(false);
          return;
        }

        setTemplate(t);
        setDesign((designParam as "classic" | "modern" | "minimal") || "classic");
        setWatermark(watermarkParam === "true");

        // Если передан pack — собираем пакет
        if (packParam) {
          const ids = packParam.split(",");
          const pack = ids.map((id) => LEGAL_TEMPLATES.find((x) => x.id === id)).filter(Boolean) as LegalTemplate[];
          if (pack.length > 0) setPackTemplates(pack);
        }

        setLoading(false);
      } catch (e) {
        setError("Ошибка инициализации экспорта");
        setLoading(false);
        console.error(e);
      }
    }
    init();
  }, [searchParams]);

  const handleExport = async () => {
    if (!template) return;

    setLoading(true);
    setProgress(0);

    try {
      // Собираем HTML документов
      const docs: string[] = [];
      const list = packTemplates.length > 0 ? packTemplates : [template];

      for (const t of list) {
        const { TEMPLATE_PREVIEWS } = await import("@/data/templatePreviews");
        const html = renderTemplateDocument(t, buildTemplateDefaults(t), {
          previewTemplate: TEMPLATE_PREVIEWS[t.id],
        });
        docs.push(html);
      }

      setProgress(50);

      // Ленивая загрузка pdf-lib и генерации PDF только при клике
      const { buildPdf } = await import("@/lib/exportPdf");
      const { blob } = await buildPdf(docs, {
        design: design as "brand" | "classic" | "minimal",
        watermark: watermark ? "Сформировано бесплатно на сервисе Dogovor" : undefined,
        pageNumbers: true,
      });

      setProgress(80);

      const fileName = packTemplates.length > 1
        ? `Паспорт_сделки_${todayStr()}`
        : `${template.name}_${todayStr()}`;

      saveAs(blob, `${fileName}.pdf`);
      setProgress(100);
    } catch (e) {
      console.error("Export error:", e);
      setError("Не удалось сформировать PDF");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !template) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-600" />
          <p className="mt-4 text-gray-600">Подготовка экспорта…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center">
          <X className="w-12 h-12 mx-auto text-red-500" />
          <h2 className="mt-4 text-xl font-bold text-gray-900">Ошибка экспорта</h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="mt-6 px-6 py-3 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 transition"
          >
            Назад
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 p-8 shadow-soft">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
            <Download className="w-8 h-8 text-brand-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Экспорт в PDF</h1>
          <p className="text-gray-600 mt-1">
            {packTemplates.length > 1
              ? `Пакет из ${packTemplates.length} документов`
              : template?.name}
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
            <p className="font-semibold text-gray-900 mb-2">Настройки:</p>
            <ul className="space-y-1 text-left">
              <li>Дизайн: {design === "classic" ? "Классический" : design === "modern" ? "Современный" : "Минимальный"}</li>
              <li>Нумерация страниц: включена</li>
              <li>Водяной знак: {watermark ? "да (бесплатный тариф)" : "нет (Pro)"}</li>
            </ul>
          </div>

          <button
            onClick={handleExport}
            disabled={loading}
            className="w-full px-6 py-3.5 bg-brand-600 text-white rounded-xl font-semibold text-base hover:bg-brand-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {progress > 0 && <span>{Math.round(progress)}%</span>}
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Сформировать и скачать PDF
              </>
            )}
          </button>

          <button
            onClick={() => window.history.back()}
            className="w-full px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ExportPdfPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[75vh] flex items-center justify-center p-4">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-600" />
            <p className="mt-4 text-gray-600">Подготовка экспорта…</p>
          </div>
        </div>
      }
    >
      <ExportPdfInner />
    </Suspense>
  );
}
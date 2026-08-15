"use client";

import { useState } from "react";
import { LEGAL_TEMPLATES } from "@/data/legalTemplates";
import { renderTemplateDocument } from "@/lib/renderDocument";
import { buildPdf } from "@/lib/exportPdf";

const SAMPLE: Record<string, string> = {
  city: "Москва",
  date: "2026-08-15",
  seller_fio: "Иванов Иван Иванович",
  seller_passport_series: "4512",
  seller_passport_number: "123456",
  seller_passport_issued_by: "ОВД района Хамовники г. Москвы",
  seller_passport_code: "770-001",
  seller_address: "г. Москва, ул. Тверская, д. 1, кв. 10",
  seller_phone: "+7 900 000-00-01",
  buyer_fio: "Петров Петр Петрович",
  buyer_passport_series: "4615",
  buyer_passport_number: "987654",
  buyer_passport_issued_by: "ОВД района Арбат г. Москвы",
  buyer_passport_code: "770-002",
  buyer_address: "г. Москва, ул. Арбат, д. 2, кв. 20",
  buyer_phone: "+7 900 000-00-02",
  car_brand: "Kia Rio",
  car_year: "2019",
  car_color: "белый",
  car_vin: "Z94CB41AAKR123456",
  car_engine: "G4LC",
  car_chassis: "отсутствует",
  car_plate: "А123ВС77",
  car_pts: "78 УХ 456789",
  car_epts: "",
  car_sts: "9918 123456",
  contract_price: "650000",
  contract_price_words: "Шестьсот пятьдесят тысяч рублей 00 копеек",
  copies_count: "3",
};

export default function DebugPdfPage() {
  const [templateId, setTemplateId] = useState("dkp-auto");
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const template =
    LEGAL_TEMPLATES.find((t) => t.id === templateId) || LEGAL_TEMPLATES[0];

  const handleDownload = async () => {
    setBusy(true);
    setError(null);
    try {
      const html = renderTemplateDocument(template, SAMPLE);
      const { blob, pageCount: pc } = await buildPdf(html, { pageNumbers: true });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${template.id}-debug.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setPageCount(pc);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const previewHtml = renderTemplateDocument(template, SAMPLE);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Отладка PDF</h1>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <select
          value={templateId}
          onChange={(e) => {
            setTemplateId(e.target.value);
            setPageCount(null);
          }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          {LEGAL_TEMPLATES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <button
          onClick={handleDownload}
          disabled={busy}
          className="px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium disabled:opacity-50"
        >
          {busy ? "Генерация…" : "Скачать PDF"}
        </button>
        {pageCount !== null && (
          <span className="text-sm text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg">
            Страниц: {pageCount}
          </span>
        )}
        {error && (
          <span className="text-sm text-red-600 bg-red-50 px-3 py-1.5 rounded-lg">
            Ошибка: {error}
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-sm font-semibold text-gray-600 mb-2">
            HTML-превью (что видит PDF-движок)
          </h2>
          <div className="border border-gray-200 rounded-xl p-4 overflow-auto max-h-[900px] bg-white">
            <div
              className="font-serif text-sm text-zinc-900"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-600 mb-2">
            Исходный HTML
          </h2>
          <pre className="border border-gray-200 rounded-xl p-4 overflow-auto max-h-[900px] text-xs bg-zinc-900 text-zinc-100">
            {previewHtml}
          </pre>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
import {
  AlignLeft,
  Archive,
  Droplets,
  FileDown,
  FileImage,
  FileText,
  Files,
  FileUp,
  Hash,
  Image as ImageIcon,
  LayoutGrid,
  PenLine,
  ScanText,
  Scissors,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import ConverterRunner from "@/components/converter/ConverterRunner";
import { CONVERTER_TOOLS } from "@/data/converter-tools";

const ICONS: Record<string, LucideIcon> = {
  Files,
  Scissors,
  LayoutGrid,
  Archive,
  Image: ImageIcon,
  FileImage,
  FileText,
  AlignLeft,
  FileDown,
  ScanText,
  PenLine,
  FileUp,
  Droplets,
  Hash,
};

/**
 * Интерактивный хаб конвертера: сетка инструментов + панель выбранного
 * инструмента на одной странице, без перехода. SEO-страницы
 * `/converter/[tool]` при этом остаются отдельными URL.
 */
export default function ConverterHub({ initialId }: { initialId?: string }) {
  const [active, setActive] = useState(
    initialId && CONVERTER_TOOLS.some((t) => t.id === initialId)
      ? initialId
      : CONVERTER_TOOLS[0].id,
  );
  const current = CONVERTER_TOOLS.find((t) => t.id === active) ?? CONVERTER_TOOLS[0];
  const CurrentIcon = ICONS[current.iconName] ?? Files;

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-500">
          <Files className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Конвертер документов</h1>
          <p className="text-sm text-gray-500">PDF, JPG, Word, распознавание текста</p>
        </div>
      </div>

      <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
        <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
        <span>
          <b>Все конвертации выполняются прямо в вашем браузере.</b> Файлы никуда не
          загружаются и не передаются на сервер — это безопасно для договоров и персональных
          данных (152-ФЗ).
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {CONVERTER_TOOLS.map((t) => {
          const Icon = ICONS[t.iconName] ?? Files;
          const isActive = active === t.id;
          return (
            <button
              key={t.slug}
              type="button"
              onClick={() => setActive(t.id)}
              className={`cursor-pointer rounded-xl border p-3 text-left transition-all ${
                isActive
                  ? "border-brand-500 bg-brand-50 shadow-soft"
                  : "border-gray-200 bg-white hover:border-brand-300 hover:bg-gray-50"
              }`}
            >
              <Icon className={`mb-2 h-5 w-5 ${isActive ? "text-brand-600" : "text-gray-400"}`} />
              <p className={`text-xs font-semibold ${isActive ? "text-brand-700" : "text-gray-800"}`}>
                {t.label}
              </p>
              <p className="mt-0.5 text-[10px] leading-snug text-gray-400">{t.short}</p>
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <CurrentIcon className="h-4 w-4 text-brand-500" />
          <h2 className="text-sm font-bold text-gray-900">{current.label}</h2>
        </div>
        <ConverterRunner id={current.id} />
      </div>

      <div className="text-xs leading-relaxed text-gray-400">
        <p className="mb-1 font-semibold text-gray-500">Полезно при работе с договорами:</p>
        <p>
          • Объедините сканы страниц договора в один PDF для отправки или нотариуса
          <br />
          • Распознайте скан подписанного договора в текст для хранения в CRM
          <br />
          • Поставьте подпись в PDF перед отправкой по электронной почте
          <br />
          • Переведите DOCX в PDF для печати в типографии без искажений вёрстки
        </p>
      </div>
    </div>
  );
}
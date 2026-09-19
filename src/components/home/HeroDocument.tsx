import { Download } from "lucide-react";

/**
 * Анимированная имитация готового документа для hero главной страницы.
 * Чистый CSS (см. .hero-* в globals.css) — SSR-безопасно, без JS.
 */
export default function HeroDocument() {
  const fields: [string, string, boolean?][] = [
    ["Заимодавец", "Иванов И. И."],
    ["Заёмщик", "Петров П. П."],
    ["Сумма", "150 000 ₽"],
    ["Проценты", "без процентов ✓", true],
  ];
  const checks = ["Паспортные данные", "Сумма прописью", "Дата возврата", "Подписи сторон"];

  return (
    <div className="relative w-full max-w-[360px]">
      <div className="hero-doc relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-elevated sm:p-6">
        <div className="mb-4 flex items-center gap-2.5">
          <div className="grid h-8 w-8 flex-none place-items-center rounded-[10px] bg-gradient-to-br from-brand-500 to-purple-600 text-sm font-extrabold text-white">
            D
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-gray-400">
              Договор № 101
            </div>
            <div className="truncate text-sm font-extrabold text-gray-900">
              Расписка в получении денег
            </div>
          </div>
          <span className="ml-auto flex-none rounded-full border border-brand-100 bg-brand-50 px-2 py-1 text-[10px] font-bold text-brand-700">
            Шаблон
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {fields.map(([label, value, ok]) => (
            <div
              key={label}
              className="flex items-center justify-between gap-3 rounded-[10px] border border-gray-200 bg-[#fbfdff] px-3 py-2"
            >
              <span className="text-[10.5px] font-semibold text-gray-500">{label}</span>
              <span
                className={`whitespace-nowrap text-xs font-bold ${ok ? "text-emerald-600" : "text-gray-900"}`}
              >
                {value}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-3.5 grid grid-cols-2 gap-2">
          {checks.map((c) => (
            <div key={c} className="hero-check flex items-center gap-1.5 text-[11px] font-semibold text-gray-600">
              <i className="grid h-4 w-4 flex-none place-items-center rounded-full bg-emerald-50 text-[9px] font-black not-italic text-emerald-600">
                ✓
              </i>
              {c}
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-end justify-between border-t border-dashed border-gray-200 pt-3">
          <div>
            <div className="h-5 w-24 border-b border-gray-300" />
            <small className="mt-1 block text-[9.5px] text-gray-400">Заимодавец</small>
          </div>
          <div>
            <div className="h-5 w-24 border-b border-gray-300" />
            <small className="mt-1 block text-[9.5px] text-gray-400">Заёмщик</small>
          </div>
        </div>

        <div className="hero-stamp absolute bottom-3.5 right-4 grid h-[74px] w-[74px] rotate-[14deg] place-items-center rounded-full border-2 border-emerald-500 bg-emerald-50/50 text-center text-[8.5px] font-black uppercase leading-tight tracking-wide text-emerald-600">
          готово
          <br />к печати
        </div>
      </div>

      <div className="hero-pill absolute -bottom-4 -left-3 z-10 inline-flex items-center gap-2 rounded-xl bg-dark-900 px-3.5 py-2.5 text-xs font-bold text-white shadow-[0_12px_30px_rgba(15,23,42,0.28)]">
        <span className="hero-ring h-[7px] w-[7px] rounded-full bg-emerald-400" />
        <Download className="h-3.5 w-3.5" />
        Экспорт в PDF и Word
      </div>
    </div>
  );
}

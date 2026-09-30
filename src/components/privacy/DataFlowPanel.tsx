"use client";

import { useState } from "react";
import { ShieldCheck, Server, Users, Laptop, ChevronDown } from "lucide-react";
import {
  DATA_FLOWS,
  LOCATION_LABEL,
  type DataLocation,
} from "@/data/data-flows";

const ICON: Record<DataLocation, typeof ShieldCheck> = {
  browser: Laptop,
  server: Server,
  thirdParty: Users,
};

const STYLE: Record<DataLocation, string> = {
  browser: "bg-emerald-50 text-emerald-700 border-emerald-200",
  server: "bg-amber-50 text-amber-800 border-amber-200",
  thirdParty: "bg-sky-50 text-sky-800 border-sky-200",
};

/**
 * Честное раскрытие: что обрабатывается в браузере, а что уходит с устройства.
 *
 * Раньше сайт говорил «данные остаются в браузере» — и пользователь, видя
 * формулировку про серверный OCR или вложение в чате, не мог понять, где
 * проходит граница. Здесь граница показана явно и по каждой операции.
 *
 * Данные берутся из src/data/data-flows.ts — единого источника, который
 * продублирован в политике конфиденциальности. Расхождение текста с кодом
 * закрывает тест src/lib/__tests__/dataFlows.test.ts.
 */
export default function DataFlowPanel({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(!compact);
  const browserCount = DATA_FLOWS.filter((f) => f.where === "browser").length;
  const serverCount = DATA_FLOWS.length - browserCount;

  if (compact) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex w-full items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3 text-left text-sm text-emerald-900 transition hover:bg-emerald-50"
        >
          <ShieldCheck className="h-5 w-5 flex-shrink-0 text-emerald-600" aria-hidden />
          <span className="flex-1">
            <b>{browserCount} операций — в браузере,</b> {serverCount} — с передачей данных
          </span>
          <ChevronDown
            className={`h-4 w-4 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
            aria-hidden
          />
        </button>
        {/* Список раскрывается по кнопке: главный экран конвертеров не должен
            превращаться в юридический текст, но возможность его увидеть
            остаётся в один клик. */}
        {open && <div className="mt-3"><FlowList /></div>}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
        <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" aria-hidden />
        <div className="text-sm text-emerald-900">
          <p className="font-semibold">Как мы обращаемся с вашими данными</p>
          <p className="mt-1 leading-relaxed">
            Работа с договорами и файлами идёт <b>прямо в вашем браузере</b>. Но часть
            возможностей честно требует передачи данных — мы перечисляем каждую и
            объясняем, зачем она нужна и сколько данные хранятся.
          </p>
        </div>
      </div>
      <FlowList />
    </div>
  );
}

/** Список операций: где обрабатывается, что передаётся, зачем и сколько хранится. */
function FlowList() {
  return (
    <ul className="space-y-2">
      {DATA_FLOWS.map((f) => {
        const Icon = ICON[f.where];
        return (
          <li key={f.operation} className="rounded-xl border border-slate-200 bg-white p-3.5">
            <div className="flex flex-wrap items-center gap-2">
              <Icon className="h-4 w-4 flex-shrink-0 text-slate-500" aria-hidden />
              <span className="font-semibold text-slate-900">{f.operation}</span>
              <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${STYLE[f.where]}`}>
                {LOCATION_LABEL[f.where]}
              </span>
              {f.consent && (
                <span className="rounded-full border border-slate-200 px-2 py-0.5 text-[11px] text-slate-600">
                  нужно ваше согласие
                </span>
              )}
            </div>
            <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">{f.detail}</p>
            {f.why && (
              <p className="mt-1 text-[13px] leading-relaxed text-slate-500">
                <b className="font-medium text-slate-600">Почему не в браузере:</b> {f.why}
              </p>
            )}
            <p className="mt-1 text-[12px] leading-relaxed text-slate-500">
              <b className="font-medium text-slate-600">Хранение:</b> {f.retention}
            </p>
          </li>
        );
      })}
    </ul>
  );
}

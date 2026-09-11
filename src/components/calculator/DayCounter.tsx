"use client";
import { useState } from "react";
import { Check, CalendarDays, AlertTriangle, ArrowRight } from "lucide-react";
import { daysBetween, today, plusDays } from "@/lib/legal/calc";
import { countWorkdays, shiftDeadline, hasTransferDecree } from "@/lib/legal/prodkalendar";
import SaveCalcButton from "@/components/calculator/SaveCalcButton";

export default function DayCounter() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState(today());
  const [result, setResult] = useState<{
    total: number;
    workdays: number;
    rest: number;
    deadlineDate: string;
    deadlineShifted: boolean;
    warning: string;
  } | null>(null);
  const [error, setError] = useState("");

  const calc = () => {
    if (!from || !to) { setError("Укажите обе даты"); return; }
    if (from > to) { setError("Дата начала не может быть позже конца"); return; }
    const total = daysBetween(from, to) + 1;
    const workdays = countWorkdays(from, to);
    const dl = shiftDeadline(to);
    const yearsWithoutDecree = new Set<string>();
    const startY = Number(from.slice(0, 4));
    const endY = Number(to.slice(0, 4));
    for (let y = startY; y <= endY; y++) {
      if (!hasTransferDecree(y)) yearsWithoutDecree.add(String(y));
    }
    const warning = yearsWithoutDecree.size
      ? `Переносы выходных на ${[...yearsWithoutDecree].join(", ")} г. ещё не утверждены — расчёт по базовым праздникам ТК РФ`
      : "";
    setResult({
      total,
      workdays,
      rest: total - workdays,
      deadlineDate: dl.date,
      deadlineShifted: dl.shifted,
      warning,
    });
    setError("");
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-gray-600">Дата начала</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-gray-600">Дата окончания</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
          </div>
        </div>
        <button onClick={calc}
          className="w-full py-2.5 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 font-bold text-xs transition cursor-pointer">
          Посчитать дни
        </button>
      </div>

      {error && <p className="text-[11px] text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5">{error}</p>}

      {result && (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] font-mono text-gray-600">Период {from} — {to}</span>
            </div>
            <SaveCalcButton
              kind="daycounter"
              title={`Срок ${from} → ${to} — ${result.workdays} раб. дн.`}
              lines={[
                `Период: ${from} — ${to} (включительно)`,
                `Всего календарных дней: ${result.total}`,
                `Рабочих дней (произв. календарь, ст. 112 ТК + переносы ПП РФ): ${result.workdays}`,
                `Выходных/праздников: ${result.rest}`,
                result.deadlineShifted
                  ? `Последний день срока — нерабочий; по ст. 193 ГК переносится на ${result.deadlineDate}`
                  : `Последний день срока ${result.deadlineDate} — рабочий, переноса нет`,
                ...(result.warning ? [result.warning] : []),
                "",
                "Расчёт: dogovor.expert, производственный календарь 2024–2026 (ПП РФ №1314, №1335, №1466).",
              ]}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-[10px] text-gray-600">Всего дней</p>
              <p className="text-xl font-bold text-gray-900">{result.total}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-600">Рабочих</p>
              <p className="text-xl font-bold text-gray-900">{result.workdays}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-600">Выходных</p>
              <p className="text-xl font-bold text-gray-900">{result.rest}</p>
            </div>
          </div>
          <p className="text-[11px] text-gray-600">
            Рабочие дни — по производственному календарю с учётом переносов Правительства РФ (ст. 112 ТК)
          </p>
          {result.warning && (
            <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2.5 flex items-start gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              {result.warning}
            </p>
          )}
          <p className="text-[11px] text-gray-600 pt-1 border-t border-gray-200 flex items-center gap-1.5 flex-wrap">
            <ArrowRight className="w-3.5 h-3.5" />
            {result.deadlineShifted
              ? <>Срок, истекающий {to}, — в нерабочий день; по ст. 193 ГК он переносится на <b>{result.deadlineDate}</b></>
              : <>Последний день срока {result.deadlineDate} — рабочий, переноса по ст. 193 ГК нет</>
            }
          </p>
          {from && (
            <p className="text-[11px] text-gray-600">
              {plusDays(from, 30)} — через 30 дней · {plusDays(from, 60)} — через 60 дней
            </p>
          )}
        </div>
      )}

      <p className="text-[11px] text-gray-600 leading-relaxed flex items-start gap-1.5">
        <CalendarDays className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
        Сроки в договорах и претензиях: если последний день срока выпадает на выходной или праздник, он переносится на следующий рабочий день (ст. 193 ГК РФ). Календарь учитывает праздники ст. 112 ТК РФ и переносы, утверждённые Постановлениями Правительства РФ (2024–2026 гг.).
      </p>
    </div>
  );
}

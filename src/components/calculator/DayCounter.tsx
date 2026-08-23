"use client";
import { useState } from "react";
import { Check, CalendarDays } from "lucide-react";
import { daysBetween, today, plusDays, fmtMoney } from "@/lib/legal/calc";

const HOLIDAYS: Record<string, string[]> = {
  "2025": ["2025-01-01", "2025-01-02", "2025-01-03", "2025-01-04", "2025-01-05", "2025-01-06", "2025-01-07", "2025-01-08", "2025-02-23", "2025-03-08", "2025-05-01", "2025-05-09", "2025-06-12", "2025-11-04"],
  "2026": ["2026-01-01", "2026-01-02", "2026-01-03", "2026-01-04", "2026-01-05", "2026-01-06", "2026-01-07", "2026-01-08", "2026-02-23", "2026-03-08", "2026-05-01", "2026-05-09", "2026-06-12", "2026-11-04"],
};

export default function DayCounter() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState(today());
  const [result, setResult] = useState<{ total: number; workdays: number; note: string } | null>(null);
  const [error, setError] = useState("");

  const calc = () => {
    if (!from || !to) { setError("Укажите обе даты"); return; }
    if (from > to) { setError("Дата начала не может быть позже конца"); return; }
    const total = daysBetween(from, to);
    let workdays = 0;
    const holidays = [...(HOLIDAYS[from.slice(0, 4)] ?? []), ...(HOLIDAYS[to.slice(0, 4)] ?? [])];
    for (let i = 0; i <= total; i++) {
      const d = new Date(parseDate(from).getTime() + i * 86400000);
      const dow = d.getDay();
      const ds = toDateStr(d);
      if (dow !== 0 && dow !== 6 && !holidays.includes(ds)) workdays++;
    }
    setResult({
      total: total + 1,
      workdays,
      note: holidays.length ? "с учётом сб/вс и федеральных праздников; переносы правительства не учтены" : "",
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
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-mono text-gray-600">Период</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-gray-600">Всего дней</p>
              <p className="text-xl font-bold text-gray-900">{result.total}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-600">Рабочих дней</p>
              <p className="text-xl font-bold text-gray-900">{result.workdays}</p>
            </div>
          </div>
          {result.note && <p className="text-[11px] text-gray-600">{result.note}</p>}
          <p className="text-[11px] text-gray-600 pt-1 border-t border-gray-200">
            {plusDays(from, 30)} — через 30 дней · {plusDays(from, 60)} — через 60 дней
          </p>
        </div>
      )}

      <p className="text-[11px] text-gray-600 leading-relaxed flex items-start gap-1.5">
        <CalendarDays className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
        Сроки в договорах и претензиях: если последний день срока — выходной, он переносится на следующий рабочий день (ст. 193 ГК). Переносы правительственных выходных 2026 уточняйте по производственному календарю.
      </p>
    </div>
  );
}

function parseDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}
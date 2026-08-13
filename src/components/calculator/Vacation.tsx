"use client";
import { useState } from "react";
import { Check, Plane } from "lucide-react";
import { vacationPay, unusedVacationDays } from "@/lib/legal/fin";
import { fmtMoney } from "@/lib/legal/calc";

export default function Vacation() {
  const [mode, setMode] = useState<"pay" | "comp">("pay");
  const [salary12, setSalary12] = useState("");
  const [days, setDays] = useState("28");
  const [months, setMonths] = useState("12");
  const [result, setResult] = useState<{ pay: number; sdz: number; daysUsed?: number } | null>(null);
  const [error, setError] = useState("");

  const calc = () => {
    const sal = parseFloat(salary12);
    if (isNaN(sal) || sal <= 0) { setError("Укажите доход за расчётный период"); return; }
    if (mode === "pay") {
      const d = parseFloat(days);
      if (isNaN(d) || d <= 0) { setError("Укажите количество дней отпуска"); return; }
      const r = vacationPay(sal, d);
      setResult({ pay: r.pay, sdz: r.sdz });
    } else {
      const m = parseFloat(months);
      if (isNaN(m) || m <= 0 || m > 120) { setError("Укажите отработанные месяцы"); return; }
      const ud = unusedVacationDays(m);
      const r = vacationPay(sal, ud);
      setResult({ pay: r.pay, sdz: r.sdz, daysUsed: ud });
    }
    setError("");
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-1.5">
        <button onClick={() => setMode("pay")}
          className={`py-2 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer ${mode === "pay" ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-600 hover:border-brand-300 bg-white"}`}>
          Отпускные
        </button>
        <button onClick={() => setMode("comp")}
          className={`py-2 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer ${mode === "comp" ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-600 hover:border-brand-300 bg-white"}`}>
          Компенсация при увольнении
        </button>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-gray-500">Зарплата за 12 месяцев до отпуска (₽)</label>
          <input type="number" value={salary12} onChange={(e) => setSalary12(e.target.value)}
            placeholder="Например 900000"
            className="w-full bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
        </div>
        {mode === "pay" ? (
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-gray-500">Дней отпуска</label>
            <input type="number" value={days} onChange={(e) => setDays(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
          </div>
        ) : (
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-gray-500">Отработано месяцев (неполный месяц от 15 дней — за полный)</label>
            <input type="number" value={months} onChange={(e) => setMonths(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
          </div>
        )}
        <button onClick={calc}
          className="w-full py-2.5 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 font-bold text-xs transition cursor-pointer">
          Рассчитать
        </button>
      </div>

      {error && <p className="text-[11px] text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5">{error}</p>}

      {result && (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-1.5">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-mono text-gray-500">Средний дневной заработок — ст. 139 ТК РФ (29,3)</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{fmtMoney(result.pay)}</p>
          <p className="text-[11px] text-gray-500">СДЗ: {fmtMoney(result.sdz)} · {result.daysUsed !== undefined ? `${result.daysUsed} неиспользованных дней (2,33 дн./мес)` : `${days} дней отпуска`}</p>
        </div>
      )}

      <p className="text-[11px] text-gray-400 leading-relaxed flex items-start gap-1.5">
        <Plane className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
        Формула: СДЗ = сумма выплат за 12 мес ÷ (29,3 × 12). Основной отпуск — 28 календарных дней (ст. 115 ТК). Компенсация: 2,33 дня за каждый месяц работы, округление в пользу работника.
      </p>
    </div>
  );
}
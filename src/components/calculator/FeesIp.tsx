"use client";
import { useState } from "react";
import { Check, Briefcase } from "lucide-react";
import { ipContributions, IP_CONTRIB } from "@/lib/legal/fin";
import { fmtMoney } from "@/lib/legal/calc";

export default function FeesIp() {
  const [year, setYear] = useState("2026");
  const [income, setIncome] = useState("");
  const [months, setMonths] = useState("12");
  const [result, setResult] = useState<ReturnType<typeof ipContributions> | null>(null);
  const [error, setError] = useState("");

  const calc = () => {
    const inc = parseFloat(income || "0");
    const m = parseInt(months, 10);
    if (isNaN(inc)) { setError("Укажите доход (0 — если доходов не было)"); return; }
    if (isNaN(m) || m < 1 || m > 12) { setError("Количество месяцев: от 1 до 12"); return; }
    setResult(ipContributions(parseInt(year, 10), inc, m));
    setError("");
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-1.5">
          {["2025", "2026", "2027"].map((y) => (
            <button key={y} onClick={() => setYear(y)}
              className={`py-2 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer ${
                year === y ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-600 hover:border-brand-300 bg-white"
              }`}>
              {y}
            </button>
          ))}
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-gray-600">Доход за год (₽)</label>
          <input type="number" min="0" value={income} onChange={(e) => setIncome(e.target.value)}
            placeholder="Например 1200000"
            className="w-full bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-gray-600">Месяцев работы в году</label>
            <input type="number" min="1" max="12" value={months} onChange={(e) => setMonths(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
          </div>
          <div className="flex items-end pb-1 text-[11px] text-gray-600">
            Фикс. взнос {year}: {IP_CONTRIB[parseInt(year, 10)]?.fixed.toLocaleString("ru-RU")} ₽
          </div>
        </div>
        <button onClick={calc}
          className="w-full py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold text-xs transition cursor-pointer">
          Рассчитать взносы
        </button>
      </div>

      {error && <p className="text-[11px] text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5">{error}</p>}

      {result && (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-2">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-mono text-gray-600">Взносы ИП {year} — ст. 430 НК РФ</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{fmtMoney(result.totalMin)}</p>
          <div className="text-[11px] text-gray-600 space-y-0.5">
            <p>Фиксированная часть: <b>{fmtMoney(result.fixed)}</b> — {result.dueFixed}</p>
            <p>1% с дохода свыше 300 000 ₽: <b>{fmtMoney(result.percent)}</b> — {result.duePercent}</p>
            {result.percent >= result.maxPercent && (
              <p className="text-amber-700">Достигнут максимум 1% ({fmtMoney(result.maxPercent)}) — больше платить не нужно</p>
            )}
          </div>
          <a href="/builder?id=gpa-contract"
            className="inline-block mt-1 py-2 px-3 rounded-lg bg-white border border-brand-300 text-brand-600 font-bold text-[11px] hover:bg-brand-50 transition">
            Договор с ИП →
          </a>
        </div>
      )}

      <p className="text-[11px] text-gray-600 leading-relaxed flex items-start gap-1.5">
        <Briefcase className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
        С 2023 года фикс. взнос — единый платёж без разбивки на ОПС/ОМС. За неполный год — пропорционально месяцам. 1% считается с дохода свыше 300 000 ₽, максимум = {IP_CONTRIB[2026].percentMax.toLocaleString("ru-RU")} ₽ ({2026} г.).
      </p>
    </div>
  );
}
"use client";
import { useState } from "react";
import { Check, Banknote } from "lucide-react";
import { calcSalaryDelayPeriods, fmtMoney, formatDateRu, today } from "@/lib/legal/calc";

export default function SalaryDelay236() {
  const [sum, setSum] = useState("");
  const [due, setDue] = useState("");
  const [paid, setPaid] = useState(today());
  const [result, setResult] = useState<{ total: number; days: number; periods: { from: string; to: string; days: number; rate: number; amount: number }[] } | null>(null);
  const [error, setError] = useState("");

  const calc = () => {
    const s = parseFloat(sum);
    if (isNaN(s) || s <= 0) { setError("Укажите сумму задолженности"); return; }
    if (!due || !paid) { setError("Укажите даты"); return; }
    if (due > paid) { setError("Дата расчёта раньше даты выплаты"); return; }
    const r = calcSalaryDelayPeriods(s, due, paid);
    setResult({ total: r.total, days: r.days, periods: r.periods });
    setError("");
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-gray-500">Сумма задолженности (₽)</label>
          <input
            type="number" min="0" value={sum} onChange={(e) => setSum(e.target.value)}
            placeholder="Например 80000"
            className="w-full bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-gray-500">День, когда должны были выплатить</label>
            <input type="date" value={due} onChange={(e) => setDue(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-gray-500">День фактического расчёта</label>
            <input type="date" value={paid} onChange={(e) => setPaid(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
          </div>
        </div>
        <button onClick={calc}
          className="w-full py-2.5 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 font-bold text-xs transition cursor-pointer">
          Рассчитать компенсацию
        </button>
      </div>

      {error && <p className="text-[11px] text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5">{error}</p>}

      {result && (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-2">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-mono text-gray-500">Компенсация по ст. 236 ТК РФ — 1/150 ключевой ставки за день</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{fmtMoney(result.total)}</p>
          <p className="text-[11px] text-gray-500">
            {result.days} дн. задержки
          </p>
          {result.periods.length > 1 && (
            <div className="max-h-28 overflow-auto space-y-1">
              {result.periods.map((p, i) => (
                <div key={i} className="flex justify-between text-[11px] text-gray-600 border-b border-gray-200 pb-1">
                  <span>{formatDateRu(p.from)} — {formatDateRu(p.to)} · {p.days} дн. · ставка {p.rate.toFixed(2).replace(".", ",")}%</span>
                  <span className="font-semibold text-gray-900">{fmtMoney(p.amount)}</span>
                </div>
              ))}
            </div>
          )}
          <a href="/builder?id=claim-labor"
            className="inline-block mt-1 py-2 px-3 rounded-lg bg-white border border-brand-300 text-brand-600 font-bold text-[11px] hover:bg-brand-50 transition">
            Составить иск к работодателю →
          </a>
        </div>
      )}

      <p className="text-[11px] text-gray-400 leading-relaxed flex items-start gap-1.5">
        <Banknote className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
        Ст. 236 ТК РФ: компенсация — не ниже 1/150 действующей в период задержки ключевой ставки ЦБ от невыплаченных сумм за каждый день задержки, со дня, следующего за днём выплаты, по день фактического расчёта включительно. Право на компенсацию не зависит от вины работодателя.
      </p>
    </div>
  );
}
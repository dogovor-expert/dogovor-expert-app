"use client";
import { useState } from "react";
import { Check, TrendingUp } from "lucide-react";
import { calcInterestByKeyRate, fmtMoney, formatDateRu, today } from "@/lib/legal/calc";

export default function Indexation208() {
  const [sum, setSum] = useState("");
  const [decision, setDecision] = useState("");
  const [paid, setPaid] = useState(today());
  const [result, setResult] = useState<{ total: number; periods: { from: string; to: string; days: number; rate: number; amount: number }[] } | null>(null);
  const [error, setError] = useState("");

  const calc = () => {
    const s = parseFloat(sum);
    if (isNaN(s) || s <= 0) { setError("Укажите присуждённую сумму"); return; }
    if (!decision || !paid || decision > paid) { setError("Проверьте даты"); return; }
    const r = calcInterestByKeyRate(s, decision, paid);
    setResult({ total: r.total, periods: r.periods });
    setError("");
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-gray-600">Присуждённая судом сумма (₽)</label>
          <input type="number" min="0" value={sum} onChange={(e) => setSum(e.target.value)}
            placeholder="Например 300000"
            className="w-full bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-gray-600">Дата вынесения решения</label>
            <input type="date" value={decision} onChange={(e) => setDecision(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-gray-600">Дата фактического исполнения</label>
            <input type="date" value={paid} onChange={(e) => setPaid(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
          </div>
        </div>
        <button onClick={calc}
          className="w-full py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold text-xs transition cursor-pointer">
          Рассчитать индексацию
        </button>
      </div>

      {error && <p className="text-[11px] text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5">{error}</p>}

      {result && (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-3">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-mono text-gray-600">Индексация по ст. 208 ГПК РФ — по ключевой ставке ЦБ</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{fmtMoney(result.total)}</p>
          {result.periods.length > 0 && (
            <div className="max-h-32 overflow-auto space-y-1">
              {result.periods.map((p, i) => (
                <div key={i} className="flex justify-between text-[11px] text-gray-600 border-b border-gray-200 pb-1">
                  <span>{formatDateRu(p.from)} — {formatDateRu(p.to)} · {p.days} дн. · {p.rate.toFixed(2).replace(".", ",")}%</span>
                  <span className="font-semibold text-gray-900">{fmtMoney(p.amount)}</span>
                </div>
              ))}
            </div>
          )}
          <a href="/builder?id=claim-generic"
            className="inline-block mt-1 py-2 px-3 rounded-lg bg-white border border-brand-300 text-brand-600 font-bold text-[11px] hover:bg-brand-50 transition">
            Составить заявление об индексации (шаблон) →
          </a>
        </div>
      )}

      <p className="text-[11px] text-gray-600 leading-relaxed flex items-start gap-1.5">
        <TrendingUp className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
        Ст. 208 ГПК РФ (в ред. ФЗ от 19.12.2022 № 59-ФЗ): индексация присуждённых сумм взыскивается со дня вынесения решения до дня фактического исполнения исходя из ключевой ставки ЦБ РФ. Заявление подаётся в суд, вынесший решение.
      </p>
    </div>
  );
}
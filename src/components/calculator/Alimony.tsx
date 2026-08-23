"use client";
import { useState } from "react";
import { Check, Baby } from "lucide-react";
import { calcAlimony, fmtMoney } from "@/lib/legal/calc";

export default function Alimony() {
  const [income, setIncome] = useState("");
  const [children, setChildren] = useState("1");
  const [debt, setDebt] = useState("");
  const [penaltyDays, setPenaltyDays] = useState("");
  const [result, setResult] = useState<{ monthly: number; sharePct: number; penalty: number } | null>(null);
  const [error, setError] = useState("");

  const calc = () => {
    const inc = parseFloat(income);
    if (isNaN(inc) || inc <= 0) { setError("Укажите доход"); return; }
    const d = parseFloat(debt || "0");
    const days = parseInt(penaltyDays || "0");
    const r = calcAlimony(inc, parseInt(children), d, days);
    setResult({ monthly: r.monthly, sharePct: r.share * 100, penalty: r.penalty });
    setError("");
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-gray-600">Доход плательщика в месяц (₽)</label>
          <input type="number" min="0" value={income} onChange={(e) => setIncome(e.target.value)}
            placeholder="Например 100000"
            className="w-full bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-gray-600">Количество детей</label>
          <div className="grid grid-cols-3 gap-1.5">
            {["1", "2", "3"].map((n) => (
              <button key={n} onClick={() => setChildren(n)}
                className={`py-2 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer ${
                  children === n ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-600 hover:border-brand-300 bg-white"
                }`}>
                {n} {n === "1" ? "ребёнок" : n === "2" ? "детей" : "детей и более"}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-gray-600">Задолженность по алиментам (₽, необязательно)</label>
            <input type="number" min="0" value={debt} onChange={(e) => setDebt(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-gray-600">Дней просрочки (необязательно)</label>
            <input type="number" min="0" value={penaltyDays} onChange={(e) => setPenaltyDays(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
          </div>
        </div>
        <button onClick={calc}
          className="w-full py-2.5 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 font-bold text-xs transition cursor-pointer">
          Рассчитать
        </button>
      </div>

      {error && <p className="text-[11px] text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5">{error}</p>}

      {result && (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-2">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-mono text-gray-600">Алименты — ст. 81 СК РФ</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{fmtMoney(result.monthly)}</p>
          <p className="text-[11px] text-gray-600">Доля от дохода: {result.sharePct.toLocaleString("ru-RU")}% (1/{result.sharePct === 25 ? 4 : result.sharePct === 33.33333333333333 ? 3 : 2} от дохода)</p>
          {result.penalty > 0 && (
            <p className="text-[11px] text-gray-600">
              Пени за просрочку (0,5% в день, ст. 115 СК РФ): <b>{fmtMoney(result.penalty)}</b>
            </p>
          )}
          <a href="/builder?id=alimony-claim"
            className="inline-block mt-1 py-2 px-3 rounded-lg bg-white border border-brand-300 text-brand-600 font-bold text-[11px] hover:bg-brand-50 transition">
            Составить иск о взыскании алиментов →
          </a>
        </div>
      )}

      <p className="text-[11px] text-gray-600 leading-relaxed flex items-start gap-1.5">
        <Baby className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
        Ст. 81 СК РФ: на одного ребёнка — 1/4 дохода, на двух — 1/3, на трёх и более — 1/2 (доли могут быть изменены судом). Ст. 115 СК РФ: пени 0,5% от суммы задолженности за каждый день просрочки.
      </p>
    </div>
  );
}
"use client";
import { useState } from "react";
import { Check, Wallet } from "lucide-react";
import { ndflTax, propertyReturn } from "@/lib/legal/fin";
import { fmtMoney } from "@/lib/legal/calc";

export default function Ndfl() {
  const [income, setIncome] = useState("");
  const [children, setChildren] = useState("0");
  const [housePrice, setHousePrice] = useState("");
  const [result, setResult] = useState<{ tax: number; effRate: number; refund: number; refundInterest: number } | null>(null);
  const [error, setError] = useState("");

  const calc = () => {
    const inc = parseFloat(income);
    if (isNaN(inc) || inc <= 0) { setError("Укажите годовой доход"); return; }
    const hp = parseFloat(housePrice || "0");
    const r = ndflTax(inc, parseInt(children, 10));
    const pr = propertyReturn(hp);
    setResult({
      tax: Math.round(r.tax),
      effRate: Math.round(r.tax / inc * 10000) / 100,
      refund: Math.round(pr.refund),
      refundInterest: pr.refundInterest,
    });
    setError("");
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-gray-600">Годовой доход до налога (₽)</label>
          <input type="number" min="0" value={income} onChange={(e) => setIncome(e.target.value)}
            placeholder="Например 3000000"
            className="w-full bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-gray-600">Детей (стандартный вычет)</label>
          <div className="grid grid-cols-4 gap-1.5">
            {["0", "1", "2", "3"].map((n) => (
              <button key={n} onClick={() => setChildren(n)}
                className={`py-2 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer ${
                  children === n ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-600 hover:border-brand-300 bg-white"
                }`}>
                {n === "0" ? "нет" : n + " " + (n === "1" ? "реб." : "реб.")}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-gray-600">Покупка жилья в этом году (₽, для имущественного вычета)</label>
          <input type="number" min="0" value={housePrice} onChange={(e) => setHousePrice(e.target.value)}
            placeholder="Например 7500000"
            className="w-full bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
        </div>
        <button onClick={calc}
          className="w-full py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold text-xs transition cursor-pointer">
          Рассчитать НДФЛ
        </button>
      </div>

      {error && <p className="text-[11px] text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5">{error}</p>}

      {result && (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-2">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-mono text-gray-600">НДФЛ 2026 — прогрессивная шкала ст. 224 НК РФ</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{fmtMoney(result.tax)}</p>
          <p className="text-[11px] text-gray-600">Эффективная ставка: {result.effRate.toLocaleString("ru-RU")}% (13% до 2,4 млн, далее 15–22%)</p>
          {result.refund > 0 && (
            <p className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-2">
              Возврат по имущественному вычету: до <b>{fmtMoney(result.refund)}</b> (13% от стоимости жилья, но не более 260 000 ₽){result.refundInterest > 0 && <> + проценты по ипотеке до {fmtMoney(result.refundInterest)}</>}
            </p>
          )}
          <a href="/builder?id=refund-claim"
            className="inline-block mt-1 py-2 px-3 rounded-lg bg-white border border-brand-300 text-brand-600 font-bold text-[11px] hover:bg-brand-50 transition">
            Заявление на имущественный вычет →
          </a>
        </div>
      )}

      <p className="text-[11px] text-gray-600 leading-relaxed flex items-start gap-1.5">
        <Wallet className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
        Ставки: 13% до 2,4 млн ₽/год, 15% до 5 млн, 18% до 20 млн, 20% до 50 млн, 22% свыше. Стандартные вычеты на детей: 1 400 ₽ (1-й), 2 800 ₽ (2-й), 6 000 ₽ (3-й и далее) в месяц, пока доход с начала года ≤ 450 000 ₽.
      </p>
    </div>
  );
}
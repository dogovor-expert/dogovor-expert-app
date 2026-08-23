"use client";
import { useState } from "react";
import { Check, Home, Wrench } from "lucide-react";
import { calcZhkhPenalty, calcCapRepairPenalty, fmtMoney, today } from "@/lib/legal/calc";

export default function ZhkhPenalty() {
  const [kind, setKind] = useState<"zhku" | "cap">("zhku");
  const [sum, setSum] = useState("");
  const [due, setDue] = useState("");
  const [paid, setPaid] = useState(today());
  const [result, setResult] = useState<{ total: number; p300: number; p130: number; days: number } | null>(null);
  const [error, setError] = useState("");

  const calc = () => {
    const s = parseFloat(sum);
    if (isNaN(s) || s <= 0) { setError("Укажите сумму долга"); return; }
    if (!due || !paid || due > paid) { setError("Проверьте даты"); return; }
    const days = Math.round((new Date(paid).getTime() - new Date(due).getTime()) / 86400000);
    if (kind === "cap") {
      const r = calcCapRepairPenalty(s, days);
      setResult({ total: r.total, p300: r.p300, p130: 0, days });
    } else {
      const r = calcZhkhPenalty(s, days);
      setResult({ total: r.total, p300: r.p300, p130: r.p130, days });
    }
    setError("");
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-1.5">
        <button onClick={() => { setKind("zhku"); setResult(null); }}
          className={`py-2 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer ${kind === "zhku" ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-600 hover:border-brand-300 bg-white"}`}>
          ЖКУ (ч. 14 ст. 155 ЖК)
        </button>
        <button onClick={() => { setKind("cap"); setResult(null); }}
          className={`py-2 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer ${kind === "cap" ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-600 hover:border-brand-300 bg-white"}`}>
          Капремонт (ч. 14.1 ст. 155 ЖК)
        </button>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-gray-600">Сумма долга (₽)</label>
          <input type="number" min="0" value={sum} onChange={(e) => setSum(e.target.value)}
            placeholder="Например 25000"
            className="w-full bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-gray-600">Дата, с которой начисляются пени</label>
            <input type="date" value={due} onChange={(e) => setDue(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-gray-600">Дата расчёта</label>
            <input type="date" value={paid} onChange={(e) => setPaid(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
          </div>
        </div>
        <button onClick={calc}
          className="w-full py-2.5 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 font-bold text-xs transition cursor-pointer">
          Рассчитать пени
        </button>
      </div>

      {error && <p className="text-[11px] text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5">{error}</p>}

      {result && (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-2">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-mono text-gray-600">Пени по {kind === "cap" ? "ч. 14.1" : "ч. 14"} ст. 155 ЖК РФ</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{fmtMoney(result.total)}</p>
          <p className="text-[11px] text-gray-600">
            Просрочка: {result.days} дн.
          </p>
          {kind === "cap" ? (
            <p className="text-[11px] text-gray-600">
              1/300 ставки ЦБ с 31-го дня просрочки: {fmtMoney(result.p300)}
              {result.days <= 30 && <span className="text-amber-700"> · до 31 дня пени не начисляются</span>}
            </p>
          ) : (
            <>
              {result.days > 30 && (
                <p className="text-[11px] text-gray-600">
                  с 31-го по 90-й день (1/300): {fmtMoney(result.p300)}
                  {result.days > 90 && <> · с 91-го дня (1/130): {fmtMoney(result.p130)}</>}
                </p>
              )}
              {result.days <= 30 && (
                <p className="text-[11px] text-gray-600">До 31 дня просрочки пени по закону не начисляются.</p>
              )}
            </>
          )}
          <a href="/builder?id=housing-claim"
            className="inline-block mt-1 py-2 px-3 rounded-lg bg-white border border-brand-300 text-brand-600 font-bold text-[11px] hover:bg-brand-50 transition">
            Составить иск о взыскании долга за ЖКУ →
          </a>
        </div>
      )}

      <p className="text-[11px] text-gray-600 leading-relaxed flex items-start gap-1.5">
        {kind === "cap" ? (
          <>
            <Wrench className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            Ч. 14.1 ст. 155 ЖК РФ: пени за взносы на капремонт — 1/300 ставки ЦБ за каждый день просрочки начиная с 31-го дня после установленного срока оплаты (без повышения до 1/130, в отличие от ЖКУ).
          </>
        ) : (
          <>
            <Home className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            Ч. 14 ст. 155 ЖК РФ: пени 1/300 ставки рефинансирования ЦБ с 31-го по 90-й день просрочки, с 91-го дня — 1/130. Управляющая организация может требовать пени по договору, но не более установленных законом пределов.
          </>
        )}
      </p>
    </div>
  );
}
"use client";
import { useState } from "react";
import { Check, Store } from "lucide-react";
import { usnTax, npdTax } from "@/lib/legal/fin";
import { fmtMoney } from "@/lib/legal/calc";

export default function UsnNpd() {
  const [mode, setMode] = useState<"usn" | "npd">("usn");
  const [usnMode, setUsnMode] = useState<"income" | "incomeMinus">("income");
  const [income, setIncome] = useState("");
  const [expenses, setExpenses] = useState("");
  const [ppl, setPpl] = useState("");
  const [org, setOrg] = useState("");
  const [result, setResult] = useState<string[]>([]);

  interface CalcResult { builder: string; link: string }

  const calc = () => {
    if (mode === "usn") {
      const inc = parseFloat(income);
      if (isNaN(inc) || inc <= 0) return;
      const exp = parseFloat(expenses || "0");
      const r = usnTax(inc, exp, usnMode);
      const lines: string[] = [
        `Налог УСН (${usnMode === "income" ? "доходы 6%" : "доходы − расходы 15%"}): ${fmtMoney(r.tax)}`,
      ];
      if (r.minTax > 0) lines.push(`Минимальный налог 1% от дохода: ${fmtMoney(r.minTax)} — платится, если больше`);
      if (r.vatStatus !== "no") {
        lines.push(`Доход свыше 60 млн ₽/год — вы обязаны платить НДС: ${r.vatStatus === "rate5" ? "5% без вычетов НДС (до 250 млн ₽)" : "7% с вычетами (до 450 млн ₽)"}`);
      } else {
        lines.push("Доход до 60 млн ₽/год — НДС не платите");
      }
      setResult(lines);
      return;
    }
    const p = parseFloat(ppl || "0");
    const o = parseFloat(org || "0");
    const r = npdTax(p, o);
    setResult([
      `Налог НПД: ${fmtMoney(r.tax)} (${fmtMoney(p)} с физлиц × 4% + ${fmtMoney(o)} с юрлиц × 6%)`,
      `Вычет НБ на расходах 10 000 ₽: использовано ${fmtMoney(r.deductionUsed)}, осталось ${fmtMoney(r.deductionLeft)}`,
      p + o >= 2_400_000 ? "Лимит НПД 2,4 млн ₽/год достигнут — налог перестаёт действовать с превышения" : "Лимит НПД: 2,4 млн ₽ в год",
    ]);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-1.5">
        <button onClick={() => setMode("usn")}
          className={`py-2 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer ${mode === "usn" ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-600 hover:border-brand-300 bg-white"}`}>
          УСН (ИП/ООО)
        </button>
        <button onClick={() => setMode("npd")}
          className={`py-2 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer ${mode === "npd" ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-600 hover:border-brand-300 bg-white"}`}>
          НПД (самозанятые)
        </button>
      </div>

      {mode === "usn" ? (
        <>
          <div className="grid grid-cols-2 gap-1.5">
            <button onClick={() => setUsnMode("income")}
              className={`py-2 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer ${usnMode === "income" ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-600 hover:border-brand-300 bg-white"}`}>
              Доходы · 6%
            </button>
            <button onClick={() => setUsnMode("incomeMinus")}
              className={`py-2 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer ${usnMode === "incomeMinus" ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-600 hover:border-brand-300 bg-white"}`}>
              Доходы − расходы · 15%
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-gray-500">Доход за год (₽)</label>
              <input type="number" value={income} onChange={(e) => setIncome(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
            </div>
            {usnMode === "incomeMinus" && (
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-gray-500">Расходы за год (₽)</label>
                <input type="number" value={expenses} onChange={(e) => setExpenses(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-gray-500">Доход от физлиц (₽, 4%)</label>
            <input type="number" value={ppl} onChange={(e) => setPpl(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-gray-500">Доход от юрлиц/ИП (₽, 6%)</label>
            <input type="number" value={org} onChange={(e) => setOrg(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
          </div>
        </div>
      )}

      <button onClick={calc}
        className="w-full py-2.5 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 font-bold text-xs transition cursor-pointer">
        Рассчитать налог
      </button>

      {result.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-1.5">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-mono text-gray-500">{mode === "usn" ? "УСН — ст. 346.20, 164 НК РФ" : "НПД — ФЗ-422"}</span>
          </div>
          {result.map((line, i) => (
            <p key={i} className="text-[11px] text-gray-600">{line}</p>
          ))}
          {mode === "usn" && <p className="text-[11px] text-gray-500">Лимит УСН 2026: 450 млн ₽ в год; НДС обязателен при доходах свыше 60 млн ₽.</p>}
          {mode === "npd" && (
            <a href="/builder?id=service-agreement"
              className="inline-block mt-1 py-2 px-3 rounded-lg bg-white border border-brand-300 text-brand-600 font-bold text-[11px] hover:bg-brand-50 transition">
              Договор с самозанятым →
            </a>
          )}
        </div>
      )}

      <p className="text-[11px] text-gray-400 leading-relaxed flex items-start gap-1.5">
        <Store className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
        Региональные ставки могут быть ниже (УСН: от 1% и 5%). С 2026 года базовая ставка НДС — 22%; на УСН при доходах 60–450 млн ₽ — НДС 5% или 7%.
      </p>
    </div>
  );
}
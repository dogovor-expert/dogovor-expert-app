"use client";
import { useState } from "react";
import { Check, FileWarning } from "lucide-react";
import { calcContractPenalty, fmtMoney, currentKeyRate, today, plusDays } from "@/lib/legal/calc";

type Mode = "perDay" | "perYear" | "f300" | "f150" | "f130";

const MODES: { id: Mode; label: string; hint: string }[] = [
  { id: "perDay", label: "% в день", hint: "Договорная ставка в процентах за день просрочки" },
  { id: "perYear", label: "% годовых", hint: "Годовая процентная ставка (365 дней)" },
  { id: "f300", label: "1/300 ключевой", hint: "По ставке рефинансирования — договор подряда, закупки и т.д." },
  { id: "f150", label: "1/150 ключевой", hint: "Законные пени (44-ФЗ, застройщики 214-ФЗ)" },
  { id: "f130", label: "1/130 ключевой", hint: "ЖКХ — с 91-го дня просрочки" },
];

export default function ContractPenalty() {
  const [sum, setSum] = useState("");
  const [mode, setMode] = useState<Mode>("perDay");
  const [rate, setRate] = useState("0.5");
  const [days, setDays] = useState("");
  const [start, setStart] = useState("");
  const [result, setResult] = useState<{ total: number; daily: number } | null>(null);
  const [error, setError] = useState("");

  const calc = () => {
    const s = parseFloat(sum);
    const d = parseInt(days);
    if (isNaN(s) || s <= 0) { setError("Укажите сумму обязательства"); return; }
    if (isNaN(d) || d <= 0) { setError("Укажите количество дней просрочки"); return; }
    const startDate = start && start.length > 0 ? start : plusDays(today(), -(d - 1));
    const total = calcContractPenalty(s, parseFloat(rate) || 0, mode, d, startDate);
    setResult({ total, daily: total / d });
    setError("");
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-gray-600">Сумма обязательства (₽)</label>
          <input type="number" min="0" value={sum} onChange={(e) => setSum(e.target.value)}
            placeholder="Например 200000"
            className="w-full bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-gray-600">Способ расчёта неустойки</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {MODES.map((m) => (
              <button key={m.id} onClick={() => { setMode(m.id); setResult(null); }}
                className={`py-2 px-2 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer ${
                  mode === m.id ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-600 hover:border-brand-300 bg-white"
                }`}>
                {m.label}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-gray-600">{MODES.find((m) => m.id === mode)?.hint}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {(mode === "perDay" || mode === "perYear") && (
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-gray-600">Ставка (%)</label>
              <input type="number" min="0" step="0.1" value={rate} onChange={(e) => setRate(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
            </div>
          )}
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-gray-600">Дней просрочки</label>
            <input type="number" min="0" value={days} onChange={(e) => setDays(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-gray-600">Дата начала просрочки</label>
            <input type="date" value={start} onChange={(e) => setStart(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
          </div>
        </div>
        <button onClick={calc}
          className="w-full py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold text-xs transition cursor-pointer">
          Рассчитать неустойку
        </button>
      </div>

      {error && <p className="text-[11px] text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5">{error}</p>}

      {result && (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-2">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-mono text-gray-600">Неустойка (ст. 330 ГК РФ)</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{fmtMoney(result.total)}</p>
          {result.daily > 0 && (
            <p className="text-[11px] text-gray-600">В день: {fmtMoney(Math.round(result.daily * 100) / 100)}</p>
          )}
          <a href="/builder?template=claim-generic"
            className="inline-block mt-1 py-2 px-3 rounded-lg bg-white border border-brand-300 text-brand-600 font-bold text-[11px] hover:bg-brand-50 transition">
            Составить претензию / иск →
          </a>
        </div>
      )}

      <p className="text-[11px] text-gray-600 leading-relaxed flex items-start gap-1.5">
        <FileWarning className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
        Неустойка по договору — ст. 330 ГК РФ; законные пени привязаны к ключевой ставке ЦБ (сейчас {currentKeyRate().toFixed(2).replace(".", ",")}%). Суд может снизить неустойку по ст. 333 ГК РФ, если она явно несоразмерна последствиям нарушения.
      </p>
    </div>
  );
}
"use client";
import { useState } from "react";
import { Check, BadgePercent } from "lucide-react";
import { ndsCalc, NDS_RATES, type NdsMode } from "@/lib/legal/nds";
import { rublesInWords } from "@/lib/legal/numberWords";

const MODES: { id: NdsMode; label: string }[] = [
  { id: "add", label: "Начислить" },
  { id: "split", label: "Выделить" },
  { id: "fromNds", label: "Сумма по НДС" },
];

export default function Nds() {
  const [mode, setMode] = useState<NdsMode>("add");
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState(22);
  const [result, setResult] = useState<{ base: number; tax: number; total: number } | null>(null);
  const [error, setError] = useState("");

  const calc = () => {
    const v = parseFloat(amount);
    if (isNaN(v) || v <= 0) { setError("Укажите сумму больше нуля"); return; }
    if (mode === "fromNds" && rate === 0) { setError("По НДС 0% расчёт невозможен"); return; }
    const r = ndsCalc(v, rate, mode);
    if (!r) { setError("Ошибка расчёта"); return; }
    setResult(r);
    setError("");
  };

  const label =
    mode === "add" ? "Сумма без НДС" :
    mode === "split" ? "Сумма с НДС" :
    "Размер НДС";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {MODES.map((m) => (
          <button key={m.id} onClick={() => { setMode(m.id); setResult(null); }}
            className={`inline-flex min-h-[40px] items-center justify-center py-2 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer ${
              mode === m.id ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-600 hover:border-brand-300 bg-white"
            }`}>
            {m.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-gray-600">{label} (₽)</label>
          <input type="number" min="0" value={amount} onChange={(e) => { setAmount(e.target.value); setResult(null); }}
            placeholder="Например 100000"
            className="w-full bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-gray-600">Ставка НДС</label>
          <div className="grid grid-cols-5 gap-2">
            {NDS_RATES.map((r) => (
              <button key={r.value} onClick={() => { setRate(r.value); setResult(null); }}
                title={r.note}
                className={`inline-flex min-h-[40px] items-center justify-center py-2 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer ${
                  rate === r.value ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-600 hover:border-brand-300 bg-white"
                }`}>
                {r.label}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-gray-600">{NDS_RATES.find((r) => r.value === rate)?.note}</p>
        </div>
        <button onClick={calc}
          className="w-full py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold text-xs transition cursor-pointer">
          Рассчитать
        </button>
      </div>

      {error && <p className="text-[11px] text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5">{error}</p>}

      {result && (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-2">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-mono text-gray-600">НДС {rate}% — ст. 164 НК РФ (22% с 2026)</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-[10px] font-mono text-gray-600">Без НДС</p>
              <p className="text-sm font-bold text-gray-900">{result.base.toLocaleString("ru-RU")} ₽</p>
            </div>
            <div>
              <p className="text-[10px] font-mono text-gray-600">НДС</p>
              <p className="text-sm font-bold text-emerald-600">{result.tax.toLocaleString("ru-RU")} ₽</p>
            </div>
            <div>
              <p className="text-[10px] font-mono text-gray-600">С НДС</p>
              <p className="text-sm font-bold text-gray-900">{result.total.toLocaleString("ru-RU")} ₽</p>
            </div>
          </div>
          <p className="text-[11px] text-gray-600 border-t border-gray-200 pt-2">{rublesInWords(result.total)}</p>
          <a href="/builder?template=invoice"
            className="inline-block mt-1 py-2 px-3 rounded-lg bg-white border border-brand-300 text-brand-600 font-bold text-[11px] hover:bg-brand-50 transition">
            Счёт с НДС по шаблону →
          </a>
        </div>
      )}

      <p className="text-[11px] text-gray-600 leading-relaxed flex items-start gap-1.5">
        <BadgePercent className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
        С 1 января 2026 основная ставка НДС — 22% (ранее 20%). Пониженная 10% — продовольствие, детские товары, книги. Спецставки 5% и 7% — для УСН-налогоплательщиков с переходом на уплату НДС.
      </p>
    </div>
  );
}
"use client";
import { useState } from "react";
import { Check, Recycle } from "lucide-react";
import { utilSbFor } from "@/lib/legal/autoDuty";
import { fmtMoney } from "@/lib/legal/calc";

const FUELS = [
  { id: "petrol", label: "Бензин" },
  { id: "diesel", label: "Дизель" },
  { id: "parallelHybrid", label: "Гибрид" },
  { id: "electric", label: "Электромобиль" },
] as const;

export default function UtilSb() {
  const [subject, setSubject] = useState<"individual" | "legal">("individual");
  const [fuel, setFuel] = useState<(typeof FUELS)[number]["id"]>("petrol");
  const [ageUnder3, setAgeUnder3] = useState(true);
  const [volume, setVolume] = useState("");
  const [power, setPower] = useState("");
  const [result, setResult] = useState<{ amount: number; formula: string } | null>(null);
  const [error, setError] = useState("");

  const calc = () => {
    const v = parseFloat(volume);
    if (isNaN(v) || v <= 0) { setError("Укажите объём двигателя"); return; }
    const p = parseFloat(power);
    if (isNaN(p) || p <= 0) { setError("Укажите мощность двигателя"); return; }
    const r = utilSbFor({ subject, fuel, ageYears: ageUnder3 ? 0 : 5, volumeCm3: v, powerHp: p, valueRub: 0 });
    setResult(r);
    setError("");
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-gray-600">Кто ввозит автомобиль</label>
          <div className="grid grid-cols-2 gap-1.5">
            <button onClick={() => { setSubject("individual"); setResult(null); }}
              className={`py-2 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer ${subject === "individual" ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-600 hover:border-brand-300 bg-white"}`}>
              Физическое лицо
            </button>
            <button onClick={() => { setSubject("legal"); setResult(null); }}
              className={`py-2 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer ${subject === "legal" ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-600 hover:border-brand-300 bg-white"}`}>
              Юридическое лицо
            </button>
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-gray-600">Тип двигателя</label>
          <div className="grid grid-cols-4 gap-1.5">
            {FUELS.map((f) => (
              <button key={f.id} onClick={() => { setFuel(f.id); setResult(null); }}
                className={`py-2 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer ${fuel === f.id ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-600 hover:border-brand-300 bg-white"}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-gray-600">Возраст автомобиля</label>
          <div className="grid grid-cols-2 gap-1.5">
            <button onClick={() => { setAgeUnder3(true); setResult(null); }}
              className={`py-2 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer ${ageUnder3 ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-600 hover:border-brand-300 bg-white"}`}>
              До 3 лет
            </button>
            <button onClick={() => { setAgeUnder3(false); setResult(null); }}
              className={`py-2 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer ${!ageUnder3 ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-600 hover:border-brand-300 bg-white"}`}>
              Старше 3 лет
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-gray-600">Объём двигателя (см³)</label>
            <input type="number" min="0" value={volume} onChange={(e) => setVolume(e.target.value)}
              placeholder="Например 1996"
              className="w-full bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-gray-600">Мощность (л.с.)</label>
            <input type="number" min="0" value={power} onChange={(e) => setPower(e.target.value)}
              placeholder="Например 150"
              className="w-full bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
          </div>
        </div>
        <button onClick={calc}
          className="w-full py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold text-xs transition cursor-pointer">
          Рассчитать утильсбор
        </button>
      </div>

      {error && <p className="text-[11px] text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5">{error}</p>}

      {result && (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-2">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-mono text-gray-600">Утильсбор — постановление Правительства № 1291</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{fmtMoney(result.amount)}</p>
          <p className="text-[11px] text-gray-600">{result.formula}</p>
          <a href="/builder?id=sale-agreement-car"
            className="inline-block mt-1 py-2 px-3 rounded-lg bg-white border border-brand-300 text-brand-600 font-bold text-[11px] hover:bg-brand-50 transition">
            Договор купли-продажи авто →
          </a>
        </div>
      )}

      <p className="text-[11px] text-gray-600 leading-relaxed flex items-start gap-1.5">
        <Recycle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
        Базовая ставка для легковых — 20 000 ₽. Физические лица: до 3 лет — коэффициент 0,17 (3 400 ₽), старше 3 лет — 0,26 (5 200 ₽), при условии ввоза для личного пользования. Юридические лица и перепродажа — повышенные коэффициенты по ПП № 1291 (с учётом индексации с 1 октября 2024). Электромобили — до 3 лет 0,17, старше 3 лет 0,26.
      </p>
    </div>
  );
}
"use client";
import { useState } from "react";
import { Check, Car } from "lucide-react";
import { transportTax, luxuryCoefFor, TRANSPORT_REGIONS } from "@/lib/legal/fin";
import { fmtMoney } from "@/lib/legal/calc";

export default function TransportTax() {
  const [power, setPower] = useState("");
  const [region, setRegion] = useState<keyof typeof TRANSPORT_REGIONS>("moscow");
  const [months, setMonths] = useState("12");
  const [year, setYear] = useState("2026");
  const [price, setPrice] = useState("");
  const [age, setAge] = useState("");
  const [result, setResult] = useState<{ rate: number; tax: number; luxury: number } | null>(null);
  const [error, setError] = useState("");

  const calc = () => {
    const p = parseFloat(power);
    if (isNaN(p) || p <= 0) { setError("Укажите мощность двигателя"); return; }
    const tm = parseInt(months, 10);
    if (isNaN(tm) || tm < 1 || tm > 12) { setError("Месяцев: 1–12"); return; }
    const priceV = parseFloat(price || "0");
    const ageV = parseFloat(age || "0");
    const coef = priceV > 0 ? luxuryCoefFor(priceV, ageV) : 1;
    const r = transportTax(p, region, tm, coef, parseInt(year, 10) || 2026);
    setResult(r);
    setError("");
  };

  const regionConf = TRANSPORT_REGIONS[region];

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-gray-600">Мощность (л.с.)</label>
            <input type="number" value={power} onChange={(e) => setPower(e.target.value)}
              placeholder="Например 149"
              className="w-full bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-gray-600">Месяцев владения в году</label>
            <input type="number" value={months} onChange={(e) => setMonths(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-gray-600">Регион</label>
          <select value={region} onChange={(e) => setRegion(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500">
            {Object.entries(TRANSPORT_REGIONS).map(([k, v]) => (
              <option key={k} value={k}>{v.name}</option>
            ))}
          </select>
          {regionConf?.byYear && (
            <div className="space-y-1 pt-1">
              <label className="text-[10px] font-mono text-gray-600">Налоговый период (год)</label>
              <select value={year} onChange={(e) => setYear(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500">
                {Object.keys(regionConf.byYear).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          )}
          {regionConf?.note && (
            <p className="text-[10px] leading-snug text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2">
              {regionConf.note}
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-gray-600">Средняя стоимость авто (₽, дорогие авто)</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)}
              placeholder="Например 6000000"
              className="w-full bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-gray-600">Возраст авто (лет)</label>
            <input type="number" value={age} onChange={(e) => setAge(e.target.value)}
              placeholder="Например 2"
              className="w-full bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
          </div>
        </div>
        <button onClick={calc}
          className="w-full py-2.5 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 font-bold text-xs transition cursor-pointer">
          Рассчитать налог
        </button>
      </div>

      {error && <p className="text-[11px] text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5">{error}</p>}

      {result && (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-1.5">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-mono text-gray-600">Транспортный налог — ст. 361, 362 НК РФ</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{fmtMoney(result.tax)}</p>
          <p className="text-[11px] text-gray-600">Ставка {result.rate.toLocaleString("ru-RU")} ₽/л.с. · {months} мес. · повышающий коэффициент {result.luxury === 1 ? "не применяется" : "×" + result.luxury.toLocaleString("ru-RU")}</p>
          <a href="/builder?id=claim-generic"
            className="inline-block mt-1 py-2 px-3 rounded-lg bg-white border border-brand-300 text-brand-600 font-bold text-[11px] hover:bg-brand-50 transition">
            Спор по налогу →
          </a>
        </div>
      )}

      <p className="text-[11px] text-gray-600 leading-relaxed flex items-start gap-1.5">
        <Car className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
        Регионы вправе менять федеральные ставки (2,5–15 ₽/л.с.) в 10 раз. Повышающие коэффициенты: 3–5 млн ₽ (до 3 лет) ×1,1; 5–10 млн (до 5 лет) ×2; 10–15 млн (до 10 лет) ×3; 15+ млн (до 20 лет) ×3.
      </p>
    </div>
  );
}
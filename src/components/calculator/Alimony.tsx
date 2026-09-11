"use client";
import { useMemo, useState } from "react";
import { Check, Baby, Scale } from "lucide-react";
import { calcAlimony, calcAlimonyFixed, fmtMoney } from "@/lib/legal/calc";
import { REGION_PM, FEDERAL_PM, PM_YEAR, PM_UPDATED, childPmForRegion } from "@/lib/legal/pm";
import SaveCalcButton from "@/components/calculator/SaveCalcButton";

type Mode = "share" | "fixed";

const MULTIPLIER_PRESETS = [
  { v: 0.5, label: "1/2 ПМ" },
  { v: 1, label: "1 ПМ" },
  { v: 1.5, label: "1,5 ПМ" },
  { v: 2, label: "2 ПМ" },
];

export default function Alimony() {
  const [mode, setMode] = useState<Mode>("share");
  const [income, setIncome] = useState("");
  const [children, setChildren] = useState("1");
  const [debt, setDebt] = useState("");
  const [penaltyDays, setPenaltyDays] = useState("");
  const [regionCode, setRegionCode] = useState("");
  const [multiplier, setMultiplier] = useState("1");
  const [result, setResult] = useState<{ monthly: number; sharePct?: number; penalty: number; basis: string } | null>(null);
  const [error, setError] = useState("");

  const regionPm = useMemo(() => childPmForRegion(regionCode || null), [regionCode]);

  const calc = () => {
    const d = parseFloat(debt || "0");
    const days = parseInt(penaltyDays || "0");
    if (mode === "share") {
      const inc = parseFloat(income);
      if (isNaN(inc) || inc <= 0) { setError("Укажите доход"); return; }
      const r = calcAlimony(inc, parseInt(children), d, days);
      setResult({
        monthly: r.monthly,
        sharePct: r.share * 100,
        penalty: r.penalty,
        basis: `ст. 81 СК РФ — ${Math.round(r.share * 1000) / 10}% дохода`,
      });
    } else {
      const m = parseFloat(multiplier.replace(",", "."));
      if (isNaN(m) || m <= 0) { setError("Укажите кратность ПМ (например 1 или 0,5)"); return; }
      const r = calcAlimonyFixed(regionPm.pm, m, d, days);
      setResult({
        monthly: r.monthly,
        penalty: r.penalty,
        basis: `ст. 83, 117 СК РФ — ${m.toLocaleString("ru-RU")} × ПМ на ребёнка (${regionPm.label})`,
      });
    }
    setError("");
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-1.5" role="group" aria-label="Способ расчёта алиментов">
        <button onClick={() => { setMode("share"); setResult(null); setError(""); }} aria-pressed={mode === "share"}
          className={`py-2 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
            mode === "share" ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-600 hover:border-brand-300 bg-white"
          }`}>
          <Baby className="w-3.5 h-3.5" /> Доля от дохода
        </button>
        <button onClick={() => { setMode("fixed"); setResult(null); setError(""); }} aria-pressed={mode === "fixed"}
          className={`py-2 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
            mode === "fixed" ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-600 hover:border-brand-300 bg-white"
          }`}>
          <Scale className="w-3.5 h-3.5" /> Твёрдая сумма
        </button>
      </div>

      <div className="space-y-3">
        {mode === "share" ? (
          <>
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
                    {n} {n === "1" ? "ребёнок" : "детей"}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-gray-600" htmlFor="alimony-region">
                Регион места жительства ребёнка (ст. 117 СК РФ)
              </label>
              <select id="alimony-region" value={regionCode} onChange={(e) => setRegionCode(e.target.value)}
                autoComplete="off"
                className="w-full bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500">
                <option value="">Не выбран — федеральный ПМ ({fmtMoney(FEDERAL_PM.child)} ₽)</option>
                {REGION_PM.map((r) => (
                  <option key={r.code} value={r.code}>{r.name} — {fmtMoney(r.child)} ₽</option>
                ))}
              </select>
              <p className="text-[10px] text-gray-500">
                ПМ на ребёнка в {regionPm.label.toLowerCase()}: <b>{fmtMoney(regionPm.pm)} ₽</b> · данные СФР, действуют с {PM_UPDATED}
              </p>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-gray-600">Кратность ПМ (суд обычно 0,5–1 на одного ребёнка)</label>
              <div className="flex gap-1.5">
                {MULTIPLIER_PRESETS.map((p) => (
                  <button key={p.v} onClick={() => setMultiplier(String(p.v))} aria-pressed={multiplier === String(p.v)}
                    className={`flex-1 py-2 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer ${
                      multiplier === String(p.v) ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-600 hover:border-brand-300 bg-white"
                    }`}>
                    {p.label}
                  </button>
                ))}
                <input type="number" min="0.1" step="0.1" value={multiplier} onChange={(e) => setMultiplier(e.target.value)}
                  aria-label="Своя кратность ПМ"
                  className="w-16 bg-gray-50 border border-gray-200 text-xs py-2 px-2 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
              </div>
            </div>
          </>
        )}
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
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] font-mono text-gray-600">Алименты — {result.basis}</span>
            </div>
            <SaveCalcButton
              kind="alimony"
              title={`Алименты (${mode === "share" ? "доля" : "твёрдая сумма"}) — ${fmtMoney(result.monthly)}/мес`}
              lines={[
                `Способ: ${mode === "share" ? "доля от дохода (ст. 81 СК РФ)" : `твёрдая сумма, кратно ПМ на ребёнка (ст. 83, 117 СК РФ) — ${multiplier} × ${fmtMoney(regionPm.pm)}`}`,
                ...(mode === "share"
                  ? [`Доход плательщика: ${fmtMoney(parseFloat(income) || 0)}`, `Детей: ${children}`]
                  : [`Регион ПМ: ${regionPm.label}`, `ПМ на ребёнка: ${fmtMoney(regionPm.pm)} (СФР, с ${PM_UPDATED})`]),
                `Основание расчёта: ${result.basis}`,
                `Ежемесячно: ${fmtMoney(result.monthly)}`,
                ...(parseFloat(debt || "0") > 0
                  ? [`Задолженность: ${fmtMoney(parseFloat(debt))}`, `Дней просрочки: ${penaltyDays || "0"}`, `Пени 0,5%/день (ст. 115 СК РФ): ${fmtMoney(result.penalty)}`]
                  : []),
                "",
                "Расчёт: dogovor.expert. Не является юридической консультацией.",
              ]}
            />
          </div>
          <p className="text-2xl font-bold text-gray-900">{fmtMoney(result.monthly)}</p>
          {result.sharePct !== undefined && (
            <p className="text-[11px] text-gray-600">
              Доля от дохода: {result.sharePct.toLocaleString("ru-RU")}% ({result.sharePct === 25 ? "1/4" : result.sharePct === 33.33333333333333 ? "1/3" : "1/2"} от дохода)
            </p>
          )}
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
        Ст. 81 СК РФ: на одного ребёнка — 1/4 дохода, на двух — 1/3, на трёх и более — 1/2 (доли могут быть изменены судом).
        Ст. 83, 117 СК РФ: если доход не подтверждён или меняющийся — суд вправе взыскать алименты в твёрдой сумме, кратной
        ПМ на ребёнка в регионе (индексация пропорционально росту ПМ). Ст. 115 СК РФ: пени 0,5% от суммы задолженности за каждый день просрочки.
        ПМ —{` ${PM_YEAR} `}год, источник: СФР (sfr.gov.ru).
      </p>
    </div>
  );
}

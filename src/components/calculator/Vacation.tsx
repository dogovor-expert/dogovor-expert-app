"use client";
import { useState } from "react";
import { Check, Plane, ChevronDown } from "lucide-react";
import { vacationPay, vacationPayWithBonuses, unusedVacationDays } from "@/lib/legal/fin";
import { fmtMoney } from "@/lib/legal/calc";
import SaveCalcButton from "@/components/calculator/SaveCalcButton";

export default function Vacation() {
  const [mode, setMode] = useState<"pay" | "comp">("pay");
  const [salary12, setSalary12] = useState("");
  const [days, setDays] = useState("28");
  const [months, setMonths] = useState("12");
  const [result, setResult] = useState<{ pay: number; sdz: number; daysUsed?: number; bonusesIncluded?: number } | null>(null);
  const [error, setError] = useState("");

  const [showBonuses, setShowBonuses] = useState(false);
  const [monthlyBonuses, setMonthlyBonuses] = useState("");
  const [periodBonuses, setPeriodBonuses] = useState("");
  const [annualBonus, setAnnualBonus] = useState("");
  const [workedMonths, setWorkedMonths] = useState("12");
  const [partialDays, setPartialDays] = useState("0");
  const [bonusesProportional, setBonusesProportional] = useState(false);

  const num = (s: string) => { const n = parseFloat(s); return isNaN(n) ? 0 : Math.max(0, n); };

  const calc = () => {
    const sal = parseFloat(salary12);
    if (isNaN(sal) || sal <= 0) { setError("Укажите доход за расчётный период"); return; }
    if (mode === "pay") {
      const d = parseFloat(days);
      if (isNaN(d) || d <= 0) { setError("Укажите количество дней отпуска"); return; }
      if (showBonuses) {
        const r = vacationPayWithBonuses({
          salary12: sal,
          monthlyBonuses: num(monthlyBonuses),
          periodBonuses: num(periodBonuses),
          annualBonus: num(annualBonus),
          fullyWorkedMonths: Math.min(12, Math.max(0, parseFloat(workedMonths) || 12)),
          partialMonthDays: Math.min(31, Math.max(0, parseFloat(partialDays) || 0)),
          bonusesAlreadyProportional: bonusesProportional,
        }, d);
        if (!r) { setError("Расчётный период не может быть пустым"); return; }
        setResult({ pay: r.pay, sdz: r.sdz, bonusesIncluded: r.bonusesIncluded });
      } else {
        const r = vacationPay(sal, d);
        setResult({ pay: r.pay, sdz: r.sdz });
      }
    } else {
      const m = parseFloat(months);
      if (isNaN(m) || m <= 0 || m > 120) { setError("Укажите отработанные месяцы"); return; }
      const ud = unusedVacationDays(m);
      const r = vacationPay(sal, ud);
      setResult({ pay: r.pay, sdz: r.sdz, daysUsed: ud });
    }
    setError("");
  };

  const field = "w-full bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500";
  const label = "text-[10px] font-mono text-gray-600";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-1.5">
        <button onClick={() => setMode("pay")}
          className={`py-2 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer ${mode === "pay" ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-600 hover:border-brand-300 bg-white"}`}>
          Отпускные
        </button>
        <button onClick={() => setMode("comp")}
          className={`py-2 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer ${mode === "comp" ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-600 hover:border-brand-300 bg-white"}`}>
          Компенсация при увольнении
        </button>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <label className={label}>Зарплата за 12 месяцев до отпуска (₽){showBonuses ? ", без премий" : ""}</label>
          <input type="number" value={salary12} onChange={(e) => setSalary12(e.target.value)}
            placeholder="Например 900000" className={field} />
        </div>
        {mode === "pay" ? (
          <div className="space-y-1">
            <label className={label}>Дней отпуска</label>
            <input type="number" value={days} onChange={(e) => setDays(e.target.value)} className={field} />
          </div>
        ) : (
          <div className="space-y-1">
            <label className={label}>Отработано месяцев (неполный месяц от 15 дней — за полный)</label>
            <input type="number" value={months} onChange={(e) => setMonths(e.target.value)} className={field} />
          </div>
        )}

        {mode === "pay" && (
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setShowBonuses((s) => !s)}
              aria-expanded={showBonuses}
              className="w-full flex items-center justify-between px-3 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <span className="text-[11px] font-semibold text-gray-800">
                Учесть премии и неполный расчётный период
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${showBonuses ? "rotate-180" : ""}`} />
            </button>
            {showBonuses && (
              <div className="p-3 space-y-3 bg-white">
                <div className="space-y-1">
                  <label className={label}>Ежемесячные премии за расчётный период (₽)</label>
                  <input type="number" value={monthlyBonuses} onChange={(e) => setMonthlyBonuses(e.target.value)}
                    placeholder="не более 1 выплаты за каждый показатель за месяц" className={field} />
                </div>
                <div className="space-y-1">
                  <label className={label}>Квартальные / полугодовые премии (₽)</label>
                  <input type="number" value={periodBonuses} onChange={(e) => setPeriodBonuses(e.target.value)}
                    placeholder="за период не длиннее расчётного" className={field} />
                </div>
                <div className="space-y-1">
                  <label className={label}>Годовая премия за предшествующий год (₽)</label>
                  <input type="number" value={annualBonus} onChange={(e) => setAnnualBonus(e.target.value)}
                    placeholder="включается полностью, независимо от даты начисления" className={field} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className={label}>Полностью отработано мес. из 12</label>
                    <input type="number" min="0" max="12" value={workedMonths} onChange={(e) => setWorkedMonths(e.target.value)} className={field} />
                  </div>
                  <div className="space-y-1">
                    <label className={label}>Дней в неполных месяцах</label>
                    <input type="number" min="0" max="31" value={partialDays} onChange={(e) => setPartialDays(e.target.value)} className={field} />
                  </div>
                </div>
                <label className="flex items-start gap-2 text-[11px] text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bonusesProportional}
                    onChange={(e) => setBonusesProportional(e.target.checked)}
                    className="mt-0.5 accent-indigo-500"
                  />
                  Премии начислены уже пропорционально отработанному времени (брать полностью)
                </label>
                <p className="text-[10px] text-gray-500 leading-relaxed">
                  П. 15 ПП РФ № 540 от 24.04.2025: при неполном периоде премии
                  (кроме начисленных за фактически отработанное время)
                  учитываются пропорционально отработанному времени; периоды по
                  п. 5 (больничные, отпуска, командировки) исключаются из расчётного.
                </p>
              </div>
            )}
          </div>
        )}

        <button onClick={calc}
          className="w-full py-2.5 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 font-bold text-xs transition cursor-pointer">
          Рассчитать
        </button>
      </div>

      {error && <p className="text-[11px] text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5">{error}</p>}

      {result && (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] font-mono text-gray-600">СДЗ — ст. 139 ТК РФ (29,3)</span>
            </div>
            <SaveCalcButton
              kind="vacation"
              title={`${mode === "pay" ? "Отпускные" : "Компенсация"} — ${fmtMoney(result.pay)}`}
              lines={[
                `Тип: ${mode === "pay" ? "расчёт отпускных" : "компенсация за неиспользованный отпуск"}`,
                `Доход за расчётный период: ${fmtMoney(parseFloat(salary12) || 0)}`,
                ...(showBonuses && mode === "pay"
                  ? [
                      `Ежемесячные премии: ${fmtMoney(num(monthlyBonuses))}`,
                      `Премии за период: ${fmtMoney(num(periodBonuses))}`,
                      `Годовая премия: ${fmtMoney(num(annualBonus))}`,
                      `Отработано: ${workedMonths} мес. + ${partialDays} дн. ${bonusesProportional ? "(премии уже пропорциональны)" : ""}`,
                    ]
                  : []),
                mode === "pay"
                  ? `Дней отпуска: ${days}`
                  : `Отработано месяцев: ${months} → неиспользованных дней: ${result.daysUsed ?? ""}`,
                `Средний дневной заработок: ${fmtMoney(result.sdz)}`,
                ...(result.bonusesIncluded ? [`Премий учтено: ${fmtMoney(result.bonusesIncluded)}`] : []),
                `Итого к выплате: ${fmtMoney(result.pay)}`,
                "",
                "Расчёт: dogovor.expert, ст. 139 ТК РФ, ПП РФ № 540 (премии).",
              ]}
            />
          </div>
          <p className="text-2xl font-bold text-gray-900">{fmtMoney(result.pay)}</p>
          <p className="text-[11px] text-gray-600">
            СДЗ: {fmtMoney(result.sdz)} · {result.daysUsed !== undefined ? `${result.daysUsed} неиспользованных дней (2,33 дн./мес)` : `${days} дней отпуска`}
          </p>
          {result.bonusesIncluded !== undefined && result.bonusesIncluded > 0 && (
            <p className="text-[11px] text-gray-600">Премий включено в расчёт: {fmtMoney(result.bonusesIncluded)}</p>
          )}
          {/* 3.11 (аудит): сравнение «за 28 / 14 / 7 дней» при полном СДЗ. */}
          {mode === "pay" && (
            <div className="grid grid-cols-3 gap-1.5 pt-1.5 border-t border-gray-200">
              {[28, 14, 7].map((d) => (
                <div
                  key={d}
                  className={`rounded-lg border px-2 py-1.5 text-center ${d === 28 ? "border-brand-300 bg-brand-50/60" : "border-gray-200 bg-white"}`}
                >
                  <p className="text-[10px] text-gray-600">за {d} дн.</p>
                  <p className={`text-xs font-bold ${d === 28 ? "text-brand-700" : "text-gray-900"}`}>
                    {fmtMoney(result.sdz * d)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <p className="text-[11px] text-gray-600 leading-relaxed flex items-start gap-1.5">
        <Plane className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
        Формула: СДЗ = (выплаты + учтённые премии) ÷ (29,3 × полные месяцы + дни в неполных). Основной отпуск — 28 календарных дней (ст. 115 ТК). Компенсация: 2,33 дня за каждый месяц работы, округление в пользу работника.
      </p>
    </div>
  );
}

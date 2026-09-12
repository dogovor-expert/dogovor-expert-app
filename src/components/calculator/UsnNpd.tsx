"use client";
import { useState } from "react";
import { Check, Store } from "lucide-react";
import { usnTax, npdTax } from "@/lib/legal/fin";
import { fmtMoney } from "@/lib/legal/calc";
import SaveCalcButton from "@/components/calculator/SaveCalcButton";

export default function UsnNpd() {
  const [mode, setMode] = useState<"usn" | "npd">("usn");
  const [usnMode, setUsnMode] = useState<"income" | "incomeMinus">("income");
  const [income, setIncome] = useState("");
  const [expenses, setExpenses] = useState("");
  const [ppl, setPpl] = useState("");
  const [org, setOrg] = useState("");
  const [result, setResult] = useState<string[]>([]);
  const [npdLimit, setNpdLimit] = useState<{ total: number; state: "ok" | "warn" | "exceeded" } | null>(null);

  interface CalcResult { builder: string; link: string }

  const calc = () => {
    if (mode === "usn") {
      setNpdLimit(null);
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
    const total = p + o;
    const NPD_LIMIT = 2_400_000;
    setNpdLimit({
      total,
      state: total > NPD_LIMIT ? "exceeded" : total >= NPD_LIMIT * 0.8 ? "warn" : "ok",
    });
    setResult([
      `Налог НПД: ${fmtMoney(r.tax)} (${fmtMoney(p)} с физлиц × 4% + ${fmtMoney(o)} с юрлиц × 6%)`,
      `Вычет НБ на расходах 10 000 ₽: использовано ${fmtMoney(r.deductionUsed)}, осталось ${fmtMoney(r.deductionLeft)}`,
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
              <label className="text-[10px] font-mono text-gray-600">Доход за год (₽)</label>
              <input type="number" value={income} onChange={(e) => setIncome(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
            </div>
            {usnMode === "incomeMinus" && (
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-gray-600">Расходы за год (₽)</label>
                <input type="number" value={expenses} onChange={(e) => setExpenses(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-gray-600">Доход от физлиц (₽, 4%)</label>
            <input type="number" value={ppl} onChange={(e) => setPpl(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-gray-600">Доход от юрлиц/ИП (₽, 6%)</label>
            <input type="number" value={org} onChange={(e) => setOrg(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
          </div>
        </div>
      )}

      <button onClick={calc}
        className="w-full py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold text-xs transition cursor-pointer">
        Рассчитать налог
      </button>

      {result.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] font-mono text-gray-600">{mode === "usn" ? "УСН — ст. 346.20, 164 НК РФ" : "НПД — ФЗ-422"}</span>
            </div>
            <SaveCalcButton
              kind="usn-npd"
              title={`${mode === "usn" ? "УСН" : "НПД"} — расчёт налога`}
              lines={[
                ...(mode === "usn"
                  ? [`Режим: УСН «${usnMode === "income" ? "доходы 6%" : "доходы минус расходы 15%"}»`, `Доход: ${income} ₽`, ...(usnMode === "incomeMinus" ? [`Расходы: ${expenses || "0"} ₽`] : [])]
                  : [`Режим: НПД (ФЗ-422)`, `Доход от физлиц: ${ppl || "0"} ₽`, `Доход от юрлиц/ИП: ${org || "0"} ₽`]),
                ...result,
                ...(npdLimit ? [`Годовой доход: ${npdLimit.total.toLocaleString("ru-RU")} ₽ из 2 400 000 ₽ (лимит НПД)`] : []),
                "",
                "Расчёт: dogovor.expert. Региональные ставки УСН могут быть ниже (от 1%/5%).",
              ]}
            />
          </div>
          {result.map((line, i) => (
            <p key={i} className="text-[11px] text-gray-600">{line}</p>
          ))}
          {mode === "npd" && npdLimit && (
            <div className={`mt-1 rounded-xl border p-3 space-y-2 ${
              npdLimit.state === "exceeded" ? "bg-red-50 border-red-200"
              : npdLimit.state === "warn" ? "bg-amber-50 border-amber-200"
              : "bg-emerald-50 border-emerald-200"
            }`} role="status">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold ${
                  npdLimit.state === "exceeded" ? "text-red-700"
                  : npdLimit.state === "warn" ? "text-amber-700" : "text-emerald-700"
                }`}>
                  {npdLimit.state === "exceeded" ? "Лимит НПД превышен — право на спецрежим утрачено"
                    : npdLimit.state === "warn" ? "Внимание: доход уже на 80% лимита НПД"
                    : "Лимит НПД: 2,4 млн ₽ в год"}
                </span>
                <span className="text-[10px] font-mono text-gray-600">{fmtMoney(npdLimit.total)} / 2,4 млн</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/70 overflow-hidden" aria-hidden="true">
                <div className={`h-full rounded-full ${
                  npdLimit.state === "exceeded" ? "bg-red-500"
                  : npdLimit.state === "warn" ? "bg-amber-500" : "bg-emerald-500"
                }`} style={{ width: `${Math.min(100, (npdLimit.total / 2_400_000) * 100)}%` }} />
              </div>
              {npdLimit.state === "exceeded" ? (
                <>
                  <p className="text-[11px] text-red-700 leading-relaxed">
                    По ФЗ-422 условие о лимите считается нарушенным со дня превышения 2,4 млн ₽:
                    с этой даты НПД не применяется, а доход сверх лимита облагается НДФЛ 13%
                    (либо УСН, если вы ИП и подали уведомление о переходе).
                  </p>
                  <button onClick={() => setMode("usn")}
                    className="py-2 px-3 rounded-lg bg-white border border-red-300 text-red-700 font-bold text-[11px] hover:bg-red-100 transition cursor-pointer">
                    Рассчитать УСН после превышения →
                  </button>
                </>
              ) : npdLimit.state === "warn" ? (
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  До конца года остаётся менее 480 тыс. ₽ запаса. Если прогноз дохода выше лимита —
                  заранее рассмотрите переход на УСН (ставка 5–6% в большинстве регионов).
                </p>
              ) : null}
            </div>
          )}
          {mode === "usn" && <p className="text-[11px] text-gray-600">Лимит УСН 2026: 450 млн ₽ в год; НДС обязателен при доходах свыше 60 млн ₽.</p>}
          {mode === "npd" && (
            <a href="/builder?id=service-agreement"
              className="inline-block mt-1 py-2 px-3 rounded-lg bg-white border border-brand-300 text-brand-600 font-bold text-[11px] hover:bg-brand-50 transition">
              Договор с самозанятым →
            </a>
          )}
        </div>
      )}

      <p className="text-[11px] text-gray-600 leading-relaxed flex items-start gap-1.5">
        <Store className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
        Региональные ставки могут быть ниже (УСН: от 1% и 5%). С 2026 года базовая ставка НДС — 22%; на УСН при доходах 60–450 млн ₽ — НДС 5% или 7%.
      </p>
    </div>
  );
}
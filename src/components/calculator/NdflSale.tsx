"use client";
import { useState } from "react";
import { Check, CarTaxiFront, Clock3 } from "lucide-react";
import { ndflSaleCalc, CAR_DEDUCTION, FREE_SALE_YEARS } from "@/lib/legal/ndflSale";
import { fmtMoney } from "@/lib/legal/calc";

const NDFL_SERVICE_READY = false;

export default function NdflSale() {
  const [sell, setSell] = useState("");
  const [buy, setBuy] = useState("");
  const [ownedLong, setOwnedLong] = useState<boolean | null>(null);
  const [result, setResult] = useState<ReturnType<typeof ndflSaleCalc> | null>(null);
  const [error, setError] = useState("");

  const calc = () => {
    const s = parseFloat(sell);
    if (isNaN(s) || s <= 0) { setError("Укажите цену продажи"); return; }
    if (ownedLong === null) { setError("Укажите срок владения"); return; }
    const b = parseFloat(buy || "");
    const r = ndflSaleCalc({
      sellPrice: s,
      buyPrice: !isNaN(b) && b > 0 ? b : null,
      yearsOwned: ownedLong ? 10 : 1,
    });
    setResult(r);
    setError("");
  };

  const deductionLabel =
    result?.deductionType === "expenses"
      ? "Вычет по расходам на покупку"
      : result?.deductionType === "fixed"
        ? `Имущественный вычет (${fmtMoney(CAR_DEDUCTION)}, пп. 1 п. 2 ст. 220 НК)`
        : "Вычет не применён";

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-gray-600">Цена продажи (₽)</label>
          <input type="number" min="0" value={sell} onChange={(e) => setSell(e.target.value)}
            placeholder="Например 1200000"
            className="w-full bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-gray-600">Цена покупки по договору (₽, опционально)</label>
          <input type="number" min="0" value={buy} onChange={(e) => setBuy(e.target.value)}
            placeholder="Например 900000 — если есть ДКП"
            className="w-full bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-gray-600">Срок владения</label>
          <div className="grid grid-cols-2 gap-1.5">
            <button onClick={() => { setOwnedLong(false); setResult(null); }}
              className={`py-2 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer ${ownedLong === false ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-600 hover:border-brand-300 bg-white"}`}>
              Менее 3 лет
            </button>
            <button onClick={() => { setOwnedLong(true); setResult(null); }}
              className={`py-2 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer ${ownedLong === true ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-600 hover:border-brand-300 bg-white"}`}>
              3 года и более
            </button>
          </div>
        </div>
        <button onClick={calc}
          className="w-full py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold text-xs transition cursor-pointer">
          Рассчитать налог
        </button>
      </div>

      {error && <p className="text-[11px] text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5">{error}</p>}

      {result && (
        result.exempt ? (
          <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 space-y-2">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] font-mono text-emerald-600">Освобождение — пп. 17.1 ст. 217 НК РФ</span>
            </div>
            <p className="text-2xl font-bold text-emerald-700">{fmtMoney(0)}</p>
            <p className="text-[11px] text-emerald-800">
              Автомобиль в собственности {FREE_SALE_YEARS} года и более — НДФЛ не платится, декларацию подавать не нужно.
            </p>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-2">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] font-mono text-gray-600">3-НДФЛ при продаже авто — ст. 220, 224 НК РФ</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{fmtMoney(result.tax)}</p>
            <p className="text-[11px] text-gray-600">
              Налоговая база: {fmtMoney(result.taxableBase)} · {deductionLabel} ({fmtMoney(result.deductionUsed)}) · ставка {result.rate.toLocaleString("ru-RU")}%
            </p>
            {result.notes?.map((n, i) => (
              <p key={i} className="text-[11px] text-blue-700 bg-blue-50 border border-blue-200 rounded-lg p-2">
                {n}
              </p>
            ))}
            {result.mustFile ? (
              <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2 flex items-start gap-1.5">
                <Clock3 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                Декларацию нужно подать до <b>30 апреля</b> следующего года, налог уплатить до <b>15 июля</b>.
              </p>
            ) : (
              <p className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-2">
                Налоговая база равна нулю — НДФЛ платить не нужно, декларацию подавать не требуется.
              </p>
            )}
            {NDFL_SERVICE_READY ? (
              <a href="/builder?template=claim-generic"
                className="inline-block mt-1 py-2 px-3 rounded-lg bg-white border border-brand-300 text-brand-600 font-bold text-[11px] hover:bg-brand-50 transition">
                Декларация под ключ →
              </a>
            ) : (
              <div className="mt-1 rounded-xl border border-dashed border-brand-300 bg-brand-50/40 p-4 text-center space-y-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-brand-600 text-white text-[10px] font-bold uppercase tracking-widest">
                  Скоро
                </span>
                <p className="text-[11px] font-bold text-gray-800">Декларация 3-НДФЛ под ключ — 4 990 ₽</p>
                <p className="text-[10px] text-gray-600 leading-relaxed">Заполнение декларации, вычеты и подача через личный кабинет ФНС — запустим в ближайшее время.</p>
              </div>
            )}
          </div>
        )
      )}

      <p className="text-[11px] text-gray-600 leading-relaxed flex items-start gap-1.5">
        <CarTaxiFront className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
        При продаже авто, бывшего в собственности менее 3 лет, доход можно уменьшить на {fmtMoney(CAR_DEDUCTION)} (фиксированный вычет) либо на подтверждённые расходы на покупку — что выгоднее. Ставка — прогрессивная 13–22% по ст. 224 НК. Льгота для семей с 2+ детьми (полное освобождение, п. 2.1 ст. 217.1 НК) относится только к продаже жилья и на автомобиль не распространяется.
      </p>
    </div>
  );
}
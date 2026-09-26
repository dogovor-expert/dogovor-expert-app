"use client";
import { useState } from "react";
import { Percent, Check, Plus, Trash2 } from "lucide-react";
import { calc395WithPayments, currentKeyRate, fmtMoney, formatDateRu, today } from "@/lib/legal/calc";
import SaveCalcButton from "@/components/calculator/SaveCalcButton";

interface Payment {
  date: string;
  amount: string;
}

export default function Interest395() {
  const [debt, setDebt] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState(today());
  const [payments, setPayments] = useState<Payment[]>([]);
  const [result, setResult] = useState<{ periods: { from: string; to: string; days: number; rate: number; debt: number; amount: number }[]; total: number; remaining: number } | null>(null);
  const [error, setError] = useState("");

  const calc = () => {
    const d = parseFloat(debt);
    if (isNaN(d) || d <= 0) { setError("Укажите сумму долга"); return; }
    if (!from || !to) { setError("Укажите начальную и конечную дату"); return; }
    if (from > to) { setError("Дата начала не может быть позже даты окончания"); return; }
    const pays = payments
      .filter((p) => p.date && parseFloat(p.amount) > 0)
      .map((p) => ({ date: p.date, amount: parseFloat(p.amount) }));
    const r = calc395WithPayments(d, from, to, pays);
    setResult({ total: r.total, periods: r.periods, remaining: r.remainingDebt });
    setError("");
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="space-y-1">
          <label htmlFor="i395-debt" className="text-[10px] font-mono text-gray-600">Сумма долга (₽)</label>
          <input
            id="i395-debt"
            type="number"
            min="0"
            value={debt}
            onChange={(e) => setDebt(e.target.value)}
            placeholder="Например 150000"
            className="w-full bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label htmlFor="i395-from" className="text-[10px] font-mono text-gray-600">Начало просрочки</label>
            <input
              id="i395-from"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="i395-to" className="text-[10px] font-mono text-gray-600">Дата расчёта</label>
            <input
              id="i395-to"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[10px] font-mono text-gray-600">Частичные оплаты (необязательно)</label>
            <button
              onClick={() => setPayments([...payments, { date: "", amount: "" }])}
              className="flex items-center gap-1 text-[11px] font-semibold text-brand-600 hover:text-brand-700 cursor-pointer"
            >
              <Plus className="w-3 h-3" /> добавить
            </button>
          </div>
          {payments.map((p, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input
                type="date"
                aria-label={`Дата оплаты №${i + 1}`}
                value={p.date}
                onChange={(e) => setPayments(payments.map((x, j) => (j === i ? { ...x, date: e.target.value } : x)))}
                className="flex-1 bg-gray-50 border border-gray-200 text-xs py-2 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
              <input
                type="number"
                aria-label={`Сумма оплаты №${i + 1}`}
                value={p.amount}
                onChange={(e) => setPayments(payments.map((x, j) => (j === i ? { ...x, amount: e.target.value } : x)))}
                placeholder="Сумма"
                className="flex-1 bg-gray-50 border border-gray-200 text-xs py-2 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
              <button
                onClick={() => setPayments(payments.filter((_, j) => j !== i))}
                aria-label={`Удалить оплату №${i + 1}`}
                className="px-2 text-gray-600 hover:text-red-500 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={calc}
          className="w-full py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold text-xs transition cursor-pointer"
        >
          Рассчитать проценты
        </button>
      </div>

      {error && <p className="text-[11px] text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5">{error}</p>}

      {result && (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] font-mono text-gray-600">Ст. 395 ГК РФ · ставка {currentKeyRate().toFixed(2).replace(".", ",")} %</span>
            </div>
            <SaveCalcButton
              kind="interest395"
              title={`Проценты по ст. 395 — ${fmtMoney(result.total)}`}
              lines={[
                `Долг: ${fmtMoney(parseFloat(debt) || 0)}`,
                `Период: ${formatDateRu(from)} — ${formatDateRu(to)}`,
                ...payments.filter((p) => p.date && parseFloat(p.amount) > 0)
                  .map((p) => `Оплата ${formatDateRu(p.date)}: ${fmtMoney(parseFloat(p.amount))}`),
                ...result.periods.map((p) =>
                  `${formatDateRu(p.from)} — ${formatDateRu(p.to)}: ${p.days} дн. × ${p.rate.toFixed(2).replace(".", ",")}% при долге ${fmtMoney(Math.round(p.debt))} = ${fmtMoney(p.amount)}`
                ),
                `Итого процентов: ${fmtMoney(result.total)}`,
                ...(result.remaining > 0 ? [`Остаток долга: ${fmtMoney(result.remaining)}`] : []),
                "",
                "Расчёт: dogovor.expert, ключевая ставка ЦБ РФ по периодам (365/366 дн.).",
              ]}
            />
          </div>
          <p className="text-2xl font-bold text-gray-900">{fmtMoney(result.total)}</p>
          {result.remaining > 0 && (
            <p className="text-[11px] text-gray-600">Остаток долга: {fmtMoney(result.remaining)}</p>
          )}
          {result.periods.length > 0 && (
            <div className="max-h-40 overflow-auto space-y-1">
              {result.periods.map((p, i) => (
                <div key={i} className="flex justify-between text-[11px] text-gray-600 border-b border-gray-200 pb-1">
                  <span>
                    {formatDateRu(p.from)} — {formatDateRu(p.to)} · {p.days} дн. · ставка {p.rate.toFixed(2).replace(".", ",")}% · долг {fmtMoney(Math.round(p.debt))}
                  </span>
                  <span className="font-semibold text-gray-900">{fmtMoney(p.amount)}</span>
                </div>
              ))}
            </div>
          )}
          <a
            href="/builder?template=claim-generic"
            className="inline-block mt-1 py-2 px-3 rounded-lg bg-white border border-brand-300 text-brand-600 font-bold text-[11px] hover:bg-brand-50 transition"
          >
            Составить иск о взыскании →
          </a>
        </div>
      )}

      <p className="text-[11px] text-gray-600 leading-relaxed flex items-start gap-1.5">
        <Percent className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
        Расчёт по формуле Банка России: долг × ключевая ставка × дни просрочки по периодам действия ставки (365/366 дней в году). Оплаты уменьшают долг со дня внесения. Суд может иначе квалифицировать платежи (ст. 319 ГК).
      </p>
    </div>
  );
}
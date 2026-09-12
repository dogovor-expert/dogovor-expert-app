"use client";
import { useState } from "react";
import { Check, CarFront, Search, Timer } from "lucide-react";
import { KOAP_CHAPTER_12, discountDeadline, fineWithDiscount, fineLabel, punishLabel, type KoapFine } from "@/lib/legal/koap";
import { fmtMoney } from "@/lib/legal/calc";

function totalFine(f: KoapFine): number {
  return f.fineMax !== null ? f.fineMax : 0;
}

export default function PddFines() {
  const [tab, setTab] = useState<"guide" | "discount">("guide");
  const [query, setQuery] = useState("");
  const [issued, setIssued] = useState("");
  const [selected, setSelected] = useState<KoapFine | null>(null);
  const [result, setResult] = useState<{ fine: number; withDiscount: number | null; deadline: string; daysLeft: number } | null>(null);
  const [error, setError] = useState("");

  const q = query.trim().toLowerCase();
  const filtered = KOAP_CHAPTER_12.filter((f) =>
    !q || f.article.includes(q) || f.title.toLowerCase().includes(q)
  );

  const pick = (f: KoapFine) => {
    setSelected(f);
    setQuery(`${f.article} (ч. ${f.part === 0 ? "—" : f.part})`);
    setResult(null);
    setError("");
  };

  const calcDiscount = () => {
    if (!selected) { setError("Сначала выберите статью из справочника"); return; }
    if (!issued) { setError("Укажите дату постановления"); return; }
    if (selected.fineMax === null) { setError("По этой статье штраф не предусмотрен (лишение прав / арест) — скидка 50% не применяется"); return; }
    const deadline = discountDeadline(issued);
    const now = new Date();
    const nowDay = now.toISOString().slice(0, 10) + "T00:00:00";
    const deadlineMs = new Date(deadline + "T00:00:00").getTime();
    const daysLeft = Math.max(0, Math.round((deadlineMs - new Date(nowDay).getTime()) / 86400000));
    const wd = fineWithDiscount(selected);
    setResult({ fine: totalFine(selected), withDiscount: wd && daysLeft > 0 ? wd : null, deadline, daysLeft });
    setError("");
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-1.5">
        <button onClick={() => setTab("guide")}
          className={`py-2 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer ${tab === "guide" ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-600 hover:border-brand-300 bg-white"}`}>
          Справочник (гл. 12 КоАП)
        </button>
        <button onClick={() => setTab("discount")}
          className={`py-2 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer ${tab === "discount" ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-600 hover:border-brand-300 bg-white"}`}>
          Скидка 50% за 20 дней
        </button>
      </div>

      {tab === "guide" && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
              <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск: статья (12.9) или нарушение («парковка», «обгон»)"
                className="w-full bg-gray-50 border border-gray-200 text-xs py-2.5 pl-9 pr-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto rounded-xl border border-gray-200 divide-y divide-gray-100">
            {filtered.map((f) => (
              <button key={`${f.article}-${f.part}`} onClick={() => pick(f)}
                className="w-full flex items-start gap-3 p-3 text-left hover:bg-gray-50 transition cursor-pointer">
                <span className="text-[11px] font-mono font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-md px-1.5 py-0.5 flex-shrink-0">
                  {f.article}{f.part ? `/${f.part}` : ""}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[11px] text-gray-700 leading-snug">{f.title}</span>
                  <span className="block text-[10px] text-gray-600 mt-0.5">
                    {fineLabel(f)} · {punishLabel(f.punish)}
                    {f.revokeMonths && <> — лишение {f.revokeMonths[0]}–{f.revokeMonths[1]} мес</>}
                    {f.repeatText && <span className="text-amber-700"> · {f.repeatText}</span>}
                  </span>
                </span>
                {f.noDiscount && <span className="text-[9px] text-red-500 font-bold flex-shrink-0 mt-0.5">без 50%</span>}
              </button>
            ))}
            {filtered.length === 0 && <p className="p-4 text-[11px] text-gray-600">Ничего не найдено</p>}
          </div>
          <p className="text-[10px] text-gray-600">
            Скидка 50% (ч. 1.3 ст. 32.2 КоАП) не применяется: повторная регистрация ТС (12.1 ч. 1.1), пьяное вождение (12.8), переезд (12.10), повторное превышение 40+ км/ч (12.9 ч. 6–7), повторный красный (12.12 ч. 3), повторная «встречка» (12.15 ч. 5, 12.16 ч. 3.1), вред здоровью (12.24), отказ от освидетельствования (12.26), употребление алкоголя после ДТП (12.27 ч. 3). Остальные штрафы гл. 12 — со скидкой при оплате в 20 дней. При фиксации камерами лишение не назначается — только штраф.
          </p>
        </div>
      )}

      {tab === "discount" && (
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-gray-600">Статья (выберите из справочника)</label>
            <input type="text" value={query} onChange={(e) => { setQuery(e.target.value); setSelected(null); setResult(null); }}
              onFocus={() => setTab("guide")}
              placeholder="Нажмите, чтобы выбрать статью"
              className="w-full bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-gray-600">Дата постановления о штрафе</label>
            <input type="date" value={issued} onChange={(e) => setIssued(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
          </div>
          {selected && (
            <p className="text-[11px] text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-2.5">
              <b>{selected.article}{selected.part ? ` ч. ${selected.part}` : ""}</b>: {selected.title} — {fineLabel(selected)}
            </p>
          )}
          <button onClick={calcDiscount}
            className="w-full py-2.5 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 font-bold text-xs transition cursor-pointer">
            Рассчитать со скидкой
          </button>

          {error && <p className="text-[11px] text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5">{error}</p>}

          {result && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-2">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] font-mono text-gray-600">Скидка 50% — ст. 32.2 КоАП, 20 дней</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <p className="text-[10px] font-mono text-gray-600">Без скидки</p>
                  <p className="text-lg font-bold text-gray-600 line-through">{fmtMoney(result.fine)}</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  <p className="text-[10px] font-mono text-emerald-500">Со скидкой</p>
                  <p className="text-lg font-bold text-emerald-700">
                    {result.withDiscount !== null ? fmtMoney(result.withDiscount) : "недоступна"}
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-gray-600 flex items-start gap-1.5">
                <Timer className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-amber-700" />
                {result.withDiscount !== null
                  ? <>Оплатите до <b>{result.deadline.split("-").reverse().join(".")}</b> — осталось <b>{result.daysLeft}</b> дн. Скидка сгорает при обжаловании постановления.</>
                  : <>Скидка 50% по этой статье не применяется (нарушение входит в исключения ст. 32.2 КоАП). Оплатите в течение 60 дней, иначе дело передадут приставам.</>}
              </p>
              <a href="/builder?id=claim-generic"
                className="inline-block mt-1 py-2 px-3 rounded-lg bg-white border border-brand-300 text-brand-600 font-bold text-[11px] hover:bg-brand-50 transition">
                Обжалование постановления →
              </a>
            </div>
          )}
        </div>
      )}

      <p className="text-[11px] text-gray-600 leading-relaxed flex items-start gap-1.5">
        <CarFront className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
        Суммы штрафов — по гл. 12 КоАП РФ в редакции 2026 года. Все штрафы, зафиксированные камерами, выносятся без лишения прав. За повторные нарушения предусмотрены повышенные санкции.
      </p>
    </div>
  );
}
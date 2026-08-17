"use client";
import { useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";

type ClassKey = "M" | "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | "13";

const CLASSES: ClassKey[] = ["M", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"];

const KBM_BY_CLASS: Record<ClassKey, number> = {
  M: 3.92,
  "0": 2.94,
  "1": 2.25,
  "2": 1.76,
  "3": 1.17,
  "4": 1.0,
  "5": 0.91,
  "6": 0.83,
  "7": 0.78,
  "8": 0.74,
  "9": 0.68,
  "10": 0.63,
  "11": 0.57,
  "12": 0.52,
  "13": 0.46,
};

const NEXT_CLASS: Record<ClassKey, Record<number, ClassKey>> = {
  M: { 0: "0", 1: "M", 2: "M", 3: "M", 4: "M" },
  "0": { 0: "1", 1: "M", 2: "M", 3: "M", 4: "M" },
  "1": { 0: "2", 1: "M", 2: "M", 3: "M", 4: "M" },
  "2": { 0: "3", 1: "1", 2: "M", 3: "M", 4: "M" },
  "3": { 0: "4", 1: "1", 2: "M", 3: "M", 4: "M" },
  "4": { 0: "5", 1: "2", 2: "1", 3: "M", 4: "M" },
  "5": { 0: "6", 1: "3", 2: "1", 3: "M", 4: "M" },
  "6": { 0: "7", 1: "4", 2: "2", 3: "M", 4: "M" },
  "7": { 0: "8", 1: "4", 2: "2", 3: "M", 4: "M" },
  "8": { 0: "9", 1: "5", 2: "2", 3: "1", 4: "M" },
  "9": { 0: "10", 1: "5", 2: "2", 3: "1", 4: "M" },
  "10": { 0: "11", 1: "6", 2: "3", 3: "1", 4: "M" },
  "11": { 0: "12", 1: "6", 2: "3", 3: "1", 4: "M" },
  "12": { 0: "13", 1: "6", 2: "3", 3: "1", 4: "M" },
  "13": { 0: "13", 1: "7", 2: "3", 3: "1", 4: "M" },
};

const TRANSITION_CLAIMS = [0, 1, 2, 3, 4] as const;

function formatKbm(v: number): string {
  return Number.isInteger(v) ? String(v) : v.toFixed(2).replace(/\.?0+$/, "");
}

function discountLabel(kbm: number): string {
  if (kbm > 1) return `надбавка ${Math.round((kbm - 1) * 100)}%`;
  if (kbm < 1) return `скидка ${Math.round((1 - kbm) * 100)}%`;
  return "без скидок и надбавок";
}

export default function KbmFrame() {
  const [currentClass, setCurrentClass] = useState<ClassKey>("3");
  const [claims, setClaims] = useState<number>(0);

  const resultClass = useMemo(() => NEXT_CLASS[currentClass][claims], [currentClass, claims]);
  const currentKbm = KBM_BY_CLASS[currentClass];
  const resultKbm = KBM_BY_CLASS[resultClass];

  const selectClass = "w-full sm:w-56 px-4 py-3 rounded-xl border border-gray-300 bg-white text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500";

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-md shadow-gray-200/60">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white shadow-lg shadow-brand-500/40 ring-2 ring-brand-300/50 flex-shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Таблица КБМ по ОСАГО</h2>
          <p className="text-sm text-gray-500">
            Коэффициент бонус-малус (КБМ) определяет скидку или надбавку к стоимости полиса
            ОСАГО и зависит от числа ДТП по вашей вине за предыдущие годы. Значения —
            по таблице Указания Банка России, класс 3 (КБМ 1,17) — стартовый для нового
            водителя.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-brand-100 bg-gradient-to-br from-brand-50 to-white p-5 sm:p-6">
        <h3 className="text-sm font-bold text-gray-900 mb-4">
          Как изменится КБМ через год безаварийной езды
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Ваш текущий класс
            </span>
            <select
              className={selectClass + " mt-1.5"}
              value={currentClass}
              onChange={(e) => setCurrentClass(e.target.value as ClassKey)}
            >
              {CLASSES.map((c) => (
                <option key={c} value={c}>
                  Класс {c} — КБМ {formatKbm(KBM_BY_CLASS[c])}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              ДТП по вашей вине за год
            </span>
            <select
              className={selectClass + " mt-1.5"}
              value={claims}
              onChange={(e) => setClaims(Number(e.target.value))}
            >
              {TRANSITION_CLAIMS.map((n) => (
                <option key={n} value={n}>
                  {n === 0 ? "0 — ездил без аварий" : `${n} ${n === 1 ? "авария" : "аварии"}`}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl bg-white border border-gray-200 p-4">
          <div>
            <p className="text-xs text-gray-500">Текущий КБМ</p>
            <p className="text-lg font-bold text-gray-900">{formatKbm(currentKbm)}</p>
            <p className="text-xs text-gray-400">{discountLabel(currentKbm)}</p>
          </div>
          <svg className="w-6 h-6 text-brand-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
          <div>
            <p className="text-xs text-gray-500">Новый КБМ</p>
            <p className="text-lg font-bold text-brand-600">{formatKbm(resultKbm)}</p>
            <p className="text-xs text-gray-400">{discountLabel(resultKbm)}</p>
          </div>
          <div className="ml-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold border border-brand-100">
              Класс {resultClass}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3">Класс</th>
                <th className="px-4 py-3">КБМ</th>
                <th className="px-4 py-3">Скидка / надбавка</th>
                <th className="px-4 py-3 text-right">
                  Класс через год: 0 / 1 / 2 / 3 / 4+ аварий
                </th>
              </tr>
            </thead>
            <tbody>
              {CLASSES.map((c, i) => {
                const kbm = KBM_BY_CLASS[c];
                const isCurrent = c === currentClass;
                return (
                  <tr
                    key={c}
                    className={
                      "border-t border-gray-100 " +
                      (isCurrent ? "bg-brand-50/70" : i % 2 ? "bg-gray-50/50" : "bg-white")
                    }
                  >
                    <td className="px-4 py-2.5 font-semibold text-gray-900">
                      {c === "M" ? "M" : c}
                    </td>
                    <td className="px-4 py-2.5 font-bold text-gray-900">{formatKbm(kbm)}</td>
                    <td className="px-4 py-2.5 text-gray-600">{discountLabel(kbm)}</td>
                    <td className="px-4 py-2.5 text-right text-gray-600 whitespace-nowrap">
                      {TRANSITION_CLAIMS.map((n) => NEXT_CLASS[c][n]).join(" / ")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-sm font-bold text-gray-900 mb-3">
          Точная проверка вашего КБМ по базе
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Таблица выше показывает правила расчёта. Чтобы узнать свой актуальный КБМ из
          официальной базы АИС ОСАГО, воспользуйтесь бесплатными сервисами:
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href="https://nsis.ru/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 shadow-md shadow-brand-500/30 transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            Проверка на nsis.ru (Госуслуги)
          </a>
          <a
            href="https://www.sravni.ru/osago/proverit-kbm/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:border-brand-300 hover:text-brand-700 transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            Проверка на sravni.ru
          </a>
        </div>
      </div>

      <p className="text-[11px] text-gray-400 leading-relaxed flex items-start gap-1.5">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-3.5 h-3.5 mt-0.5 flex-shrink-0"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
        Значения КБМ и правила перехода классов приведены по таблице Указания Банка России.
        Восстановление КБМ через НСИС и страховые компании бесплатно — не пользуйтесь
        платными посредниками.
      </p>
    </div>
  );
}
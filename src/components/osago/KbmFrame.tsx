"use client";
import { useState } from "react";
import { ShieldCheck, ExternalLink, Info } from "lucide-react";

/**
 * Личный кабинет НСИС — официальный сервис проверки КБМ.
 * С 01.10.2024 оператор базы КБМ — АО «НСИС» (не РСА). Проверка выполняется
 * в личном кабинете по ФИО, дате рождения и серии/номеру ВУ.
 */
const NSIS_KBM_URL = "https://lk.nsis.ru/";

/**
 * Официальная шкала КБМ (Указание Банка России, приложение 2 к Правилам
 * страхового тарифа по ОСАГО; в силе с 01.04.2022). Классы: от «М»
 * (самый плохой) до 13 (самый лучший). Значения 3.92…0.46.
 * Пересмотр класса — ежегодно 1 апреля по безубыточности.
 */
export const KBM_SCALE: { cls: string; kbm: number }[] = [
  { cls: "М", kbm: 3.92 },
  { cls: "0", kbm: 2.94 },
  { cls: "1", kbm: 2.25 },
  { cls: "2", kbm: 1.76 },
  { cls: "3", kbm: 1.17 },
  { cls: "4", kbm: 1.0 },
  { cls: "5", kbm: 0.91 },
  { cls: "6", kbm: 0.83 },
  { cls: "7", kbm: 0.78 },
  { cls: "8", kbm: 0.74 },
  { cls: "9", kbm: 0.68 },
  { cls: "10", kbm: 0.63 },
  { cls: "11", kbm: 0.57 },
  { cls: "12", kbm: 0.52 },
  { cls: "13", kbm: 0.46 },
];

export default function KbmInfo() {
  const [showScale, setShowScale] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-md shadow-gray-200/60">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg ring-2 ring-emerald-300/50 flex-shrink-0">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Проверка КБМ</h2>
          <p className="text-sm text-gray-600">
            Коэффициент бонус-малус напрямую влияет на цену ОСАГО: от 0.46 (скидка 54%)
            до 3.92 (надбавка 292%).
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <a
          href={NSIS_KBM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition bg-emerald-600 text-white hover:bg-emerald-700"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Узнать свой КБМ в официальной базе НСИС
        </a>

        <p className="text-[11px] text-gray-600 leading-relaxed flex items-start gap-1.5">
          <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          С 01.10.2024 оператором базы КБМ является АО «НСИС» (не РСА). Проверка бесплатна
          и выполняется в личном кабинете НСИС: потребуются ФИО, дата рождения и серия/номер ВУ.
          КБМ рассчитывается по базе АИС страхования — его нельзя узнать по одному номеру ВУ.
          Если КБМ не соответствует истории вождения — его можно восстановить через страховую
          или запрос в НСИС.
        </p>

        <button
          onClick={() => setShowScale((s) => !s)}
          aria-expanded={showScale}
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 transition cursor-pointer"
        >
          {showScale ? "Скрыть шкалу КБМ" : "Показать шкалу классов КБМ"}
        </button>

        {showScale && (
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-[11px]">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-3 py-2 font-semibold">Класс</th>
                  <th className="text-right px-3 py-2 font-semibold">КБМ</th>
                  <th className="text-right px-3 py-2 font-semibold">Скидка/наценка</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {KBM_SCALE.map(({ cls, kbm }) => (
                  <tr key={cls} className={kbm < 1 ? "bg-emerald-50/40" : kbm > 1 ? "bg-red-50/40" : ""}>
                    <td className="px-3 py-1.5 text-gray-900">Класс {cls}</td>
                    <td className="px-3 py-1.5 text-right font-mono text-gray-900">{kbm.toFixed(2)}</td>
                    <td className="px-3 py-1.5 text-right text-gray-600">
                      {kbm < 1 ? `−${Math.round((1 - kbm) * 100)}%` : kbm > 1 ? `+${Math.round((kbm - 1) * 100)}%` : "база"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="px-3 py-2 text-[10px] text-gray-500 bg-gray-50 border-t border-gray-200">
              Класс пересматривается ежегодно 1 апреля: без аварий — растёт, авария по вине — падает.
              Максимальный 13 класс (КБМ 0.46) достигается за 10+ лет безаварийной езды.
              Источник: Приложение 2 к Правилам применения страховщиками тарифов (Указание Банка России).
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

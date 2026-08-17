"use client";
import { useState } from "react";
import { ExternalLink } from "lucide-react";

const RSA_KBM_URL = "https://dkbm-web.autoins.ru/dkbm-web-1.0/";

export default function KbmFrame() {
  const [failed, setFailed] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 space-y-4 shadow-md shadow-gray-200/60">
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
          <h2 className="text-xl font-bold text-gray-900">Проверка КБМ</h2>
          <p className="text-sm text-gray-500">
            Коэффициент бонус-малус по официальному реестру РСА (Россия). Введите ФИО, дату
            рождения и водительское удостоверение — данные проверяются напрямую на сервисе РСА.
          </p>
        </div>
      </div>

      <a
        href={RSA_KBM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 shadow-md shadow-brand-500/30 transition-all"
      >
        <ExternalLink className="w-4 h-4" />
        Проверить КБМ на сайте РСА
      </a>

      {failed ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Встроенный блок проверки не загрузился (сервис РСА ограничивает встраивание).
          Воспользуйтесь кнопкой выше, чтобы открыть проверку КБМ на официальном сайте РСА
          в новой вкладке.
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
          <iframe
            src={RSA_KBM_URL}
            title="Проверка КБМ — реестр РСА"
            loading="lazy"
            className="w-full"
            style={{ height: "720px", border: 0 }}
            allow="clipboard-write"
            referrerPolicy="no-referrer"
            onError={() => setFailed(true)}
          />
        </div>
      )}

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
        Сервис «Проверка КБМ» предоставлен АО «Российский Союз Автостраховщиков» (autoins.ru).
        Данные, введённые в форму, передаются напрямую в реестр РСА и не сохраняются на
        серверах Dogovor.
      </p>
    </div>
  );
}

import { Clock } from "lucide-react";

export default function KbmFrame() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-md shadow-gray-200/60">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white shadow-lg ring-2 ring-gray-300/50 flex-shrink-0">
          <Clock className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Проверка и восстановление КБМ</h2>
          <p className="text-sm text-gray-600">
            Раздел проверки коэффициента бонус-малус по ОСАГО временно недоступен.
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 py-12 text-center">
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-600 text-sm font-semibold">
          <Clock className="w-4 h-4" />
          Скоро
        </span>
        <p className="text-sm text-gray-600 max-w-sm">
          Мы готовим удобный сервис проверки КБМ по официальной базе. Вернёмся к этому позже.
        </p>
      </div>
    </div>
  );
}
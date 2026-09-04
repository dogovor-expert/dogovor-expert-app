"use client";
/**
 * Cookies-баннер. Изолирован от AppLayout, чтобы любая навигация
 * не вызывала его ре-маунт.
 *
 * Использует useCookieConsent (singleton через useSyncExternalStore):
 *  - На SSR ничего не рендерим (consent всегда null)
 *  - До гидратации consent === null → баннер скрыт
 *  - После гидратации синхронно читаем localStorage:
 *    - "accepted"/"declined" → баннер закрыт
 *    - null → баннер открыт
 *  - При клике "Принять"/"Отклонить" — пишем в localStorage + emit событие
 *    → YandexMetrika и другие потребители подхватывают
 */
import { useEffect, useState } from "react";
import { Cookie, X } from "lucide-react";
import Link from "next/link";
import { useCookieConsent } from "@/hooks/useCookieConsent";

export function CookieBanner() {
  const { consent, accept, decline } = useCookieConsent();
  // Защита от гидратационного матча: на сервере рендерим null,
  // на клиенте после mount смотрим реальное состояние.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  if (consent !== null) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-banner-title"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-xl bg-white border border-gray-200 rounded-2xl shadow-xl p-4"
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
          <Cookie className="w-4.5 h-4.5 text-brand-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p id="cookie-banner-title" className="text-sm font-semibold text-gray-900">
            Мы используем cookies
          </p>
          <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
            Обезличенные данные для анализа посещаемости и улучшения сервиса. Подробнее в{" "}
            <Link href="/privacy" className="text-brand-600 hover:underline">
              Политике конфиденциальности
            </Link>
            .
          </p>
          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={accept}
              className="px-4 py-3 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 active:bg-brand-700 rounded-lg transition-colors cursor-pointer"
            >
              Принять
            </button>
            <button
              type="button"
              onClick={decline}
              className="px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors cursor-pointer"
            >
              Отклонить
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={decline}
          className="p-2 hover:bg-gray-100 active:bg-gray-200 rounded-lg flex-shrink-0 cursor-pointer"
          aria-label="Закрыть"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>
      </div>
    </div>
  );
}

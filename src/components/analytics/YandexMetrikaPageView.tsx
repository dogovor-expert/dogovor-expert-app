"use client";

/**
 * Яндекс.Метрика: отправляет page-view при смене pathname/search.
 * Использует useCookieConsent — корректно реагирует на accept/decline
 * без перезагрузки (Аудит Фаза 1: T1/AN1).
 */
import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { YANDEX_METRIKA_ID } from "@/lib/site";
import { useCookieConsent } from "@/hooks/useCookieConsent";

declare global {
  interface Window {
    ym?: (id: number, action: string, ...args: unknown[]) => void;
  }
}

const ENABLED = YANDEX_METRIKA_ID && YANDEX_METRIKA_ID !== "XXXXXXXX";

export function YandexMetrikaPageView() {
  return (
    <Suspense fallback={null}>
      <YandexMetrikaPageViewInner />
    </Suspense>
  );
}

function YandexMetrikaPageViewInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isReady, categories } = useCookieConsent();

  useEffect(() => {
    if (!ENABLED || !isReady || !categories.analytics) return;
    if (typeof window === "undefined" || typeof window.ym !== "function") return;
    window.ym(
      Number(YANDEX_METRIKA_ID),
      "hit",
      window.location.pathname + window.location.search
    );
  }, [pathname, searchParams, isReady, categories.analytics]);

  return null;
}

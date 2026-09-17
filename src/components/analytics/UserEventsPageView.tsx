"use client";

/**
 * Просмотры страниц в собственный журнал (/api/events → user_events).
 *
 * Это первая сторона (наш собственный бэкенд, данные в РФ), поэтому журнал
 * ведётся независимо от согласия на сторонние счётчики — как и остальные
 * first-party события через track()/trackOwnOnly(). Сторонний счётчик
 * Яндекс.Метрики при этом по-прежнему подключается только по согласию
 * (см. YandexMetrika.tsx), а собственный журнал раскрыт в Политике
 * конфиденциальности (раздел «Cookies и аналитика»).
 */
import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackOwnOnly, goals } from "@/lib/analytics";

export function UserEventsPageView() {
  return (
    <Suspense fallback={null}>
      <UserEventsPageViewInner />
    </Suspense>
  );
}

function UserEventsPageViewInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    trackOwnOnly(goals.pageView);
    // searchParams намеренно в зависимостях (как в YandexMetrikaPageView) —
    // чтобы фиксировать и переходы, меняющие только query.
  }, [pathname, searchParams]);

  return null;
}

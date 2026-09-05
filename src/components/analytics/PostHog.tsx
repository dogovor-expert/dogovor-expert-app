'use client';
/**
 * PostHog (US-регион): продуктовая аналитика сайта.
 *
 * Архитектура (по образцу YandexMetrika + YandexMetrikaPageView):
 *  - Гейтится по granular consent (категория analytics, useCookieConsent).
 *  - SDK грузится лениво (dynamic import) ТОЛЬКО после подтверждения consent:
 *    не попадает в initial bundle, не исполняется для тех, кто отклонил.
 *    При отзыве согласия вызываем opt_out_capturing().
 *  - Pageview ($pageview) отправляем сами на смене pathname/search — так же,
 *    как YandexMetrikaPageView, чтобы корректно работать с SSG/SPA-навигацией.
 */
import { Suspense, useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import type { PostHog as PostHogInstance } from 'posthog-js';
import { useCookieConsent } from '@/hooks/useCookieConsent';

const POSTHOG_TOKEN = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com';

const ENABLED = Boolean(POSTHOG_TOKEN) && POSTHOG_TOKEN !== 'phx_...';

export function PostHog() {
  return (
    <Suspense fallback={null}>
      <PostHogInner />
    </Suspense>
  );
}

function PostHogInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isReady, categories } = useCookieConsent();
  const startedRef = useRef(false);
  const lastCaptured = useRef<string | null>(null);
  const [instance, setInstance] = useState<{
    ph: PostHogInstance;
    capturing: boolean;
  } | null>(null);

  useEffect(() => {
    if (!ENABLED || !isReady) return;
    const token = POSTHOG_TOKEN;
    if (!token) return;
    const allowed = categories.analytics;
    let cancelled = false;
    void (async () => {
      const { default: posthog } = await import('posthog-js');
      if (cancelled) return;
      if (!startedRef.current) {
        startedRef.current = true;
        posthog.init(token, {
          api_host: POSTHOG_HOST,
          autocapture: false,
          capture_pageview: false,
          disable_session_recording: true,
          disable_surveys: true,
          advanced_disable_feature_flags: true,
          person_profiles: 'identified_only',
          secure_cookie: true,
          cross_subdomain_cookie: false,
          persistence: 'localStorage+cookie',
        });
      }
      if (allowed) {
        posthog.opt_in_capturing();
      } else {
        posthog.opt_out_capturing();
      }
      setInstance((prev) =>
        prev ? { ...prev, capturing: allowed } : { ph: posthog, capturing: allowed }
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [isReady, categories.analytics]);

  useEffect(() => {
    if (!instance?.capturing) return;
    const path = `${pathname}${searchParams.size ? `?${searchParams.toString()}` : ''}`;
    if (lastCaptured.current === path) return;
    lastCaptured.current = path;
    instance.ph.capture('$pageview', { path });
  }, [pathname, searchParams, instance]);

  return null;
}

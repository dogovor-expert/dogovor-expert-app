"use client";
import { useEffect, useRef, useState } from "react";

// Yandex SmartCaptcha API (см. https://yandex.cloud/ru/docs/smartcaptcha/concepts/widget-methods)
// Отличия от Cloudflare Turnstile:
//  - объект window.smartCaptcha (не turnstile);
//  - render(container, { sitekey, hl?, callback }) — БЕЗ theme/expired-callback;
//  - НЕТ remove(); есть reset(widgetId?) и subscribe(widgetId, event, cb);
//  - истечение токена ловится через subscribe(id, 'token-expired', ...).
declare global {
  interface Window {
    smartCaptcha?: {
      render: (
        container: HTMLElement | string,
        params: {
          sitekey: string;
          callback?: (token: string) => void;
          hl?: string;
          test?: boolean;
          invisible?: boolean;
          hideShield?: boolean;
          shieldPosition?: string;
        }
      ) => string | undefined;
      reset: (widgetId?: string) => void;
      execute?: (widgetId?: string) => void;
      getResponse?: (widgetId?: string) => string;
      subscribe?: (
        widgetId: string,
        event: "token-expired" | "network-error" | "javascript-error" | "success",
        callback: (arg?: unknown) => void
      ) => () => void;
    };
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_SMARTCAPTCHA_SITE_KEY;
const SCRIPT_SRC = "https://smartcaptcha.yandexcloud.net/captcha.js";
const LOAD_TIMEOUT_MS = 8000;

type Status = "loading" | "ready" | "error";

export default function SmartCaptcha({
  onToken,
}: {
  onToken: (token: string | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const unsubRef = useRef<(() => void) | null>(null);
  const renderedRef = useRef(false);
  // Колбэк держим в ref: виджет рендерится ОДИН раз, иначе каждое нажатие
  // клавиши у родителя перерендеривало бы капчу и сбрасывало токен.
  const onTokenRef = useRef(onToken);
  onTokenRef.current = onToken;
  const [status, setStatus] = useState<Status>("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!SITE_KEY) return;
    let cancelled = false;
    let settled = false;
    setStatus("loading");
    renderedRef.current = false;

    const fail = () => {
      if (!cancelled && !settled) {
        settled = true;
        setStatus("error");
      }
    };
    const succeed = () => {
      if (cancelled || settled) return;
      if (window.smartCaptcha) {
        settled = true;
        setStatus("ready");
      } else {
        fail();
      }
    };

    const onLoad = () => succeed();
    const onError = () => fail();

    const loadScript = () => {
      const existing = document.querySelector<HTMLScriptElement>("script[data-smartcaptcha]");
      if (existing) {
        // API уже загружен другим экземпляром — переиспользуем.
        if (window.smartCaptcha) {
          settled = true;
          setStatus("ready");
          return null;
        }
      }
      const s = document.createElement("script");
      s.src = SCRIPT_SRC;
      s.async = true;
      s.defer = true;
      s.dataset.smartcaptcha = "1";
      s.addEventListener("load", onLoad);
      s.addEventListener("error", onError);
      document.head.appendChild(s);
      return s;
    };

    // Если API уже на странице — сразу рендер.
    if (window.smartCaptcha && attempt === 0) {
      settled = true;
      setStatus("ready");
      return () => {
        cancelled = true;
      };
    }

    const script = loadScript();
    const timer = setTimeout(fail, LOAD_TIMEOUT_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (script) {
        script.removeEventListener("load", onLoad);
        script.removeEventListener("error", onError);
      }
    };
  }, [attempt]);

  useEffect(() => {
    if (status !== "ready" || !SITE_KEY || renderedRef.current || !containerRef.current) return;
    const widgetId = window.smartCaptcha?.render(containerRef.current, {
      sitekey: SITE_KEY,
      hl: "ru",
      callback: (token) => onTokenRef.current(token),
    });
    renderedRef.current = true;
    widgetIdRef.current = widgetId ?? null;
    const id = widgetId ?? null;
    // SmartCaptcha не отдаёт expired-callback в render — подписываемся отдельно.
    if (id && window.smartCaptcha?.subscribe) {
      const unsub = window.smartCaptcha.subscribe(id, "token-expired", () => {
        onTokenRef.current(null);
        window.smartCaptcha?.reset(id);
      });
      unsubRef.current = typeof unsub === "function" ? unsub : null;
    }
    return () => {
      if (unsubRef.current) {
        try {
          unsubRef.current();
        } catch {
          /* noop */
        }
        unsubRef.current = null;
      }
      widgetIdRef.current = null;
      renderedRef.current = false;
    };
  }, [status]);

  if (!SITE_KEY) return null;

  if (status === "error") {
    return (
      <div className="mt-4 w-full rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5" role="alert">
        <p className="text-xs text-amber-800 leading-snug">
          Капча не загрузилась — возможно, её блокирует встроенный блокировщик
          рекламы или VPN браузера. Отключите блокировщик для этого сайта
          и повторите попытку, или зарегистрируйтесь через Google/Яндекс — там капча не нужна.
        </p>
        <button
          type="button"
          onClick={() => setAttempt((a) => a + 1)}
          className="mt-2 text-xs font-semibold text-brand-600 hover:text-brand-700 underline underline-offset-2"
        >
          Повторить загрузку капчи
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4 w-full flex justify-center min-h-[65px]">
      <div ref={containerRef} />
    </div>
  );
}

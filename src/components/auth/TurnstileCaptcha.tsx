"use client";
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
        }
      ) => string | undefined;
      reset: (widgetId?: string) => void;
      remove?: (widgetId?: string) => void;
    };
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/api.js?render=explicit";
const LOAD_TIMEOUT_MS = 8000;

type Status = "loading" | "ready" | "error";

export default function TurnstileCaptcha({
  onToken,
}: {
  onToken: (token: string | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const renderedRef = useRef(false);
  // Колбэк держим в ref: виджет должен рендериться ОДИН раз. Раньше effect
  // зависел от onToken, и из-за inline-стрелки у родителя каждое нажатие
  // клавиши перерендеривало виджет — пользователь не успевал отметить галочку,
  // а токен сбрасывался (регистрация стала невозможной).
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
      if (window.turnstile) {
        settled = true;
        setStatus("ready");
      } else {
        fail();
      }
    };

    const onLoad = () => succeed();
    const onError = () => fail();

    const loadScript = () => {
      const existing = document.querySelector<HTMLScriptElement>("script[data-turnstile]");
      if (existing) existing.remove();
      const s = document.createElement("script");
      s.src = SCRIPT_SRC;
      s.async = true;
      s.defer = true;
      s.dataset.turnstile = "1";
      s.addEventListener("load", onLoad);
      s.addEventListener("error", onError);
      document.head.appendChild(s);
      return s;
    };

    // Если API уже на странице (второй экземпляр компонента) — сразу рендер.
    if (window.turnstile && attempt === 0) {
      settled = true;
      setStatus("ready");
      return () => { cancelled = true; };
    }

    const script = loadScript();
    const timer = setTimeout(fail, LOAD_TIMEOUT_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      script.removeEventListener("load", onLoad);
      script.removeEventListener("error", onError);
    };
  }, [attempt]);

  useEffect(() => {
    if (status !== "ready" || !SITE_KEY || renderedRef.current || !containerRef.current) return;
    const widgetId = window.turnstile?.render(containerRef.current, {
      sitekey: SITE_KEY,
      theme: "auto",
      callback: (token) => onTokenRef.current(token),
      "expired-callback": () => {
        onTokenRef.current(null);
        if (widgetIdRef.current) window.turnstile?.reset(widgetIdRef.current);
      },
      "error-callback": () => onTokenRef.current(null),
    });
    renderedRef.current = true;
    widgetIdRef.current = widgetId ?? null;
    const id = widgetId ?? null;
    return () => {
      if (id) window.turnstile?.remove?.(id);
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

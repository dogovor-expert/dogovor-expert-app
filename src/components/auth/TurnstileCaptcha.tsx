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
      ) => string;
      reset: (widgetId?: string) => void;
    };
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export default function TurnstileCaptcha({
  onToken,
}: {
  onToken: (token: string | null) => void;
}) {  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!SITE_KEY || !containerRef.current) return;
    if (document.querySelector('script[src*="turnstile"]')) {
      setLoaded(true);
      return;
    }
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/api.js?render=explicit";
    s.async = true;
    s.defer = true;
    s.onload = () => setLoaded(true);
    document.head.appendChild(s);
  }, []);

  useEffect(() => {
    if (!loaded || !SITE_KEY || !containerRef.current) return;
    const widgetId = window.turnstile?.render(containerRef.current, {
      sitekey: SITE_KEY,
      callback: (token) => onToken(token),
      "expired-callback": () => onToken(null),
      "error-callback": () => onToken(null),
    });
    widgetIdRef.current = widgetId ?? null;
  }, [loaded, onToken]);

  if (!SITE_KEY) return null;

  return (
    <div className="mt-4 w-full flex justify-center">
      <div ref={containerRef} />
    </div>
  );
}
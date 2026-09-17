"use client";

/**
 * Запись визитов (session replay) на базе rrweb — self-hosted.
 *
 * Принципы (см. docs: миграция 20260914_session_replays.sql):
 *  1) Пишем ТОЛЬКО по согласию — категория «Аналитика» в cookie-баннере
 *     (гейт здесь, на клиенте; в отличие от user_events, который ведётся на
 *     законном интересе, запись воспроизводит само поведение).
 *  2) Маскируем ввод: maskAllInputs — все поля форм; элементы с атрибутом
 *     data-sensitive или классом rr-block вырезаются целиком.
 *  3) Чувствительные разделы не пишем вовсе (EXCLUDED_PREFIXES): кабинет
 *     безопасности, биллинг, авторизация, подписание, админка.
 *  4) Данные не покидают наш сервер: чанки уходят в /api/replay → Supabase.
 *
 * Библиотека подгружается динамически, чтобы не утяжелять основной бандл.
 */

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useCookieConsent } from "@/hooks/useCookieConsent";
import { getEventSessionId } from "@/lib/analytics";

const EXCLUDED_PREFIXES = ["/admin", "/security", "/billing", "/login", "/reset", "/auth", "/sign"];
const FLUSH_MS = 10_000;
const MAX_BUFFER_EVENTS = 1000;

function sampleRate(): number {
  const raw = Number(process.env.NEXT_PUBLIC_REPLAY_SAMPLE_RATE);
  return Number.isFinite(raw) && raw >= 0 && raw <= 1 ? raw : 1;
}

function isExcluded(pathname: string): boolean {
  return EXCLUDED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/** gzip + base64 (без Buffer — это браузер). Возвращает "" при неудаче. */
async function packEvents(events: unknown[]): Promise<string> {
  try {
    if (typeof CompressionStream === "undefined") return "";
    const json = JSON.stringify(events);
    const stream = new Blob([json]).stream().pipeThrough(new CompressionStream("gzip"));
    const bytes = new Uint8Array(await new Response(stream).arrayBuffer());
    let bin = "";
    const CHUNK = 0x8000;
    for (let i = 0; i < bytes.length; i += CHUNK) {
      bin += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
    }
    return btoa(bin);
  } catch {
    return "";
  }
}

export function SessionRecorder() {
  const pathname = usePathname();
  const { isReady, categories } = useCookieConsent();
  const enabled = isReady && categories.analytics;

  const stopRef = useRef<(() => void) | null>(null);
  const bufferRef = useRef<unknown[]>([]);
  const seqRef = useRef(0);
  const flushTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!enabled) return;
    if (Math.random() >= sampleRate()) return;
    if (isExcluded(pathname)) {
      // Уходим в «чёрный» раздел — глушим запись и досылаем остаток.
      stopRef.current?.();
      stopRef.current = null;
      return;
    }

    const sessionId = getEventSessionId();
    let cancelled = false;

    const flush = (final = false) => {
      const events = bufferRef.current;
      if (events.length === 0) return;
      bufferRef.current = [];
      const seq = seqRef.current++;
      void packEvents(events).then((data) => {
        if (!data) return;
        const body = JSON.stringify({ sessionId, seq, data, path: pathname });
        try {
          if (final && body.length < 60_000 && typeof navigator !== "undefined" && navigator.sendBeacon) {
            navigator.sendBeacon("/api/replay", new Blob([body], { type: "application/json" }));
            return;
          }
          void fetch("/api/replay", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body,
          }).catch(() => {
            /* аналитика не должна ничего ломать */
          });
        } catch {
          /* ignore */
        }
      });
    };

    void import("rrweb").then(({ record }) => {
      if (cancelled) return;
      stopRef.current =
        record({
          emit(event) {
            bufferRef.current.push(event);
            if (bufferRef.current.length >= MAX_BUFFER_EVENTS) flush();
          },
          maskAllInputs: true,
          maskTextSelector: "[data-sensitive]",
          blockSelector: ".rr-block",
          recordCanvas: false,
          collectFonts: false,
          recordCrossOriginIframes: false,
        }) ?? null;
      flushTimerRef.current = setInterval(() => flush(), FLUSH_MS);
    });

    const onHide = () => flush(true);
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush(true);
    };
    window.addEventListener("pagehide", onHide);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      window.removeEventListener("pagehide", onHide);
      document.removeEventListener("visibilitychange", onVisibility);
      if (flushTimerRef.current) clearInterval(flushTimerRef.current);
      flushTimerRef.current = null;
      flush(true);
      stopRef.current?.();
      stopRef.current = null;
    };
    // pathname — намеренно: при переходе в/из исключённого раздела
    // запись останавливается/возобновляется (rrweb пишет документ целиком,
    // SPA-переходы внутри одной сессии он фиксирует сам).
  }, [enabled, pathname]);

  return null;
}
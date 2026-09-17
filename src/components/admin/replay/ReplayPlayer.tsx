"use client";

import { useEffect, useRef } from "react";
import "rrweb-player/dist/style.css";

/**
 * Плеер записи визита (rrweb). Библиотека подгружается динамически и только
 * на этой странице — в основной бандл сайта не попадает.
 */
export default function ReplayPlayer({ events }: { events: unknown[] }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || events.length === 0) return;

    let disposed = false;
    let player: { $destroy?: () => void } | null = null;

    void import("rrweb-player").then(({ default: Player }) => {
      if (disposed || !hostRef.current) return;
      host.innerHTML = "";
      const instance = new Player({
        target: host,
        props: {
          events: events as never,
          width: 1100,
          height: 640,
          autoPlay: false,
          showController: true,
          speed: 1,
          skipInactive: true,
          mouseTail: true,
        },
      });
      player = instance as unknown as { $destroy?: () => void };
    });

    return () => {
      disposed = true;
      try {
        player?.$destroy?.();
      } catch {
        /* плеер мог не успеть создаться */
      }
      if (hostRef.current) hostRef.current.innerHTML = "";
    };
  }, [events]);

  if (events.length === 0) {
    return <p className="text-sm text-gray-500">В записи нет событий (сессия слишком короткая или данные не успели сохраниться).</p>;
  }

  return (
    <div
      ref={hostRef}
      className="w-full overflow-auto rounded-lg border border-gray-200 bg-white"
    />
  );
}

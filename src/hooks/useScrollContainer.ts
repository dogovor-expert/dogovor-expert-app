"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Находит реальный скролл-контейнер страницы: сайт работает в приложении-оболочке
 * (AppLayout), где скроллится <main class="overflow-y-auto">, а не window.
 * Возвращает ref узла и сам скроллер.
 */
export function useScrollContainer<T extends HTMLElement>() {
  const nodeRef = useRef<T | null>(null);
  const [scroller, setScroller] = useState<Element | null>(null);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    const find = (): Element => {
      let el: HTMLElement | null = node;
      while (el) {
        const cs = getComputedStyle(el);
        if (el.scrollHeight > el.clientHeight + 1 && cs.overflowY !== "visible") return el;
        el = el.parentElement;
      }
      return document.scrollingElement ?? document.documentElement;
    };

    const raf = requestAnimationFrame(() => setScroller(find()));
    return () => cancelAnimationFrame(raf);
  }, []);

  return { nodeRef, scroller };
}

export function scrollerSize(scroller: Element | null): { el: HTMLElement; max: number } {
  const el = (scroller === document.documentElement || scroller === null
    ? document.documentElement
    : scroller) as HTMLElement;
  const max = el.scrollHeight - el.clientHeight;
  return { el, max: max > 0 ? max : 0 };
}
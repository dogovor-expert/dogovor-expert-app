"use client";

import { useEffect, useState } from "react";
import { scrollerSize, useScrollContainer } from "@/hooks/useScrollContainer";

/** Полоса прогресса чтения статьи: fixed top 3px, градиент brand→purple. */
export function ArticleProgress() {
  const [width, setWidth] = useState(0);
  const { nodeRef, scroller } = useScrollContainer<HTMLDivElement>();

  useEffect(() => {
    if (!scroller) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const { el, max } = scrollerSize(scroller);
        if (max > 0) {
          setWidth(Math.min(100, (el.scrollTop / max) * 100));
        } else {
          setWidth(0);
        }
      });
    };
    const ro = new ResizeObserver(onScroll);
    ro.observe(scroller);
    scroller.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      scroller.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [scroller]);

  return (
    <div
      ref={nodeRef}
      className="fixed inset-x-0 top-0 z-[80] h-[3px] bg-transparent"
      aria-hidden="true"
    >
      <div
        className="h-full bg-gradient-to-r from-brand-500 to-purple-600 transition-[width] duration-100 ease-out"
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
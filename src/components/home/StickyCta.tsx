"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";

/** Липкий CTA: появляется после прокрутки первого экрана, можно закрыть. */
export default function StickyCta() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setVisible(y > 700 && y < max - 400);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (dismissed || !visible) return null;

  return (
    <div className="sticky-cta fixed inset-x-3 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-40 lg:inset-x-auto lg:left-1/2 lg:bottom-6 lg:-translate-x-1/2">
      <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white/95 px-4 py-3 shadow-elevated backdrop-blur-md">
        <span className="hidden text-sm font-semibold text-gray-900 sm:block">
          Готовы создать документ?
        </span>
        <span className="text-sm font-semibold text-gray-900 sm:hidden">Создать документ</span>
        <Link
          href="/builder"
          className="inline-flex flex-none items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
        >
          Бесплатно
          <ArrowRight className="h-4 w-4" />
        </Link>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Скрыть"
          className="grid h-7 w-7 flex-none place-items-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

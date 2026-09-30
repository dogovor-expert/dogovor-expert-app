"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import Logo from "@/components/layout/Logo";

import "@fontsource-variable/inter";
import "@fontsource/ibm-plex-mono/400.css";
import "@/tools/notary/index.css";

/**
 * Обёртка Контроля оферт.
 *
 * ⚠️ Динамический импорт с `ssr: false` — обязателен, а не оптимизация.
 * Модуль инструмента работает с `crypto.subtle`/`DOMParser`/`clipboard`/
 * `window.print` и падает при серверном рендере, поэтому загружается
 * только в браузере (тот же приём, что в redactor-client.tsx).
 */
const NotaryApp = dynamic(() => import("@/tools/notary/App"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f1e8]">
      <div className="flex flex-col items-center gap-3 text-[#4a5468]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ece5d3] border-t-[#1f3d6b]" />
        <p className="text-sm">Загружаем инструмент…</p>
      </div>
    </div>
  ),
});

/**
 * Разметка-изолятор.
 *
 * Весь дизайн инструмента подвешен под `.notary-root`
 * (см. src/tools/notary/index.css). Без этого общие имена вроде
 * .chip, .mono и .marquee перекрасили бы основной сайт.
 *
 * Здесь же — единственная наша часть: логотип dogovor.expert и возврат
 * на сайт. Сам интерфейс инструмента остаётся его собственным.
 */
export default function NotaryClient() {
  return (
    <div className="notary-root">
      {/* Возврат на сайт. Основной каркас для /notary намеренно не
          рисуется (см. ConditionalShell) — инструмент занимает всё окно и
          использует собственный фиксированный сайдбар. Эта узкая полоса —
          единственная точка выхода обратно в dogovor.expert. */}
      <div className="sticky top-0 z-[60] flex items-center gap-3 border-b border-[rgba(27,36,56,0.12)] bg-[rgba(245,241,232,0.92)] px-4 py-2 backdrop-blur">
        {/* Logo рендерит собственную ссылку <a> — оборачивать его в <Link>
            нельзя (вложенные <a> ломают гидратацию). Компакт без дескриптора,
            чтобы полоса была в одну строку и на 360px. */}
        <Logo tagline={false} />
        <span className="hidden text-xs font-medium uppercase tracking-wider text-[#7a8399] sm:inline">
          Дополнительные инструменты
        </span>
        <Link
          href="/"
          className="ml-auto rounded-lg px-3 py-1.5 text-sm font-semibold text-[#1f3d6b] hover:bg-[rgba(31,61,107,0.08)]"
        >
          На сайт
        </Link>
      </div>

      <NotaryApp />
    </div>
  );
}

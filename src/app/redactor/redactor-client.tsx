"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import Logo from "@/components/layout/Logo";

import "@fontsource-variable/inter";
import "@fontsource/ibm-plex-mono/400.css";
import "@/tools/redactor/index.css";

/**
 * Обёртка Smart Redactor.
 *
 * ⚠️ Динамический импорт с `ssr: false` — обязателен, а не оптимизация.
 * Модуль инструмента на верхнем уровне вызывает `new URL(..., import.meta.url)`
 * для воркера pdf.js и работает с `canvas`/`Blob`/`crypto`. При серверном
 * рендере это падает, поэтому инструмент загружается только в браузере.
 */
const RedactorApp = dynamic(() => import("@/tools/redactor/App"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f8f4]">
      <div className="flex flex-col items-center gap-3 text-[#4a5a44]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#c9d3c0] border-t-[#385d45]" />
        <p className="text-sm">Загружаем инструмент…</p>
      </div>
    </div>
  ),
});

/**
 * Разметка-изолятор.
 *
 * Все 531 правило дизайна инструмента подвешены под `.redactor-root`
 * (см. src/tools/redactor/index.css). Без этого общие имена вроде
 * .sidebar, .button и .topbar перекрасили бы основной сайт.
 *
 * Здесь же — единственная наша часть: логотип dogovor.expert и возврат
 * на сайт. Сам интерфейс инструмента остаётся его собственным.
 */
export default function RedactorClient() {
  return (
    <div className="redactor-root">
      {/* Возврат на сайт. Основной каркас для /redactor намеренно не
          рисуется (см. ConditionalShell) — инструмент занимает всё окно и
          использует собственный фиксированный сайдбар. Эта узкая полоса —
          единственная точка выхода обратно в dogovor.expert. */}
      <div className="redactor-return">
        <Link href="/" aria-label="На главную dogovor.expert" className="redactor-return-logo">
          <Logo />
        </Link>
        <span className="redactor-return-label">Дополнительные инструменты</span>
        <Link href="/" className="redactor-return-link">
          На сайт
        </Link>
      </div>

      <RedactorApp />
    </div>
  );
}

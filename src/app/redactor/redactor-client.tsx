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
      {/* Служебная полоса dogovor.expert. Сознательно узкая: дизайн
          инструмента не должен выглядеть частью конструктора договоров,
          но пользователь должен понимать, где он находится. */}
      <div
        className="flex items-center justify-between border-b border-[#dfe3d8] bg-white px-4 py-2"
        style={{ borderColor: "#dfe3d8" }}
      >
        <div className="flex items-center gap-3">
          <Link
            href="/"
            aria-label="На главную dogovor.expert"
            className="inline-flex items-center gap-2"
          >
            <span className="scale-[0.72] origin-left">
              <Logo />
            </span>
          </Link>
          <span className="text-xs text-[#7b856f]">Дополнительные инструменты</span>
        </div>
        <Link
          href="/"
          className="rounded-lg px-3 py-1.5 text-xs font-medium text-[#385d45] transition-colors hover:bg-[#eef2e8]"
        >
          На сайт
        </Link>
      </div>

      {/* Инструмент рассчитан на всю высоту окна, поэтому полосу
          обслуживания уводим из потока. */}
      <div style={{ marginTop: "-1px" }}>
        <RedactorApp />
      </div>
    </div>
  );
}

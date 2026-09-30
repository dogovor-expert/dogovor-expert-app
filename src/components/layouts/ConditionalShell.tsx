"use client";

import { usePathname } from "next/navigation";
import AppLayout from "@/components/layouts/AppLayout";

/**
 * Полноэкранные страницы.
 *
 * Smart Redactor — самостоятельное приложение со своим дизайном: у него
 * собственный фиксированный сайдбар (`position: fixed`) и `min-height: 100vh`.
 * Если одеть его в основной каркас, получатся две боковые панели рядом, а
 * фиксированная панель инструмента уедет под нашу — это и было видно на
 * первом скриншоте.
 *
 * Поэтому для этих маршрутов children рендерятся напрямую, без AppLayout.
 * Вернуться на сайт можно с тонкой полосы-обёртки внутри самой страницы.
 *
 * Список расширяем: сюда же попадёт веб-нотариус и следующие инструменты
 * раздела «Дополнительные».
 */
const FULLSCREEN_PREFIXES = ["/redactor", "/notary"];

export default function ConditionalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFullscreen = FULLSCREEN_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  if (isFullscreen) return <>{children}</>;
  return <AppLayout>{children}</AppLayout>;
}

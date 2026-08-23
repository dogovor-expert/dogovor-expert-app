"use client";

import Script from "next/script";

/**
 * Ленивый живой чат-виджет.
 * Подключается асинхронно (lazyOnload) — вне основного бандла страниц,
 * не влияет на скорость загрузки /builder и остальных страниц.
 *
 * Настраивается через env:
 *  - NEXT_PUBLIC_CHAT_WIDGET_SRC — URL скрипта виджета
 *    (Jivo: https://code.jivosite.com/widget/<ID>;
 *     Chait/Notiflow/др. — свой snippet-URL из кабинета провайдера).
 *  - NEXT_PUBLIC_CHAT_OPEN_FN — имя глобального API виджета для программного
 *    открытия (по умолчанию "jivo_api"; для других — см. документацию провайдера).
 *
 * Оффлайн-режим (честный SLA «Ответим в течение 24 часов») настраивается
 * в кабинете провайдера, чтобы виджет не выглядел «сломанным», когда
 * оператор не на месте.
 */
const WIDGET_SRC = process.env.NEXT_PUBLIC_CHAT_WIDGET_SRC;
const OPEN_FN = process.env.NEXT_PUBLIC_CHAT_OPEN_FN || "jivo_api";

/** Программно открыть чат (из кнопки «Чат с поддержкой»). */
export function openChat() {
  if (typeof window === "undefined") return;
  const api = (window as unknown as Record<string, unknown>)[OPEN_FN];
  try {
    if (api && typeof (api as { open?: () => void }).open === "function") {
      (api as { open: () => void }).open();
      return;
    }
    if (typeof api === "function") {
      (api as (cmd: string) => void)("open");
      return;
    }
  } catch {
    /* ignore */
  }
  const bubble = document.querySelector<HTMLElement>(
    "[data-chat-widget-bubble], .jivo-small, #chat-widget-bubble, .chait-bubble"
  );
  if (bubble) {
    bubble.click();
    return;
  }
  // Виджет не настроен — честный fallback на форму обратной связи.
  window.location.href = "/contacts#feedback";
}

export default function ChatWidget() {
  if (!WIDGET_SRC) return null;
  return (
    <Script
      id="support-chat-widget"
      src={WIDGET_SRC}
      strategy="lazyOnload"
    />
  );
}

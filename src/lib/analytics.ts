/**
 * Центральный хелпер событий Яндекс.Метрики (reachGoal).
 *
 * Consent-гейт автоматический: счётчик Метрики монтируется только при
 * categories.analytics === true (см. YandexMetrika.tsx), поэтому при
 * отказе от аналитики window.ym не определён — трекинг безопасно no-op.
 *
 * Имена целей — латиница/цифры/подчёркивания (требование Метрики:
 * запрещены / \ & # ? = ", + экранируется). Каждая цель должна быть
 * создана в UI Метрики — см. docs/analytics-goals.md.
 */

import { YANDEX_METRIKA_ID } from "@/lib/site";

type GoalParams = Record<string, string | number | boolean | undefined>;

type YmFn = (counterId: number, action: string, target?: string, params?: GoalParams) => void;

function ym(): YmFn | null {
  if (typeof window === "undefined") return null;
  const fn = (window as unknown as { ym?: YmFn }).ym;
  return typeof fn === "function" ? fn : null;
}

/** Отправка цели «Целевое событие» в Метрику. Fail-safe: никогда не бросает. */
export function track(goal: string, params?: GoalParams): void {
  try {
    const fn = ym();
    if (!fn) return;
    const counterId = Number(YANDEX_METRIKA_ID);
    if (params) {
      fn(counterId, "reachGoal", goal, params);
    } else {
      fn(counterId, "reachGoal", goal);
    }
  } catch {
    // Аналитика не должна ломать пользовательский сценарий.
  }
}

export const goals = {
  builderStart: "builder_start",
  exportPdf: "export_pdf",
  exportDocx: "export_docx",
  exportEmail: "export_email",
  paywallShown: "paywall_shown",
  paymentCreated: "payment_created",
  paymentSuccess: "payment_success",
  billingAutorenewToggle: "billing_autorenew_toggle",
  autotekaOrderStart: "autoteka_order_start",
} as const;

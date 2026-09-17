/**
 * Центральный хелпер трекинга событий сайта — единая точка вызова track(),
 * два независимых получателя:
 *  1) Яндекс.Метрика (reachGoal) — как и раньше, гейтится cookie-consent
 *     (см. YandexMetrika.tsx: счётчик не монтируется без согласия).
 *  2) /api/events → таблица user_events (см. src/lib/userEvents.ts) —
 *     собственный журнал для /admin/analytics. Это первая сторона (наш
 *     бэкенд, данные в РФ), поэтому журнал ведётся под законным интересом
 *     (п. 7 ч. 1 ст. 6 152-ФЗ) и НЕ зависит от согласия на сторонние
 *     счётчики; это раскрыто в Политике конфиденциальности, раздел «Cookies
 *     и аналитика». При этом в meta никогда не пишется содержимое полей форм
 *     — см. EVENT_CATALOG в userEvents.ts (перечень разрешённого к передаче).
 *
 * Имена целей — латиница/цифры/подчёркивания (требование Метрики:
 * запрещены / \ & # ? = ", + экранируется). Каждая цель должна быть
 * создана в UI Метрики — см. docs/analytics-goals.md — и совпадать с
 * ключом EVENT_CATALOG в userEvents.ts, чтобы одно и то же имя события
 * попадало в оба места без дублирования вызовов track() по коду.
 */

import { YANDEX_METRIKA_ID } from "@/lib/site";

type GoalParams = Record<string, string | number | boolean | undefined>;

type YmFn = (counterId: number, action: string, target?: string, params?: GoalParams) => void;

function ym(): YmFn | null {
  if (typeof window === "undefined") return null;
  const fn = (window as unknown as { ym?: YmFn }).ym;
  return typeof fn === "function" ? fn : null;
}

const SESSION_KEY = "dogovor_eid";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 дней

/**
 * Анонимный id визита — случайная строка, НЕ производная от каких-либо
 * личных данных, живёт в localStorage и сама «протухает» через 30 дней
 * неактивности (не бессрочный идентификатор пользователя).
 */
export function getEventSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { id: string; exp: number };
      if (parsed.exp > Date.now()) {
        // Продлеваем TTL при активности — «скользящее окно».
        window.localStorage.setItem(
          SESSION_KEY,
          JSON.stringify({ id: parsed.id, exp: Date.now() + SESSION_TTL_MS })
        );
        return parsed.id;
      }
    }
  } catch {
    /* localStorage недоступен — используем разовый id на этот вызов */
  }
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify({ id, exp: Date.now() + SESSION_TTL_MS }));
  } catch {
    /* ignore */
  }
  return id;
}

/** Отправка события в /api/events. Fail-safe, не блокирует UI. */
function sendToOwnBackend(event: string, params?: GoalParams): void {
  if (typeof window === "undefined") return;
  try {
    void fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true, // запрос переживёт переход на другую страницу
      body: JSON.stringify({
        event,
        sessionId: getEventSessionId(),
        path: window.location.pathname,
        meta: params ?? undefined,
      }),
    }).catch(() => {
      /* сеть недоступна — аналитика не должна ничего ломать */
    });
  } catch {
    /* ignore */
  }
}

/**
 * Событие только в свой журнал (без reachGoal в Метрику). Используется для
 * page_view: просмотры страниц Метрика и так считает через ym(...,'hit',...)
 * в YandexMetrikaPageView — дублировать их как «цель» не нужно.
 */
export function trackOwnOnly(event: string, params?: GoalParams): void {
  sendToOwnBackend(event, params);
}

/** Отправка цели «Целевое событие» в Метрику + событие в свой журнал. Fail-safe: никогда не бросает. */
export function track(goal: string, params?: GoalParams): void {
  try {
    const fn = ym();
    if (fn) {
      const counterId = Number(YANDEX_METRIKA_ID);
      if (params) {
        fn(counterId, "reachGoal", goal, params);
      } else {
        fn(counterId, "reachGoal", goal);
      }
    }
  } catch {
    // Аналитика не должна ломать пользовательский сценарий.
  }
  sendToOwnBackend(goal, params);
}

/**
 * Цель ТОЛЬКО в Метрику — без записи в собственный журнал. Для событий,
 * которые надёжнее фиксирует сервер (создание/успех оплаты: см.
 * /api/billing/create-payment и /api/billing/webhook): так журнал не
 * задваивается, а цель в Метрике остаётся на месте.
 */
export function trackMetrikaOnly(goal: string, params?: GoalParams): void {
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
  pageView: "page_view",
  builderStart: "builder_start",
  builderTemplateSwitch: "builder_template_switch",
  scannerUsed: "scanner_used",
  auditRun: "audit_run",
  previewOpened: "preview_opened",
  exportPdf: "export_pdf",
  exportDocx: "export_docx",
  exportEmail: "export_email",
  approvalCreated: "approval_created",
  signingStarted: "signing_started",
  signingCompleted: "signing_completed",
  paywallShown: "paywall_shown",
  paymentCreated: "payment_created",
  paymentSuccess: "payment_success",
  billingAutorenewToggle: "billing_autorenew_toggle",
  autotekaOrderStart: "autoteka_order_start",
  feedbackSubmitted: "feedback_submitted",
  leadSubmitted: "lead_submitted",
} as const;

import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Внутренний журнал действий пользователей (см. supabase/migrations/20260913_user_events.sql).
 *
 * ЕДИНСТВЕННЫЙ вход для записи — logUserEvent(). Не вставляйте в user_events
 * напрямую из других мест: тогда теряется гарантия схемы meta ниже.
 *
 * ГЛАВНОЕ ПРАВИЛО ЭТОГО ФАЙЛА: meta — это ТОЛЬКО идентификаторы, булевы
 * флаги, числа и значения из заранее известного набора (enum). Никогда —
 * содержимое полей формы (ФИО, паспорт, ИНН, адрес, телефон, email, суммы
 * с реквизитами). Если разработчику нужно передать что-то за пределами
 * EVENT_CATALOG[event].meta — это сигнал остановиться и подумать, а не
 * расширять тип на `Record<string, unknown>`.
 */

export type EventName = keyof typeof EVENT_CATALOG;

/** Разрешённый тип значения в meta — то, что заведомо не может быть ПДн. */
type MetaPrimitive = string | number | boolean;

interface EventSpec {
  /** Человекочитаемое название — для дашборда и docs. */
  label: string;
  /** Группа для воронки/фильтров в /admin/analytics. */
  group: "traffic" | "builder" | "ocr" | "export" | "billing" | "signing" | "support" | "ai";
  /**
   * Разрешённые ключи meta и опциональный enum допустимых значений
   * (для строк). Если поле не строковый enum — просто перечисляем ключ
   * без списка значений (тогда проверяется только тип и длина).
   */
  meta?: Record<string, readonly string[] | null>;
}

/**
 * Единый каталог событий сайта. Событие, которого нет в этом объекте,
 * /api/events молча отклоняет (400) — это осознанное ограничение:
 * список того, что мы измеряем, должен быть виден целиком в одном месте,
 * а не размазан по компонентам как произвольные строки.
 */
export const EVENT_CATALOG = {
  page_view: {
    label: "Просмотр страницы",
    group: "traffic",
  },
  builder_start: {
    label: "Открытие конструктора",
    group: "builder",
    meta: { template: null, source: ["url", "catalog", "related", "favorite"] as const },
  },
  builder_template_switch: {
    label: "Смена шаблона в конструкторе",
    group: "builder",
    meta: { from: null, to: null },
  },
  scanner_used: {
    label: "Использован сканер документов",
    group: "builder",
    meta: { doc_type: null, server_ocr: ["true", "false"] as const },
  },
  ocr_engine_used: {
    label: "OCR: движок",
    group: "ocr",
    meta: {
      engine: ["tesseract", "paddle", "ocular", "tesseract+paddle", "tesseract+ocular"] as const,
      confidence: null,
      doc_type: null,
    },
  },
  ocr_fallback: {
    label: "OCR: fallback",
    group: "ocr",
    meta: {
      from: ["tesseract", "ocular"] as const,
      to: ["paddle", "tesseract"] as const,
      reason: ["low_confidence", "short_text", "server_error", "timeout"] as const,
    },
  },
  audit_run: {
    label: "Запущена проверка документа",
    group: "builder",
    meta: { template: null, errors: null },
  },
  preview_opened: {
    label: "Открыт предпросмотр",
    group: "builder",
    meta: { template: null },
  },
  export_pdf: {
    label: "Экспорт PDF",
    group: "export",
    meta: { template: null, pack: ["true", "false"] as const },
  },
  export_docx: {
    label: "Экспорт DOCX",
    group: "export",
    meta: { template: null, pack: ["true", "false"] as const },
  },
  export_email: {
    label: "Отправка на email",
    group: "export",
    meta: { template: null },
  },
  approval_created: {
    label: "Создана ссылка согласования",
    group: "export",
    meta: { template: null },
  },
  approval_opened: {
    label: "Открыта ссылка согласования",
    group: "export",
    meta: { template: null },
  },
  approval_unlocked: {
    label: "Ссылка согласования разблокирована",
    group: "export",
    meta: { template: null },
  },
  approval_signup: {
    label: "Регистрация после ссылки согласования",
    group: "export",
    meta: { template: null },
  },
  signing_started: {
    label: "Начато подписание УКЭП",
    group: "signing",
    meta: { template: null },
  },
  signing_completed: {
    label: "Документ подписан УКЭП",
    group: "signing",
    meta: { template: null },
  },
  paywall_shown: {
    label: "Показан пейволл",
    group: "billing",
    meta: { reason: null },
  },
  payment_created: {
    label: "Создан платёж",
    group: "billing",
    meta: { plan: null },
  },
  payment_success: {
    label: "Успешная оплата",
    group: "billing",
    meta: { plan: null },
  },
  billing_autorenew_toggle: {
    label: "Переключено автопродление",
    group: "billing",
    meta: { enabled: ["true", "false"] as const },
  },
  autoteka_order_start: {
    label: "Заказ отчёта проверки авто",
    group: "billing",
    meta: { tariff: ["std", "prem"] as const },
  },
  feedback_submitted: {
    label: "Отправлена обратная связь",
    group: "support",
    meta: { type: null },
  },
  lead_submitted: {
    label: "Отправлена заявка (лид)",
    group: "support",
    meta: { service: null },
  },
  ai_message: {
    label: "Вопрос AI-юристу",
    group: "ai",
    meta: { thread_id: null, free: null, confidence: null },
  },
  ai_topup_created: {
    label: "Создано пополнение AI-баланса",
    group: "billing",
    meta: { amount_rub: null },
  },
  ai_topup_success: {
    label: "Пополнен AI-баланс",
    group: "billing",
    meta: { amount_rub: null },
  },
} as const satisfies Record<string, EventSpec>;

export type EventMeta = Record<string, MetaPrimitive>;

const MAX_META_KEYS = 10;
const MAX_STRING_LEN = 200;

/**
 * Строгая санитизация meta по каталогу события: неизвестные ключи —
 * отбрасываются, значения вне enum — отбрасываются, длинные строки —
 * обрезаются. Никогда не бросает — на невалидном входе просто уменьшает
 * meta, чтобы битый event на клиенте не терял всю запись целиком.
 */
function sanitizeMeta(event: EventName, meta: unknown): EventMeta | null {
  const spec = EVENT_CATALOG[event] as EventSpec;
  if (!spec.meta || !meta || typeof meta !== "object") return null;
  const allowed = spec.meta;
  const out: EventMeta = {};
  let count = 0;
  for (const [key, rawValue] of Object.entries(meta as Record<string, unknown>)) {
    if (count >= MAX_META_KEYS) break;
    if (!(key in allowed)) continue; // неизвестный ключ — молча отбрасываем
    const enumValues = allowed[key];
    if (typeof rawValue === "boolean" || typeof rawValue === "number") {
      out[key] = rawValue;
      count++;
      continue;
    }
    if (typeof rawValue === "string") {
      const v = rawValue.slice(0, MAX_STRING_LEN);
      if (enumValues && !enumValues.includes(v)) continue;
      out[key] = v;
      count++;
    }
  }
  return count > 0 ? out : null;
}

export function isKnownEvent(event: string): event is EventName {
  return Object.prototype.hasOwnProperty.call(EVENT_CATALOG, event);
}

/**
 * Префикс session_id для событий, которые пишет СЕРВЕР (вебхук оплаты,
 * создание платежа). У них нет клиентского визита, поэтому это «служебная»
 * псевдосессия; при подсчёте уникальных визитов такие session_id
 * исключаются (см. getKpiTotals в userEventsQueries.ts).
 */
export const SERVER_SESSION_PREFIX = "srv-";

export type DeviceType = "mobile" | "tablet" | "desktop";

export function deviceFromUserAgent(ua: string | null): DeviceType {
  if (!ua) return "desktop";
  if (/ipad|tablet/i.test(ua)) return "tablet";
  if (/mobi|android|iphone/i.test(ua)) return "mobile";
  return "desktop";
}

/**
 * Записывает одно событие. Fail-safe: сбой записи никогда не должен
 * ломать пользовательский сценарий (тот же паттерн, что и logAdminAction
 * в src/lib/audit.ts).
 */
export async function logUserEvent(params: {
  event: EventName;
  userId?: string | null;
  sessionId: string;
  path?: string | null;
  referrerHost?: string | null;
  device?: DeviceType;
  meta?: unknown;
}): Promise<void> {
  try {
    const supabase = createAdminClient();
    await supabase.from("user_events").insert({
      event: params.event,
      user_id: params.userId ?? null,
      session_id: params.sessionId,
      path: params.path?.slice(0, 300) ?? null,
      referrer_host: params.referrerHost?.slice(0, 200) ?? null,
      device: params.device ?? null,
      meta: sanitizeMeta(params.event, params.meta),
    });
  } catch {
    /* аналитика не должна блокировать основной сценарий */
  }
}

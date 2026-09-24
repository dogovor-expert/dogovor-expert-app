import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Upstash Redis — распределённый rate limiter для serverless (Vercel).
// В продакшене Redis обязателен (fail-closed). В разработке можно отключить через RATELIMIT_DISABLED=1.
const isDev = process.env.NODE_ENV === "development";
const rateLimitDisabled = process.env.RATELIMIT_DISABLED === "1";

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

if (!redis && !isDev && !rateLimitDisabled) {
  console.warn("[ratelimit] UPSTASH_REDIS_* not configured — limiters are null and checkRateLimit() will FAIL-CLOSED (429) for every protected route. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN for production.");
}

const mk = (prefix: string, limit: number, windowMs: `${number} s` | `${number} m` | `${number} h`) =>
  redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(limit, windowMs),
        prefix,
        ephemeralCache: new Map(),
      })
    : null;

export const limiters = {
  /** Публичные формы (лиды) — 10 запросов/мин на IP. */
  publicForm: mk("rl:public-form", 10, "60 s"),
  /** Создание документа пользователем — 30/мин на user.id. */
  documentCreate: mk("rl:document-create", 30, "60 s"),
  /** CRUD по contractors/persons/approval — 60/мин на user.id. */
  crudMutation: mk("rl:crud-mutation", 60, "60 s"),
  /** Вебхук платежей — 30 запросов/мин на IP. */
  webhook: mk("rl:webhook", 30, "60 s"),
  /** Вебхук Telegram (ответы оператора) — 60 запросов/мин на IP. */
  telegramWebhook: mk("rl:telegram-webhook", 60, "60 s"),
  /** Отправка на email — 10 запросов/мин на IP. */
  emailSend: mk("rl:email-send", 10, "60 s"),
  /** Форма обратной связи — 10 запросов/мин на IP. */
  feedbackForm: mk("rl:feedback-form", 10, "60 s"),
  /** Админ-мутации (смена статусов, прав) — 30/мин на IP. */
  adminAction: mk("rl:admin-action", 30, "60 s"),
  /** Приём событий аналитики (/api/events) — щедро, шлётся часто с фронта. */
  events: mk("rl:events", 120, "60 s"),
  /** Приём чанков записи визитов (rrweb) — чанк раз в ~10 c на сессию. */
  replay: mk("rl:replay", 60, "60 s"),
  /** Админ-экспорт чувствительных данных (CSV) — 5/мин на admin.id. */
  adminExport: mk("rl:admin-export", 5, "60 s"),
  /** Auth-чувствительные операции (refresh-token, login) — 5/мин на user.id. */
  authAction: mk("rl:auth-action", 5, "60 s"),
  /** Чат с поддержкой — 30 сообщений/мин на IP (защита от спама). */
  chat: mk("rl:chat", 30, "60 s"),
  /** DADATA suggest/find — 40 запросов/мин на IP. */
  dadata: mk("rl:dadata", 40, "60 s"),
  /** Проверка статуса самозанятого (НПД) в ФНС — 20 запросов/мин на IP. */
  npd: mk("rl:npd", 20, "60 s"),
  /** Реальное списание (auto-renew) — 5 запросов/мин на IP (защита от CSRF-шторма). */
  billing: mk("rl:billing", 5, "60 s"),
  /** Подготовка PDF к подписанию — 20 запросов/мин на user.id. */
  signPrepare: mk("rl:sign-prepare", 20, "60 s"),
  /** Приём подписанного PDF — 20 запросов/мин на user.id. */
  signAccept: mk("rl:sign-accept", 20, "60 s"),
  /** Скачивание подписанного PDF — 30 запросов/мин на user.id. */
  signDownload: mk("rl:sign-download", 30, "60 s"),
  /** Верификация подписи — 30 запросов/мин на user.id. */
  signVerify: mk("rl:sign-verify", 30, "60 s"),
  /** Экспорт персональных данных (S4) — 5/мин на user.id (тяжёлый полный дамп). */
  exportData: mk("rl:export-data", 5, "60 s"),
  /** Опрос статуса OCR-задачи (S4) — 60/мин на user.id (внешний прокси). */
  ocrStatus: mk("rl:ocr-status", 60, "60 s"),
  /** OCR-загрузка через прокси — 10/мин на user.id (тяжёлый внешний вызов). */
  ocrUpload: mk("rl:ocr-upload", 10, "60 s"),
  /** Настройки биллинга (тумблер автопродления) — 10/мин на IP. */
  billingSettings: mk("rl:billing-settings", 10, "60 s"),
  /** История Autoteka-отчётов (S4) — 30/мин на user.id. */
  autotekaHistory: mk("rl:autoteka-history", 30, "60 s"),
  /** Загрузка аватара (валидация + ре-энкод) — 5/мин на user.id. */
  avatarUpload: mk("rl:avatar-upload", 5, "60 s"),
  /** AI-юрист: вопрос — 20/мин на user.id (каждый запрос = деньги). */
  aiChat: mk("rl:ai-chat", 20, "60 s"),
};

export function clientIp(req: Request): string {
  const vff = req.headers.get("x-vercel-forwarded-for");
  if (vff) return vff.split(",")[0].trim();
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "anonymous";
}

export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<{ ok: boolean; retryAfter: number }> {
  if (!limiter) {
    // Fail-closed in production, fail-open only in dev with explicit opt-in
    if (isDev && rateLimitDisabled) {
      return { ok: true, retryAfter: 0 };
    }
    return { ok: false, retryAfter: 60 };
  }
  try {
    const { success, reset } = await limiter.limit(identifier);
    if (success) return { ok: true, retryAfter: 0 };
    return { ok: false, retryAfter: Math.max(1, Math.ceil((reset - Date.now()) / 1000)) };
  } catch (e) {
    // Транзитный сбой Upstash (сеть/таймаут) не должен каскадно валить
    // все защищённые роуты 500-й ошибкой: считаем лимит исчерпанным
    // (fail-closed, но с предсказуемым 429 + Retry-After) и логируем.
    console.error("[ratelimit] limiter.limit() failed — denying request (fail-closed):", e instanceof Error ? e.message : e);
    return { ok: false, retryAfter: 30 };
  }
}

export function rateLimitResponse(retryAfter: number) {
  return Response.json({ error: "rate_limit_exceeded" }, {
    status: 429,
    headers: { "Retry-After": String(retryAfter) },
  });
}
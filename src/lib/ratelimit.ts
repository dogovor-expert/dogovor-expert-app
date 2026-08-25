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
  console.warn("[ratelimit] UPSTASH_REDIS_* not configured — rate limiting DISABLED (fail-open). Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN for production.");
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
  /** Вебхук платежей — 30 запросов/мин на IP. */
  webhook: mk("rl:webhook", 30, "60 s"),
  /** Отправка на email — 10 запросов/мин на IP. */
  emailSend: mk("rl:email-send", 10, "60 s"),
  /** Форма обратной связи — 10 запросов/мин на IP. */
  feedbackForm: mk("rl:feedback-form", 10, "60 s"),
  /** Админ-мутации (смена статусов, прав) — 30/мин на IP. */
  adminAction: mk("rl:admin-action", 30, "60 s"),
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
  const { success, reset } = await limiter.limit(identifier);
  if (success) return { ok: true, retryAfter: 0 };
  return { ok: false, retryAfter: Math.max(1, Math.ceil((reset - Date.now()) / 1000)) };
}

export function rateLimitResponse(retryAfter: number) {
  return Response.json({ error: "rate_limit_exceeded" }, {
    status: 429,
    headers: { "Retry-After": String(retryAfter) },
  });
}
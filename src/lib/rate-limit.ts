import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Обработка ошибок Redis: если переменные окружения не заданы или Redis недоступен,
// создаем заглушку, которая всегда разрешает запросы (fail-open).
let redis: Redis;
try {
  redis = Redis.fromEnv();
} catch {
  // Заглушка, чтобы приложение не падало при недоступности Redis
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || 'https://placeholder',
    token: process.env.UPSTASH_REDIS_REST_TOKEN || 'placeholder',
  });
}

export const rateLimiters = {
  // Общий API: 100 запросов в минуту
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    analytics: true,
    prefix: 'rl:api',
  }),

  // Аутентификация: 5 попыток за 15 минут
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '15 m'),
    analytics: true,
    prefix: 'rl:auth',
  }),

  // Тяжёлые операции (OCR, генерация PDF): 10 в минуту
  heavy: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    analytics: true,
    prefix: 'rl:heavy',
  }),

  // Формы: 3 в час
  forms: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '1 h'),
    analytics: true,
    prefix: 'rl:forms',
  }),
};

export function getRateLimitKey(request: Request, userId?: string): string {
  if (userId) return `user:${userId}`;
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anonymous';
  return `ip:${ip}`;
}

// Хелпер для API-роутов
export async function withRateLimit(
  request: Request,
  limiter: Ratelimit,
  userId?: string
) {
  const key = getRateLimitKey(request, userId);
  const result = await limiter.limit(key);
  return {
    ...result,
    headers: {
      'X-RateLimit-Limit': result.limit.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': result.reset.toString(),
    },
  };
}
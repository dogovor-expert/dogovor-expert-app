import "server-only";
import { headers } from "next/headers";
import type { z } from "zod";
import { limiters, checkRateLimit } from "@/lib/ratelimit";

/**
 * Хелперы безопасности для Server Actions.
 *
 * Использовать в каждом `"use server"`-действии, которое мутирует
 * защищённые ресурсы (админка, биллинг, профиль).
 *
 * Применяются в начале функции В УКАЗАННОМ ПОРЯДКЕ:
 *   1. assertSameOrigin()   — блокирует CSRF с подделанным Origin
 *   2. getAdminUser()       — проверяет, что вызывающий — админ
 *   3. checkAdminRateLimit() — rate-limit per admin.id (Upstash)
 *
 * После этого — Zod-валидация входных данных (см. parseForm()).
 *
 * Все три проверки ОБЯЗАТЕЛЬНЫ. Отказ любой из них = throw new Error(...),
 * который Next.js превращает в HTTP 500 для Server Action (на клиенте
 * будет виден как rejected promise). Сообщения об ошибках НЕ должны
 * утекать наружу — см. server-action-error-boundary в src/app/admin.
 */

/**
 * Проверяет, что Server Action вызван с того же origin.
 *
 * Next.js в production автоматически блокирует cross-origin Server Actions
 * через механизм `allowedOrigins`, но мы дублируем проверку явно:
 *   1) защита от edge-кейсов, когда middleware наоборот пропустил запрос;
 *   2) единообразие с API-роутами, где same-origin проверяется через
 *      `isSameOrigin()` (см. src/lib/admin-auth.ts);
 *   3) наглядность в коде — намерение "только свой origin" видно.
 *
 * Бросает Error, если:
 *   - Origin отсутствует (бот/curl/некоторые мобильные клиенты);
 *   - host header отсутствует;
 *   - origin.host не совпадает с host.
 *
 * Используем встроенный `new URL()` — он парсит строго и не падает на
 * кривых данных (либо успех, либо throw, оба варианта корректны).
 */
export async function assertSameOrigin(): Promise<void> {
  const h = await headers();
  const origin = h.get("origin");
  const host = h.get("host");
  if (!origin || !host) {
    throw new Error("forbidden");
  }
  let parsed: URL;
  try {
    parsed = new URL(origin);
  } catch {
    throw new Error("forbidden");
  }
  // host может включать порт (localhost:3000) — сравниваем полностью.
  if (parsed.host !== host) {
    throw new Error("forbidden");
  }
}

/**
 * Rate-limit для admin Server Actions.
 *
 * Переиспользует существующий limiters.adminAction (30 запросов/мин на
 * один admin.id) из src/lib/ratelimit.ts — НЕ дублирует логику.
 *
 * Бросает Error("rate_limited") при превышении. На клиенте это
 * проявляется как rejected promise; UI должен ловить и показывать
 * toast "слишком много запросов".
 */
export async function checkAdminRateLimit(adminId: string): Promise<void> {
  const result = await checkRateLimit(limiters.adminAction, adminId);
  if (!result.ok) {
    // Содержательное сообщение, но без утечки внутренних деталей
    // (не светим retryAfter — это серверная телеметрия).
    throw new Error("rate_limited");
  }
}

/**
 * Парсит FormData через Zod-схему. Бросает Error("bad_input: <details>")
 * при невалидных данных.
 *
 * Преимущества перед ручным разбором:
 *   - явное описание допустимых полей и их типов;
 *   - автоматическое приведение строк к number/boolean/enum;
 *   - защита от unknown-полей (.strict() в схеме);
 *   - единообразные сообщения об ошибках для UI.
 */
export function parseForm<T extends z.ZodTypeAny>(
  schema: T,
  fd: FormData,
): z.infer<T> {
  const obj: Record<string, unknown> = {};
  for (const [key, value] of fd.entries()) {
    // FormData.getAll для одинаковых ключей (radio/checkbox groups);
    // для одиночных полей оставляем только первое значение.
    if (key in obj) {
      const prev = obj[key];
      if (Array.isArray(prev)) prev.push(value);
      else obj[key] = [prev, value];
    } else {
      obj[key] = value;
    }
  }
  const result = schema.safeParse(obj);
  if (!result.success) {
    // Сжимаем ошибки до одной строки для логов; UI получает details
    // в rejected promise (см. admin Server Components).
    const flat = result.error.flatten().fieldErrors;
    const summary = Object.entries(flat)
      .map(([k, v]) => `${k}: ${(v as string[]).join(", ")}`)
      .join("; ");
    throw new Error(`bad_input: ${summary}`);
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- z.infer<T> для generic ZodTypeAny резолвится в any
  return result.data;
}

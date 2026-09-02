import { NextResponse } from 'next/server';

/**
 * Проверяет, что запрос исходит с того же origin (защита от CSRF).
 * Для мутирующих методов (POST, PUT, PATCH, DELETE) проверяет:
 * - Origin header (если есть) должен совпадать с текущим origin
 * - Referer header (если есть) должен совпадать с текущим origin
 *
 * Поведение по окружениям:
 * - development: пропускаем для удобства локальной разработки
 * - test: пропускаем (e2e-тесты шлют запросы без Origin)
 * - production: строгая проверка Origin/Referer; без обоих — 403
 * - preview/staging: строгая (раньше гэп — NODE_ENV !== 'production' → отказ)
 */
export function validateCsrf(req: Request): { valid: true } | { valid: false; response: NextResponse } {
  const env = process.env.NODE_ENV;

  // В development и test пропускаем
  if (env === 'development' || env === 'test') {
    return { valid: true };
  }

  // production / staging / preview — строгая проверка
  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');

  // В production NEXT_PUBLIC_APP_URL обязателен. Если не задан — fail-closed
  // (вместо фоллбэка на localhost, который заблокировал бы сам сайт).
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!baseUrl) {
    console.error('[csrf] NEXT_PUBLIC_APP_URL not set in production — failing closed');
    return {
      valid: false,
      response: NextResponse.json({ error: 'CSRF misconfigured' }, { status: 500 }),
    };
  }
  let siteOrigin: string;
  try {
    siteOrigin = new URL(baseUrl).origin;
  } catch {
    console.error('[csrf] NEXT_PUBLIC_APP_URL is not a valid URL');
    return {
      valid: false,
      response: NextResponse.json({ error: 'CSRF misconfigured' }, { status: 500 }),
    };
  }

  if (origin) {
    try {
      if (new URL(origin).origin !== siteOrigin) {
        return {
          valid: false,
          response: NextResponse.json({ error: 'CSRF validation failed: invalid origin' }, { status: 403 }),
        };
      }
      return { valid: true };
    } catch {
      return {
        valid: false,
        response: NextResponse.json({ error: 'CSRF validation failed: malformed origin' }, { status: 403 }),
      };
    }
  }

  if (referer) {
    try {
      if (new URL(referer).origin !== siteOrigin) {
        return {
          valid: false,
          response: NextResponse.json({ error: 'CSRF validation failed: invalid referer' }, { status: 403 }),
        };
      }
      return { valid: true };
    } catch {
      return {
        valid: false,
        response: NextResponse.json({ error: 'CSRF validation failed: malformed referer' }, { status: 403 }),
      };
    }
  }

  // Ни Origin, ни Referer — браузер их всегда шлёт на fetch. Без них — бот/curl.
  return {
    valid: false,
    response: NextResponse.json({ error: 'CSRF validation failed: missing origin/referer' }, { status: 403 }),
  };
}

/**
 * Хелпер для использования в API-роутах с проверкой метода.
 * Применяется к POST, PUT, PATCH, DELETE.
 *
 * Принимает handler с любой сигнатурой, совместимой с Request (в т.ч. NextRequest).
 * Это позволяет оборачивать роуты с дополнительными параметрами (params) и типизированным
 * NextRequest, не теряя типобезопасность.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withCsrf<TArgs extends any[], TReturn extends Promise<Response>>(
  handler: (...args: TArgs) => TReturn
): (...args: TArgs) => Promise<Response> {
  return (...args: TArgs): Promise<Response> => {
    const req = args[0] as unknown as Request;
    const method = req.method.toUpperCase();
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const csrf = validateCsrf(req);
      if (!csrf.valid) {
        return Promise.resolve(csrf.response);
      }
    }
    return handler(...args);
  };
}
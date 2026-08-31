import { NextResponse } from 'next/server';

/**
 * Проверяет, что запрос исходит с того же origin (защита от CSRF).
 * Для мутирующих методов (POST, PUT, PATCH, DELETE) проверяет:
 * - Origin header (если есть) должен совпадать с текущим origin
 * - Referer header (если есть) должен совпадать с текущим origin
 * 
 * В случае несовпадения возвращает ошибку 403.
 */
export function validateCsrf(req: Request): { valid: true } | { valid: false; response: NextResponse } {
  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');

  // В development можно пропускать проверку для удобства
  if (process.env.NODE_ENV === 'development') {
    return { valid: true };
  }

  // Проверяем Origin
  if (origin) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const url = new URL(baseUrl);
    const originUrl = new URL(origin);
    if (originUrl.origin !== url.origin) {
      return {
        valid: false,
        response: NextResponse.json({ error: 'CSRF validation failed: invalid origin' }, { status: 403 }),
      };
    }
    return { valid: true };
  }

  // Если Origin отсутствует, проверяем Referer
  if (referer) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const url = new URL(baseUrl);
    const refererUrl = new URL(referer);
    if (refererUrl.origin !== url.origin) {
      return {
        valid: false,
        response: NextResponse.json({ error: 'CSRF validation failed: invalid referer' }, { status: 403 }),
      };
    }
    return { valid: true };
  }

  // Если ни Origin, ни Referer не переданы — блокируем (кроме GET/HEAD/OPTIONS)
  // Здесь предполагается, что вызывается только для мутирующих методов
  return {
    valid: false,
    response: NextResponse.json({ error: 'CSRF validation failed: missing origin/referer' }, { status: 403 }),
  };
}

/**
 * Хелпер для использования в API-роутах с проверкой метода.
 * Применяется к POST, PUT, PATCH, DELETE.
 */
export function withCsrf(handler: (req: Request) => Promise<Response>) {
  return async (req: Request): Promise<Response> => {
    const method = req.method.toUpperCase();
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const csrf = validateCsrf(req);
      if (!csrf.valid) {
        return csrf.response;
      }
    }
    return handler(req);
  };
}
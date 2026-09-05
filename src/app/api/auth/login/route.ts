import { createClient } from '@/lib/supabase/server';
import { loginSchema, type LoginFormData } from '@/lib/validations/document';
import { validateBody } from '@/lib/validations/api';
import { NextResponse } from 'next/server';
import { withCsrf } from '@/lib/csrf';
import { isSameOrigin } from '@/lib/admin-auth';
import { limiters, clientIp, checkRateLimit, rateLimitResponse } from '@/lib/ratelimit';

// S5 (аудит): серверная верификация Turnstile — вход оставался единственным
// auth-эндпоинтом без капчи (только rate-limit). Возвращает:
// ok — пройдено/не настроено; fail — капча не пройдена; unavailable — CF недоступен.
async function verifyTurnstile(token: string, ip: string): Promise<'ok' | 'fail' | 'unavailable'> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return 'ok';
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token, remoteip: ip }).toString(),
      cache: 'no-store',
    });
    if (!res.ok) return 'unavailable';
    const data = (await res.json()) as { success: boolean };
    return data.success ? 'ok' : 'fail';
  } catch {
    return 'unavailable';
  }
}

async function loginHandler(req: Request) {
  // Belt-and-suspenders: CSRF + isSameOrigin
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  // N1 (independent audit): rate-limit по IP и по email независимо
  // — чтобы остановить distributed brute-force по одному email-у с разных IP
  const ip = clientIp(req);
  const rlIp = await checkRateLimit(limiters.authAction, `login:ip:${ip}`);
  if (!rlIp.ok) return rateLimitResponse(rlIp.retryAfter);

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // S5: Turnstile — строго при настроенном TURNSTILE_SECRET_KEY. Токен без
  // таймаута Cloudflare (unavailable) — fail-open, чтобы не валить легитимные входы.
  if (process.env.TURNSTILE_SECRET_KEY) {
    const captchaToken =
      typeof body.captchaToken === 'string' && body.captchaToken.length > 0
        ? body.captchaToken
        : null;
    if (!captchaToken) {
      return NextResponse.json({ error: 'Подтвердите, что вы не робот' }, { status: 400 });
    }
    const verdict = await verifyTurnstile(captchaToken, ip);
    if (verdict === 'fail') {
      return NextResponse.json(
        { error: 'Проверка капчи не пройдена. Попробуйте ещё раз' },
        { status: 400 }
      );
    }
    if (verdict === 'unavailable') {
      console.warn('[login] Turnstile siteverify unavailable — allowing request');
    }
  }

  const validation = validateBody<LoginFormData>(loginSchema, body);
  if (!validation.success) {
    return validation.error;
  }

  const { email, password } = validation.data;

  // Лимит по email — защита от брутфорса одного аккаунта с распределённых IP
  const rlEmail = await checkRateLimit(limiters.authAction, `login:email:${email.toLowerCase()}`);
  if (!rlEmail.ok) return rateLimitResponse(rlEmail.retryAfter);

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Не раскрываем, существует ли email (защита от user enumeration)
    return NextResponse.json({ error: 'Неверный email или пароль' }, { status: 401 });
  }

  return NextResponse.json({ user: data.user, session: data.session });
}

export const POST = withCsrf(loginHandler);
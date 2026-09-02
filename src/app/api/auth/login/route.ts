import { createClient } from '@/lib/supabase/server';
import { loginSchema, type LoginFormData } from '@/lib/validations/document';
import { validateBody } from '@/lib/validations/api';
import { NextResponse } from 'next/server';
import { withCsrf } from '@/lib/csrf';
import { isSameOrigin } from '@/lib/admin-auth';
import { limiters, clientIp, checkRateLimit, rateLimitResponse } from '@/lib/ratelimit';

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
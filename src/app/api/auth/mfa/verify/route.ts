import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { withCsrf } from "@/lib/csrf";
import { isSameOrigin } from "@/lib/admin-auth";
import { limiters, checkRateLimit, rateLimitResponse, clientIp } from "@/lib/ratelimit";

export const runtime = "nodejs";

// Серверное подтверждение TOTP (challenge + verify). Вызывается со страницы
// /login?mfa=1, когда браузерный Supabase клиент не выполняет challenge/verify
// сам (сессия обслуживается серверным @supabase/ssr-клиентом). После успешного
// verify GoTrue повышает уровень сессии до aal2 — middleware пускает на
// защищённые маршруты, а /api/auth/mfa/trust-device выдаёт куку «запомнить
// устройство».
async function verifyHandler(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const supabase = await createClient();

  // App-уровневый rate-limit на подбор TOTP-кода: 5 попыток/мин на
  // пользователя (fallback — IP, если сессии ещё нет). Раньше защита была
  // только платформенная (GoTrue), что не гарантирует лимит на инстансе.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const rl = await checkRateLimit(limiters.authAction, `mfa-verify:${user?.id ?? clientIp(request)}`);
  if (!rl.ok) return rateLimitResponse(rl.retryAfter);

  let body: { factorId?: unknown; code?: unknown };
  try {
    body = (await request.json()) as { factorId?: unknown; code?: unknown };
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const factorId = typeof body.factorId === "string" ? body.factorId : "";
  const code = typeof body.code === "string" ? body.code.trim() : "";
  if (!factorId || code.length < 6) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
    factorId,
  });
  if (challengeError) {
    return NextResponse.json({ error: challengeError.message }, { status: 400 });
  }

  const { error: verifyError } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challenge.id,
    code,
  });
  if (verifyError) {
    return NextResponse.json({ error: verifyError.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

export const POST = withCsrf(verifyHandler);
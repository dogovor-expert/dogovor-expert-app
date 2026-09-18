import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { withCsrf } from "@/lib/csrf";
import {
  MFA_DEVICE_COOKIE,
  MFA_DEVICE_MAX_AGE_S,
  signDeviceCookie,
} from "@/lib/mfa-device";

export const runtime = "nodejs";

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

async function trustDeviceHandler(request: NextRequest) {
  let remember = true;
  try {
    const rawBody: unknown = await request.json();
    const body = rawBody as { remember?: unknown } | null;
    remember = body?.remember !== false;
  } catch {
    // пустое тело — считаем remember=true
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });

  if (!remember) {
    // Метаданные (mfa_trusted_at) обновляет браузерный клиент-владелец сессии.
    // Серверный updateUser ротировал refresh-токен и ломал клиентскую сессию.
    response.cookies.set(MFA_DEVICE_COOKIE, "", cookieOptions(0));
    return response;
  }

  // Куку доверия выдаём только свееподтверждённой aal2-сессии
  // (роут вызывается сразу после успешного mfa.verify на странице входа).
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal?.currentLevel !== "aal2") {
    return NextResponse.json({ error: "aal2_required" }, { status: 403 });
  }

  const secret = process.env.MFA_DEVICE_TRUST_SECRET;
  if (!secret) {
    // Функция не настроена — молча не выдаём куку, строгий 2FA сохраняется.
    return NextResponse.json({ ok: true, trusted: false }, { status: 200 });
  }

  const exp = Date.now() + MFA_DEVICE_MAX_AGE_S * 1000;
  const value = await signDeviceCookie(secret, user.id, exp);
  response.cookies.set(MFA_DEVICE_COOKIE, value, cookieOptions(MFA_DEVICE_MAX_AGE_S));
  return NextResponse.json({ ok: true, trusted: true, expiresAt: exp });
}
export const POST = withCsrf(trustDeviceHandler);

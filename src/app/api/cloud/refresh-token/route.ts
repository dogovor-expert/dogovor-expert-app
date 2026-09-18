import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { withCsrf } from "@/lib/csrf";
import { isSameOrigin } from "@/lib/admin-auth";
import { limiters, checkRateLimit, rateLimitResponse } from "@/lib/ratelimit";

const GOOGLE_TOKEN = "https://oauth2.googleapis.com/token";

/**
 * Прокси для обновления access_token у провайдера.
 *
 * Архитектура: refresh_token хранится в клиентском vault (e2e encrypted IndexedDB),
 * сервер не имеет к нему доступа. Клиент отправляет refresh_token в body, сервер
 * проксирует запрос к провайдеру с client_secret (который нельзя отдавать клиенту).
 *
 * Защита:
 * - CSRF: withCsrf + isSameOrigin (refresh_token — sensitive, нельзя позволить CSRF-шторм)
 * - Rate-limit: 5 req/min per user (limiters.authAction) — защита от brute-force
 *   отзыва/перебора refresh_token
 * - Не логируем refresh_token / access_token / client_secret
 * - Ответ не содержит refresh_token (refresh_token обычно не ротируется при refresh)
 */
async function handler(req: NextRequest) {
  // Belt-and-suspenders: и withCsrf (Origin/Referer strict), и isSameOrigin (gэп closed в C10).
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // Rate-limit per user.id (не по IP — клиент за NAT/корп.сети)
  const rl = await checkRateLimit(limiters.authAction, user.id);
  if (!rl.ok) return rateLimitResponse(rl.retryAfter);

  const body = (await req.json().catch(() => ({}))) as {
    provider?: unknown;
    refreshToken?: unknown;
  };
  const { provider, refreshToken } = body;
  if (provider !== "google") {
    return NextResponse.json({ error: "Only google provider supported for now" }, { status: 400 });
  }

  if (!refreshToken || typeof refreshToken !== "string") {
    return NextResponse.json({ error: "refresh_token not provided" }, { status: 400 });
  }

  // Sanity: refresh_token у Google обычно ~100 символов. Защита от попыток
  // передать огромный body / распарсить ответ.
  if (refreshToken.length > 2048) {
    return NextResponse.json({ error: "refresh_token too long" }, { status: 400 });
  }

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: "Google OAuth not configured on server" }, { status: 500 });
  }

  const tokenBody = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
  });

  let res: Response;
  try {
    res = await fetch(GOOGLE_TOKEN, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: tokenBody,
    });
  } catch {
    // НЕ логируем refresh_token / ответ провайдера (может содержать sensitive data)
    console.error("[cloud/refresh-token] Google fetch failed");
    return NextResponse.json({ error: "upstream_unavailable" }, { status: 502 });
  }

  if (!res.ok) {
    // Возвращаем только статус, без upstream-тела (там может быть request_id, но
    // не токены). Подробности — только в server logs.
    const errText = await res.text().catch(() => "");
    console.error("[cloud/refresh-token] upstream_error", { status: res.status, len: errText.length });
    return NextResponse.json({ error: "upstream_error" }, { status: 502 });
  }

  const data = (await res.json()) as {
    access_token?: unknown;
    expires_in?: unknown;
    scope?: unknown;
  };
  if (typeof data.access_token !== "string") {
    return NextResponse.json({ error: "invalid_upstream_response" }, { status: 502 });
  }

  return NextResponse.json({
    accessToken: data.access_token,
    expiresAt: typeof data.expires_in === "number" ? Date.now() + data.expires_in * 1000 : undefined,
    scope: typeof data.scope === "string" ? data.scope : undefined,
  });
}

export const POST = withCsrf(handler);
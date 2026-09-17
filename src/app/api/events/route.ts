import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { withCsrf } from "@/lib/csrf";
import { isSameOrigin } from "@/lib/admin-auth";
import { limiters, checkRateLimit, rateLimitResponse, clientIp } from "@/lib/ratelimit";
import { logUserEvent, isKnownEvent, deviceFromUserAgent } from "@/lib/userEvents";

/**
 * Приём событий внутренней аналитики (см. src/lib/userEvents.ts).
 *
 * Осознанно НЕ требует авторизации: события нужны и от анонимных
 * посетителей (воронка "зашёл на сайт → начал → зарегистрировался"),
 * поэтому auth здесь опциональный — user_id пишется, если сессия есть.
 *
 * Именно поэтому same-origin — обязателен (иначе чужой сайт может засорять
 * вашу аналитику руками ваших же посетителей), а rate-limit — по IP, а не
 * по user.id (у анонимов user.id нет).
 */
async function postHandler(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const rl = await checkRateLimit(limiters.events, clientIp(req));
  if (!rl.ok) return rateLimitResponse(rl.retryAfter);

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "bad body" }, { status: 400 });
  }

  const { event, sessionId, path, meta } = body as Record<string, unknown>;
  if (typeof event !== "string" || !isKnownEvent(event)) {
    // Неизвестное событие — не считаем ошибкой клиента (например, старая
    // вкладка со старой версией фронта), просто молча игнорируем.
    return NextResponse.json({ ok: true, ignored: true });
  }
  if (typeof sessionId !== "string" || sessionId.length < 8 || sessionId.length > 64) {
    return NextResponse.json({ error: "bad session id" }, { status: 400 });
  }

  // Пользователь опционален: /api/events должен работать и для анонимов.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let referrerHost: string | null = null;
  const referer = req.headers.get("referer");
  if (referer) {
    try {
      referrerHost = new URL(referer).host;
    } catch {
      referrerHost = null;
    }
  }

  await logUserEvent({
    event,
    userId: user?.id ?? null,
    sessionId,
    path: typeof path === "string" ? path : null,
    referrerHost,
    device: deviceFromUserAgent(req.headers.get("user-agent")),
    meta,
  });

  // 202: событие принято к обработке, без гарантии и без данных в ответе —
  // клиенту не нужно ничего из ответа, лишний JSON только замедляет запрос.
  return new NextResponse(null, { status: 202 });
}

export const POST = withCsrf(postHandler);

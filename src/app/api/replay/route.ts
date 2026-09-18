import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { withCsrf } from "@/lib/csrf";
import { isSameOrigin } from "@/lib/admin-auth";
import { limiters, checkRateLimit, rateLimitResponse, clientIp } from "@/lib/ratelimit";
import { deviceFromUserAgent } from "@/lib/userEvents";

/**
 * Приём чанков записи визита (rrweb) — см. src/components/analytics/SessionRecorder.tsx
 * и миграцию 20260914_session_replays.sql.
 *
 * Запись ведётся только по согласию (categories.analytics, гейт на клиенте),
 * поэтому здесь авторизация опциональна (визит может быть анонимным), но
 * same-origin обязателен: иначе чужой сайт мог бы заливать мусор в наш
 * журнал от имени наших посетителей. rate-limit — по IP.
 *
 * Данные приходят как base64(gzip(JSON)) из браузера: сервер их не
 * распаковывает (только считает размер), поэтому на бэкенд-стороне нет
 * риска разбора неконтролируемого JSON.
 */

const MAX_CHUNK_CHARS = 700_000; // ~512 КБ gzip в base64
const MAX_SEQ = 100_000;
const SESSION_RE = /^[A-Za-z0-9_-]{8,64}$/;

async function postHandler(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const rl = await checkRateLimit(limiters.replay, clientIp(req));
  if (!rl.ok) return rateLimitResponse(rl.retryAfter);

  const body: unknown = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "bad body" }, { status: 400 });
  }

  const { sessionId, seq, data, path } = body as Record<string, unknown>;
  if (typeof sessionId !== "string" || !SESSION_RE.test(sessionId)) {
    return NextResponse.json({ error: "bad session id" }, { status: 400 });
  }
  if (typeof seq !== "number" || !Number.isInteger(seq) || seq < 0 || seq > MAX_SEQ) {
    return NextResponse.json({ error: "bad seq" }, { status: 400 });
  }
  if (typeof data !== "string" || data.length === 0 || data.length > MAX_CHUNK_CHARS) {
    return NextResponse.json({ error: "bad chunk" }, { status: 413 });
  }

  // Пользователь опционален: запись может быть и у анонима.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const admin = createAdminClient();
  const { error } = await admin.rpc("record_replay_chunk", {
    p_session_id: sessionId,
    p_seq: seq,
    p_data: data,
    p_user_id: user?.id ?? null,
    p_device: deviceFromUserAgent(req.headers.get("user-agent")),
    p_path: typeof path === "string" && path.startsWith("/") ? path.slice(0, 200) : null,
  });

  if (error) {
    // Fail-safe для клиента: не роняем страницу пользователя из-за
    // аналитического журнала, но факт пишем в серверный лог.
    console.error("[replay] record_replay_chunk failed:", error.message);
    return NextResponse.json({ error: "storage_failed" }, { status: 500 });
  }

  return new NextResponse(null, { status: 202 });
}

export const POST = withCsrf(postHandler);

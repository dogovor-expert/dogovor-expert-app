import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { limiters, checkRateLimit, rateLimitResponse } from "@/lib/ratelimit";
import { withCsrf } from "@/lib/csrf";
import { isSameOrigin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

/** GET /api/notifications — список последних уведомлений текущего пользователя. */
export async function GET(req: Request) {
  const rl = await checkRateLimit(limiters.crudMutation, clientIpOf(req));
  if (!rl.ok) return rateLimitResponse(rl.retryAfter);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const [list, unread] = await Promise.all([
    supabase
      .from("notifications")
      .select("id, type, title, body, read_at, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .is("read_at", null),
  ]);

  return NextResponse.json({
    notifications: list.data ?? [],
    unread: unread.count ?? 0,
  });
}

/** POST { id } — отметить одно уведомление прочитанным; { all: true } — все. */
async function postHandler(req: Request) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const rl = await checkRateLimit(limiters.crudMutation, clientIpOf(req));
  if (!rl.ok) return rateLimitResponse(rl.retryAfter);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { all?: unknown; id?: unknown } | null;
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  if (body.all === true) {
    const { error } = await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .is("read_at", null);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (typeof body.id !== "string" || !/^[0-9a-f-]{36}$/i.test(body.id)) {
    return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  }
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", body.id)
    .eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export const POST = withCsrf(postHandler);

function clientIpOf(req: Request): string {
  return (
    req.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip")?.trim() ||
    "anonymous"
  );
}

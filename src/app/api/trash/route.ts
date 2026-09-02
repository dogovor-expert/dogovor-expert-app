import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { withCsrf } from "@/lib/csrf";
import { isSameOrigin } from "@/lib/admin-auth";
import { limiters, checkRateLimit, rateLimitResponse } from "@/lib/ratelimit";

// UUID v4 regex (8-4-4-4-12 hex digits). Безопасная валидация: нельзя
// передать произвольный SQL-фрагмент в `.in("id", ...)` даже после zod.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_BATCH = 100;

function parseIds(raw: unknown): { ok: true; ids: string[] } | { ok: false; error: string } {
  if (!Array.isArray(raw) || raw.length === 0) {
    return { ok: false, error: "ids array is required" };
  }
  if (raw.length > MAX_BATCH) {
    return { ok: false, error: `max ${MAX_BATCH} ids per request` };
  }
  for (const id of raw) {
    if (typeof id !== "string" || !UUID_RE.test(id)) {
      return { ok: false, error: "invalid uuid" };
    }
  }
  return { ok: true, ids: raw as string[] };
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("documents")
    .select("id, template_id, title, fields, checklist, versions, status, deleted_at, created_at, updated_at")
    .eq("user_id", user.id)
    .not("deleted_at", "is", null)
    .order("deleted_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

async function postHandler(req: Request) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const rl = await checkRateLimit(limiters.crudMutation, user.id);
  if (!rl.ok) return rateLimitResponse(rl.retryAfter);

  const body = await req.json().catch(() => null);
  const parsed = parseIds(body?.ids);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { error } = await supabase
    .from("documents")
    .update({ status: "draft", deleted_at: null, updated_at: new Date().toISOString() })
    .in("id", parsed.ids)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, restored: parsed.ids.length });
}

async function deleteHandler(req: Request) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // Более строгий лимит на DELETE (безвозвратное удаление)
  const rl = await checkRateLimit(limiters.crudMutation, `delete:${user.id}`);
  if (!rl.ok) return rateLimitResponse(rl.retryAfter);

  const body = await req.json().catch(() => null);
  const parsed = parseIds(body?.ids);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { error } = await supabase
    .from("documents")
    .delete()
    .in("id", parsed.ids)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, purged: parsed.ids.length });
}

export const POST = withCsrf(postHandler);
export const DELETE = withCsrf(deleteHandler);
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { limiters, clientIp, checkRateLimit, rateLimitResponse } from "@/lib/ratelimit";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const rl = await checkRateLimit(limiters.publicForm, clientIp(req) + ":" + token);
  if (!rl.ok) return rateLimitResponse(rl.retryAfter);

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("approvals")
    .select("id, token, template_id, mode, values, checklist, expires_at, changed, opened_count")
    .eq("token", token)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (new Date(data.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: "expired" }, { status: 410 });
  }

  // Считаем открытие только при первичном просмотре контрагентом (?view=1).
  // Повторные fetch (обновления, применение владельцем) счётчик не увеличивают.
  const isView = new URL(req.url).searchParams.get("view") === "1";
  if (isView) {
    await admin
      .from("approvals")
      .update({ opened_count: Number(data.opened_count ?? 0) + 1 })
      .eq("id", data.id);
  }

  return NextResponse.json({
    templateId: data.template_id,
    mode: data.mode,
    values: data.values,
    checklist: data.checklist,
    changed: data.changed,
    expiresAt: data.expires_at,
  });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const rl = await checkRateLimit(limiters.publicForm, clientIp(req) + ":" + token);
  if (!rl.ok) return rateLimitResponse(rl.retryAfter);

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "bad body" }, { status: 400 });
  }
  const values = body.values && typeof body.values === "object" ? body.values : {};
  const checklist = body.checklist && typeof body.checklist === "object" ? body.checklist : {};

  const admin = createAdminClient();
  const { data: existing, error: findError } = await admin
    .from("approvals")
    .select("id, expires_at")
    .eq("token", token)
    .single();

  if (findError || !existing) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (new Date(existing.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: "expired" }, { status: 410 });
  }

  const { error } = await admin
    .from("approvals")
    .update({
      values,
      checklist,
      changed: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", existing.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

/** Владелец применил правки контрагента — сбрасываем флаг changed. */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const { data: existing, error: findError } = await admin
    .from("approvals")
    .select("id, user_id")
    .eq("token", token)
    .single();
  if (findError || !existing) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (existing.user_id !== user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { error } = await admin
    .from("approvals")
    .update({ changed: false, updated_at: new Date().toISOString() })
    .eq("id", existing.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

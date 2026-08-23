import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const APPROVAL_DAYS = 7;

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "bad body" }, { status: 400 });
  }
  const templateId = String(body.templateId ?? "").trim();
  const mode = body.mode === "edit" ? "edit" : "fill";
  if (!templateId) return NextResponse.json({ error: "templateId is required" }, { status: 400 });
  const values = body.values && typeof body.values === "object" ? body.values : {};
  const checklist = body.checklist && typeof body.checklist === "object" ? body.checklist : {};

  const token = randomUUID();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + APPROVAL_DAYS * 24 * 60 * 60 * 1000);

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("approvals")
    .insert({
      token,
      user_id: user.id,
      template_id: templateId,
      mode,
      values,
      checklist,
      expires_at: expiresAt.toISOString(),
    })
    .select("id, token, template_id, mode, created_at, expires_at, changed, updated_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("approvals")
    .select("id, token, template_id, mode, created_at, expires_at, changed, updated_at, opened_count")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

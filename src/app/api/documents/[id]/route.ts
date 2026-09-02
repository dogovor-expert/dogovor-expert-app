import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { withCsrf } from "@/lib/csrf";
import { isSameOrigin } from "@/lib/admin-auth";

type Params = { params: Promise<{ id: string }> };

async function patchHandler(req: Request, { params }: Params) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "bad body" }, { status: 400 });

  // Whitelist: только контентные поля. status/template_id/deleted_at управляются
  // через DELETE (корзина) и специальные роуты (/api/trash), чтобы клиент не
  // мог обойти логику корзины или подменить шаблон/дату удаления.
  const allowedFields = [
    "title",
    "fields",
    "checklist",
    "versions",
    "is_favorite",
  ] as const;
  const updates: Record<string, unknown> = {};
  for (const key of allowedFields) {
    if (key in body) updates[key] = body[key];
  }
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "no valid fields to update" }, { status: 400 });
  }
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("documents")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ data });
}

async function deleteHandler(_req: Request, { params }: Params) {
  if (!isSameOrigin(_req)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: existing } = await supabase
    .from("documents")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (!existing) return NextResponse.json({ error: "not found" }, { status: 404 });

  const { error } = await supabase
    .from("documents")
    .update({ status: "trashed", deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export const DELETE = withCsrf(deleteHandler);

// PATCH: isSameOrigin уже есть, добавляем withCsrf для единообразия.
export const PATCH = withCsrf(patchHandler);
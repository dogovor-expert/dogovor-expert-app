import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isValidInn } from "@/lib/inn";

const FIELDS = ["full_name", "phone", "company", "inn", "avatar_url", "signature"];

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("full_name, phone, company, inn, avatar_url, signature, notify_email, is_admin, created_at")
    .eq("id", user.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: { ...profile, email: user.email } });
}

export async function PATCH(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "bad body" }, { status: 400 });
  }

  const update: Record<string, string | boolean> = {};
  for (const key of FIELDS) {
    const value = body[key];
    if (value === undefined || value === null) continue;
    if (typeof value !== "string") {
      return NextResponse.json({ error: `invalid value for ${key}` }, { status: 400 });
    }
    const trimmed = value.trim();
    if (key === "inn" && !isValidInn(trimmed)) {
      return NextResponse.json(
        { error: "ИНН должен содержать 10 или 12 цифр и быть корректным" },
        { status: 400 }
      );
    }
    if (key === "avatar_url" && trimmed !== "" && !trimmed.startsWith(process.env.NEXT_PUBLIC_SUPABASE_URL + "/storage/v1/object/public/avatars/")) {
      return NextResponse.json({ error: "invalid avatar_url" }, { status: 400 });
    }
    update[key] = trimmed.slice(0, 500);
  }
  if (typeof body.notify_email === "boolean") {
    update.notify_email = body.notify_email;
  }
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ data: null });
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(update)
    .eq("id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const admin = createAdminClient();

  try {
    const { data: objects } = await admin.storage
      .from("avatars")
      .list(user.id, { limit: 100 });
    if (objects && objects.length > 0) {
      await admin.storage.from("avatars").remove(
        objects.map((o) => `${user.id}/${o.name}`)
      );
    }
  } catch {
    // Best-effort: continue with account deletion even if cleanup fails
  }

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data: { ok: true } });
}
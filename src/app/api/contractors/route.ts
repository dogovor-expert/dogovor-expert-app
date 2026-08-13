import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const FIELDS = ["name", "inn", "kpp", "ogrn", "address", "email", "phone", "note"];

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("contractors")
    .select("id, name, inn, kpp, ogrn, address, email, phone, note, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data ?? [] });
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "bad body" }, { status: 400 });
  }

  const row: Record<string, string> = {};
  for (const key of FIELDS) {
    const value = body[key];
    row[key] = typeof value === "string" ? value.trim().slice(0, 500) : "";
  }
  if (!row.name && !row.inn) {
    return NextResponse.json({ error: "Заполните наименование или ИНН" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("contractors")
    .insert({ ...row, user_id: user.id })
    .select("id, name, inn, kpp, ogrn, address, email, phone, note, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { error } = await supabase
    .from("contractors")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: null });
}
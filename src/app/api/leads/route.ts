import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const SERVICES = ["docs", "full", "kasko"] as const;
const STATUSES = ["new", "paid", "docs", "filed", "done", "canceled"] as const;

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "bad body" }, { status: 400 });
  }

  const service = body.service;
  if (!SERVICES.includes(service)) {
    return NextResponse.json({ error: "invalid service" }, { status: 400 });
  }

  const brand = String(body.brand ?? "").trim().slice(0, 200);
  if (!brand) {
    return NextResponse.json({ error: "brand is required" }, { status: 400 });
  }

  const phone = String(body.phone ?? "").replace(/\D/g, "").slice(0, 15);
  if (phone.length < 10) {
    return NextResponse.json({ error: "phone is required" }, { status: 400 });
  }

  const vin = String(body.vin ?? "").trim().toUpperCase().slice(0, 17);

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("leads")
    .insert({ service, brand, phone, vin, status: "new" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}

async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  return profile?.is_admin ? supabase : null;
}

export async function GET() {
  const supabase = await requireAdmin();
  if (!supabase) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("leads")
    .select("id, service, brand, vin, phone, status, meta, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function PATCH(req: Request) {
  const supabase = await requireAdmin();
  if (!supabase) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body?.id || !STATUSES.includes(body.status)) {
    return NextResponse.json({ error: "invalid id or status" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("leads")
    .update({ status: body.status })
    .eq("id", body.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
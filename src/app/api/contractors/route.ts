import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { withCsrf } from "@/lib/csrf";
import { isSameOrigin } from "@/lib/admin-auth";
import { limiters, checkRateLimit, rateLimitResponse } from "@/lib/ratelimit";
import { isInn } from "@/lib/legal/validators";
import { z } from "zod";

const contractorSchema = z.object({
  name: z.string().trim().max(500).optional().default(""),
  inn: z.string().trim().max(20).optional().default(""),
  kpp: z.string().trim().max(20).optional().default(""),
  ogrn: z.string().trim().max(20).optional().default(""),
  address: z.string().trim().max(500).optional().default(""),
  email: z.string().trim().max(254).optional().default(""),
  phone: z.string().trim().max(20).optional().default(""),
  note: z.string().trim().max(500).optional().default(""),
});

export async function GET() {
  const supabase = await createClient();
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

async function postHandler(req: NextRequest) {
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

  const raw: unknown = await req.json().catch(() => null);
  if (!raw || typeof raw !== "object") {
    return NextResponse.json({ error: "bad body" }, { status: 400 });
  }

  const parsed = contractorSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation", details: parsed.error.flatten() }, { status: 400 });
  }
  const row = parsed.data;

  if (!row.name && !row.inn) {
    return NextResponse.json({ error: "Заполните наименование или ИНН" }, { status: 400 });
  }

  if (row.inn) {
    const innCheck = isInn(row.inn);
    if (!innCheck.valid) {
      return NextResponse.json({ error: innCheck.message || "ИНН некорректен" }, { status: 400 });
    }
  }

  if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
    return NextResponse.json({ error: "Некорректный email" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("contractors")
    .insert({ ...row, user_id: user.id })
    .select("id, name, inn, kpp, ogrn, address, email, phone, note, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}

async function deleteHandler(req: NextRequest) {
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

export const POST = withCsrf(postHandler);
export const DELETE = withCsrf(deleteHandler);
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body.enabled !== "boolean") {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const { data: subs } = await supabase
    .from("subscriptions")
    .select("id, status, period_end, auto_renewal, yookassa_payment_method_id")
    .eq("user_id", user.id)
    .order("period_start", { ascending: false })
    .limit(5);

  const now = new Date();
  const active = (subs ?? []).find(
    (s) => s.status === "active" && s.period_end && new Date(String(s.period_end)) >= now
  );

  if (!active) {
    return NextResponse.json({ error: "no_active_subscription" }, { status: 400 });
  }

  if (body.enabled && !active.yookassa_payment_method_id) {
    return NextResponse.json(
      { error: "no_saved_payment_method", message: "Для автопродления нужна сохранённая карта. Оформите подписку ещё раз — на первом шаге карта сохранится автоматически." },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("subscriptions")
    .update({ auto_renewal: body.enabled })
    .eq("id", active.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ auto_renewal: body.enabled });
}
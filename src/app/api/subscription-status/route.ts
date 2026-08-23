import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ subscription_active: false }, { status: 200 });
  }

  const { data: subs } = await supabase
    .from("subscriptions")
    .select("plan, status, period_end, auto_renewal, yookassa_payment_method_id")
    .eq("user_id", user.id)
    .order("period_start", { ascending: false, nullsFirst: false })
    .limit(10);

  const now = new Date();
  const active = (subs ?? []).find(
    (s) => s.status === "active" && s.period_end && new Date(String(s.period_end)) >= now
  );

  return NextResponse.json({
    subscription_active: !!active,
    plan: active?.plan ?? (subs?.[0]?.plan ?? "free"),
    period_end: active?.period_end ?? null,
    auto_renewal: active?.auto_renewal ?? false,
    has_payment_method: !!active?.yookassa_payment_method_id,
    renew_link_available: !!active?.auto_renewal && !!active?.yookassa_payment_method_id,
  });
}
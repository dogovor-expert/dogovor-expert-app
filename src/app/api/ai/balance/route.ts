import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSameOrigin } from "@/lib/admin-auth";
import { AI_LOW_BALANCE_KOPEKS, formatKopeks } from "@/lib/ai/pricing";

async function getHandler(req: Request) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const { data } = await admin
    .from("ai_balances")
    .select("balance_kopeks, free_asked")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();
  const raw = data as { balance_kopeks?: unknown; free_asked?: unknown } | null;
  const balance = Number(raw?.balance_kopeks ?? 0);
  return NextResponse.json({
    balance_kopeks: balance,
    balance: formatKopeks(balance),
    free_asked: Number(raw?.free_asked ?? 0),
    low: balance < AI_LOW_BALANCE_KOPEKS,
  });
}

export async function GET(req: Request) {
  return getHandler(req);
}

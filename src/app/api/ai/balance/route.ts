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
    .select("balance_kopeks, free_asked, quota_total, quota_used, quota_month")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();
  const raw = data as {
    balance_kopeks?: unknown;
    free_asked?: unknown;
    quota_total?: unknown;
    quota_used?: unknown;
    quota_month?: unknown;
  } | null;
  const balance = Number(raw?.balance_kopeks ?? 0);
  const quotaTotal = Number(raw?.quota_total ?? 0);
  const quotaUsed = Number(raw?.quota_used ?? 0);
  const quotaMonth = typeof raw?.quota_month === "string" ? raw.quota_month : "";
  return NextResponse.json({
    balance_kopeks: balance,
    balance: formatKopeks(balance),
    free_asked: Number(raw?.free_asked ?? 0),
    low: balance < AI_LOW_BALANCE_KOPEKS,
    quota_total: quotaTotal,
    quota_used: quotaUsed,
    quota_left: Math.max(0, quotaTotal - quotaUsed),
    quota_month: quotaMonth,
  });
}

export async function GET(req: Request) {
  return getHandler(req);
}

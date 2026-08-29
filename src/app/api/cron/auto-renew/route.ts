import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { initiateRecurringRenewal, type RenewResult } from "@/lib/billing/recurring";

const DAY_MS = 86400000;
// Окно, за которое до истечения подписки мы инициируем автосписание.
const RENEW_WINDOW_DAYS = 3;

function authOk(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = req.headers.get("authorization") ?? "";
  return auth === `Bearer ${secret}`;
}

export async function POST(req: Request) {
  if (!authOk(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const now = Date.now();
  const windowEnd = new Date(now + RENEW_WINDOW_DAYS * DAY_MS).toISOString();

  const { data: subs, error } = await admin
    .from("subscriptions")
    .select("id, user_id, plan, status, period_end, auto_renewal, yookassa_payment_method_id")
    .eq("status", "active")
    .eq("auto_renewal", true)
    .not("yookassa_payment_method_id", "is", null)
    .lte("period_end", windowEnd);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!subs || subs.length === 0) {
    return NextResponse.json({ processed: 0 });
  }

  const results: { subscription_id: string; user_id: string; status: RenewResult }[] = [];
  for (const sub of subs) {
    const status = await initiateRecurringRenewal(admin, {
      id: sub.id,
      user_id: sub.user_id,
      plan: sub.plan ?? "pro",
      yookassa_payment_method_id: sub.yookassa_payment_method_id,
    });
    results.push({ subscription_id: sub.id, user_id: sub.user_id, status });
  }

  return NextResponse.json({ processed: results.length, results });
}

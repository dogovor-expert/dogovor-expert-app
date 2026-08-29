import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { currentProPrice } from "@/lib/pricing";

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

  const shopId = (process.env.YOOKASSA_SHOP_ID ?? "").trim();
  const secretKey = (process.env.YOOKASSA_SECRET_KEY ?? "").trim();
  if (!shopId || !secretKey) {
    return NextResponse.json({ error: "payment_unavailable" }, { status: 503 });
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

  const price = currentProPrice();
  const results: { subscription_id: string; user_id: string; status: string }[] = [];

  for (const sub of subs) {
    // Защита от двойного списания: уже есть незавершённый платёж за этот период?
    const { data: existing } = await admin
      .from("payments")
      .select("id, status, meta")
      .eq("user_id", sub.user_id)
      .in("status", ["pending", "paid"])
      .limit(20);
    const alreadyCharged = (existing ?? []).some(
      (p) => (p.meta as Record<string, unknown> | null)?.renewal_for === sub.id
    );
    if (alreadyCharged) {
      results.push({ subscription_id: sub.id, user_id: sub.user_id, status: "skipped_already_charged" });
      continue;
    }

    try {
      const res = await fetch("https://api.yookassa.ru/v3/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotence-Key": randomUUID(),
          Authorization: "Basic " + Buffer.from(`${shopId}:${secretKey}`).toString("base64"),
        },
        body: JSON.stringify({
          amount: { value: price.toFixed(2), currency: "RUB" },
          capture: true,
          payment_method_id: sub.yookassa_payment_method_id,
          description: "PRO-подписка · 30 дней · автопродление",
          metadata: { user_id: sub.user_id, plan: sub.plan ?? "pro", auto_renewal: "true", renewal_for: sub.id },
        }),
      });
      if (!res.ok) {
        results.push({ subscription_id: sub.id, user_id: sub.user_id, status: "provider_error" });
        // Карта могла протухнуть — выключаем автопродление, чтобы не спамить.
        await admin.from("subscriptions").update({ auto_renewal: false }).eq("id", sub.id);
        continue;
      }
      const payment = await res.json();
      await admin.from("payments").insert({
        user_id: sub.user_id,
        amount: price,
        provider: "yookassa",
        provider_id: payment.id,
        status: "pending",
        meta: { plan: sub.plan ?? "pro", auto_renewal: true, renewal_for: sub.id },
      });
      results.push({ subscription_id: sub.id, user_id: sub.user_id, status: payment.status ?? "pending" });
    } catch {
      results.push({ subscription_id: sub.id, user_id: sub.user_id, status: "exception" });
    }
  }

  return NextResponse.json({ processed: results.length, results });
}

import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const PRO_PRICE = 990;

export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const shopId = process.env.YOOKASSA_SHOP_ID;
  const secretKey = process.env.YOOKASSA_SECRET_KEY;
  if (!shopId || !secretKey) {
    return NextResponse.json({ error: "payment_unavailable" }, { status: 503 });
  }

  const { data: subs } = await supabase
    .from("subscriptions")
    .select("id, status, period_end, auto_renewal, yookassa_payment_method_id")
    .eq("user_id", user.id)
    .order("period_end", { ascending: false })
    .limit(5);

  const now = new Date();
  const active = (subs ?? []).find(
    (s) => s.status === "active" && s.period_end && new Date(String(s.period_end)) >= now
  );

  if (!active || !active.auto_renewal) {
    return NextResponse.json({ error: "no_active_auto_renewal" }, { status: 400 });
  }
  if (!active.yookassa_payment_method_id) {
    return NextResponse.json({ error: "no_saved_payment_method" }, { status: 400 });
  }

  const host = req.headers.get("host") ?? "dogovor.expert";
  const proto = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";

  const res = await fetch("https://api.yookassa.ru/v3/payments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotence-Key": randomUUID(),
      Authorization: "Basic " + Buffer.from(`${shopId}:${secretKey}`).toString("base64"),
    },
    body: JSON.stringify({
      amount: { value: PRO_PRICE.toFixed(2), currency: "RUB" },
      capture: true,
      payment_method_id: active.yookassa_payment_method_id,
      description: "PRO-подписка · 30 дней · автопродление",
      metadata: { user_id: user.id, plan: "pro", auto_renewal: "true" },
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: "provider_error" }, { status: 502 });
  }
  const payment = await res.json();

  const admin = createAdminClient();
  await admin.from("payments").insert({
    user_id: user.id,
    amount: PRO_PRICE,
    provider: "yookassa",
    provider_id: payment.id,
    status: "pending",
    meta: { plan: "pro", auto_renewal: true },
  });

  return NextResponse.json({
    ok: true,
    status: payment.status,
    payment_id: payment.id,
    return_url: `${proto}://${host}/billing?renewed=1`,
  });
}
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { currentProPrice } from "@/lib/pricing";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const shopId = process.env.YOOKASSA_SHOP_ID;
  const secretKey = process.env.YOOKASSA_SECRET_KEY;
  if (!shopId || !secretKey) {
    return NextResponse.json({ error: "payment_unavailable" }, { status: 503 });
  }

  const host = req.headers.get("host") ?? "dogovor.expert";
  const proto = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
  const price = currentProPrice();

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
      confirmation: {
        type: "redirect",
        return_url: `${proto}://${host}/billing?success=1`,
      },
      description: "PRO-подписка · 30 дней",
      metadata: { user_id: user.id, plan: "pro" },
      save_payment_method: true,
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: "provider_error" }, { status: 502 });
  }
  const payment = await res.json();
  if (payment.status !== "pending" || !payment.confirmation?.confirmation_url) {
    return NextResponse.json({ error: "provider_unexpected" }, { status: 502 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("payments")
    .insert({
      user_id: user.id,
      amount: price,
      provider: "yookassa",
      provider_id: payment.id,
      status: "pending",
      meta: { plan: "pro" },
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({
    confirmation_url: payment.confirmation.confirmation_url,
    payment_id: data.id,
  });
}
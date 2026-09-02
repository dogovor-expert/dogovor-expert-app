import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { currentProPrice } from "@/lib/pricing";
import { withCsrf } from "@/lib/csrf";
import { isSameOrigin } from "@/lib/admin-auth";
import { limiters, checkRateLimit, rateLimitResponse } from "@/lib/ratelimit";

async function postHandler(req: Request) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // Rate-limit: создание платежа — 5/мин на user.id (защита от спама YooKassa)
  const rl = await checkRateLimit(limiters.authAction, user.id);
  if (!rl.ok) return rateLimitResponse(rl.retryAfter);

  const shopId = (process.env.YOOKASSA_SHOP_ID ?? "").trim();
  const secretKey = (process.env.YOOKASSA_SECRET_KEY ?? "").trim();
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
    const detail = await res.text().catch(() => "");
    console.error("[billing/create-payment] YooKassa create payment failed", res.status, detail);
    let providerDetail = "";
    try { const j = JSON.parse(detail); providerDetail = j.description || j.code || detail; } catch { providerDetail = detail; }
    return NextResponse.json({ error: "provider_error", yookassa_status: res.status, detail: providerDetail }, { status: 502 });
  }
  const payment = await res.json();
  if (payment.status !== "pending" || !payment.confirmation?.confirmation_url) {
    console.error("[billing/create-payment] YooKassa unexpected payment state", JSON.stringify(payment));
    return NextResponse.json({ error: "provider_unexpected" }, { status: 502 });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("[billing/create-payment] SUPABASE_SERVICE_ROLE_KEY is not set");
    return NextResponse.json({ error: "config_error", detail: "SUPABASE_SERVICE_ROLE_KEY не задан на сервере" }, { status: 503 });
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

  if (error) return NextResponse.json({ error: error.message, detail: error.message }, { status: 500 });
  return NextResponse.json({
    confirmation_url: payment.confirmation.confirmation_url,
    payment_id: data.id,
  });
}

export const POST = withCsrf(postHandler);
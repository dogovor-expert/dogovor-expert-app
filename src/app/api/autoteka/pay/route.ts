import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const STD_PRICE = 199;
const PREM_PRICE = 299;
const VIN_RE = /^[A-HJ-NPR-Z0-9]{17}$/;

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const vin = String(body?.vin ?? "").toUpperCase().trim();
  if (!VIN_RE.test(vin)) {
    return NextResponse.json({ error: "invalid_vin" }, { status: 400 });
  }

  const premium = Boolean(body?.premium);
  const amount = premium ? PREM_PRICE : STD_PRICE;

  const shopId = (process.env.YOOKASSA_SHOP_ID ?? "").trim();
  const secretKey = (process.env.YOOKASSA_SECRET_KEY ?? "").trim();
  if (!shopId || !secretKey) {
    return NextResponse.json({ error: "payment_unavailable" }, { status: 503 });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("[autoteka/pay] SUPABASE_SERVICE_ROLE_KEY is not set");
    return NextResponse.json({ error: "config_error", detail: "SUPABASE_SERVICE_ROLE_KEY не задан на сервере" }, { status: 503 });
  }
  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("reports")
    .select("id")
    .eq("user_id", user.id)
    .eq("vin", vin)
    .eq("status", "ready")
    .limit(1);
  if (existing && existing.length > 0) {
    return NextResponse.json({ error: "already_purchased" }, { status: 409 });
  }

  const host = req.headers.get("host") ?? "dogovor.expert";
  const proto = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";

  const res = await fetch("https://api.yookassa.ru/v3/payments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotence-Key": Buffer.from(`${user.id}:${vin}:${premium ? "prem" : "std"}`).toString("base64"),
      Authorization: "Basic " + Buffer.from(`${shopId}:${secretKey}`).toString("base64"),
    },
    body: JSON.stringify({
      amount: { value: amount.toFixed(2), currency: "RUB" },
      capture: true,
      confirmation: {
        type: "redirect",
        return_url: `${proto}://${host}/autoteka?success=1&vin=${encodeURIComponent(vin)}`,
      },
      description: `Автотека · отчёт по VIN ${vin}${premium ? " (Премиум)" : ""}`,
      metadata: { type: "report", vin, premium },
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("[autoteka/pay] YooKassa create payment failed", res.status, detail);
    let providerDetail = "";
    try { const j = JSON.parse(detail); providerDetail = j.description || j.code || detail; } catch { providerDetail = detail; }
    return NextResponse.json({ error: "provider_error", yookassa_status: res.status, detail: providerDetail }, { status: 502 });
  }
  const payment = await res.json();
  if (payment.status !== "pending" || !payment.confirmation?.confirmation_url) {
    console.error("[autoteka/pay] YooKassa unexpected payment state", JSON.stringify(payment));
    return NextResponse.json({ error: "provider_unexpected" }, { status: 502 });
  }

  const { data: payRow, error: payErr } = await admin
    .from("payments")
    .insert({
      user_id: user.id,
      amount,
      provider: "yookassa",
      provider_id: payment.id,
      status: "pending",
      meta: { type: "report", vin, premium },
    })
    .select()
    .single();

  if (payErr) return NextResponse.json({ error: payErr.message, detail: payErr.message }, { status: 500 });

  const { data: reportRow, error: reportErr } = await admin
    .from("reports")
    .insert({
      user_id: user.id,
      vin,
      payment_id: payRow.id,
      status: "pending",
      payload: { premium },
    })
    .select()
    .single();

  if (reportErr) return NextResponse.json({ error: reportErr.message, detail: reportErr.message }, { status: 500 });

  return NextResponse.json({
    confirmation_url: payment.confirmation.confirmation_url,
    payment_id: payRow.id,
    report_id: reportRow.id,
  });
}
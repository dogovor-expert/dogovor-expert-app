import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const REPORT_PRICE = 199;
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

  const shopId = process.env.YOOKASSA_SHOP_ID;
  const secretKey = process.env.YOOKASSA_SECRET_KEY;
  if (!shopId || !secretKey) {
    return NextResponse.json({ error: "payment_unavailable" }, { status: 503 });
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
      "Idempotence-Key": randomUUID(),
      Authorization: "Basic " + Buffer.from(`${shopId}:${secretKey}`).toString("base64"),
    },
    body: JSON.stringify({
      amount: { value: REPORT_PRICE.toFixed(2), currency: "RUB" },
      capture: true,
      confirmation: {
        type: "redirect",
        return_url: `${proto}://${host}/autoteka?success=1&vin=${encodeURIComponent(vin)}`,
      },
      description: `Автотека · отчёт по VIN ${vin}`,
      metadata: { type: "report", vin },
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: "provider_error" }, { status: 502 });
  }
  const payment = await res.json();
  if (payment.status !== "pending" || !payment.confirmation?.confirmation_url) {
    return NextResponse.json({ error: "provider_unexpected" }, { status: 502 });
  }

  const { data: payRow, error: payErr } = await admin
    .from("payments")
    .insert({
      user_id: user.id,
      amount: REPORT_PRICE,
      provider: "yookassa",
      provider_id: payment.id,
      status: "pending",
      meta: { type: "report", vin },
    })
    .select()
    .single();

  if (payErr) return NextResponse.json({ error: payErr.message }, { status: 500 });

  const { data: reportRow, error: reportErr } = await admin
    .from("reports")
    .insert({
      user_id: user.id,
      vin,
      payment_id: payRow.id,
      status: "pending",
    })
    .select()
    .single();

  if (reportErr) return NextResponse.json({ error: reportErr.message }, { status: 500 });

  return NextResponse.json({
    confirmation_url: payment.confirmation.confirmation_url,
    payment_id: payRow.id,
    report_id: reportRow.id,
  });
}
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const STD_PRICE = 199;
const PREM_PRICE = 299;
const VIN_RE = /^[A-HJ-NPR-Z0-9]{17}$/;
const PRO_MONTHLY_FREE = 5;

async function isProUser(admin: any, userId: string): Promise<boolean> {
  const { data: subs } = await admin
    .from("subscriptions")
    .select("status, period_end")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(5);
  const now = new Date();
  return (subs ?? []).some(
    (s: any) =>
      s.status === "active" &&
      s.period_end &&
      new Date(String(s.period_end)) >= now
  );
}

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

  // PRO-перк: 5 бесплатных отчётов в месяц. Если квота есть — генерируем бесплатно.
  try {
    const pro = await isProUser(admin, user.id);
    if (pro) {
      const ym = new Date().toISOString().slice(0, 7); // YYYY-MM
      const { data: usageRow } = await admin
        .from("autoteka_usage")
        .select("used")
        .eq("user_id", user.id)
        .eq("ym", ym)
        .single();
      const used = Number(usageRow?.used ?? 0);
      if (used < PRO_MONTHLY_FREE) {
        const { collectReport } = await import("@/lib/tronk");
        const bundle = await collectReport(vin, premium);
        const ready = Boolean((bundle.sources as any)?.reportjson);
        const reportRow = await admin
          .from("reports")
          .insert({
            user_id: user.id,
            vin,
            payment_id: randomUUID(),
            status: ready ? "ready" : "pending",
            payload: bundle.sources,
          })
          .select()
          .single();
        if (reportRow.error) {
          return NextResponse.json({ error: reportRow.error.message }, { status: 500 });
        }
        await admin
          .from("autoteka_usage")
          .upsert(
            { user_id: user.id, ym, used: used + 1 },
            { onConflict: "user_id,ym" }
          );
        return NextResponse.json({
          free: true,
          report_id: reportRow.data.id,
          status: ready ? "ready" : "pending",
        });
      }
      // Квота исчерпана — идём по платному пути
      return NextResponse.json(
        { error: "quota_exceeded", free_limit: PRO_MONTHLY_FREE, used },
        { status: 402 }
      );
    }
  } catch {
    // Таблица авто-квоты ещё не создана (нужна миграция) — молча переходим к платеже.
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
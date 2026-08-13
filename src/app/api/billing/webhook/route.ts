import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  if (!process.env.YOOKASSA_SECRET_KEY) {
    return NextResponse.json({ error: "disabled" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const event = body?.event;
  const payment = body?.object;
  if (!payment?.id) return NextResponse.json({ ok: true });
  if (event !== "payment.succeeded") return NextResponse.json({ ok: true });

  const admin = createAdminClient();
  const { data: rows } = await admin
    .from("payments")
    .select("id, user_id, status, meta")
    .eq("provider_id", payment.id)
    .limit(1);

  if (!rows || rows.length === 0) return NextResponse.json({ ok: true });
  const row = rows[0];
  if (row.status === "paid") return NextResponse.json({ ok: true });

  const paid = payment.status === "succeeded";
  await admin.from("payments").update({ status: paid ? "paid" : "failed" }).eq("id", row.id);

  if (paid) {
    const plan = row.meta?.plan ?? "pro";
    const now = new Date();
    const end = new Date(now.getTime() + 30 * 86400000);
    await admin.from("subscriptions").insert({
      user_id: row.user_id,
      plan,
      status: "active",
      period_start: now.toISOString(),
      period_end: end.toISOString(),
      yookassa_payment_method_id: payment.payment_method?.id ?? null,
    });
  }

  return NextResponse.json({ ok: true });
}
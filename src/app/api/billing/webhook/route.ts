import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const DAY_MS = 86400000;

export async function POST(req: Request) {
  if (!process.env.YOOKASSA_SECRET_KEY) {
    return NextResponse.json({ error: "disabled" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const event = body?.event;
  const payment = body?.object;
  if (!payment?.id) return NextResponse.json({ ok: true });

  const admin = createAdminClient();
  const { data: rows } = await admin
    .from("payments")
    .select("id, user_id, status, meta")
    .eq("provider_id", payment.id)
    .limit(1);

  if (!rows || rows.length === 0) return NextResponse.json({ ok: true });
  const row = rows[0];
  const paymentMethodId = payment.payment_method?.id ?? null;

  if (event === "payment.canceled" || event === "payment.refund.succeeded") {
    if (row.status !== "paid") {
      await admin.from("payments").update({ status: "canceled" }).eq("id", row.id);
    }
    return NextResponse.json({ ok: true });
  }

  if (event !== "payment.succeeded") return NextResponse.json({ ok: true });
  if (row.status === "paid") return NextResponse.json({ ok: true });

  const paid = payment.status === "succeeded";
  await admin.from("payments").update({ status: paid ? "paid" : "failed" }).eq("id", row.id);

  if (paid) {
    const plan = row.meta?.plan ?? "pro";
    const now = new Date();

    // Если подписка с автопродлением ещё активна — продлеваем период,
    // иначе создаём новую запись (обычная оплата).
    const { data: subs } = await admin
      .from("subscriptions")
      .select("id, period_end, auto_renewal, yookassa_payment_method_id")
      .eq("user_id", row.user_id)
      .eq("status", "active")
      .order("period_end", { ascending: false })
      .limit(1);

    const activeSub = (subs ?? []).find(
      (s) => s.period_end && new Date(String(s.period_end)) > now
    );

    if (activeSub && activeSub.auto_renewal) {
      const base = new Date(String(activeSub.period_end));
      const extended = new Date(base.getTime() + 30 * DAY_MS);
      await admin
        .from("subscriptions")
        .update({
          period_end: extended.toISOString(),
          yookassa_payment_method_id: paymentMethodId ?? activeSub.yookassa_payment_method_id,
        })
        .eq("id", activeSub.id);
    } else {
      const end = new Date(now.getTime() + 30 * DAY_MS);
      await admin.from("subscriptions").insert({
        user_id: row.user_id,
        plan,
        status: "active",
        period_start: now.toISOString(),
        period_end: end.toISOString(),
        yookassa_payment_method_id: paymentMethodId,
        auto_renewal: false,
      });
    }
  }

  return NextResponse.json({ ok: true });
}
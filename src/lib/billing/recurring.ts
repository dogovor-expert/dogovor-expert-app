import { randomUUID } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { currentProPrice } from "@/lib/pricing";

export interface RenewSubInput {
  id: string;
  user_id: string;
  plan?: string;
  yookassa_payment_method_id: string;
}

export type RenewResult =
  | "charged"
  | "skipped_already_charged"
  | "provider_error"
  | "exception";

/**
 * Инициирует рекуррентное списание по сохранённой карте (ЮKassa payment_method_id).
 * Используется и планировщиком (cron), и «ленивым» автопродлением при заходе
 * пользователя. Дедуп предотвращает двойное списание в рамках одного периода.
 */
export async function initiateRecurringRenewal(
  admin: SupabaseClient,
  sub: RenewSubInput
): Promise<RenewResult> {
  const shopId = (process.env.YOOKASSA_SHOP_ID ?? "").trim();
  const secretKey = (process.env.YOOKASSA_SECRET_KEY ?? "").trim();
  if (!shopId || !secretKey) return "exception";

  const { data: existing } = await admin
    .from("payments")
    .select("id, status, meta")
    .eq("user_id", sub.user_id)
    .in("status", ["pending", "paid"])
    .limit(20);
  const alreadyCharged = (existing ?? []).some(
    (p: { meta?: Record<string, unknown> | null }) => p?.meta?.renewal_for === sub.id
  );
  if (alreadyCharged) return "skipped_already_charged";

  const price = currentProPrice();
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
        description: "PRO-подписка · 30 дней · автопродление (recurring)",
        metadata: {
          user_id: sub.user_id,
          plan: sub.plan ?? "pro",
          auto_renewal: "true",
          renewal_for: sub.id,
        },
      }),
    });
    if (!res.ok) {
      // Карта протухла/невалидна — выключаем автопродление, чтобы не спамить.
      await admin.from("subscriptions").update({ auto_renewal: false }).eq("id", sub.id);
      return "provider_error";
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
    return "charged";
  } catch {
    return "exception";
  }
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { initiateRecurringRenewal } from "@/lib/billing/recurring";

const DAY_MS = 86400000;
// Ленивое автопродление: списываем, когда до/после истечения не более окна.
const RENEW_GRACE_DAYS = 7;
const RENEW_LOOKAHEAD_DAYS = 3;

// M9: недолгий in-memory кеш выборки подписок, чтобы не бить БД на каждый
// GET статуса (навигация по страницам дергает /api/subscription-status часто).
// Ленивое автопродление (ниже) НЕ кешируется — триггер должен срабатывать.
type SubsRow = {
  id: string;
  plan: string;
  status: string;
  period_end: string | null;
  auto_renewal: boolean;
  yookassa_payment_method_id: string | null;
};
const subsCache = new Map<string, { ts: number; subs: SubsRow[] | null }>();
const SUBS_TTL_MS = 30_000;

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ subscription_active: false }, { status: 200 });
  }

  let subs: SubsRow[] | null = null;
  const cached = subsCache.get(user.id);
  if (cached && Date.now() - cached.ts < SUBS_TTL_MS) {
    subs = cached.subs;
  } else {
    const { data } = await supabase
      .from("subscriptions")
      .select("id, plan, status, period_end, auto_renewal, yookassa_payment_method_id")
      .eq("user_id", user.id)
      .order("period_start", { ascending: false, nullsFirst: false })
      .limit(10);
    subs = (data as SubsRow[] | null) ?? null;
    subsCache.set(user.id, { ts: Date.now(), subs });
  }

  const now = new Date();
  const active = (subs ?? []).find(
    (s) => s.status === "active" && s.period_end && new Date(String(s.period_end)) >= now
  );

  // Ленивое автопродление при заходе (работает и без cron, напр. на Hobby-тарифе Vercel).
  if (active?.auto_renewal && active?.yookassa_payment_method_id && active?.period_end) {
    const end = new Date(String(active.period_end)).getTime();
    const withinLookahead = end <= now.getTime() + RENEW_LOOKAHEAD_DAYS * DAY_MS;
    const withinGrace = end >= now.getTime() - RENEW_GRACE_DAYS * DAY_MS;
    if (withinLookahead && withinGrace) {
      try {
        const admin = createAdminClient();
        await initiateRecurringRenewal(admin, {
          id: active.id,
          user_id: user.id,
          plan: active.plan,
          yookassa_payment_method_id: active.yookassa_payment_method_id,
        });
      } catch {
        // не блокируем ответ статуса из-за ошибки продления
      }
    }
  }

  return NextResponse.json({
    subscription_active: !!active,
    plan: active?.plan ?? (subs?.[0]?.plan ?? "free"),
    period_end: active?.period_end ?? null,
    auto_renewal: active?.auto_renewal ?? false,
    has_payment_method: !!active?.yookassa_payment_method_id,
    renew_link_available: !!active?.yookassa_payment_method_id,
  });
}
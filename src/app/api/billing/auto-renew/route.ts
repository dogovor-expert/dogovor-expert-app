import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { currentProPrice } from "@/lib/pricing";
import { isSameOrigin } from "@/lib/admin-auth";
import { limiters, clientIp, checkRateLimit, rateLimitResponse } from "@/lib/ratelimit";
import { withCsrf } from "@/lib/csrf";

interface SubscriptionRow {
  id: string;
  status: string | null;
  period_end: string | null;
  auto_renewal: boolean | null;
  yookassa_payment_method_id: string | null;
}

async function postHandler(req: Request) {
  // CSRF: реальное списание с сохранённой карты допустимо только с same-origin.
  if (!isSameOrigin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const rl = await checkRateLimit(limiters.billing, clientIp(req));
  if (!rl.ok) return rateLimitResponse(rl.retryAfter);

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

  const subsResult = await supabase
    .from("subscriptions")
    .select("id, status, period_end, auto_renewal, yookassa_payment_method_id")
    .eq("user_id", user.id)
    .order("period_end", { ascending: false })
    .limit(5);
  const rawSubs: unknown = subsResult.data;
  const subs = Array.isArray(rawSubs) ? (rawSubs as SubscriptionRow[]) : [];

  const now = new Date();
  const active = (subs ?? []).find(
    (s) => s.status === "active" && s.period_end && new Date(String(s.period_end)) >= now
  );

  if (!active) {
    return NextResponse.json({ error: "no_active_subscription" }, { status: 400 });
  }
  if (!active.yookassa_payment_method_id) {
    return NextResponse.json({ error: "no_saved_payment_method" }, { status: 400 });
  }

  // Анти-дабл-чардж (аудитор 2026-09-12): если за последние 10 минут уже
  // создавалась попытка автопродления (pending — списание в процессе/не
  // подтверждено; succeeded — уже списано), не отправляем повторное
  // безвозвратное capture:true списание.
  const admin = createAdminClient();
  const recentSince = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { data: inFlight } = await admin
    .from("payments")
    .select("id")
    .eq("user_id", user.id)
    .eq("meta->>auto_renewal", true)
    .in("status", ["pending", "succeeded"])
    .gte("created_at", recentSince)
    .limit(1);
  if (inFlight && inFlight.length > 0) {
    return NextResponse.json(
      { error: "renew_in_progress", message: "Продление уже выполняется — не нажимайте повторно" },
      { status: 409 }
    );
  }

  const host = req.headers.get("host") ?? "dogovor.expert";
  const proto = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
  const price = currentProPrice();

  // Детерминированный идемпотентный ключ (аудитор 2026-09-12): раньше был
  // randomUUID — каждый повторный вызов (двойной клик, ретрай фронта) создавал
  // НОВЫЙ платёж с capture:true = двойное списание. Ключ «подписка + бакет
  // 5 минут»: всплеск дублей дедуплицируется на стороне YooKassa (окно
  // идемпотентности 24ч), а через 5+ минут легитимный ретрай после отказа —
  // возможен. От повторного УСПЕШНОГО списания защищает пре-чек выше
  // (pending/succeeded за 10 минут → 409).
  const idempotenceKey = createHash("sha256")
    .update(`renew:${active.id}:${Math.floor(Date.now() / 300000)}`)
    .digest("hex");

  const res = await fetch("https://api.yookassa.ru/v3/payments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotence-Key": idempotenceKey,
      Authorization: "Basic " + Buffer.from(`${shopId}:${secretKey}`).toString("base64"),
    },
    body: JSON.stringify({
      amount: { value: price.toFixed(2), currency: "RUB" },
      capture: true,
      payment_method_id: active.yookassa_payment_method_id,
      description: "PRO-подписка · 30 дней · автопродление",
      metadata: { user_id: user.id, plan: "pro", auto_renewal: "true" },
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: "provider_error" }, { status: 502 });
  }
  const payment = (await res.json()) as { id: string; status: string };

  await admin.from("payments").insert({
    user_id: user.id,
    amount: price,
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

export const POST = withCsrf(postHandler);
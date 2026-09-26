import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { currentProPrice } from "@/lib/pricing";
import { AI_PLAN_PRICE_RUB, AI_PLAN_QUESTIONS, AI_PLAN_PERIOD_DAYS } from "@/lib/ai/pricing";
import { withCsrf } from "@/lib/csrf";
import { isSameOrigin } from "@/lib/admin-auth";
import { limiters, checkRateLimit, rateLimitResponse } from "@/lib/ratelimit";
import { logUserEvent, SERVER_SESSION_PREFIX } from "@/lib/userEvents";

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

  // План: "pro" (по умолчанию) или "ai" (тариф «AI-юрист»: 490 ₽/мес,
  // 200 вопросов, квота выставляется вебхуком при активации).
  let plan: "pro" | "ai" = "pro";
  try {
    const parsed = (await req.json()) as { plan?: unknown };
    if (parsed?.plan === "ai") plan = "ai";
    else if (parsed?.plan !== undefined && parsed?.plan !== "pro") {
      return NextResponse.json({ error: "unknown_plan" }, { status: 400 });
    }
  } catch {
    plan = "pro";
  }
  const price = plan === "ai" ? AI_PLAN_PRICE_RUB : currentProPrice();
  const description =
    plan === "ai"
      ? `AI-юрист · ${AI_PLAN_QUESTIONS} вопросов · ${AI_PLAN_PERIOD_DAYS} дней`
      : "PRO-подписка · 30 дней";

  // Идемпотентность (аудитор 2026-09-12): бакет 5 минут — двойной клик
  // создаёт ОДИН платёж в YooKassa; повтор позже (после отмены/истечения
  // pending) получает свежий счёт, как и нужно пользователю.
  const idempotenceKey = createHash("sha256")
    .update(`first-pay:${plan}:${user.id}:${Math.floor(Date.now() / 300000)}`)
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
      confirmation: {
        type: "redirect",
        return_url: `${proto}://${host}/billing?success=1`,
      },
      description,
      metadata: { user_id: user.id, plan },
      save_payment_method: true,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("[billing/create-payment] YooKassa create payment failed", res.status, detail);
    let providerDetail = "";
    try { const j = JSON.parse(detail) as { description?: string; code?: string }; providerDetail = j.description || j.code || detail; } catch { providerDetail = detail; }
    return NextResponse.json({ error: "provider_error", yookassa_status: res.status, detail: providerDetail }, { status: 502 });
  }
  const payment = (await res.json()) as { status?: string; id?: string; confirmation?: { confirmation_url?: string } };
  if (payment.status !== "pending" || !payment.confirmation?.confirmation_url) {
    console.error("[billing/create-payment] YooKassa unexpected payment state", JSON.stringify(payment));
    return NextResponse.json({ error: "provider_unexpected" }, { status: 502 });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("[billing/create-payment] SUPABASE_SERVICE_ROLE_KEY is not set");
    return NextResponse.json({ error: "config_error", detail: "SUPABASE_SERVICE_ROLE_KEY не задан на сервере" }, { status: 503 });
  }
  const admin = createAdminClient();
  const payResult = await admin
    .from("payments")
    .insert({
      user_id: user.id,
      amount: price,
      provider: "yookassa",
      provider_id: payment.id,
      status: "pending",
      meta: { plan },
    })
    .select()
    .single();

  if (payResult.error) return NextResponse.json({ error: payResult.error.message, detail: payResult.error.message }, { status: 500 });
  const data = payResult.data as { id: string } | null;

  // Журнал аналитики: фиксируем создание платежа С СЕРВЕРА (надёжнее
  // клиента). session_id — служебная псевдосессия, привязанная к id платежа
  // YooKassa, чтобы связать «создан» и «оплачен» из вебхука (тот же id).
  await logUserEvent({
    event: "payment_created",
    userId: user.id,
    sessionId: `${SERVER_SESSION_PREFIX}${payment.id}`,
    path: "/billing",
    meta: { plan },
  });

  return NextResponse.json({
    confirmation_url: payment.confirmation.confirmation_url,
    payment_id: data?.id ?? "",
  });
}

export const POST = withCsrf(postHandler);
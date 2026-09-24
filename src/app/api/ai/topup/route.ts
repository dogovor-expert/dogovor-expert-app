import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { withCsrf } from "@/lib/csrf";
import { isSameOrigin } from "@/lib/admin-auth";
import { limiters, checkRateLimit, rateLimitResponse } from "@/lib/ratelimit";
import { aiTopupSchema, validateBody } from "@/lib/validations/api";
import { AI_MIN_TOPUP_KOPEKS } from "@/lib/ai/pricing";
import { logUserEvent, SERVER_SESSION_PREFIX } from "@/lib/userEvents";

/**
 * Создание платежа пополнения AI-баланса (клон billing/create-payment).
 * Зачисление — в billing/webhook по meta.purpose === "ai_topup".
 */
async function postHandler(req: Request) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const rl = await checkRateLimit(limiters.authAction, user.id);
  if (!rl.ok) return rateLimitResponse(rl.retryAfter);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const validation = validateBody(aiTopupSchema, body);
  if (!validation.success) return validation.error;
  const { amountRub } = validation.data;
  if (amountRub * 100 < AI_MIN_TOPUP_KOPEKS) {
    return NextResponse.json({ error: "Минимум 100 ₽" }, { status: 400 });
  }

  const shopId = (process.env.YOOKASSA_SHOP_ID ?? "").trim();
  const secretKey = (process.env.YOOKASSA_SECRET_KEY ?? "").trim();
  if (!shopId || !secretKey) {
    return NextResponse.json({ error: "payment_unavailable" }, { status: 503 });
  }

  const host = req.headers.get("host") ?? "dogovor.expert";
  const proto = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";

  const idempotenceKey = createHash("sha256")
    .update(`ai-topup:${user.id}:${amountRub}:${Math.floor(Date.now() / 300000)}`)
    .digest("hex");

  const res = await fetch("https://api.yookassa.ru/v3/payments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotence-Key": idempotenceKey,
      Authorization: "Basic " + Buffer.from(`${shopId}:${secretKey}`).toString("base64"),
    },
    body: JSON.stringify({
      amount: { value: amountRub.toFixed(2), currency: "RUB" },
      capture: true,
      confirmation: {
        type: "redirect",
        return_url: `${proto}://${host}/ai-yurist?topup=success`,
      },
      description: `Пополнение AI-баланса · ${amountRub} ₽`,
      metadata: { user_id: user.id, purpose: "ai_topup", amount_rub: String(amountRub) },
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("[ai/topup] YooKassa create payment failed", res.status, detail);
    return NextResponse.json({ error: "provider_error" }, { status: 502 });
  }
  const payment = (await res.json()) as { status?: string; id?: string; confirmation?: { confirmation_url?: string } };
  if (payment.status !== "pending" || !payment.confirmation?.confirmation_url) {
    console.error("[ai/topup] YooKassa unexpected payment state", JSON.stringify(payment));
    return NextResponse.json({ error: "provider_unexpected" }, { status: 502 });
  }

  const admin = createAdminClient();
  const payResult = await admin
    .from("payments")
    .insert({
      user_id: user.id,
      amount: amountRub,
      provider: "yookassa",
      provider_id: payment.id,
      status: "pending",
      meta: { purpose: "ai_topup", amount_rub: amountRub },
    })
    .select()
    .single();

  if (payResult.error) {
    return NextResponse.json({ error: payResult.error.message }, { status: 500 });
  }

  await logUserEvent({
    event: "ai_topup_created",
    userId: user.id,
    sessionId: `${SERVER_SESSION_PREFIX}${payment.id}`,
    path: "/ai-yurist",
    meta: { amount_rub: amountRub },
  });

  return NextResponse.json({ confirmation_url: payment.confirmation.confirmation_url });
}

export const POST = withCsrf(postHandler);

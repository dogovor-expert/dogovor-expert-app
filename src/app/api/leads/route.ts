import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSameOrigin } from "@/lib/admin-auth";
import { limiters, clientIp, checkRateLimit, rateLimitResponse } from "@/lib/ratelimit";
import { withCsrf } from "@/lib/csrf";
import { sendEmail, sendTelegram, SUPPORT_EMAIL } from "@/lib/mail";
import { leadSchema, validateBody } from "@/lib/validations/api";
import { smartcaptchaConfigured, verifySmartCaptcha } from "@/lib/smartcaptcha";

const STATUSES = ["new", "paid", "docs", "filed", "done", "canceled"] as const;

async function postHandler(req: Request) {
  // CSRF + same-origin: лид-форма — публичная, но не должна принимать
  // кросс-доменные POST (дроп заявок через чужие сайты).
  if (!isSameOrigin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const rl = await checkRateLimit(limiters.publicForm, clientIp(req));
  if (!rl.ok) return rateLimitResponse(rl.retryAfter);

  const rawBody = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!rawBody) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Капча Yandex SmartCaptcha (когда настроена): защита от спама на
  // Telegram/почту поддержки. Одинаковая семантика с логином: fail-open
  // только при недоступности самого сервиса SmartCaptcha.
  if (smartcaptchaConfigured()) {
    const captchaToken =
      typeof rawBody.captchaToken === "string" ? rawBody.captchaToken : "";
    if (!captchaToken) {
      return NextResponse.json(
        { error: "Подтвердите, что вы не робот" },
        { status: 400 }
      );
    }
    const verdict = await verifySmartCaptcha(captchaToken, clientIp(req));
    if (verdict === "fail") {
      return NextResponse.json(
        { error: "Капча не пройдена — попробуйте ещё раз" },
        { status: 400 }
      );
    }
    if (verdict === "unavailable") {
      console.warn("[leads] SmartCaptcha недоступен — fail-open");
    }
  }

  // Zod-валидация
  const validation = validateBody(leadSchema, rawBody);
  if (!validation.success) {
    return validation.error;
  }
  const body = validation.data;

  const { service, brand, phone, vin } = body;

  const supabase = createAdminClient();
  const leadResult = await supabase
    .from("leads")
    .insert({ service, brand, phone, vin: vin ?? "", status: "new" })
    .select()
    .single();

  if (leadResult.error) return NextResponse.json({ error: leadResult.error.message }, { status: 500 });
  const data: unknown = leadResult.data;

  const text = `Новый лид (растаможка)\nУслуга: ${service}\nБренд: ${brand}\nVIN: ${vin || "—"}\nТел: ${phone}`;
  await sendTelegram("🔔 " + text);
  await sendEmail({
    to: SUPPORT_EMAIL,
    subject: `Новый лид: ${brand}`,
    html: `<div style="font-family:Arial,sans-serif;padding:16px;white-space:pre-wrap;color:#374151;">${text}</div>`,
  });

  return NextResponse.json({ data }, { status: 201 });
}

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  return profile?.is_admin ? supabase : null;
}

export async function GET() {
  const supabase = await requireAdmin();
  if (!supabase) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("leads")
    .select("id, service, brand, vin, phone, status, meta, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

async function patchHandler(req: Request) {
  // CSRF: смена статуса лида — только same-origin.
  if (!isSameOrigin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const supabase = await requireAdmin();
  if (!supabase) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { id?: unknown; status?: unknown } | null;
  if (!body?.id || typeof body.status !== "string" || !STATUSES.includes(body.status as (typeof STATUSES)[number])) {
    return NextResponse.json({ error: "invalid id or status" }, { status: 400 });
  }

  const updResult = await supabase
    .from("leads")
    .update({ status: body.status })
    .eq("id", body.id)
    .select()
    .single();

  if (updResult.error) return NextResponse.json({ error: updResult.error.message }, { status: 500 });
  const data: unknown = updResult.data;
  return NextResponse.json({ data });
}

export const POST = withCsrf(postHandler);

export const PATCH = withCsrf(patchHandler);
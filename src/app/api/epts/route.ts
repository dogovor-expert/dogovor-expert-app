import { NextResponse } from "next/server";
import { z } from "zod";
import { isSameOrigin } from "@/lib/admin-auth";
import { limiters, clientIp, checkRateLimit, rateLimitResponse } from "@/lib/ratelimit";
import { withCsrf } from "@/lib/csrf";
import { sendEmail, sendTelegram, SUPPORT_EMAIL } from "@/lib/mail";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Заявка на выписку из ЭПТС с немедленной оплатой через ЮKassa.
 *
 * Флоу: пользователь заполняет форму → мы создаём платёж ЮKassa (redirect) →
 * сохраняем заявку (leads, service='epts') в статусе payment_pending →
 * возвращаем confirmation_url → клиент уходит на страницу оплаты.
 * Результат оплаты обрабатывает вебхук /api/billing/webhook (ищет заявку
 * по leads.meta->>provider_id), который помечает заявку 'paid' и уведомляет
 * поддержку. Уведомление об оплате уходит ДО того, как оператор начнёт
 * оформлять документ.
 */

import { EPTS_PRICE_RUB } from "@/lib/pricing";

// Раньше здесь стоял литерал `const EPTS_PRICE = 800`, а в UI — другая копия
// того же числа. Теперь цена одна: src/lib/pricing.ts.
const EPTS_PRICE = EPTS_PRICE_RUB;

const eptsSchema = z.object({
  vin: z.string().regex(/^[A-HJ-NPR-Z0-9]{17}$/, "VIN должен содержать 17 символов"),
  epts: z.string().regex(/^[0-9]{15}$/, "Номер ЭПТС должен содержать 15 цифр"),
  email: z.string().email("Некорректный email"),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/, "Некорректный телефон"),
});

type EptsInput = z.infer<typeof eptsSchema>;

interface YookassaPaymentResponse {
  id: string;
  status: string;
  confirmation?: { confirmation_url?: string };
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function postHandler(req: Request) {
  // CSRF: заявка публичная, но не должна приниматься с чужих доменов.
  if (!isSameOrigin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const rl = await checkRateLimit(limiters.publicForm, clientIp(req));
  if (!rl.ok) return rateLimitResponse(rl.retryAfter);

  const rawBody = (await req.json().catch(() => null)) as unknown;
  const parsed = eptsSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Проверьте поля формы", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { vin, epts, email, phone }: EptsInput = parsed.data;

  // Сохраняем заявку в БД (таблица leads, service='epts'), чтобы она была видна
  // в админ-панели даже если платёж не удалось создать (оператор сможет
  // связаться с клиентом).
  let leadId: string | null = null;
  try {
    const supabase = createAdminClient();
    const leadResult = (await supabase.from("leads").insert({
      service: "epts",
      brand: "",
      vin,
      phone,
      status: "new",
      meta: { email, epts },
    }).select("id").single()) as { data: { id: string } | null; error: { message: string } | null };
    if (leadResult.error) {
      console.error("[epts] lead insert failed:", leadResult.error.message);
    } else {
      leadId = leadResult.data?.id ?? null;
    }
  } catch (e) {
    console.error("[epts] lead insert exception:", String(e));
  }

  const shopId = (process.env.YOOKASSA_SHOP_ID ?? "").trim();
  const secretKey = (process.env.YOOKASSA_SECRET_KEY ?? "").trim();
  if (!shopId || !secretKey) {
    console.error("[epts] YOOKASSA env not set");
    const text = `Заявка без оплаты: выписка ЭПТС\nVIN: ${vin}\n№ ЭПТС: ${epts}\nEmail: ${email}\nТелефон: ${phone}`;
    await sendTelegram("⚠️ " + text);
    await sendEmail({
      to: SUPPORT_EMAIL,
      subject: "Заявка: выписка ЭПТС (без оплаты)",
      html: `<div style="font-family:Arial,sans-serif;padding:16px;white-space:pre-wrap;color:#374151;">${escapeHtml(text)}</div>`,
    });
    return NextResponse.json({ error: "payment_unavailable" }, { status: 503 });
  }

  const host = req.headers.get("host") ?? "dogovor.expert";
  const proto = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";

  // Idempotence-Key с 5-минутным тайм-бакетом: защищает от двойного создания
  // платежа при повторной отправке формы, но позволяет оформить заявку заново
  // после отмены/экспирации платежа (раньше ключ был вечным и блокировал повтор).
  const idempotenceBucket = Math.floor(Date.now() / 300000);

  const res = await fetch("https://api.yookassa.ru/v3/payments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotence-Key": Buffer.from(`epts:${vin}:${epts}:${idempotenceBucket}`).toString("base64"),
      Authorization: "Basic " + Buffer.from(`${shopId}:${secretKey}`).toString("base64"),
    },
    body: JSON.stringify({
      amount: { value: EPTS_PRICE.toFixed(2), currency: "RUB" },
      capture: true,
      confirmation: {
        type: "redirect",
        return_url: `${proto}://${host}/epts?success=1`,
      },
      description: `Выписка из ЭПТС · ${vin}`,
      metadata: { type: "epts", lead_id: leadId ?? "" },
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("[epts] YooKassa create payment failed", res.status, detail);
    let providerDetail = "";
    try {
      const j: unknown = JSON.parse(detail);
      const desc = (j as { description?: unknown }).description;
      const code = (j as { code?: unknown }).code;
      providerDetail = (typeof desc === "string" && desc) || (typeof code === "string" && code) || detail;
    } catch {
      providerDetail = detail;
    }
    const text = `Заявка без оплаты: выписка ЭПТС\nVIN: ${vin}\n№ ЭПТС: ${epts}\nEmail: ${email}\nТелефон: ${phone}\nОшибка ЮKassa: ${providerDetail}`;
    await sendTelegram("⚠️ " + text);
    await sendEmail({
      to: SUPPORT_EMAIL,
      subject: "Заявка: выписка ЭПТС (ошибка оплаты)",
      html: `<div style="font-family:Arial,sans-serif;padding:16px;white-space:pre-wrap;color:#374151;">${escapeHtml(text)}</div>`,
    });
    return NextResponse.json({ error: "provider_error", yookassa_status: res.status, detail: providerDetail }, { status: 502 });
  }

  const payment = (await res.json()) as YookassaPaymentResponse;
  if (payment.status !== "pending" || !payment.confirmation?.confirmation_url) {
    console.error("[epts] YooKassa unexpected payment state", JSON.stringify(payment));
    return NextResponse.json({ error: "provider_unexpected" }, { status: 502 });
  }

  // Связываем платёж с заявкой: вебхук будет искать её по meta->>provider_id.
  try {
    const supabase = createAdminClient();
    await supabase
      .from("leads")
      .update({
        status: "payment_pending",
        meta: { email, epts, provider: "yookassa", provider_id: payment.id, amount: EPTS_PRICE },
      })
      .eq("id", leadId ?? "noop");
  } catch (e) {
    console.error("[epts] lead payment link failed:", String(e));
  }

  return NextResponse.json({ confirmation_url: payment.confirmation.confirmation_url }, { status: 201 });
}

export const POST = withCsrf(postHandler);
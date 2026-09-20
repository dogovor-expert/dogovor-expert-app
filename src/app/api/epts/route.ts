import { NextResponse } from "next/server";
import { z } from "zod";
import { isSameOrigin } from "@/lib/admin-auth";
import { limiters, clientIp, checkRateLimit, rateLimitResponse } from "@/lib/ratelimit";
import { withCsrf } from "@/lib/csrf";
import { sendEmail, sendTelegram, SUPPORT_EMAIL } from "@/lib/mail";

/**
 * Заявка на выписку из ЭПТС.
 *
 * MVP: заявка уходит в поддержку (Telegram + email). Платёж и автоматическая
 * выгрузка подключаются отдельно. Запись в БД не выполняется, чтобы не
 * зависеть от схемы таблицы leads (она рассчитана на другой enum услуг).
 */
const eptsSchema = z.object({
  vin: z.string().regex(/^[A-HJ-NPR-Z0-9]{17}$/, "VIN должен содержать 17 символов"),
  epts: z.string().regex(/^[0-9]{15}$/, "Номер ЭПТС должен содержать 15 цифр"),
  email: z.string().email("Некорректный email"),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/, "Некорректный телефон"),
});

type EptsInput = z.infer<typeof eptsSchema>;

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
  const text = `Новая заявка: выписка ЭПТС\nVIN: ${vin}\n№ ЭПТС: ${epts}\nEmail: ${email}\nТелефон: ${phone}`;

  await sendTelegram("🔔 " + text);
  await sendEmail({
    to: SUPPORT_EMAIL,
    subject: "Заявка: выписка ЭПТС",
    html: `<div style="font-family:Arial,sans-serif;padding:16px;white-space:pre-wrap;color:#374151;">${escapeHtml(text)}</div>`,
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}

export const POST = withCsrf(postHandler);

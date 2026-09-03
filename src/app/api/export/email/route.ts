import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { limiters, clientIp, checkRateLimit, rateLimitResponse } from "@/lib/ratelimit";
import { withCsrf } from "@/lib/csrf";
import { isSameOrigin } from "@/lib/admin-auth";
import { sendEmail, isMailConfigured } from "@/lib/mail";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PDF_MAGIC = "%PDF-";

const BODY_HTML = (safeFilename: string) => `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;">
  <h2 style="margin:0 0 12px;color:#111827;">Ваш документ готов</h2>
  <p style="margin:0 0 16px;color:#374151;">Здравствуйте! Во вложении — сформированный на сервисе <b>Dogovor.expert</b> документ <b>${safeFilename}</b>.</p>
  <p style="margin:0 0 16px;color:#374151;">Документ носит справочный характер и не заменяет консультацию юриста по вопросам, требующим квалифицированной проверки.</p>
  <p style="margin:0;color:#6b7280;font-size:12px;">Письмо отправлено автоматически. Отвечать на него не нужно.</p>
</div>`;

async function postHandler(req: Request) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const rl = await checkRateLimit(limiters.emailSend, clientIp(req));
  if (!rl.ok) return rateLimitResponse(rl.retryAfter);

  // Проверяем конфигурацию ДО аутентификации: сначала дешёвый early-return,
  // чтобы не тратить Supabase round-trip при сломанном окружении.
  if (!isMailConfigured()) {
    return NextResponse.json(
      { error: "email_not_configured" },
      { status: 501 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "bad body" }, { status: 400 });
  }

  // Email bombing prevention: only allow sending to authenticated user's email
  const userEmail = user.email ?? "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (email !== userEmail.toLowerCase()) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  const filename =
    typeof body.filename === "string" ? body.filename.trim() : "document";
  const pdfBase64 =
    typeof body.pdfBase64 === "string" ? body.pdfBase64 : "";

  // Cap at 10MB base64 (~7.5MB binary)
  const MAX_BASE64 = 10_000_000;
  if (!pdfBase64 || pdfBase64.length > MAX_BASE64) {
    return NextResponse.json({ error: "invalid_pdf" }, { status: 400 });
  }
  // Verify PDF magic bytes
  const pdfHeader = atob(pdfBase64.slice(0, 20));
  if (!pdfHeader.startsWith(PDF_MAGIC)) {
    return NextResponse.json({ error: "invalid_pdf" }, { status: 400 });
  }

  const safeFilename =
    filename.replace(/[^а-яА-Яa-zA-Z0-9 _-]/g, "").slice(0, 120) + ".pdf";

  // Делегируем отправку в lib/mail.ts: единый fallback-порядок
  // ZeptoMail → Resend → Zoho SMTP. Это устраняет расхождение, при котором
  // роут раньше игнорировал Zoho SMTP и возвращал 501 даже при настроенном
  // Zoho-окружении.
  const ok = await sendEmail({
    to: email,
    subject: "Ваш документ с Dogovor.expert",
    html: BODY_HTML(safeFilename),
    attachments: [
      {
        filename: safeFilename,
        mimeType: "application/pdf",
        contentBase64: pdfBase64,
      },
    ],
  });

  if (!ok) {
    return NextResponse.json(
      { error: "send_failed" },
      { status: 502 }
    );
  }

  return NextResponse.json({ data: { ok: true } });
}

export const POST = withCsrf(postHandler);
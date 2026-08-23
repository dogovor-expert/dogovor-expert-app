import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { limiters, clientIp, checkRateLimit, rateLimitResponse } from "@/lib/ratelimit";
import { getAdminUser } from "@/lib/admin-auth";
import { isSameOrigin } from "@/lib/admin-auth";
import { logAdminAction } from "@/lib/audit";
import { SUPPORT_EMAIL } from "@/lib/site";
import { sendTelegram } from "@/lib/mail";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TYPES = ["doc_error", "site_bug", "feature_request", "other"] as const;
const TOOLS = ["Автотека", "ОСАГО", "Конвертер", "Калькуляторы", "Сканер документов", "Личный кабинет", "Другое"];
const TYPE_LABELS: Record<string, string> = {
  doc_error: "Ошибка в документе",
  site_bug: "Не работает функция сайта",
  feature_request: "Новый документ/инструмент",
  other: "Другое",
};

const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));

async function sendNotification(p: {
  ticketNo: string; type: string; docName: string | null; tool: string | null;
  message: string; email: string; tech: unknown; screenshotUrls: string[];
}) {
  const zeptoToken = process.env.ZEPTOMAIL_TOKEN;
  const resendKey = process.env.RESEND_API_KEY;
  if (!zeptoToken && !resendKey) return;

  const shots = p.screenshotUrls.length
    ? `<p style="margin:0 0 12px;color:#374151;">Скриншоты: ${p.screenshotUrls
        .map((u) => `<a href="${esc(u)}">${esc(u)}</a>`)
        .join("<br>")}</p>`
    : "";

  const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
    <h2 style="margin:0 0 12px;color:#111827;">Новое обращение ${esc(p.ticketNo)}</h2>
    <p style="margin:0 0 8px;color:#374151;"><b>Тип:</b> ${esc(TYPE_LABELS[p.type] || p.type)}</p>
    ${p.docName ? `<p style="margin:0 0 8px;color:#374151;"><b>Документ:</b> ${esc(p.docName)}</p>` : ""}
    ${p.tool ? `<p style="margin:0 0 8px;color:#374151;"><b>Инструмент:</b> ${esc(p.tool)}</p>` : ""}
    <p style="margin:0 0 8px;color:#374151;"><b>От:</b> ${esc(p.email)}</p>
    <p style="margin:0 0 12px;color:#374151;white-space:pre-wrap;">${esc(p.message)}</p>
    ${shots}
    <p style="margin:0 0 8px;color:#6b7280;font-size:12px;">Техданные: ${esc(JSON.stringify(p.tech))}</p>
    <p style="margin:0;color:#6b7280;font-size:12px;">Автоуведомление. Отвечать с учётной почты сервиса.</p>
  </div>`;

  const fromRaw = process.env.EMAIL_FROM || "no-reply@dogovor.expert";
  const fromName = process.env.EMAIL_FROM_NAME || "Dogovor.expert";

  try {
    if (zeptoToken) {
      await fetch("https://api.zeptomail.com/v1.1/email/single", {
        method: "POST",
        headers: { Authorization: `Zoho-enczapikey ${zeptoToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: { address: fromRaw, name: fromName },
          to: [{ email_address: { address: SUPPORT_EMAIL } }],
          subject: `Обращение ${p.ticketNo}: ${TYPE_LABELS[p.type] || p.type}`,
          htmlbody: html,
        }),
      });
    } else {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: `${fromName} <${fromRaw}>`,
          to: [SUPPORT_EMAIL],
          subject: `Обращение ${p.ticketNo}: ${TYPE_LABELS[p.type] || p.type}`,
          html,
        }),
      });
    }
  } catch {
    /* уведомление не критично для приёма обращения */
  }

  try {
    await sendTelegram(
      `🔔 Новое обращение ${p.ticketNo}\nТип: ${TYPE_LABELS[p.type] || p.type}\nОт: ${p.email}\n${p.message}`
    );
  } catch {
    /* telegram не критичен */
  }
}

export async function POST(req: Request) {
  const rl = await checkRateLimit(limiters.feedbackForm, clientIp(req));
  if (!rl.ok) return rateLimitResponse(rl.retryAfter);

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "bad body" }, { status: 400 });
  }

  const type = body.type;
  if (!TYPES.includes(type)) {
    return NextResponse.json({ error: "invalid_type" }, { status: 400 });
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (message.length < 5 || message.length > 5000) {
    return NextResponse.json({ error: "invalid_message" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  if (body.consent !== true) {
    return NextResponse.json({ error: "consent_required" }, { status: 400 });
  }

  const docSlug = typeof body.docSlug === "string" ? body.docSlug.slice(0, 200) : null;
  const docName = typeof body.docName === "string" ? body.docName.slice(0, 200) : null;
  if (type === "doc_error" && !docSlug) {
    return NextResponse.json({ error: "doc_required" }, { status: 400 });
  }

  const tool = typeof body.tool === "string" ? body.tool.slice(0, 100) : null;
  if (type === "site_bug" && (!tool || !TOOLS.includes(tool))) {
    return NextResponse.json({ error: "tool_required" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const id = randomUUID();
  const ticketNo = "FB-" + id.replace(/-/g, "").slice(0, 6).toUpperCase();

  // Скриншоты -> Storage
  const screenshotUrls: string[] = [];
  const shots = Array.isArray(body.screenshots) ? body.screenshots.slice(0, 3) : [];
  for (const s of shots) {
    if (!s || typeof s.dataUrl !== "string" || !s.dataUrl.startsWith("data:")) continue;
    const m = s.dataUrl.match(/^data:(.*?);base64,(.*)$/);
    if (!m) continue;
    const mime = m[1];
    if (!["image/png", "image/jpeg", "image/webp"].includes(mime)) continue;
    const buf = Buffer.from(m[2], "base64");
    if (buf.length > 5 * 1024 * 1024) continue;
    const ext = mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
    const path = `${id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("feedback")
      .upload(path, buf, { contentType: mime, upsert: false });
    if (upErr) continue;
    const { data: urlData } = supabase.storage.from("feedback").getPublicUrl(path);
    if (urlData?.publicUrl) screenshotUrls.push(urlData.publicUrl);
  }

  const tech = body.tech && typeof body.tech === "object" ? body.tech : null;

  const { error } = await supabase.from("feedback").insert({
    id,
    ticket_no: ticketNo,
    type,
    doc_slug: docSlug,
    doc_name: docName,
    tool,
    message,
    email,
    screenshots: screenshotUrls.length ? screenshotUrls : null,
    tech,
    consent: true,
    status: "new",
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await sendNotification({ ticketNo, type, docName, tool, message, email, tech, screenshotUrls });

  return NextResponse.json({ ok: true, ticket_no: ticketNo });
}

// ===== Админ: список заявок с фильтрами =====
export async function GET(req: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const supabase = createAdminClient();
  const url = new URL(req.url);
  const type = url.searchParams.get("type");
  const status = url.searchParams.get("status");

  let query = supabase.from("feedback").select("*").order("created_at", { ascending: false }).limit(200);
  if (type) query = query.eq("type", type);
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// ===== Админ: смена статуса заявки =====
export async function PATCH(req: Request) {
  if (!isSameOrigin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const rl = await checkRateLimit(limiters.adminAction, clientIp(req));
  if (!rl.ok) return rateLimitResponse(rl.retryAfter);

  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id : null;
  const status = typeof body?.status === "string" ? body.status : null;
  if (!id || !["new", "done", "spam"].includes(status)) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("feedback").update({ status }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logAdminAction({
    adminId: admin.id,
    action: "feedback_status",
    resource: "feedback",
    resourceId: id,
    meta: { status },
  });
  return NextResponse.json({ ok: true });
}

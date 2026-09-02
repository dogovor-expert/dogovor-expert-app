import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { limiters, clientIp, checkRateLimit, rateLimitResponse } from "@/lib/ratelimit";
import { getAdminUser, isSameOrigin } from "@/lib/admin-auth";
import { logAdminAction } from "@/lib/audit";
import { SUPPORT_EMAIL } from "@/lib/site";
import { sendTelegram } from "@/lib/mail";
import { feedbackSchema, validateBody } from "@/lib/validations/api";

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
  message: string; email: string; tech: unknown; screenshotPaths: string[];
}) {
  const zeptoToken = process.env.ZEPTOMAIL_TOKEN;
  const resendKey = process.env.RESEND_API_KEY;
  if (!zeptoToken && !resendKey) return;

  // C5: бакет приватный — ссылки на скриншоты не публикуем в письме (ПДн).
  // Админ смотрит скриншоты в панели по signed URL.
  const shots = p.screenshotPaths.length
    ? `<p style="margin:0 0 12px;color:#374151;">Скриншоты: ${p.screenshotPaths.length} шт. — доступны в админке по signed URL.</p>`
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

  const rawBody = await req.json().catch(() => null);
  if (!rawBody) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Zod-валидация
  const validation = validateBody(feedbackSchema, rawBody);
  if (!validation.success) {
    return validation.error;
  }
  const body = validation.data;

  // Дополнительная бизнес-логика, которую нельзя выразить в Zod
  const { type, docSlug, tool } = body;
  if (type === "doc_error" && !docSlug) {
    return NextResponse.json({ error: "doc_required" }, { status: 400 });
  }
  if (type === "site_bug" && (!tool || !TOOLS.includes(tool))) {
    return NextResponse.json({ error: "tool_required" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const id = randomUUID();
  const ticketNo = "FB-" + id.replace(/-/g, "").slice(0, 6).toUpperCase();

  // Скриншоты -> Storage (C5: бакет приватный, храним путь, отдаём через signed URL)
  const screenshotPaths: string[] = [];
  const shots = body.screenshots ?? [];
  for (const s of shots) {
    if (!s.dataUrl.startsWith("data:")) continue;
    const m = s.dataUrl.match(/^data:(.*?);base64,(.*)$/);
    if (!m) continue;
    const mime = m[1];
    if (!["image/png", "image/jpeg", "image/webp"].includes(mime)) continue;
    const base64Data = m[2];
    if (base64Data.length > 7_000_000) continue;
    const buf = Buffer.from(base64Data, "base64");
    if (buf.length > 5 * 1024 * 1024) continue;
    const ext = mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
    const path = `${id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("feedback")
      .upload(path, buf, { contentType: mime, upsert: false });
    if (upErr) continue;
    screenshotPaths.push(path);
  }

  const tech = body.tech ?? null;

  const { error } = await supabase.from("feedback").insert({
    id,
    ticket_no: ticketNo,
    type,
    doc_slug: docSlug ?? null,
    doc_name: body.docName ?? null,
    tool: tool ?? null,
    message: body.message,
    email: body.email,
    screenshots: screenshotPaths.length ? screenshotPaths : null,
    tech,
    consent: true,
    status: "new",
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await sendNotification({ ticketNo, type, docName: body.docName ?? null, tool: tool ?? null, message: body.message, email: body.email, tech, screenshotPaths });

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

  // C5: бакет приватный — отдаём скриншоты только админу через signed URL (5 мин).
  const rows = await Promise.all(
    (data ?? []).map(async (row: { screenshots?: string[] | null }) => {
      if (Array.isArray(row.screenshots) && row.screenshots.length) {
        const signed = await Promise.all(
          row.screenshots.map(async (p: string) => {
            const { data: sd } = await supabase.storage
              .from("feedback")
              .createSignedUrl(p, 300);
            return sd?.signedUrl ?? null;
          })
        );
        return { ...row, screenshots: signed.filter(Boolean) as string[] };
      }
      return row;
    })
  );

  return NextResponse.json({ data: rows });
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

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { withCsrf } from "@/lib/csrf";
import { isSameOrigin } from "@/lib/admin-auth";
import { limiters, checkRateLimit, rateLimitResponse } from "@/lib/ratelimit";
import { logSignAction } from "@/lib/sign-audit";
import { renderTemplateDocument } from "@/lib/renderDocument";
import { buildPdf } from "@/lib/exportPdf";
import { preparePAdESPlaceholder, hexLengthOfCms } from "@/lib/embedPades";
import type { LegalTemplate } from "@/data/types";

const SHA256_HEX = "sha-256";

async function sha256Hex(data: ArrayBuffer): Promise<string> {
  const buffer = await crypto.subtle.digest(SHA256_HEX, data);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function postHandler(req: Request) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const rl = await checkRateLimit(limiters.signPrepare, `sign:prepare:${user.id}`);
  if (!rl.ok) return rateLimitResponse(rl.retryAfter);

  let body: { documentId?: string; designId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad body" }, { status: 400 });
  }

  const { documentId, designId } = body;
  if (!documentId) return NextResponse.json({ error: "documentId required" }, { status: 400 });

  // Загружаем документ и проверяем владение
  const admin = createAdminClient();
  const { data: doc, error: docError } = await admin
    .from("documents")
    .select("id, user_id, title, html, data, template_id")
    .eq("id", documentId)
    .single();

  if (docError || !doc) {
    return NextResponse.json({ error: "document not found" }, { status: 404 });
  }
  if (doc.user_id !== user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  // Загружаем шаблон для рендера через единый движок
  const { data: template, error: tmplError } = await admin
    .from("templates")
    .select("*")
    .eq("id", doc.template_id)
    .single();

  if (tmplError || !template) {
    return NextResponse.json({ error: "template not found" }, { status: 404 });
  }

  // Рендерим HTML документа через единый движок (server-side для гарантии идентичности)
  const html = renderTemplateDocument(template as LegalTemplate, doc.data ?? {});

  // Генерируем PDF на сервере через единый рендерер (с дизайном)
  const { blob } = await buildPdf(html, {
    title: doc.title,
    design: (designId as "classic" | "minimal" | "brand") ?? "classic",
  });

  const pdfArrayBuffer = await blob.arrayBuffer();
  const pdfBytes = new Uint8Array(pdfArrayBuffer);

  // Создаём PAdES плейсхолдер: placeholder PDF + signedContent (байты для подписания)
  // Используем максимальную длину CMS (примерно 4000 байт base64 = ~3000 байт DER)
  // Для надёжности используем запас - 10000 hex символов (5000 байт)
  const cmsHexLen = 10000;
  const { placeholder, signedContent } = await preparePAdESPlaceholder(pdfBytes, cmsHexLen, {
    signerName: "dogovor.expert user",
    signingDate: new Date(),
    reason: "Подписание документа на dogovor.expert",
    location: "",
    contactInfo: "https://dogovor.expert",
  });

  // Считаем SHA-256 хэш исходного PDF (для аудита)
  const documentHash = await sha256Hex(pdfBytes.buffer);

  // Логируем подготовку
  await logSignAction({
    userId: user.id,
    documentId,
    action: "prepare",
    documentHash,
    ip: req.headers.get("x-forwarded-for"),
    userAgent: req.headers.get("user-agent"),
    meta: { designId, cmsHexLen },
  });

  // Возвращаем: placeholder PDF (для встраивания подписи), signedContent (что подписывать), cmsHexLen
  return NextResponse.json({
    placeholderPdfBase64: Buffer.from(placeholder).toString("base64"),
    signedContentBase64: Buffer.from(signedContent).toString("base64"),
    cmsHexLen,
    documentHash,
    documentId,
  });
}

export const POST = withCsrf(postHandler);
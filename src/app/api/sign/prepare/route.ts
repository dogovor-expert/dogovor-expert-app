import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { withCsrf } from "@/lib/csrf";
import { isSameOrigin } from "@/lib/admin-auth";
import { limiters, checkRateLimit, rateLimitResponse } from "@/lib/ratelimit";
import { logSignAction } from "@/lib/sign-audit";
import { buildPdf } from "@/lib/exportPdf";
import { preparePAdESPlaceholder } from "@/lib/embedPades";
import { buildSignableDocument, normalizeReserve } from "@/lib/sign-prepare";

const SHA256_HEX = "sha-256";
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-9a-f][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
/** Дизайны PDF, поддерживаемые рендерером (см. ExportPdfOptions.design). */
type DesignName = "classic" | "minimal" | "brand";

async function sha256Hex(data: ArrayBuffer): Promise<string> {
  const buffer = await crypto.subtle.digest(SHA256_HEX, data);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

interface DocumentRow {
  id: string;
  user_id: string;
  title: string | null;
  fields: unknown;
  template_id: string;
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

  let body: { documentId?: string; designId?: string; cmsHexLen?: number };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "bad body" }, { status: 400 });
  }

  const { documentId, designId } = body;
  if (!documentId) {
    return NextResponse.json({ error: "documentId required" }, { status: 400 });
  }
  // documentId уходит в запрос к БД — пропускаем только UUID.
  if (!UUID_RE.test(documentId)) {
    return NextResponse.json({ error: "invalid documentId" }, { status: 400 });
  }

  // Литеральное сравнение (а не includes) — так TS сужает тип без приведения.
  const design: DesignName =
    designId === "classic" || designId === "minimal" || designId === "brand"
      ? designId
      : "classic";

  // Резерв под CMS: без cmsHexLen — пробный проход (клиент измерит длину
  // подписи и придёт с точным значением, иначе ByteRange не совпадёт).
  const reserve = normalizeReserve(body.cmsHexLen);
  if (reserve === null) {
    return NextResponse.json({ error: "invalid cmsHexLen" }, { status: 400 });
  }
  const isProbe = body.cmsHexLen === undefined || body.cmsHexLen === null;

  // Документ: реальная схема — values в `fields` (jsonb). Колонок html/data НЕТ.
  const admin = createAdminClient();
  const docResult = await admin
    .from("documents")
    .select("id, user_id, title, fields, template_id")
    .eq("id", documentId)
    .single();

  if (docResult.error || !docResult.data) {
    return NextResponse.json({ error: "document not found" }, { status: 404 });
  }
  // Данные из Supabase приходят как any — приводим через unknown (иначе
  // lint ругается на «лишнее» приведение).
  const rawDoc: unknown = docResult.data;
  const doc = rawDoc as DocumentRow;
  if (doc.user_id !== user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  // Шаблон берём из СТАТИЧЕСКОГО каталога (таблицы templates в БД нет),
  // текст — из templatePreviews. Пустой документ подписывать нельзя.
  const signable = buildSignableDocument(doc.template_id, doc.fields);
  if (!signable) {
    return NextResponse.json(
      { error: "template not found or has no text" },
      { status: 404 }
    );
  }

  const title = doc.title?.trim() || signable.template.name;

  // PDF собираем серверным рендерером — тем же, что отдаёт пользователю.
  const { blob } = await buildPdf(signable.html, { title, design });
  const pdfArrayBuffer = await blob.arrayBuffer();
  const pdfBytes = new Uint8Array(pdfArrayBuffer);

  // Плейсхолдер PAdES: PDF с зарезервированным Contents + байты для подписания.
  const { placeholder, signedContent } = await preparePAdESPlaceholder(
    pdfBytes,
    reserve,
    {
      signerName: "dogovor.expert user",
      signingDate: new Date(),
      reason: "Подписание документа на dogovor.expert",
      location: "",
      contactInfo: "https://dogovor.expert",
    }
  );

  const documentHash = await sha256Hex(pdfBytes.buffer);

  await logSignAction({
    userId: user.id,
    documentId,
    action: "prepare",
    documentHash,
    ip: req.headers.get("x-forwarded-for"),
    userAgent: req.headers.get("user-agent"),
    meta: {
      designId: design,
      cmsHexLen: reserve,
      isProbe,
      templateId: doc.template_id,
    },
  });

  return NextResponse.json({
    placeholderPdfBase64: Buffer.from(placeholder).toString("base64"),
    signedContentBase64: Buffer.from(signedContent).toString("base64"),
    cmsHexLen: reserve,
    isProbe,
    documentHash,
    documentId,
  });
}

export const POST = withCsrf(postHandler);

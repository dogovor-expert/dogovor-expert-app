import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { withCsrf } from "@/lib/csrf";
import { isSameOrigin } from "@/lib/admin-auth";
import { limiters, checkRateLimit, rateLimitResponse } from "@/lib/ratelimit";
import { logSignAction } from "@/lib/sign-audit";
import { PDFDocument, PDFName, PDFDict, PDFArray, asPDFName } from "pdf-lib";
import { uint8ToBase64, hexToUint8 } from "@/lib/bytes";

const SHA256_HEX = "sha-256";
const MAX_PDF_SIZE = 50 * 1024 * 1024; // 50 MB
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-9a-f][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function sha256Hex(data: ArrayBuffer): Promise<string> {
  const buffer = await crypto.subtle.digest(SHA256_HEX, data);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Извлекает и верифицирует PAdES подпись из PDF.
 * Возвращает null если подпись не найдена или невалидна.
 */
async function verifyPAdESSignature(pdfBytes: Uint8Array): Promise<{
  valid: boolean;
  cmsBase64?: string;
  signerName?: string;
  signingDate?: Date;
  reason?: string;
  error?: string;
}> {
  try {
    const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });

    // Ищем поле подписи в AcroForm
    const catalog: any = pdfDoc.catalog;
    const acroForm = catalog.lookupMaybe(asPDFName("AcroForm"), PDFDict);
    if (!acroForm) return { valid: false, error: "No AcroForm found" };

    const acroFormDict = acroForm as any;
    const fields = acroFormDict.lookupMaybe(asPDFName("Fields"), PDFArray);
    if (!fields) return { valid: false, error: "No Fields in AcroForm" };

    let sigDict: any = null;
    for (const fieldRef of fields.array) {
      const field = pdfDoc.context.lookup(fieldRef, PDFDict);
      if (field) {
        const ft = (field as any).lookupMaybe(asPDFName("FT"));
        if (ft && ft.value === "Sig") {
          sigDict = field;
          break;
        }
      }
    }

    if (!sigDict) return { valid: false, error: "No signature field found" };

    // Извлекаем Contents (CMS/PKCS#7)
    const contents = (sigDict as any).lookupMaybe(asPDFName("Contents"));
    if (!contents) return { valid: false, error: "No Contents in signature" };

    const cmsHex = contents.value; // hex string без <>

    // Базовая проверка: CMS должен быть валидным hex
    if (!/^[0-9A-Fa-f]+$/.test(cmsHex) || cmsHex.length < 100) {
      return { valid: false, error: "Invalid CMS format" };
    }

    // Чанкованное преобразование — см. @/lib/bytes
    const cmsBase64 = uint8ToBase64(hexToUint8(cmsHex));

    // Извлекаем метаданные подписи
    const name = (sigDict as any).lookupMaybe(asPDFName("Name"))?.value;
    const reason = (sigDict as any).lookupMaybe(asPDFName("Reason"))?.value;
    const m = (sigDict as any).lookupMaybe(asPDFName("M"))?.value;

    return {
      valid: true,
      cmsBase64,
      signerName: name,
      reason,
      signingDate: m ? parsePdfDate(m) : undefined,
    };
  } catch (e) {
    return { valid: false, error: e instanceof Error ? e.message : "Verification failed" };
  }
}

function parsePdfDate(pdfDate: string): Date | undefined {
  // D:YYYYMMDDHHmmSS
  const match = pdfDate.match(/^D:(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/);
  if (!match) return undefined;
  const [, year, month, day, hour, min, sec] = match;
  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(min),
    Number(sec)
  );
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

  const rl = await checkRateLimit(limiters.signAccept, `sign:accept:${user.id}`);
  if (!rl.ok) return rateLimitResponse(rl.retryAfter);

  let body: {
    documentId?: string;
    signedPdfBase64?: string;
    thumbprint?: string;
    subjectName?: string;
    validTo?: string;
    algorithm?: "CAdES-BES" | "CAdES-X-Long-Type-1";
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad body" }, { status: 400 });
  }

  const { documentId, signedPdfBase64, thumbprint, subjectName, validTo, algorithm = "CAdES-BES" } = body;

  if (!documentId || !signedPdfBase64 || !thumbprint || !subjectName || !validTo) {
    return NextResponse.json({ error: "missing required fields" }, { status: 400 });
  }

  // documentId подставляется в путь Storage — проверяем, что это UUID,
  // иначе в путь попадёт произвольная строка (в т.ч. с ../).
  if (!UUID_RE.test(documentId)) {
    return NextResponse.json({ error: "invalid documentId" }, { status: 400 });
  }

  // Проверка размера
  const pdfBuffer = Buffer.from(signedPdfBase64, "base64");
  if (pdfBuffer.length > MAX_PDF_SIZE) {
    return NextResponse.json({ error: "PDF too large (max 50 MB)" }, { status: 400 });
  }

  // Проверяем, что документ существует и принадлежит пользователю.
  // prepare это делает, accept — нет, а admin-клиент обходит RLS,
  // поэтому без этой проверки любой юзер пишет подписи к чужим документам.
  const admin = createAdminClient();
  const { data: doc, error: docError } = await admin
    .from("documents")
    .select("id, user_id")
    .eq("id", documentId)
    .maybeSingle();

  if (docError || !doc) {
    return NextResponse.json({ error: "document not found" }, { status: 404 });
  }
  if (doc.user_id !== user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  // Верификация PAdES подписи в PDF
  const pdfBytes = new Uint8Array(pdfBuffer);
  const verification = await verifyPAdESSignature(pdfBytes);

  if (!verification.valid) {
    return NextResponse.json({ error: `Invalid signature: ${verification.error}` }, { status: 400 });
  }

  // Пересчитываем хэш PDF
  const documentHash = await sha256Hex(pdfBuffer.buffer.slice(pdfBuffer.byteOffset, pdfBuffer.byteOffset + pdfBuffer.byteLength));

  // Сохраняем в Storage (приватный бакет signed-documents)
  const timestamp = Date.now();
  const storagePath = `signed/${user.id}/${documentId}-${timestamp}.pdf`;

  const { error: uploadError } = await admin.storage
    .from("signed-documents")
    .upload(storagePath, pdfBuffer, {
      contentType: "application/pdf",
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json({ error: "storage upload failed" }, { status: 500 });
  }

  // Записываем в document_signatures
  const { data: signature, error: sigError } = await admin
    .from("document_signatures")
    .insert({
      document_id: documentId,
      user_id: user.id,
      certificate_thumbprint: thumbprint,
      certificate_subject: subjectName,
      certificate_valid_to: new Date(validTo).toISOString(),
      signature_algorithm: algorithm,
      signature_path: storagePath,
      document_hash_sha256: documentHash,
    })
    .select()
    .single();

  if (sigError || !signature) {
    // Попытка удалить загруженный файл при ошибке БД
    try {
      await admin.storage.from("signed-documents").remove([storagePath]);
    } catch {
      // ignore
    }
    return NextResponse.json({ error: "database error" }, { status: 500 });
  }

  // Логируем
  await logSignAction({
    userId: user.id,
    documentId,
    action: "accept",
    documentHash,
    ip: req.headers.get("x-forwarded-for"),
    userAgent: req.headers.get("user-agent"),
    meta: {
      signatureId: signature.id,
      thumbprint,
      algorithm,
      structureFound: verification.valid,
    },
  });

  // Возвращаем ID подписи и URL для скачивания (подписанный URL с TTL)
  const { data: signedUrlData } = await admin.storage
    .from("signed-documents")
    .createSignedUrl(storagePath, 60 * 60); // 1 час

  return NextResponse.json({
    signatureId: signature.id,
    downloadUrl: signedUrlData?.signedUrl ?? `/api/sign/${signature.id}/download`,
    verification: {
      signerName: verification.signerName,
      reason: verification.reason,
      signingDate: verification.signingDate,
    },
  });
}

export const POST = withCsrf(postHandler);
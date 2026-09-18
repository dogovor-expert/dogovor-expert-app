import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { withCsrf } from "@/lib/csrf";
import { isSameOrigin } from "@/lib/admin-auth";
import { limiters, checkRateLimit, rateLimitResponse } from "@/lib/ratelimit";
import { logSignAction } from "@/lib/sign-audit";
import { PDFDocument, PDFName, PDFDict, PDFArray, asPDFName } from "pdf-lib";
import { uint8ToBase64, hexToUint8 } from "@/lib/bytes";
import { verifyPAdESCrypto, extractSignedContentFromPDF } from "@/lib/pades-verify";

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
    const catalog = pdfDoc.catalog;
    const acroForm = catalog.lookupMaybe(asPDFName("AcroForm"), PDFDict);
    if (!acroForm) return { valid: false, error: "No AcroForm found" };

    const fields = acroForm.lookupMaybe(asPDFName("Fields"), PDFArray);
    if (!fields) return { valid: false, error: "No Fields in AcroForm" };

    let sigDict: PDFDict | null = null;
    for (const fieldRef of fields.asArray()) {
      const field = pdfDoc.context.lookup(fieldRef, PDFDict);
      if (field) {
        const ft = field.lookupMaybe(asPDFName("FT"), PDFName);
        // PDFName.asString() возвращает значение СО слешем ("/Sig"); .value — функция в pdf-lib 1.17
        if (ft && ft.asString() === "/Sig") {
          sigDict = field;
          break;
        }
      }
    }

    if (!sigDict) return { valid: false, error: "No signature field found" };

    // Извлекаем Contents (CMS/PKCS#7)
    const contents = sigDict.get(asPDFName("Contents"));
    if (!contents) return { valid: false, error: "No Contents in signature" };

    const contentsObj = contents as { value?: unknown };
    const cmsHex: string = typeof contentsObj.value === "string" ? contentsObj.value : "";

    // Базовая проверка: CMS должен быть валидным hex
    if (!/^[0-9A-Fa-f]+$/.test(cmsHex) || cmsHex.length < 100) {
      return { valid: false, error: "Invalid CMS format" };
    }

    // Чанкованное преобразование — см. @/lib/bytes
    const cmsBase64 = uint8ToBase64(hexToUint8(cmsHex));

    // Извлекаем метаданные подписи
    const readStr = (v: unknown): string | undefined => {
      const obj = v as { value?: unknown } | null | undefined;
      return typeof obj?.value === "string" ? obj.value : undefined;
    };
    const name = readStr(sigDict.get(asPDFName("Name")));
    const reason = readStr(sigDict.get(asPDFName("Reason")));
    const m = readStr(sigDict.get(asPDFName("M")));

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
    body = (await req.json()) as typeof body;
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

  const pdfBytes = new Uint8Array(pdfBuffer);

  // Структурная проверка (существующая)
  const structureVerification = await verifyPAdESSignature(pdfBytes);
  if (!structureVerification.valid) {
    return NextResponse.json({ error: `Invalid signature structure: ${structureVerification.error}` }, { status: 400 });
  }

  // Извлекаем signedContent и CMS для криптографической верификации
  const extracted = await extractSignedContentFromPDF(pdfBytes);
  if (!extracted) {
    return NextResponse.json({ error: "Failed to extract signature data from PDF" }, { status: 400 });
  }
  const { signedContent, cmsHex } = extracted;

  // Криптографическая верификация (НОВАЯ)
  const cryptoResult = await verifyPAdESCrypto(pdfBytes, signedContent, cmsHex);

  if (!cryptoResult.valid) {
    await logSignAction({
      userId: user.id,
      documentId,
      action: "accept",
      documentHash: "",
      ip: req.headers.get("x-forwarded-for"),
      userAgent: req.headers.get("user-agent"),
      meta: { cryptoVerified: false, cryptoErrors: cryptoResult.errors, cryptoWarnings: cryptoResult.warnings },
    });
    return NextResponse.json({ error: "Cryptographic verification failed", details: cryptoResult.errors }, { status: 400 });
  }
  if (!cryptoResult.signer) {
    // Теоретически недостижимо: valid=true гарантирует наличие signer.
    return NextResponse.json({ error: "Signer info missing" }, { status: 500 });
  }

  // Проверка соответствия метаданных (сервер не верит клиенту!)
  // Thumbprint сверяем — это уникальный идентификатор сертификата
  const clientThumbprint = body.thumbprint?.toUpperCase().replace(/:/g, "");
  if (cryptoResult.signer.thumbprintSha1 !== clientThumbprint) {
    return NextResponse.json({ error: "Thumbprint mismatch (SHA-1)" }, { status: 400 });
  }
  // Subject DN и ValidTo НЕ сверяем с body — сервер извлёк их из CMS.
  // rawDN содержит числовые OID (2.5.4.3=...), а клиент присылает CN=... — они никогда не совпадут.
  // ValidTo в клиенте может иметь другую точность/таймзону — доверяем серверному значению.

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

  // Записываем в document_signatures (данные ИЗ CMS, а не из body!)
  const sigResult = await admin
    .from("document_signatures")
    .insert({
      document_id: documentId,
      user_id: user.id,
      certificate_thumbprint: cryptoResult.signer.thumbprintSha1,
      certificate_subject: cryptoResult.signer.subject.rawDN,
      certificate_valid_to: cryptoResult.signer.validTo.toISOString(),
      signature_algorithm: algorithm,
      signature_path: storagePath,
      document_hash_sha256: documentHash,
      // Новые поля для криптоверификации (требуют миграции)
      certificate_issuer: cryptoResult.signer.issuer.rawDN,
      certificate_serial: cryptoResult.signer.serialNumber,
      crypto_verified: cryptoResult.cryptoVerified,
      chain_verified: cryptoResult.chainValid,
      revocation_status: cryptoResult.revocation.status,
    })
    .select()
    .single();

  const signature = sigResult.data as { id: string } | null;

  if (sigResult.error || !signature) {
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
      thumbprint: cryptoResult.signer.thumbprintSha1,
      algorithm,
      structureFound: structureVerification.valid,
      cryptoVerified: cryptoResult.cryptoVerified,
      chainVerified: cryptoResult.chainValid,
      revocationStatus: cryptoResult.revocation.status,
      isQualified: cryptoResult.signer.isQualified,
      hashAlgorithm: cryptoResult.integrity.algorithm,
      hashMatch: cryptoResult.integrity.hashMatch,
    },
  });

  // Возвращаем ID подписи и URL для скачивания (подписанный URL с TTL)
  const { data: signedUrlData } = await admin.storage
    .from("signed-documents")
    .createSignedUrl(storagePath, 60 * 60); // 1 час

  const revocationStatus = cryptoResult.revocation.status;
  return NextResponse.json({
    signatureId: signature.id,
    downloadUrl: signedUrlData?.signedUrl ?? `/api/sign/${signature.id}/download`,
    verification: {
      signerName: structureVerification.signerName,
      reason: structureVerification.reason,
      signingDate: structureVerification.signingDate,
      cryptoVerified: cryptoResult.cryptoVerified,
      chainVerified: cryptoResult.chainValid,
      revocationStatus,
      // Явный флаг «проверка отзыва не выполнена» — отличать от «не отозван»
      revocationCheckPending: revocationStatus === "unknown" || revocationStatus === "offline",
      isQualified: cryptoResult.signer.isQualified,
      hashAlgorithm: cryptoResult.integrity.algorithm,
      hashMatch: cryptoResult.integrity.hashMatch,
    },
  });
}

export const POST = withCsrf(postHandler);

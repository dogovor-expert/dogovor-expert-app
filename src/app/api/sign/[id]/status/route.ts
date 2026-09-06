import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { limiters, checkRateLimit, rateLimitResponse } from "@/lib/ratelimit";
import { logSignAction } from "@/lib/sign-audit";
import {
  PDFDocument,
  PDFArray,
  PDFDict,
  PDFName,
  asPDFName,
  type PDFNumber,
} from "pdf-lib";

const SHA256_HEX = "sha-256";

/**
 * Статус подписанного документа.
 *
 * ВАЖНО ПРО ЧЕСТНОСТЬ ОТВЕТА.
 * Здесь выполняются только те проверки, которые реально можно сделать
 * средствами pdf-lib и Node без ГОСТ-криптографии:
 *   - целостность файла (SHA-256 против хэша, сохранённого при подписании);
 *   - структура PAdES: наличие AcroForm и поля /FT /Sig;
 *   - корректность /ByteRange и попадание /Contents в его разрыв;
 *   - срок действия сертификата по данным из БД.
 *
 * НЕ проверяется (для этого нужен ГОСТ-движок — КриптоПро CSP / КриптоАРМ
 * на сервере, либо проверка на клиенте через плагин):
 *   - криптографическая валидность подписи CMS (ГОСТ Р 34.10-2012);
 *   - цепочка сертификатов;
 *   - отзыв сертификата по CRL/OCSP;
 *   - метка времени TSA (RFC 3161).
 *
 * Поэтому в ответе есть явный флаг `cryptoVerified: false` и формулировки,
 * не утверждающие проверку того, что не проверялось.
 */

async function sha256Hex(data: ArrayBuffer): Promise<string> {
  const buffer = await crypto.subtle.digest(SHA256_HEX, data);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function parsePdfDate(pdfDate: string): Date | undefined {
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

function latin1(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return s;
}

interface PAdesInspection {
  structureFound: boolean;
  byteRangeValid: boolean;
  byteRange?: number[];
  contentsInGap: boolean;
  cmsBytes: number;
  signerName?: string;
  reason?: string;
  signingDate?: Date;
  error?: string;
}

/**
 * Разбирает подпись и по-настоящему проверяет /ByteRange.
 * Возвращает только то, что удалось установить; ничего не захардкожено.
 */
async function inspectPAdES(pdfBytes: Uint8Array): Promise<PAdesInspection> {
  const empty: PAdesInspection = {
    structureFound: false,
    byteRangeValid: false,
    contentsInGap: false,
    cmsBytes: 0,
  };

  try {
    const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
    const catalog = pdfDoc.catalog;

    // 1. Ищем поле подписи в AcroForm
    const acroForm = catalog.lookupMaybe(asPDFName("AcroForm"), PDFDict);
    if (!acroForm) return { ...empty, error: "No AcroForm found" };

    const fields = acroForm.lookupMaybe(asPDFName("Fields"), PDFArray);
    if (!fields) return { ...empty, error: "No Fields in AcroForm" };

    let sigDict: PDFDict | undefined;
    for (const ref of fields.asArray()) {
      const field = pdfDoc.context.lookupMaybe(ref, PDFDict);
      if (!field) continue;
      const ft = field.lookupMaybe(asPDFName("FT"), PDFName);
      if (ft?.asString() === "/Sig") {
        sigDict = field;
        break;
      }
    }
    if (!sigDict) return { ...empty, error: "No signature field (/FT /Sig) found" };

    const structureFound = true;

    // 2. /Contents — CMS в hex
    const contents = (sigDict as any).lookupMaybe(asPDFName("Contents"));
    if (!contents) {
      return { ...empty, structureFound, error: "No /Contents in signature" };
    }
    const cmsHex: string = (contents as unknown as { value: string }).value ?? "";
    if (!/^[0-9A-Fa-f]+$/.test(cmsHex) || cmsHex.length < 100) {
      return { ...empty, structureFound, error: "/Contents is not a valid CMS hex blob" };
    }

    // 3. /ByteRange — реальная проверка, а не константа
    const byteRangeArr = sigDict.lookupMaybe(asPDFName("ByteRange"), PDFArray);
    if (!byteRangeArr) {
      return {
        ...empty,
        structureFound,
        cmsBytes: cmsHex.length >> 1,
        error: "No /ByteRange — подпись не покрывает содержимое файла",
      };
    }

    const nums = byteRangeArr.asArray().map((n) => (n as PDFNumber).asNumber());
    if (nums.length !== 4 || nums.some((n) => !Number.isFinite(n) || n < 0)) {
      return {
        ...empty,
        structureFound,
        byteRange: nums,
        cmsBytes: cmsHex.length >> 1,
        error: "/ByteRange malformed",
      };
    }

    const [start1, len1, start2, len2] = nums;
    const total = pdfBytes.length;

    // Разрыв между двумя диапазонами — там, где лежит /Contents
    const gapStart = start1 + len1;
    const gapEnd = start2;

    const contiguous = start1 === 0 && gapEnd === gapStart;
    const coversToEnd = start2 + len2 === total;
    const gapBiggerThanMarkers = gapEnd - gapStart >= 2;

    // Разрыв должен содержать ровно <hex>
    let contentsInGap = false;
    if (contiguous && gapBiggerThanMarkers && gapEnd <= total) {
      const gapStr = latin1(pdfBytes.subarray(gapStart, gapEnd)).trim();
      const m = gapStr.match(/^<([0-9A-Fa-f\s]*)>$/);
      if (m) {
        const hexLen = m[1].replace(/\s/g, "").length;
        contentsInGap = hexLen === cmsHex.length;
      }
    }

    const byteRangeValid =
      contiguous && coversToEnd && gapBiggerThanMarkers && contentsInGap;

    const nameVal = (sigDict as any).lookupMaybe(asPDFName("Name"));
    const reasonVal = (sigDict as any).lookupMaybe(asPDFName("Reason"));
    const mVal = (sigDict as any).lookupMaybe(asPDFName("M"));

    const readStr = (v: unknown): string | undefined => {
      const val = v as { value?: unknown } | undefined;
      return typeof val?.value === "string" ? val.value : undefined;
    };

    const m = readStr(mVal);

    return {
      structureFound,
      byteRangeValid,
      byteRange: nums,
      contentsInGap,
      cmsBytes: cmsHex.length >> 1,
      signerName: readStr(nameVal),
      reason: readStr(reasonVal),
      signingDate: m ? parsePdfDate(m) : undefined,
      error: byteRangeValid ? undefined : "/ByteRange не корректен",
    };
  } catch (e) {
    return {
      ...empty,
      error: e instanceof Error ? e.message : "Failed to parse PDF",
    };
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // isSameOrigin здесь намеренно убран: браузер не шлёт Origin при переходе
  // верхнего уровня, и прямая навигация на ссылку скачивания давала 403.

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const rl = await checkRateLimit(limiters.signVerify, `sign:verify:${user.id}`);
  if (!rl.ok) return rateLimitResponse(rl.retryAfter);

  const admin = createAdminClient();

  const { data: sig, error: sigError } = await admin
    .from("document_signatures")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (sigError || !sig) {
    return NextResponse.json({ error: "signature not found" }, { status: 404 });
  }

  // Владелец или админ
  if (sig.user_id !== user.id) {
    const { data: isAdmin } = await admin.rpc("is_admin");
    if (!isAdmin) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
  }

  const { data: fileData, error: downloadError } = await admin.storage
    .from("signed-documents")
    .download(sig.signature_path);

  if (downloadError || !fileData) {
    return NextResponse.json({ error: "file not found in storage" }, { status: 404 });
  }

  const pdfArrayBuffer = await fileData.arrayBuffer();
  const pdfBytes = new Uint8Array(pdfArrayBuffer);

  // 1. Целостность файла: отличается ли файл от того, что сохраняли
  const actualHash = await sha256Hex(pdfArrayBuffer);
  const hashMatch = actualHash === sig.document_hash_sha256;

  // 2. Структура PAdES и /ByteRange
  const inspection = await inspectPAdES(pdfBytes);

  // 3. Срок сертификата — только по данным из БД
  const now = new Date();
  const validTo = new Date(sig.certificate_valid_to);
  const certExpired = now > validTo;
  const certExpiringSoon =
    validTo.getTime() - now.getTime() < 30 * 24 * 60 * 60 * 1000;

  // 4. Подпись в будущем — явный признак подделки метаданных
  const signedInFuture = !!inspection.signingDate && inspection.signingDate > now;

  const structuralValid =
    inspection.structureFound && inspection.byteRangeValid && !signedInFuture;

  await logSignAction({
    userId: user.id,
    documentId: sig.document_id,
    action: "verify",
    documentHash: sig.document_hash_sha256,
    ip: req.headers.get("x-forwarded-for"),
    userAgent: req.headers.get("user-agent"),
    meta: { hashMatch, structuralValid, byteRangeValid: inspection.byteRangeValid },
  });

  const cryptoVerified = sig.crypto_verified ?? false;
  const chainVerified = sig.chain_verified ?? false;
  const revocationStatus = sig.revocation_status ?? "unknown";
  const issuer = sig.certificate_issuer ?? null;
  const serial = sig.certificate_serial ?? null;

  const notChecked: string[] = [];
  if (!cryptoVerified) {
    notChecked.push("Криптографическая валидность подписи CMS (ГОСТ Р 34.10-2012)");
  }
  if (!chainVerified) {
    notChecked.push("Цепочка сертификатов до доверенного УЦ Минцифры");
  }
  if (revocationStatus === "unknown" || revocationStatus === "offline") {
    notChecked.push("Отзыв сертификата по CRL/OCSP");
  }
  if (!sig.tsa_info) {
    notChecked.push("Метка времени TSA (RFC 3161)");
  }

  return NextResponse.json({
    signatureId: sig.id,
    documentId: sig.document_id,
    createdAt: sig.created_at,
    algorithm: sig.signature_algorithm,

    integrity: {
      hashMatch,
      storedHash: sig.document_hash_sha256,
      actualHash,
      note: hashMatch
        ? "Файл не отличается от сохранённого при подписании"
        : "Файл изменён относительно сохранённого при подписании",
    },
    structure: {
      valid: structuralValid,
      found: inspection.structureFound,
      byteRangeValid: inspection.byteRangeValid,
      byteRange: inspection.byteRange,
      contentsInGap: inspection.contentsInGap,
      cmsBytes: inspection.cmsBytes,
      signerName: inspection.signerName,
      reason: inspection.reason,
      signingDate: inspection.signingDate ?? null,
      signedInFuture,
      error: inspection.error ?? null,
    },
    certificate: {
      thumbprint: sig.certificate_thumbprint,
      subject: sig.certificate_subject,
      issuer,
      serialNumber: serial,
      validTo: sig.certificate_valid_to,
      expired: certExpired,
      expiringSoon: certExpiringSoon,
      isQualified: sig.is_qualified ?? false,
    },

    cryptoVerified,
    chainVerified,
    revocationStatus,
    chainDetails: sig.chain_details ?? [],
    timestamp: sig.tsa_info ?? null,
    notChecked,
    message: cryptoVerified
      ? "Криптографическая проверка пройдена успешно."
      : "Проверена только структура подписи и целостность файла. Криптографическая проверка не выполнялась или не прошла.",
    verifiedAt: new Date().toISOString(),
  });
}

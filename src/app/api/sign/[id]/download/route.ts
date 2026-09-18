import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { limiters, checkRateLimit, rateLimitResponse } from "@/lib/ratelimit";
import { logSignAction } from "@/lib/sign-audit";

const SHA256_HEX = "sha-256";

interface SignatureRow {
  user_id: string;
  signature_path: string;
  document_hash_sha256: string;
  document_id: string;
}

async function sha256Hex(data: ArrayBuffer): Promise<string> {
  const buffer = await crypto.subtle.digest(SHA256_HEX, data);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // isSameOrigin здесь намеренно убран: браузер не отправляет Origin при
  // переходе верхнего уровня, из-за чего прямое скачивание по ссылке
  // (и открытие в новой вкладке) всегда отдавало 403.

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const rl = await checkRateLimit(limiters.signDownload, `sign:download:${user.id}`);
  if (!rl.ok) return rateLimitResponse(rl.retryAfter);

  const admin = createAdminClient();

  // Загружаем запись подписи
  const sigResult = await admin
    .from("document_signatures")
    .select("*")
    .eq("id", id)
    .single();

  const rawSig: unknown = sigResult.data;
  const sig = rawSig as SignatureRow | null;

  if (sigResult.error || !sig) {
    return NextResponse.json({ error: "signature not found" }, { status: 404 });
  }

  // Проверка прав доступа
  if (sig.user_id !== user.id) {
    // Админы могут скачивать любые
    const isAdminResult = await admin.rpc("is_admin");
    if (!isAdminResult.data) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
  }

  // Скачиваем из Storage
  const { data: fileData, error: downloadError } = await admin.storage
    .from("signed-documents")
    .download(sig.signature_path);

  if (downloadError || !fileData) {
    return NextResponse.json({ error: "file not found in storage" }, { status: 404 });
  }

  // Защитная проверка хэша при выдаче
  const pdfArrayBuffer = await fileData.arrayBuffer();
  const actualHash = await sha256Hex(pdfArrayBuffer);
  if (actualHash !== sig.document_hash_sha256) {
    // Хэш не совпадает — файл отличается от сохранённого при подписании
    await logSignAction({
      userId: user.id,
      documentId: sig.document_id,
      action: "download",
      documentHash: actualHash,
      ip: req.headers.get("x-forwarded-for"),
      userAgent: req.headers.get("user-agent"),
      meta: {
        integrityFailed: true,
        expected: sig.document_hash_sha256,
        actual: actualHash,
      },
    });
    return NextResponse.json({ error: "document integrity check failed" }, { status: 409 });
  }

  await logSignAction({
    userId: user.id,
    documentId: sig.document_id,
    action: "download",
    documentHash: actualHash,
    ip: req.headers.get("x-forwarded-for"),
    userAgent: req.headers.get("user-agent"),
  });

  return new NextResponse(pdfArrayBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="signed-${sig.document_id}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
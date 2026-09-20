import { NextResponse } from "next/server";
import { withCsrf } from "@/lib/csrf";
import { isSameOrigin } from "@/lib/admin-auth";
import { limiters, clientIp, checkRateLimit, rateLimitResponse } from "@/lib/ratelimit";
import { chatStoreAvailable } from "@/lib/chat-store";
import { uploadChatFile, isAllowedMime, fileKind, CHAT_FILE_MAX } from "@/lib/chat-files";

const CHAT_ENABLED = process.env.NEXT_PUBLIC_CHAT_ENABLED === "1";

/**
 * Загрузка вложения посетителем в чат. Файл кладём в приватный Storage,
 * возвращаем подписанную ссылку; сама отправка сообщения — через /api/chat.
 */
async function postHandler(req: Request) {
  if (!isSameOrigin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const rl = await checkRateLimit(limiters.chat, clientIp(req));
  if (!rl.ok) return rateLimitResponse(rl.retryAfter);

  if (!CHAT_ENABLED || !chatStoreAvailable()) {
    return NextResponse.json({ error: "chat_unavailable" }, { status: 503 });
  }

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const rawVisitorId = form.get("visitorId");
  const visitorId = typeof rawVisitorId === "string" ? rawVisitorId.slice(0, 64) : "";
  const uploaded = form.get("file");
  if (!visitorId || !(uploaded instanceof File)) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  if (uploaded.size <= 0 || uploaded.size > CHAT_FILE_MAX) {
    return NextResponse.json({ error: "too_large", message: "Файл больше 10 МБ." }, { status: 413 });
  }
  const mime = uploaded.type || "application/octet-stream";
  if (!isAllowedMime(mime)) {
    return NextResponse.json(
      { error: "bad_type", message: "Можно прикрепить изображение, PDF или документ." },
      { status: 415 }
    );
  }

  const bytes = new Uint8Array(await uploaded.arrayBuffer());
  const ext = ((uploaded.name.includes(".") ? uploaded.name.split(".").pop() : mime.split("/")[1]) || "bin")
    .replace(/[^a-z0-9]/gi, "")
    .slice(0, 8);
  const path = `chat/${visitorId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext || "bin"}`;

  const stored = await uploadChatFile(path, bytes, mime);
  if (!stored) return NextResponse.json({ error: "upload_failed" }, { status: 502 });

  return NextResponse.json({
    ok: true,
    file: { url: stored.url, name: uploaded.name.slice(0, 120), mime, kind: fileKind(mime), size: uploaded.size },
  });
}

export const POST = withCsrf(postHandler);
import { NextResponse } from "next/server";
import {
  getVisitorByThread,
  appendMessage,
  incUnread,
  touchActiveThread,
  type ChatFile,
  type ChatMessage,
} from "@/lib/chat-store";
import { getFilePath, downloadTelegramFile } from "@/lib/telegram-chat";
import { uploadChatFile, fileKind } from "@/lib/chat-files";
import { limiters, checkRateLimit, rateLimitResponse, clientIp } from "@/lib/ratelimit";

const SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;
const SUPPORT_GROUP_ID = process.env.TELEGRAM_SUPPORT_GROUP_ID;

// Telegram Bot API отдаёт файлы до 20 МБ; держим запас.
const MAX_DOWNLOAD = 15 * 1024 * 1024;

// Важно: без secret_token любой может слать фейковые «ответы оператора».
function authorized(req: Request): boolean {
  if (!SECRET) return false;
  const provided = req.headers.get("x-telegram-bot-api-secret-token");
  if (!provided) return false;
  if (provided.length !== SECRET.length) return false;
  let mismatch = 0;
  for (let i = 0; i < SECRET.length; i++) mismatch |= provided.charCodeAt(i) ^ SECRET.charCodeAt(i);
  return mismatch === 0;
}

interface TgDocument {
  file_id?: string;
  file_name?: string;
  mime_type?: string;
  file_size?: number;
}

interface TgPhoto {
  file_id?: string;
  file_size?: number;
}

interface TgUpdate {
  message?: {
    chat?: { id?: number };
    message_thread_id?: number;
    from?: { is_bot?: boolean; username?: string };
    text?: string;
    caption?: string;
    document?: TgDocument;
    photo?: TgPhoto[];
  };
}

function extensionFor(mime: string, fileName?: string): string {
  const fromName = fileName?.includes(".") ? fileName.split(".").pop() : "";
  if (fromName) return fromName.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8) || "bin";
  const fromMime = mime.split("/")[1]?.replace(/[^a-z0-9]/g, "");
  return (fromMime || "bin").slice(0, 8);
}

export async function POST(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "forbidden" }, { status: 401 });
  }

  // Rate-limit по IP источника (fail-closed): ограничивает поток апдейтов,
  // если secret_token когда-либо утечёт, и защищает Redis/хранилище чата.
  const rl = await checkRateLimit(limiters.telegramWebhook, clientIp(req));
  if (!rl.ok) return rateLimitResponse(rl.retryAfter);

  const update = (await req.json().catch(() => null)) as TgUpdate | null;
  const msg = update?.message;
  if (!msg) return NextResponse.json({ ok: true });

  const text = (msg.text ?? msg.caption ?? "").trim();
  const document = msg.document;
  const photos = msg.photo;
  const photo = photos && photos.length ? photos[photos.length - 1] : undefined;
  const fileId = document?.file_id ?? photo?.file_id;
  if (!text && !fileId) return NextResponse.json({ ok: true }); // сервисные/неподдерживаемые

  // Только сообщения из нашей супергруппы и только в темах (thread_id != 1 = General).
  const chatId = msg.chat?.id;
  const threadId = msg.message_thread_id;
  if (!chatId || !threadId || threadId === 1) return NextResponse.json({ ok: true });
  if (SUPPORT_GROUP_ID && String(chatId) !== String(SUPPORT_GROUP_ID)) {
    return NextResponse.json({ ok: true });
  }

  // Игнорируем собственные исходящие сообщения бота (чтобы не было петли).
  if (msg.from?.is_bot) return NextResponse.json({ ok: true });

  const visitorId = await getVisitorByThread(threadId);
  if (!visitorId) return NextResponse.json({ ok: true }); // тема без привязки к посетителю

  // Если оператор приложил файл — скачиваем из Telegram и кладём в Storage.
  let file: ChatFile | undefined;
  if (fileId) {
    const filePath = await getFilePath(fileId);
    if (filePath) {
      const dl = await downloadTelegramFile(filePath);
      if (dl && dl.bytes.byteLength <= MAX_DOWNLOAD) {
        const mime = document?.mime_type || dl.contentType || "application/octet-stream";
        const path = `chat/${visitorId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extensionFor(mime, document?.file_name)}`;
        const uploaded = await uploadChatFile(path, dl.bytes, mime);
        if (uploaded) {
          file = {
            url: uploaded.url,
            name: (document?.file_name || (mime.startsWith("image/") ? "screenshot" : "файл")).slice(0, 120),
            mime,
            kind: fileKind(mime),
            size: dl.bytes.byteLength,
          };
        }
      }
    }
  }

  const out: ChatMessage = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role: "operator",
    text,
    ts: Date.now(),
    ...(file ? { file } : {}),
  };
  await appendMessage(visitorId, out);
  await incUnread(visitorId);
  await touchActiveThread(visitorId, out.ts);

  return NextResponse.json({ ok: true });
}
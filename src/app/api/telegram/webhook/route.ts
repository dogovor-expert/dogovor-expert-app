import { NextResponse } from "next/server";
import { getVisitorByThread, appendMessage, incUnread, touchActiveThread, type ChatMessage } from "@/lib/chat-store";

const SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;
const SUPPORT_GROUP_ID = process.env.TELEGRAM_SUPPORT_GROUP_ID;

// Важно: без secret_token любой может слать фейковые «ответы оператора».
function authorized(req: Request): boolean {
  if (!SECRET) return false;
  const provided = req.headers.get("x-telegram-bot-api-secret-token");
  if (!provided) return false;
  // constant-time-ish сравнение
  if (provided.length !== SECRET.length) return false;
  let mismatch = 0;
  for (let i = 0; i < SECRET.length; i++) mismatch |= provided.charCodeAt(i) ^ SECRET.charCodeAt(i);
  return mismatch === 0;
}

interface TgUpdate {
  message?: {
    chat?: { id?: number };
    message_thread_id?: number;
    from?: { is_bot?: boolean; username?: string };
    text?: string;
  };
}

export async function POST(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "forbidden" }, { status: 401 });
  }

  const update = (await req.json().catch(() => null)) as TgUpdate | null;
  const msg = update?.message;
  if (!msg || !msg.text) return NextResponse.json({ ok: true }); // сервисные сообщения игнорируем

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

  const out: ChatMessage = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role: "operator",
    text: msg.text,
    ts: Date.now(),
  };
  await appendMessage(visitorId, out);
  await incUnread(visitorId);
  await touchActiveThread(visitorId, out.ts);

  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { limiters, clientIp, checkRateLimit, rateLimitResponse } from "@/lib/ratelimit";
import {
  getThread,
  setThread,
  appendMessage,
  getMessages,
  clearUnread,
  getUnread,
  saveProfile,
  type ChatMessage,
} from "@/lib/chat-store";
import {
  TELEGRAM_CONFIGURED,
  createForumTopic,
  sendToTopic,
  escapeHtml,
} from "@/lib/telegram-chat";

const CHAT_ENABLED = process.env.NEXT_PUBLIC_CHAT_ENABLED === "1";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TEXT_MAX = 4000;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const visitorId = url.searchParams.get("visitorId");
  if (!visitorId) return NextResponse.json({ error: "bad_visitor" }, { status: 400 });

  if (url.searchParams.get("meta") === "1") {
    return NextResponse.json({ unread: await getUnread(visitorId) });
  }

  const since = Number(url.searchParams.get("since") || "0") || 0;
  const messages = await getMessages(visitorId, since);
  if (url.searchParams.get("clear") === "1") await clearUnread(visitorId);
  return NextResponse.json({ messages });
}

export async function POST(req: Request) {
  const rl = await checkRateLimit(limiters.chat, clientIp(req));
  if (!rl.ok) return rateLimitResponse(rl.retryAfter);

  if (!CHAT_ENABLED || !TELEGRAM_CONFIGURED) {
    return NextResponse.json(
      { error: "chat_unavailable", message: "Чат временно недоступен. Оставьте сообщение через форму «Сообщить о проблеме»." },
      { status: 503 }
    );
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "bad_body" }, { status: 400 });
  }

  const visitorId = typeof body.visitorId === "string" ? body.visitorId.slice(0, 64) : "";
  if (!visitorId) return NextResponse.json({ error: "bad_visitor" }, { status: 400 });

  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (text.length < 1 || text.length > TEXT_MAX) {
    return NextResponse.json({ error: "invalid_text" }, { status: 400 });
  }

  if (body.consent !== true) {
    return NextResponse.json({ error: "consent_required" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim().slice(0, 80) : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!name || !EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ error: "invalid_profile" }, { status: 400 });
  }

  await saveProfile(visitorId, { name, email });

  // Получаем или создаём тему (forum topic) в Telegram-супергруппе.
  let threadId = await getThread(visitorId);  const shortId = visitorId.slice(0, 6);
  if (!threadId) {
    const topicName = `${name} · #${shortId}`;
    threadId = await createForumTopic(topicName);
    if (!threadId) {
      return NextResponse.json(
        { error: "topic_failed", message: "Не удалось инициализировать чат. Попробуйте позже." },
        { status: 502 }
      );
    }
    await setThread(visitorId, threadId);

    const ctx = body.ctx && typeof body.ctx === "object" ? body.ctx : {};
    const contextText = [
      `👤 <b>Новый посетитель</b> #${escapeHtml(shortId)}`,
      `📄 Имя: ${escapeHtml(name)}`,
      `✉️ Email: ${escapeHtml(email)}`,
      ctx.url ? `🌐 Страница: ${escapeHtml(String(ctx.url))}` : null,
      ctx.referrer ? `🔗 Откуда: ${escapeHtml(String(ctx.referrer))}` : null,
      ctx.ua ? `🖥 ${escapeHtml(String(ctx.ua).slice(0, 200))}` : null,
      ctx.lang ? `🗣 Язык: ${escapeHtml(String(ctx.lang))}` : null,
      `⏰ ${new Date().toLocaleString("ru-RU")}`,
    ]
      .filter(Boolean)
      .join("\n");
    await sendToTopic(threadId, contextText);
  }

  const msg: ChatMessage = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role: "visitor",
    text,
    ts: Date.now(),
    name,
  };
  await appendMessage(visitorId, msg);
  await sendToTopic(threadId, text);

  return NextResponse.json({ ok: true, message: msg });
}

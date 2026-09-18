import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "node:crypto";
import { limiters, clientIp, checkRateLimit, rateLimitResponse } from "@/lib/ratelimit";
import { withCsrf } from "@/lib/csrf";
import { isSameOrigin } from "@/lib/admin-auth";
import { chatSchema, validateBody } from "@/lib/validations/api";
import {
  getThread,
  setThread,
  appendMessage,
  getMessages,
  clearUnread,
  getUnread,
  saveProfile,
  touchActiveThread,
  touchPresence,
  type ChatMessage,
} from "@/lib/chat-store";
import {
  TELEGRAM_CONFIGURED,
  createForumTopic,
  sendToTopic,
  escapeHtml,
} from "@/lib/telegram-chat";

const CHAT_ENABLED = process.env.NEXT_PUBLIC_CHAT_ENABLED === "1";



// Защита от IDOR (C4): GET возвращает переписку только для visitorId, привязанного
// к подписанному httpOnly-cookie. Угадать чужой UUID нельзя, а cookie не читается
// JS на стороннем сайте (httpOnly + sameSite=lax) — значит прочитать чужую
// переписку (вместе с ФИО/email) невозможно.
const CHAT_COOKIE = "chat_vid";
function chatHmacSecret(): string {
  // Fail-closed (аудит S2): без явного секрета подпись visitor-cookie
  // предсказуема (фолбэки на SERVICE_ROLE / "insecure-chat-dev-only"
  // позволяли подделать чужой visitorId). Роут просто отдаёт 500,
  // пока CHAT_HMAC_SECRET не настроен.
  const secret = process.env.CHAT_HMAC_SECRET;
  if (!secret) throw new Error("CHAT_HMAC_SECRET is not configured");
  return secret;
}
function signVisitor(visitorId: string): string {
  const sig = crypto
    .createHmac("sha256", chatHmacSecret())
    .update(visitorId)
    .digest("base64url");
  return `${visitorId}.${sig}`;
}
function verifyVisitorCookie(value: string | undefined): string | null {
  if (!value) return null;
  const idx = value.lastIndexOf(".");
  if (idx <= 0) return null;
  const vid = value.slice(0, idx);
  const sig = value.slice(idx + 1);
  const expected = crypto
    .createHmac("sha256", chatHmacSecret())
    .update(vid)
    .digest("base64url");
  if (sig.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  return vid;
}

export async function GET(req: Request) {
  const rl = await checkRateLimit(limiters.chat, clientIp(req));
  if (!rl.ok) return rateLimitResponse(rl.retryAfter);

  const cookieStore = await cookies();
  const url = new URL(req.url);
  if (url.searchParams.get("meta") === "1") {
    // Публичный поллинг (SupportLauncher) — возвращает 200 даже без cookie,
    // чтобы не засорять консоль 403. Реальные данные (unread) отдаются
    // только когда visitorId верифицирован через подписанную cookie.
    const vid = verifyVisitorCookie(cookieStore.get(CHAT_COOKIE)?.value);
    const unread = vid ? await getUnread(vid) : 0;
    if (vid) await touchPresence(vid);
    return NextResponse.json({ unread });
  }

  const visitorId = verifyVisitorCookie(cookieStore.get(CHAT_COOKIE)?.value);
  if (!visitorId) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const since = Number(url.searchParams.get("since") || "0") || 0;
  const messages = await getMessages(visitorId, since);
  if (url.searchParams.get("clear") === "1") await clearUnread(visitorId);
  return NextResponse.json({ messages });
}

async function postHandler(req: Request) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const rl = await checkRateLimit(limiters.chat, clientIp(req));
  if (!rl.ok) return rateLimitResponse(rl.retryAfter);

  if (!CHAT_ENABLED || !TELEGRAM_CONFIGURED) {
    return NextResponse.json(
      { error: "chat_unavailable", message: "Чат временно недоступен. Оставьте сообщение через форму «Сообщить о проблеме»." },
      { status: 503 }
    );
  }

  // P1: Zod-валидация (best practice 2026: safeParse + structured error)
  const parsed: unknown = await req.json().catch(() => null);
  const validated = validateBody(chatSchema, parsed);
  if (!validated.success) return validated.error;
  const { visitorId, text: rawText, name, email, ctx: rawCtx } = validated.data;
  const text = rawText.trim();
  const safeVisitorId = visitorId.slice(0, 64);
  const ctx = rawCtx ?? {};

  await saveProfile(safeVisitorId, { name, email });

  const buildContextText = () =>
    [
      `👤 <b>Новый посетитель</b> #${escapeHtml(safeVisitorId.slice(0, 6))}`,
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

  // Получаем или создаём тему (forum topic) в Telegram-супергруппе.
  let threadId = await getThread(safeVisitorId);
  const shortId = safeVisitorId.slice(0, 6);
  const ensureTopic = async (): Promise<number | null> => {
    if (!threadId) {
      const topicName = `${name} · #${shortId}`;
      const created = await createForumTopic(topicName);
      if (!created) return null;
      threadId = created;
      await setThread(safeVisitorId, threadId);
      await sendToTopic(threadId, buildContextText());
    }
    return threadId;
  };
  const topic = await ensureTopic();
  if (!topic) {
    return NextResponse.json(
      { error: "topic_failed", message: "Не удалось инициализировать чат. Попробуйте позже." },
      { status: 502 }
    );
  }

  const msg: ChatMessage = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role: "visitor",
    text,
    ts: Date.now(),
    name,
  };
  await appendMessage(visitorId, msg);
  await touchActiveThread(visitorId, msg.ts);
  const delivered = await sendToTopic(topic, text);
  if (!delivered) {
    // Тема могла быть удалена в Telegram («message thread not found»):
    // пересоздаём тему и переотправляем контекст + сообщение.
    threadId = null;
    const recreated = await ensureTopic();
    if (recreated) await sendToTopic(recreated, text);
  }

  const res = NextResponse.json({ ok: true, message: msg });
  // Привязываем эту беседу к подписанному httpOnly-cookie (C4).
  res.cookies.set(CHAT_COOKIE, signVisitor(visitorId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}

export const POST = withCsrf(postHandler);

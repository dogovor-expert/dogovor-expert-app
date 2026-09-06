import { Redis } from "@upstash/redis";

// Распределённое хранилище истории чатов и маппинга visitorId <-> Telegram topic.
// Используем тот же Upstash Redis, что и rate limiter (env UPSTASH_REDIS_*).
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

if (!redis) {
  console.warn(
    "[chat-store] UPSTASH_REDIS_* не настроены — история чата не будет сохраняться (fail-open)."
  );
}

/** Срок жизни данных чата — 30 дней (приватность: переписка может содержать ФИО/паспортные данные). */
const TTL_SECONDS = 60 * 60 * 24 * 30;

export interface ChatMessage {
  id: string;
  role: "visitor" | "operator";
  text: string;
  ts: number;
  name?: string;
}

export interface ChatProfile {
  name: string;
  email: string;
}

const msgKey = (v: string) => `chat:msgs:${v}`;
const threadKey = (v: string) => `chat:thread:${v}`;
const visitorByThreadKey = (t: number) => `chat:visitor:thread:${t}`;
const unreadKey = (v: string) => `chat:unread:${v}`;
const profileKey = (v: string) => `chat:profile:${v}`;
/** Sorted set всех активных переписок: score = ts последнего сообщения. */
const ACTIVE_THREADS_KEY = "chat:active";
const onlineKey = (v: string) => `chat:online:${v}`;

export function chatStoreAvailable(): boolean {
  return !!redis;
}

/** Регистрация активности переписки (вызывается при каждом appendMessage). */
export async function touchActiveThread(visitorId: string, ts: number): Promise<void> {
  if (!redis) return;
  await redis.zadd(ACTIVE_THREADS_KEY, { score: ts, member: visitorId });
}

/** Список последних активных visitorId (сначала свежие). */
export async function listActiveThreads(limit = 50): Promise<string[]> {
  if (!redis) return [];
  return redis.zrange(ACTIVE_THREADS_KEY, 0, limit - 1, { rev: true });
}

/** Presence: вызывается на каждый poll виджета; TTL чуть больше 3 опросов. */
export async function touchPresence(visitorId: string): Promise<void> {
  if (!redis) return;
  await redis.set(onlineKey(visitorId), 1, { ex: 45 });
}

/** Онлайн ли посетитель (ключ присутствия жив). */
export async function isOnline(visitorId: string): Promise<boolean> {
  if (!redis) return false;
  return (await redis.exists(onlineKey(visitorId))) === 1;
}

export async function getThread(visitorId: string): Promise<number | null> {
  if (!redis) return null;
  const t = await redis.get<number>(threadKey(visitorId));
  return typeof t === "number" ? t : null;
}

export async function setThread(visitorId: string, threadId: number): Promise<void> {
  if (!redis) return;
  await redis.set(threadKey(visitorId), threadId, { ex: TTL_SECONDS });
  await redis.set(visitorByThreadKey(threadId), visitorId, { ex: TTL_SECONDS });
}

export async function getVisitorByThread(threadId: number): Promise<string | null> {
  if (!redis) return null;
  const v = await redis.get<string>(visitorByThreadKey(threadId));
  return typeof v === "string" ? v : null;
}

export async function appendMessage(visitorId: string, msg: ChatMessage): Promise<void> {
  if (!redis) return;
  // @upstash/redis сам сериализует объект — НЕ оборачиваем в JSON.stringify.
  await redis.rpush(msgKey(visitorId), msg);
  await redis.expire(msgKey(visitorId), TTL_SECONDS);
}

export async function getMessages(visitorId: string, sinceTs = 0): Promise<ChatMessage[]> {
  if (!redis) return [];
  // lrange возвращает уже десериализованные объекты (не строки).
  const raw = await redis.lrange<ChatMessage>(msgKey(visitorId), 0, -1);
  if (!sinceTs) return raw;
  return raw.filter((m) => m.ts >= sinceTs);
}

export async function incUnread(visitorId: string): Promise<void> {
  if (!redis) return;
  await redis.incr(unreadKey(visitorId));
  await redis.expire(unreadKey(visitorId), TTL_SECONDS);
}

export async function getUnread(visitorId: string): Promise<number> {
  if (!redis) return 0;
  const n = await redis.get<number>(unreadKey(visitorId));
  return typeof n === "number" ? n : 0;
}

export async function clearUnread(visitorId: string): Promise<void> {
  if (!redis) return;
  await redis.del(unreadKey(visitorId));
}

export async function saveProfile(visitorId: string, profile: ChatProfile): Promise<void> {
  if (!redis) return;
  await redis.set(profileKey(visitorId), JSON.stringify(profile), { ex: TTL_SECONDS });
}

export async function getProfile(visitorId: string): Promise<ChatProfile | null> {
  if (!redis) return null;
  const raw = await redis.get<string>(profileKey(visitorId));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ChatProfile;
  } catch {
    return null;
  }
}

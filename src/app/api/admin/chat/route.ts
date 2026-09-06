import { NextResponse } from "next/server";
import { requireAdminApi, isSameOrigin } from "@/lib/admin-auth";
import {
  listActiveThreads,
  getMessages,
  getProfile,
  isOnline,
  chatStoreAvailable,
} from "@/lib/chat-store";

export const dynamic = "force-dynamic";

/**
 * Read-only инбокс чата для админки: список активных переписок
 * (chat:active sorted set) + история конкретного диалога.
 * Пишет только в Redis; в Telegram не дублирует (read-only MVP).
 */
export async function GET(req: Request) {
  const admin = await requireAdminApi();
  if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  if (!chatStoreAvailable()) {
    return NextResponse.json({ error: "chat_store_unavailable" }, { status: 503 });
  }

  const url = new URL(req.url);
  const visitorId = url.searchParams.get("visitorId");

  // Режим истории конкретной переписки.
  if (visitorId) {
    if (!/^[0-9a-zA-Z-]{6,64}$/.test(visitorId)) {
      return NextResponse.json({ error: "invalid_visitor_id" }, { status: 400 });
    }
    const [messages, profile, online] = await Promise.all([
      getMessages(visitorId),
      getProfile(visitorId),
      isOnline(visitorId),
    ]);
    return NextResponse.json({ messages, profile, online });
  }

  // Список последних активных диалогов с превью.
  const limit = Math.min(Number(url.searchParams.get("limit") || "40") || 40, 100);
  const ids = await listActiveThreads(limit);
  const threads = await Promise.all(
    ids.map(async (id) => {
      const [messages, profile, online] = await Promise.all([
        getMessages(id),
        getProfile(id),
        isOnline(id),
      ]);
      const last = messages[messages.length - 1];
      return {
        visitorId: id,
        name: profile?.name ?? null,
        email: profile?.email ?? null,
        online,
        lastText: last?.text?.slice(0, 140) ?? null,
        lastRole: last?.role ?? null,
        lastTs: last?.ts ?? null,
        total: messages.length,
      };
    })
  );

  // Свежие сверху.
  threads.sort((a, b) => (b.lastTs ?? 0) - (a.lastTs ?? 0));
  return NextResponse.json({ threads });
}

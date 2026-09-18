import { gunzipSync } from "node:zlib";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Чтение записей визитов для /admin/replays.
 * Таблицы session_replays/session_replay_chunks закрыты RLS и доступны
 * только service_role, поэтому здесь всегда createAdminClient().
 */

export type ReplaySessionRow = {
  session_id: string;
  user_id: string | null;
  started_at: string;
  last_seen_at: string;
  chunk_count: number;
  size_bytes: number;
  device: string | null;
  entry_path: string | null;
};

export async function listReplaySessions(days = 30, limit = 200): Promise<ReplaySessionRow[]> {
  const admin = createAdminClient();
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await admin
    .from("session_replays")
    .select("session_id,user_id,started_at,last_seen_at,chunk_count,size_bytes,device,entry_path")
    .gte("last_seen_at", since)
    .order("last_seen_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []);
}

export async function getReplaySession(sessionId: string): Promise<ReplaySessionRow | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("session_replays")
    .select("session_id,user_id,started_at,last_seen_at,chunk_count,size_bytes,device,entry_path")
    .eq("session_id", sessionId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data) ?? null;
}

/**
 * Собирает все чанки визита в один массив событий rrweb.
 * Чанки хранятся как base64(gzip(JSON)); битый чанк пропускаем —
 * не роняем страницу из-за одного повреждённого сегмента.
 */
export async function getReplayEvents(sessionId: string): Promise<unknown[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("session_replay_chunks")
    .select("seq,data")
    .eq("session_id", sessionId)
    .order("seq", { ascending: true })
    .limit(5000);
  if (error) throw new Error(error.message);

  const events: unknown[] = [];
  for (const row of (data ?? []) as { seq: number; data: string }[]) {
    try {
      const json = gunzipSync(Buffer.from(row.data, "base64")).toString("utf-8");
      const parsed: unknown = JSON.parse(json);
      if (Array.isArray(parsed)) events.push(...(parsed as unknown[]));
    } catch {
      console.warn(`[replay] повреждённый чанк seq=${row.seq} session=${sessionId}`);
    }
  }
  return events;
}

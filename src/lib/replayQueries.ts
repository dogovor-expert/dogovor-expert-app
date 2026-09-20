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

export interface ReplayFilter {
  days: number;
  device?: string | null;
  query?: string | null;
  limit: number;
  offset: number;
}

export interface ReplayListResult {
  rows: ReplaySessionRow[];
  total: number;
}

/** Список визитов с фильтрами (устройство, поиск по session_id/входному пути) и пагинацией. */
export async function listReplaySessionsFiltered(f: ReplayFilter): Promise<ReplayListResult> {
  const admin = createAdminClient();
  const since = new Date(Date.now() - f.days * 24 * 60 * 60 * 1000).toISOString();
  let q = admin
    .from("session_replays")
    .select(
      "session_id,user_id,started_at,last_seen_at,chunk_count,size_bytes,device,entry_path",
      { count: "exact" }
    )
    .gte("last_seen_at", since);
  if (f.device) q = q.eq("device", f.device);
  if (f.query) {
    const like = `%${f.query.replace(/[%,()]/g, "").slice(0, 80)}%`;
    q = q.or(`session_id.ilike.${like},entry_path.ilike.${like}`);
  }
  const { data, error, count } = await q
    .order("last_seen_at", { ascending: false })
    .range(f.offset, f.offset + f.limit - 1);
  if (error) throw new Error(error.message);
  return { rows: data ?? [], total: count ?? 0 };
}

/** Количество записей за период (для аналитики). */
export async function countReplaySessions(days = 30): Promise<number> {
  const admin = createAdminClient();
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const { count } = await admin
    .from("session_replays")
    .select("session_id", { count: "exact", head: true })
    .gte("last_seen_at", since);
  return count ?? 0;
}

/** Удаляет один визит вместе со всеми чанками. */
export async function deleteReplaySession(sessionId: string): Promise<void> {
  const admin = createAdminClient();
  await admin.from("session_replay_chunks").delete().eq("session_id", sessionId);
  const { error } = await admin.from("session_replays").delete().eq("session_id", sessionId);
  if (error) throw new Error(error.message);
}

/** Удаляет визиты старше N дней (пакетно, по 100). Возвращает число удалённых. */
export async function deleteReplaySessionsOlderThan(days: number): Promise<number> {
  const admin = createAdminClient();
  const before = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const { data } = await admin
    .from("session_replays")
    .select("session_id")
    .lt("last_seen_at", before);
  const ids = (data ?? []).map((r: { session_id: string }) => r.session_id);
  for (let i = 0; i < ids.length; i += 100) {
    const chunk = ids.slice(i, i + 100);
    await admin.from("session_replay_chunks").delete().in("session_id", chunk);
    await admin.from("session_replays").delete().in("session_id", chunk);
  }
  return ids.length;
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

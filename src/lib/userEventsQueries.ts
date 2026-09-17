import { createAdminClient } from "@/lib/supabase/admin";
import { EVENT_CATALOG, SERVER_SESSION_PREFIX, type EventName } from "@/lib/userEvents";

export interface DailyPoint {
  day: string; // YYYY-MM-DD
  count: number;
}

export interface EventSummary {
  event: EventName;
  label: string;
  total: number;
  series: DailyPoint[]; // по дням за весь запрошенный период, с нулями в пропусках
}

/** Список дат YYYY-MM-DD за последние `days` дней, включая сегодня. */
function dateRange(days: number): string[] {
  const out: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

/**
 * Сводка по всем событиям каталога за последние `days` дней: суммарно и
 * по дням (с нулями там, где событий не было — иначе график «прыгает»).
 */
export async function getEventSummaries(days = 30): Promise<EventSummary[]> {
  const admin = createAdminClient();
  const { data, error } = (await admin.rpc("user_events_daily", { p_days: days })) as {
    data: { event: string; day: string; count: number }[] | null;
    error: { message: string } | null;
  };
  if (error || !data) return [];

  const range = dateRange(days);
  const byEvent = new Map<string, Map<string, number>>();
  for (const row of data) {
    const perDay = byEvent.get(row.event) ?? new Map<string, number>();
    perDay.set(row.day, Number(row.count));
    byEvent.set(row.event, perDay);
  }

  return (Object.keys(EVENT_CATALOG) as EventName[]).map((event): EventSummary => {
    const perDay = byEvent.get(event) ?? new Map<string, number>();
    const series = range.map((day) => ({ day, count: perDay.get(day) ?? 0 }));
    return {
      event,
      label: EVENT_CATALOG[event].label,
      total: series.reduce((s, p) => s + p.count, 0),
      series,
    };
  });
}

export interface FunnelStep {
  event: EventName;
  label: string;
  count: number;
  /** Доля от первого шага воронки, 0..1. */
  ratioFromStart: number;
  /** Доля от предыдущего шага, 0..1 (null для первого шага). */
  ratioFromPrev: number | null;
}

/** Стандартная воронка «зашёл → начал → скачал/подписал → оплатил». */
const FUNNEL: EventName[] = ["builder_start", "export_pdf", "payment_created", "payment_success"];

export async function getFunnel(days = 30): Promise<FunnelStep[]> {
  const summaries = await getEventSummaries(days);
  const totalsByEvent = new Map(summaries.map((s) => [s.event, s.total]));
  const startTotal = totalsByEvent.get(FUNNEL[0]) ?? 0;
  let prev: number | null = null;
  return FUNNEL.map((event) => {
    const count = totalsByEvent.get(event) ?? 0;
    const step: FunnelStep = {
      event,
      label: EVENT_CATALOG[event].label,
      count,
      ratioFromStart: startTotal > 0 ? count / startTotal : 0,
      ratioFromPrev: prev !== null && prev > 0 ? count / prev : null,
    };
    prev = count;
    return step;
  });
}

export interface TopTemplateRow {
  template: string;
  count: number;
}

/** Топ шаблонов по открытиям конструктора за период (для карточки «популярное»). */
export async function getTopTemplates(days = 30, limit = 8): Promise<TopTemplateRow[]> {
  const admin = createAdminClient();
  const since = new Date(Date.now() - days * 86400000).toISOString();
  const { data, error } = await admin
    .from("user_events")
    .select("meta")
    .eq("event", "builder_start")
    .gte("created_at", since)
    .limit(5000);
  if (error || !data) return [];

  const counts = new Map<string, number>();
  for (const row of data as { meta: { template?: string } | null }[]) {
    const t = row.meta?.template;
    if (!t) continue;
    counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([template, count]) => ({ template, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export interface UserEventRow {
  id: string;
  event: EventName;
  path: string | null;
  device: string | null;
  meta: Record<string, unknown> | null;
  created_at: string;
}

/** Лента событий одного пользователя — для карточки в /admin/users/[id]. */
export async function getUserEventTimeline(userId: string, limit = 100): Promise<UserEventRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("user_events")
    .select("id, event, path, device, meta, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data;
}

export interface KpiTotals {
  visitsToday: number;
  visits7d: number;
  uniqueSessions7d: number;
  conversionRate: number; // payment_success / builder_start за период, 0..1
}

export async function getKpiTotals(): Promise<KpiTotals> {
  const admin = createAdminClient();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();

  const [{ count: visitsToday }, { data: last7 }] = await Promise.all([
    admin
      .from("user_events")
      .select("id", { count: "exact", head: true })
      .eq("event", "page_view")
      .gte("created_at", startOfToday.toISOString()),
    admin
      .from("user_events")
      .select("event, session_id")
      .in("event", ["page_view", "builder_start", "payment_success"])
      .gte("created_at", sevenDaysAgo)
      .limit(20000),
  ]);

  const rows = (last7 ?? []) as { event: string; session_id: string }[];
  const visits7d = rows.filter((r) => r.event === "page_view").length;
  // Уникальные визиты считаем по клиентским session_id; служебные
  // серверные псевдосессии (srv-..., платежи) сюда не попадают, иначе
  // «уникальные визиты» завышались бы на каждую оплату.
  const uniqueSessions7d = new Set(
    rows
      .filter((r) => !r.session_id.startsWith(SERVER_SESSION_PREFIX))
      .map((r) => r.session_id)
  ).size;
  const starts = rows.filter((r) => r.event === "builder_start").length;
  const success = rows.filter((r) => r.event === "payment_success").length;

  return {
    visitsToday: visitsToday ?? 0,
    visits7d,
    uniqueSessions7d,
    conversionRate: starts > 0 ? success / starts : 0,
  };
}

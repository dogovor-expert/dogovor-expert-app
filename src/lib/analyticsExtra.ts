import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Дополнительные срезы аналитики поверх user_events: устройства, топ страниц,
 * источники трафика, мультиметрический мониторинг по дням и дельты KPI.
 * Всё агрегируется на сервере (данные обезличены), доступ — только из админки.
 */

export interface NamedCount {
  label: string;
  count: number;
}

export interface DayPoint {
  day: string;
  count: number;
}

export interface MultiSeries {
  key: string;
  label: string;
  color: string;
  series: DayPoint[];
  total: number;
}

export interface KpiDeltas {
  today: { current: number; previous: number };
  week: { current: number; previous: number };
}

const DEVICE_LABELS: Record<string, string> = {
  mobile: "Телефон",
  tablet: "Планшет",
  desktop: "Компьютер",
  unknown: "Неизвестно",
};

function sinceIso(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

function dayKeys(days: number): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i -= 1) {
    out.push(new Date(now.getTime() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
  }
  return out;
}

/** Разбивка визитов по типу устройства. */
export async function getDeviceBreakdown(days = 30): Promise<NamedCount[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("user_events")
    .select("device")
    .eq("event", "page_view")
    .gte("created_at", sinceIso(days))
    .limit(20000);
  const map = new Map<string, number>();
  for (const r of (data ?? []) as { device: string | null }[]) {
    const k = r.device ?? "unknown";
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([k, c]) => ({ label: DEVICE_LABELS[k] ?? k, count: c }))
    .sort((a, b) => b.count - a.count);
}

/** Топ просматриваемых страниц. */
export async function getTopPaths(days = 30, limit = 8): Promise<NamedCount[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("user_events")
    .select("path")
    .eq("event", "page_view")
    .gte("created_at", sinceIso(days))
    .limit(20000);
  const map = new Map<string, number>();
  for (const r of (data ?? []) as { path: string | null }[]) {
    const k = r.path || "/";
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([k, c]) => ({ label: k, count: c }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/** Источники трафика (по referrer-хосту). */
export async function getTopReferrers(days = 30, limit = 8): Promise<NamedCount[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("user_events")
    .select("referrer_host")
    .eq("event", "page_view")
    .not("referrer_host", "is", null)
    .gte("created_at", sinceIso(days))
    .limit(20000);
  const map = new Map<string, number>();
  for (const r of (data ?? []) as { referrer_host: string | null }[]) {
    const k = (r.referrer_host ?? "").trim();
    if (!k) continue;
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([k, c]) => ({ label: k, count: c }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

const MULTI = [
  { key: "page_view", label: "Визиты", color: "#2563eb" },
  { key: "builder_start", label: "Конструктор", color: "#7c3aed" },
  { key: "export_pdf", label: "Экспорт PDF", color: "#059669" },
  { key: "payment_success", label: "Оплаты", color: "#d97706" },
] as const;

/** Мультиметрический мониторинг по дням: визиты, конструктор, экспорт, оплаты. */
export async function getDailyMulti(days = 30): Promise<MultiSeries[]> {
  const admin = createAdminClient();
  const keys = MULTI.map((m) => m.key) as unknown as string[];
  const { data } = await admin
    .from("user_events")
    .select("event,created_at")
    .in("event", keys)
    .gte("created_at", sinceIso(days))
    .limit(20000);

  const daysArr = dayKeys(days);
  const idx = new Map(daysArr.map((d, i) => [d, i]));

  return MULTI.map((m) => {
    const series: DayPoint[] = daysArr.map((day) => ({ day, count: 0 }));
    let total = 0;
    for (const r of (data ?? []) as { event: string; created_at: string }[]) {
      if (r.event !== m.key) continue;
      const i = idx.get(r.created_at.slice(0, 10));
      if (i === undefined) continue;
      series[i].count += 1;
      total += 1;
    }
    return { key: m.key, label: m.label, color: m.color, series, total };
  });
}

/** Дельта визитов: сегодня vs вчера, 7 дней vs предыдущие 7. */
export async function getKpiDeltas(): Promise<KpiDeltas> {
  const admin = createAdminClient();
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const startYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toISOString();
  const start7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const start14 = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

  const { data } = await admin
    .from("user_events")
    .select("created_at")
    .eq("event", "page_view")
    .gte("created_at", start14)
    .limit(40000);

  let today = 0;
  let yesterday = 0;
  let week = 0;
  let prevWeek = 0;
  for (const r of (data ?? []) as { created_at: string }[]) {
    const t = r.created_at;
    if (t >= startToday) today += 1;
    else if (t >= startYesterday) yesterday += 1;
    if (t >= start7) week += 1;
    else if (t >= start14) prevWeek += 1;
  }
  return { today: { current: today, previous: yesterday }, week: { current: week, previous: prevWeek } };
}

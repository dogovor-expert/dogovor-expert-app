import { createAdminClient } from "@/lib/supabase/admin";
import { LEGAL_TEMPLATES } from "@/data/templates";
import { checkRateLimit, clientIp, limiters, rateLimitResponse } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

interface BlogStatsRow {
  meta: { template?: string } | null;
}

/** Живые статы для блога: сколько документов создали сегодня + топ-3 шаблона. */
export async function GET(req: Request) {
  const rl = await checkRateLimit(limiters.publicForm, clientIp(req));
  if (!rl.ok) return rateLimitResponse(rl.retryAfter);

  const admin = createAdminClient();
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);

  const [{ count, error: countError }, { data, error: dataError }] = await Promise.all([
    admin
      .from("user_events")
      .select("id", { count: "exact", head: true })
      .eq("event", "export_pdf")
      .gte("created_at", dayStart.toISOString()),
    admin
      .from("user_events")
      .select("meta")
      .eq("event", "export_pdf")
      .gte("created_at", dayStart.toISOString())
      .limit(5000),
  ]);

  if (countError || dataError) {
    return Response.json(
      { exportPdfToday: null, top: [] },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  const nameById = new Map(LEGAL_TEMPLATES.map((t) => [t.id, t.name]));
  const counts = new Map<string, number>();
  for (const row of (data ?? []) as BlogStatsRow[]) {
    const t = row.meta?.template;
    if (!t) continue;
    counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  const top = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id]) => nameById.get(id))
    .filter((n): n is string => Boolean(n));

  return Response.json(
    { exportPdfToday: count ?? 0, top },
    { headers: { "Cache-Control": "no-store" } }
  );
}
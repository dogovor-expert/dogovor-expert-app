import Link from "next/link";
import { unstable_cache } from "next/cache";
import { requireAdminPage } from "@/lib/admin-auth";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from "@/components/ui/Table";
import { DailyBarChart } from "@/components/admin/analytics/DailyBarChart";
import { FunnelChart } from "@/components/admin/analytics/FunnelChart";
import { getEventSummaries, getFunnel, getTopTemplates, getKpiTotals } from "@/lib/userEventsQueries";
import { getDeviceBreakdown, getTopPaths, getTopReferrers, getDailyMulti, getKpiDeltas } from "@/lib/analyticsExtra";
import { getLeadsSummary } from "@/lib/leadsQueries";
import { countReplaySessions } from "@/lib/replayQueries";
import { EVENT_CATALOG } from "@/lib/userEvents";
import { Eye, Users, TrendingUp, Percent, MonitorSmartphone, FileText, ArrowUpRight, ArrowDownRight, Globe, Inbox, PlaySquare } from "lucide-react";

export const dynamic = "force-dynamic";

const GROUP_LABELS: Record<string, string> = {
  traffic: "Трафик",
  builder: "Конструктор",
  ocr: "Распознавание",
  export: "Экспорт",
  signing: "Подписание",
  billing: "Монетизация",
  support: "Поддержка",
};

const PERIODS = [7, 30, 90] as const;

/** Горизонтальный список «значение + доля» для устройств/страниц/источников. */
function BarList({ items }: { items: { label: string; count: number }[] }) {
  if (!items.length) return <p className="text-sm text-gray-400">Нет данных за период</p>;
  const max = Math.max(...items.map((i) => i.count), 1);
  return (
    <div className="space-y-2">
      {items.map((it) => (
        <div key={it.label} className="flex items-center gap-3">
          <span className="text-sm text-gray-700 w-40 truncate shrink-0" title={it.label}>
            {it.label}
          </span>
          <div className="flex-1 h-4 rounded bg-gray-100 overflow-hidden">
            <div className="h-full rounded bg-brand-400" style={{ width: `${Math.max((it.count / max) * 100, 3)}%` }} />
          </div>
          <span className="text-xs text-gray-500 tabular-nums w-12 text-right">{it.count.toLocaleString("ru-RU")}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * Агрегаты аналитики кэшируются на 5 минут: страница делает 11 запросов к БД,
 * а данные за день меняются нечасто. Кэш общий (данные обезличены, раздел
 * доступен только администраторам).
 */
const loadAnalytics = unstable_cache(
  async (days: number) =>
    Promise.all([
      getEventSummaries(days),
      getFunnel(days),
      getTopTemplates(days),
      getKpiTotals(),
      getDeviceBreakdown(days),
      getTopPaths(days),
      getTopReferrers(days),
      getDailyMulti(days),
      getKpiDeltas(),
      getLeadsSummary(days),
      countReplaySessions(days),
    ]),
  ["admin-analytics"],
  { revalidate: 300 }
);

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Агрегаты по всем пользователям — данные обезличены (event/day/count),
  // но раздел логически «финансово-поведенческий», поэтому тот же уровень
  // доступа, что и у платежей/подписок (6.5 RBAC).
  await requireAdminPage("admin");
  const sp = await searchParams;
  const daysParam = Number(Array.isArray(sp.days) ? sp.days[0] : sp.days);
  const days = (PERIODS as readonly number[]).includes(daysParam) ? daysParam : 30;

  const [summaries, funnel, topTemplates, kpi, devices, topPaths, referrers, multi, deltas, leads, replays] =
    await loadAnalytics(days);

  const pageViews = summaries.find((s) => s.event === "page_view");
  const byGroup = new Map<string, typeof summaries>();
  for (const s of summaries) {
    const group = EVENT_CATALOG[s.event].group;
    if (!byGroup.has(group)) byGroup.set(group, []);
    byGroup.get(group)?.push(s);
  }

  const deltaPct = (c: number, p: number) => (p === 0 ? (c > 0 ? 100 : 0) : Math.round(((c - p) / p) * 100));
  const kpiCards: Array<{
    label: string;
    value: number | string;
    icon: typeof Eye;
    delta?: number;
    deltaLabel?: string;
    hint?: string;
  }> = [
    { label: "Визитов сегодня", value: kpi.visitsToday, icon: Eye, delta: deltaPct(deltas.today.current, deltas.today.previous), deltaLabel: "к вчерашнему дню" },
    { label: "Визитов за 7 дней", value: kpi.visits7d, icon: TrendingUp, delta: deltaPct(deltas.week.current, deltas.week.previous), deltaLabel: "к прошлой неделе" },
    { label: "Уникальных визитов за 7 дней", value: kpi.uniqueSessions7d, icon: Users },
    {
      label: "Конверсия в оплату",
      value: `${Math.round(kpi.conversionRate * 100)}%`,
      icon: Percent,
      hint: "payment_success / builder_start",
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Аналитика</h1>
          <p className="text-gray-600 text-sm">
            Собственный журнал действий пользователей — данные не покидают инфраструктуру
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {PERIODS.map((p) => (
            <Link
              key={p}
              href={`/admin/analytics?days=${p}`}
              className={`px-3 py-1.5 text-sm rounded-lg border ${
                p === days
                  ? "bg-brand-600 border-brand-600 text-white"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {p} дн.
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((k) => {
          const Icon = k.icon;
          return (
            <Card key={k.label} className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-brand-600" />
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-gray-900 tabular-nums">{k.value}</p>
                    {typeof k.delta === "number" && (
                      <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${k.delta >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                        {k.delta >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        {Math.abs(k.delta)}%
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600">{k.label}</p>
                  {k.deltaLabel && <p className="text-[10px] text-gray-400">{k.deltaLabel}</p>}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card padding="md">
          <h2 className="font-semibold text-gray-900 mb-1">Воронка конверсии</h2>
          <p className="text-xs text-gray-500 mb-4">За последние {days} дней, по всем пользователям</p>
          <FunnelChart steps={funnel} />
        </Card>

        <Card padding="md">
          <h2 className="font-semibold text-gray-900 mb-1">Просмотры страниц</h2>
          <p className="text-xs text-gray-500 mb-4">
            {pageViews?.total.toLocaleString("ru-RU") ?? 0} за {days} дней
          </p>
          <DailyBarChart data={pageViews?.series ?? []} />
        </Card>
      </div>

      <Card padding="md">
        <h2 className="font-semibold text-gray-900 mb-1">Популярные шаблоны</h2>
        <p className="text-xs text-gray-500 mb-4">По открытиям конструктора за {days} дней</p>
        {topTemplates.length === 0 ? (
          <p className="text-sm text-gray-400">Нет данных за период</p>
        ) : (
          <div className="space-y-2">
            {topTemplates.map((t) => {
              const max = topTemplates[0]?.count ?? 1;
              return (
                <div key={t.template} className="flex items-center gap-3">
                  <span className="text-sm text-gray-700 w-40 truncate shrink-0" title={t.template}>
                    {t.template}
                  </span>
                  <div className="flex-1 h-4 rounded bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded bg-brand-400"
                      style={{ width: `${Math.max((t.count / max) * 100, 3)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 tabular-nums w-10 text-right">{t.count}</span>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card padding="md">
        <h2 className="font-semibold text-gray-900 mb-1">Мониторинг по дням</h2>
        <p className="text-xs text-gray-500 mb-4">Визиты, открытия конструктора, экспорт и оплаты за {days} дней</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {multi.map((m) => (
            <div key={m.key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{m.label}</span>
                <span className="text-xs text-gray-500 tabular-nums">{m.total.toLocaleString("ru-RU")}</span>
              </div>
              <DailyBarChart data={m.series} color={m.color} height={72} />
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card padding="md">
          <h2 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <MonitorSmartphone className="w-4 h-4 text-brand-600" /> Устройства
          </h2>
          <p className="text-xs text-gray-500 mb-4">Визиты по типу устройства за {days} дней</p>
          <BarList items={devices} />
        </Card>
        <Card padding="md">
          <h2 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-600" /> Топ страниц
          </h2>
          <p className="text-xs text-gray-500 mb-4">Просмотры за {days} дней</p>
          <BarList items={topPaths} />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card padding="md">
          <h2 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <Globe className="w-4 h-4 text-brand-600" /> Источники трафика
          </h2>
          <p className="text-xs text-gray-500 mb-4">Внешние переходы за {days} дней</p>
          {referrers.length ? <BarList items={referrers} /> : <p className="text-sm text-gray-400">Внешних переходов нет</p>}
        </Card>
        <Card padding="md">
          <h2 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <Inbox className="w-4 h-4 text-brand-600" /> Заявки
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            Всего: <strong className="text-gray-800">{leads.total}</strong> · за {days} дней:{" "}
            <strong className="text-gray-800">{leads.last}</strong>
          </p>
          {leads.total === 0 ? (
            <p className="text-sm text-gray-400">Заявок пока нет</p>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">По услуге</p>
                <BarList items={leads.byService} />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">По статусу</p>
                <BarList items={leads.byStatus} />
              </div>
            </div>
          )}
        </Card>
      </div>

      <Card padding="md">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <PlaySquare className="w-4 h-4 text-brand-600" /> Записи визитов
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Записей за {days} дней: <strong className="text-gray-800">{replays}</strong>
            </p>
          </div>
          <Link href="/admin/replays" className="text-sm text-brand-700 hover:underline">
            Открыть записи →
          </Link>
        </div>
      </Card>

      <Card padding="none">
        <h2 className="font-semibold text-gray-900 p-4 pb-2">Все события за {days} дней</h2>
        <Table variant="minimal">
          <TableHead>
            <TableRow>
              <TableHeader>Событие</TableHeader>
              <TableHeader>Группа</TableHeader>
              <TableHeader>Всего</TableHeader>
              <TableHeader>Динамика</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {summaries
              .filter((s) => s.total > 0)
              .sort((a, b) => b.total - a.total)
              .map((s) => (
                <TableRow key={s.event}>
                  <TableCell className="font-medium text-gray-800">{s.label}</TableCell>
                  <TableCell>
                    <Badge variant="gray" size="sm">
                      {GROUP_LABELS[EVENT_CATALOG[s.event].group]}
                    </Badge>
                  </TableCell>
                  <TableCell className="tabular-nums">{s.total.toLocaleString("ru-RU")}</TableCell>
                  <TableCell className="w-40">
                    <DailyBarChart data={s.series} height={28} color="#9ca3af" />
                  </TableCell>
                </TableRow>
              ))}
            {summaries.every((s) => s.total === 0) && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-400 py-6">
                  Событий за период нет
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

import Link from "next/link";
import { requireAdminPage } from "@/lib/admin-auth";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from "@/components/ui/Table";
import { DailyBarChart } from "@/components/admin/analytics/DailyBarChart";
import { FunnelChart } from "@/components/admin/analytics/FunnelChart";
import { getEventSummaries, getFunnel, getTopTemplates, getKpiTotals } from "@/lib/userEventsQueries";
import { EVENT_CATALOG, type EventName } from "@/lib/userEvents";
import { Eye, Users, TrendingUp, Percent } from "lucide-react";

export const dynamic = "force-dynamic";

const GROUP_LABELS: Record<string, string> = {
  traffic: "Трафик",
  builder: "Конструктор",
  export: "Экспорт",
  signing: "Подписание",
  billing: "Монетизация",
  support: "Поддержка",
};

const PERIODS = [7, 30, 90] as const;

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

  const [summaries, funnel, topTemplates, kpi] = await Promise.all([
    getEventSummaries(days),
    getFunnel(days),
    getTopTemplates(days),
    getKpiTotals(),
  ]);

  const pageViews = summaries.find((s) => s.event === "page_view");
  const byGroup = new Map<string, typeof summaries>();
  for (const s of summaries) {
    const group = EVENT_CATALOG[s.event].group;
    if (!byGroup.has(group)) byGroup.set(group, []);
    byGroup.get(group)!.push(s);
  }

  const kpiCards = [
    { label: "Визитов сегодня", value: kpi.visitsToday, icon: Eye },
    { label: "Визитов за 7 дней", value: kpi.visits7d, icon: TrendingUp },
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
                  <p className="text-2xl font-bold text-gray-900 tabular-nums">{k.value}</p>
                  <p className="text-xs text-gray-600">{k.label}</p>
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
                      {GROUP_LABELS[EVENT_CATALOG[s.event as EventName].group]}
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

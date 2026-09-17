import Link from "next/link";
import { requireAdminPage } from "@/lib/admin-auth";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from "@/components/ui/Table";
import { listReplaySessions, type ReplaySessionRow } from "@/lib/replayQueries";
import { PlaySquare } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Записи визитов" };

const DAYS = 30;
const LIMIT = 200;

const DEVICE_LABELS: Record<string, string> = {
  mobile: "Телефон",
  tablet: "Планшет",
  desktop: "Компьютер",
};

function fmtBytes(n: number): string {
  if (n < 1024) return `${n} Б`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} КБ`;
  return `${(n / (1024 * 1024)).toFixed(1)} МБ`;
}

function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function duration(s: ReplaySessionRow): string {
  const ms = new Date(s.last_seen_at).getTime() - new Date(s.started_at).getTime();
  const sec = Math.max(0, Math.round(ms / 1000));
  if (sec < 60) return `${sec} с`;
  return `${Math.floor(sec / 60)} мин ${sec % 60} с`;
}

export default async function AdminReplaysPage() {
  await requireAdminPage("admin");
  const sessions = await listReplaySessions(DAYS, LIMIT);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Записи визитов</h1>
        <p className="text-gray-600 text-sm">
          Записи поведения (rrweb) за последние {DAYS} дней. Пишутся только по согласию,
          поля форм маскируются; разделы безопасности, биллинга и авторизации не записываются.
        </p>
      </div>

      <Card padding="none" className="overflow-hidden">
        {sessions.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            Пока нет записей. Они появятся, когда посетители с принятой аналитикой проведут
            время на сайте.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Начало</TableHeader>
                  <TableHeader>Вход</TableHeader>
                  <TableHeader>Длительность</TableHeader>
                  <TableHeader>Устройство</TableHeader>
                  <TableHeader>Размер</TableHeader>
                  <TableHeader>Пользователь</TableHeader>
                  <TableHeader />
                </TableRow>
              </TableHead>
              <TableBody>
                {sessions.map((s) => (
                  <TableRow key={s.session_id}>
                    <TableCell className="whitespace-nowrap">{fmtDateTime(s.started_at)}</TableCell>
                    <TableCell className="text-gray-600 max-w-[220px] truncate">{s.entry_path ?? "—"}</TableCell>
                    <TableCell className="whitespace-nowrap">{duration(s)}</TableCell>
                    <TableCell>{s.device ? DEVICE_LABELS[s.device] ?? s.device : "—"}</TableCell>
                    <TableCell className="whitespace-nowrap">{fmtBytes(s.size_bytes)}</TableCell>
                    <TableCell>
                      {s.user_id ? (
                        <Badge variant="green">вошёл</Badge>
                      ) : (
                        <span className="text-gray-400 text-sm">аноним</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/admin/replays/${s.session_id}`}
                        className="inline-flex items-center gap-1.5 text-sm text-brand-700 hover:underline"
                      >
                        <PlaySquare className="w-4 h-4" />
                        Смотреть
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAdminPage } from "@/lib/admin-auth";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getReplayEvents, getReplaySession } from "@/lib/replayQueries";
import ReplayPlayer from "@/components/admin/replay/ReplayPlayer";

export const dynamic = "force-dynamic";
export const metadata = { title: "Запись визита" };

function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default async function ReplayDetailPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  await requireAdminPage("admin");
  const { sessionId } = await params;

  const session = await getReplaySession(sessionId);
  if (!session) notFound();
  const events = await getReplayEvents(sessionId);

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      <Link href="/admin/replays" className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4" />
        Все записи
      </Link>

      <Card className="p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Запись визита</h1>
            <p className="text-xs text-gray-500 mt-1 font-mono break-all">{session.session_id}</p>
          </div>
          {session.user_id ? <Badge variant="green">вошёл в аккаунт</Badge> : <Badge variant="gray">аноним</Badge>}
        </div>
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
          <div>
            <dt className="text-gray-500">Начало</dt>
            <dd className="text-gray-900">{fmtDateTime(session.started_at)}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Последняя активность</dt>
            <dd className="text-gray-900">{fmtDateTime(session.last_seen_at)}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Страница входа</dt>
            <dd className="text-gray-900 break-all">{session.entry_path ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Чанков / размер</dt>
            <dd className="text-gray-900">
              {session.chunk_count} / {(session.size_bytes / 1024).toFixed(0)} КБ
            </dd>
          </div>
        </dl>
      </Card>

      <Card className="p-4">
        <ReplayPlayer events={events} />
      </Card>
    </div>
  );
}

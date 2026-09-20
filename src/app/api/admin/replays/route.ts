import { NextResponse } from "next/server";
import { requireAdminApi, isSameOrigin, getAdminUser } from "@/lib/admin-auth";
import { withCsrf } from "@/lib/csrf";
import { logAdminAction } from "@/lib/audit";
import { deleteReplaySession, deleteReplaySessionsOlderThan } from "@/lib/replayQueries";

export const dynamic = "force-dynamic";

/**
 * Удаление записей визитов из админ-панели.
 * Body: { sessionId } — удалить один визит; { olderThanDays } — удалить старые.
 * Доступ: только администратор, same-origin, через withCsrf.
 */
async function deleteHandler(req: Request) {
  const admin = await requireAdminApi();
  if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!isSameOrigin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const actor = await getAdminUser();
  const adminId = actor?.id ?? "system";

  const body = (await req.json().catch(() => null)) as
    | { sessionId?: unknown; olderThanDays?: unknown }
    | null;

  const sessionId = typeof body?.sessionId === "string" ? body.sessionId : null;
  const olderThanDays = typeof body?.olderThanDays === "number" ? body.olderThanDays : null;

  try {
    if (sessionId) {
      await deleteReplaySession(sessionId);
      await logAdminAction({ adminId, action: "replay_delete", resource: "session_replays", resourceId: sessionId, meta: { deleted: 1 } });
      return NextResponse.json({ ok: true, deleted: 1 });
    }
    if (olderThanDays !== null && olderThanDays >= 1) {
      const deleted = await deleteReplaySessionsOlderThan(olderThanDays);
      await logAdminAction({ adminId, action: "replay_delete", resource: "session_replays", meta: { deleted, olderThanDays } });
      return NextResponse.json({ ok: true, deleted });
    }
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  } catch (e) {
    console.error("[admin/replays] delete failed", e);
    return NextResponse.json({ error: "delete_failed" }, { status: 500 });
  }
}

export const DELETE = withCsrf(deleteHandler);

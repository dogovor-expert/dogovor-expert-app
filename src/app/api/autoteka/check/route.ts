import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { peekReportTask } from "@/lib/tronk";
import { withCsrf } from "@/lib/csrf";
import { isSameOrigin } from "@/lib/admin-auth";
import { limiters, checkRateLimit, rateLimitResponse } from "@/lib/ratelimit";
import { autotekaCheckSchema, validateBody } from "@/lib/validations/api";

interface ReportRow {
  id: string;
  vin: string;
  status: string;
  payload: unknown;
  created_at: string;
}

function readStringField(obj: unknown, key: string): string | undefined {
  if (typeof obj !== "object" || obj === null) return undefined;
  const value = (obj as Record<string, unknown>)[key];
  return typeof value === "string" ? value : undefined;
}

async function postHandler(req: Request) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // Polling — высокий риск шторма. Строгий лимит.
  const rl = await checkRateLimit(limiters.authAction, `autoteka:check:${user.id}`);
  if (!rl.ok) return rateLimitResponse(rl.retryAfter);

  // P1: Zod-валидация (vin обязательный, plate опциональный госномер РФ)
  const parsed: unknown = await req.json().catch(() => null);
  const validated = validateBody(autotekaCheckSchema, parsed);
  if (!validated.success) return validated.error;
  const { vin } = validated.data;

  const admin = createAdminClient();
  const reportResult = await admin
    .from("reports")
    .select("id, vin, status, payload, created_at")
    .eq("user_id", user.id)
    .eq("vin", vin)
    .order("created_at", { ascending: false })
    .limit(1);

  const rawRows: unknown = reportResult.data;
  const rows = Array.isArray(rawRows) ? (rawRows as ReportRow[]) : [];
  const report = rows[0] ?? null;

  if (report && report.status === "ready") {
    return NextResponse.json({
      status: "ready",
      vin,
      report: {
        id: report.id,
        vin: report.vin,
        payload: report.payload,
        created_at: report.created_at,
      },
    });
  }

  // Отчёт в генерации (async reportjson): доводим до конца и сохраняем.
  const tronkTaskId =
    report && report.status === "pending"
      ? readStringField(report.payload, "tronk_task_id")
      : undefined;
  if (tronkTaskId) {
    const taskId = tronkTaskId;
    try {
      const peek = await peekReportTask(taskId);
      if (peek.status === "ready" && peek.report) {
        const payload = { reportjson: peek.report };
        await admin
          .from("reports")
          .update({ status: "ready", payload })
          .eq("id", report.id);
        return NextResponse.json({
          status: "ready",
          vin,
          report: {
            id: report.id,
            vin: report.vin,
            payload,
            created_at: report.created_at,
          },
        });
      }
      if (peek.status === "failed") {
        await admin
          .from("reports")
          .update({ status: "failed", payload: { error: "provider_unavailable" } })
          .eq("id", report.id);
        return NextResponse.json({ status: "failed", vin });
      }
    } catch {
      // оставляем pending — фронт повторит опрос
    }
    return NextResponse.json({ status: "pending", vin });
  }

  if (report && report.status === "pending") {
    return NextResponse.json({ status: "pending", vin });
  }

  return NextResponse.json({ status: "unpaid", vin });
}

export const POST = withCsrf(postHandler);
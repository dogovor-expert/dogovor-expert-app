import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { peekReportTask } from "@/lib/tronk";

const VIN_RE = /^[A-HJ-NPR-Z0-9]{17}$/;

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const vin = String(body?.vin ?? "").toUpperCase().trim();
  if (!VIN_RE.test(vin)) {
    return NextResponse.json({ error: "invalid_vin" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: rows } = await admin
    .from("reports")
    .select("id, vin, status, payload, created_at")
    .eq("user_id", user.id)
    .eq("vin", vin)
    .order("created_at", { ascending: false })
    .limit(1);

  const report = (rows ?? [])[0] ?? null;

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
  if (report && report.status === "pending" && (report.payload)?.tronk_task_id) {
    const taskId = String((report.payload).tronk_task_id);
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
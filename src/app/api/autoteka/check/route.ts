import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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

  if (report && report.status === "pending") {
    return NextResponse.json({ status: "pending", vin });
  }

  return NextResponse.json({ status: "unpaid", vin });
}
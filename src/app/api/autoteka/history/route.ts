import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { limiters, checkRateLimit, rateLimitResponse } from "@/lib/ratelimit";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // S4 (аудит): service-role запрос к reports — закрываем лимитом.
  const rl = await checkRateLimit(limiters.autotekaHistory, user.id);
  if (!rl.ok) return rateLimitResponse(rl.retryAfter);

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("reports")
    .select("id, vin, status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ reports: data ?? [] });
}

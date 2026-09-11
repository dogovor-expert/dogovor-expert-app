import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { withCsrf } from "@/lib/csrf";
import { limiters, checkRateLimit, rateLimitResponse } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

/**
 * TICKET-1: согласие на серверный OCR (152-ФЗ ст. 9).
 *
 * GET  /api/ocr-consent — текущее состояние согласия для залогиненного
 *      пользователя (для синхронизации между устройствами).
 * POST /api/ocr-consent — зафиксировать/отозвать согласие.
 *      Тело: { granted: boolean }. При granted:true пишется timestamp
 *      (доказательная база), при false — NULL (отзыв).
 */

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function GET() {
  const { supabase, user } = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { data, error } = await supabase
    .from("profiles")
    .select("ocr_consent_at")
    .eq("id", user.id)
    .maybeSingle();
  if (error) {
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }
  return NextResponse.json(
    { consented: Boolean(data?.ocr_consent_at) },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export const POST = withCsrf(async (req: NextRequest) => {
  const { supabase, user } = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const rl = await checkRateLimit(limiters.crudMutation, user.id);
  if (!rl.ok) return rateLimitResponse(rl.retryAfter);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const granted =
    body && typeof body === "object"
      ? (body as { granted?: unknown }).granted
      : undefined;
  if (typeof granted !== "boolean") {
    return NextResponse.json({ error: "granted_must_be_boolean" }, { status: 400 });
  }

  const { error } = await supabase
    .from("profiles")
    .update({ ocr_consent_at: granted ? new Date().toISOString() : null })
    .eq("id", user.id);
  if (error) {
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }
  return NextResponse.json({ ok: true, granted });
});

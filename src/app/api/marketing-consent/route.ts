import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { limiters, checkRateLimit, rateLimitResponse } from "@/lib/ratelimit";
import { withCsrf } from "@/lib/csrf";
import { isSameOrigin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

/**
 * Согласия на маркетинговую рассылку (152-ФЗ + 38-ФЗ ст.18).
 * Хранится доказательная база: факт согласия (дата, IP, UA) — не менее 3 лет.
 * Два РАЗДЕЛЬНЫХ волеизъявления; по умолчанию оба выключены.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const { data } = await admin
    .from("marketing_consents")
    .select("pd_consent, ad_consent")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return NextResponse.json({
    pd_consent: data?.pd_consent ?? false,
    ad_consent: data?.ad_consent ?? false,
  });
}

async function postHandler(req: Request) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const rl = await checkRateLimit(limiters.crudMutation, clientIpOf(req));
  if (!rl.ok) return rateLimitResponse(rl.retryAfter);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (
    !body ||
    (body.kind !== "pd" && body.kind !== "ad") ||
    typeof body.value !== "boolean"
  ) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: prof } = await admin
    .from("profiles")
    .select("email")
    .eq("id", user.id)
    .single();

  const now = new Date().toISOString();
  const row = {
    user_id: user.id,
    email: prof?.email ?? user.email ?? "",
    pd_consent: body.kind === "pd" ? body.value : undefined,
    ad_consent: body.kind === "ad" ? body.value : undefined,
    pd_consent_at: body.kind === "pd" ? now : undefined,
    ad_consent_at: body.kind === "ad" ? now : undefined,
    ip: clientIpOf(req),
    user_agent: req.headers.get("user-agent")?.slice(0, 300) ?? null,
  };

  const { error } = await admin.from("marketing_consents").insert(row);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

export const POST = withCsrf(postHandler);

function clientIpOf(req: Request): string {
  return (
    req.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip")?.trim() ||
    "anonymous"
  );
}

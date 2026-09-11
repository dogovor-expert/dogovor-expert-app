import { NextResponse, type NextRequest } from "next/server";
import { withCsrf } from "@/lib/csrf";
import { requireAdminApi } from "@/lib/admin-auth";
import { limiters, checkRateLimit, rateLimitResponse } from "@/lib/ratelimit";
import { z } from "zod";

const searchSchema = z.object({
  q: z.string().trim().min(2).max(120),
});

export const dynamic = "force-dynamic";

export const POST = withCsrf(async (req: NextRequest) => {
  // 6.5 RBAC: глобальный поиск по PII (users/payments/leads/feedback) — admin+.
  const sb = await requireAdminApi("admin");
  if (!sb) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const rl = await checkRateLimit(limiters.adminAction, "admin-search");
  if (!rl.ok) return rateLimitResponse(rl.retryAfter);

  const body = await req.json().catch(() => null);
  const parsed = searchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation", details: parsed.error.flatten() }, { status: 400 });
  }

  const safe = parsed.data.q.replace(/[^a-zA-Zа-яА-ЯёЁ0-9@.\s-]/g, "");
  if (safe.length < 2) {
    return NextResponse.json({ error: "Слишком короткий запрос" }, { status: 400 });
  }

  const like = `%${safe}%`;
  const [{ data: users }, { data: feedback }, { data: leads }, { data: payments }] =
    await Promise.all([
      sb
        .from("profiles")
        .select("id, full_name, company, inn")
        .or(`full_name.ilike.${like},company.ilike.${like},inn.ilike.${like}`)
        .limit(20),
      sb
        .from("feedback")
        .select("id, ticket_no, type, email, message, status, created_at")
        .or(`email.ilike.${like},message.ilike.${like},ticket_no.ilike.${like}`)
        .limit(20),
      sb
        .from("leads")
        .select("id, service, brand, vin, phone, status, created_at")
        .or(`brand.ilike.${like},vin.ilike.${like},phone.ilike.${like}`)
        .limit(20),
      sb
        .from("payments")
        .select("id, user_id, amount, currency, provider, status, created_at")
        .or(`provider_id.ilike.${like},provider.ilike.${like}`)
        .limit(20),
    ]);

  return NextResponse.json({
    q: safe,
    users: users || [],
    feedback: feedback || [],
    leads: leads || [],
    payments: payments || [],
  });
});
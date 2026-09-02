import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createDocumentSchema, validateBody } from "@/lib/validations/api";
import { withCsrf } from "@/lib/csrf";
import { isSameOrigin } from "@/lib/admin-auth";
import { limiters, checkRateLimit, rateLimitResponse } from "@/lib/ratelimit";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("documents")
    .select("id, template_id, title, fields, checklist, versions, status, deleted_at, created_at, updated_at")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
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

  // Rate-limit: создание документа — 30/мин на user.id (защита от спама черновиками)
  const rl = await checkRateLimit(limiters.documentCreate, user.id);
  if (!rl.ok) return rateLimitResponse(rl.retryAfter);

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Zod-валидация
  const validation = validateBody(createDocumentSchema, body);
  if (!validation.success) {
    return validation.error;
  }
  const { template_id, title, fields, checklist, versions } = validation.data;

  const { data, error } = await supabase
    .from("documents")
    .insert({
      user_id: user.id,
      template_id,
      title: title ?? "",
      fields: fields ?? {},
      checklist: checklist ?? {},
      versions: versions ?? [],
      status: "draft",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}

export const POST = withCsrf(postHandler);
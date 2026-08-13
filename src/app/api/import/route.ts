import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 60;

export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const drafts = Array.isArray(body?.drafts) ? body.drafts : [];
  if (drafts.length === 0) {
    return NextResponse.json({ error: "no drafts" }, { status: 400 });
  }

  const rows = drafts.map((d: any) => ({
    user_id: user.id,
    template_id: String(d.templateId ?? ""),
    title: String(d.title ?? ""),
    fields: d.values ?? {},
    checklist: d.checklist ?? {},
    versions: d.versions ?? [],
    status: "draft",
  }));

  // тихо пропускаем конфликты по template_id (одна активная версия на шаблон)
  const { data, error } = await supabase
    .from("documents")
    .upsert(rows, { onConflict: "user_id,template_id" })
    .select("id, template_id");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ imported: data.length });
}
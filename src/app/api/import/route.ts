import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 60;

const MAX_IMPORT = 50;
const ALLOWED_TEMPLATE_IDS = [
  "dkp-auto", "dkp-auto-short", "rental", "rental-short", "loan", "loan-short",
  "gift", "gift-short", "act-transfer-auto", "act-transfer-auto-short",
  "receipt", "receipt-short", "procuration", "procuration-short",
  // Add more as needed
];

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const drafts = Array.isArray(body?.drafts) ? body.drafts : [];
  if (drafts.length === 0 || drafts.length > MAX_IMPORT) {
    return NextResponse.json({ error: "invalid drafts count" }, { status: 400 });
  }

  const rows = drafts.map((d: any) => {
    const templateId = String(d.templateId ?? "");
    if (!ALLOWED_TEMPLATE_IDS.includes(templateId)) {
      throw new Error(`invalid template_id: ${templateId}`);
    }
    return {
      user_id: user.id,
      template_id: templateId,
      title: String(d.title ?? "").slice(0, 200),
      fields: d.values ?? {},
      checklist: d.checklist ?? {},
      versions: d.versions ?? [],
      status: "draft",
    };
  });

  // тихо пропускаем конфликты по template_id (одна активная версия на шаблон)
  const { data, error } = await supabase
    .from("documents")
    .upsert(rows, { onConflict: "user_id,template_id" })
    .select("id, template_id");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ imported: data.length });
}
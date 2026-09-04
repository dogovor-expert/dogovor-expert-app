import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { withCsrf } from "@/lib/csrf";
import { isSameOrigin } from "@/lib/admin-auth";
import { limiters, checkRateLimit, rateLimitResponse } from "@/lib/ratelimit";
import { importSchema, validateBody } from "@/lib/validations/api";

export const maxDuration = 60;

// Whitelist пока hardcoded: 14 шаблонов. В будущем — динамическая проверка по
// таблице legal_templates (см. master fix plan).
const ALLOWED_TEMPLATE_IDS = [
  "dkp-auto", "dkp-auto-short", "rental", "rental-short", "loan", "loan-short",
  "gift", "gift-short", "act-transfer-auto", "act-transfer-auto-short",
  "receipt", "receipt-short", "procuration", "procuration-short",
];

async function postHandler(req: Request) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // Rate-limit: импорт (дорогая операция)
  const rl = await checkRateLimit(limiters.authAction, user.id);
  if (!rl.ok) return rateLimitResponse(rl.retryAfter);

  // P1: Zod-валидация (best practice 2026: safeParse + structured error)
  const parsed = await req.json().catch(() => null);
  const validated = validateBody(importSchema, parsed);
  if (!validated.success) return validated.error;
  const { drafts, force } = validated.data;

  // Строим строки с валидацией; невалидный templateId — 400 (а не 500, как раньше)
  const rows: Array<{
    user_id: string;
    template_id: string;
    title: string;
    fields: unknown;
    checklist: unknown;
    versions: unknown[];
    status: string;
  }> = [];
  for (const d of drafts) {
    try {
      if (!ALLOWED_TEMPLATE_IDS.includes(d.templateId)) {
        return NextResponse.json(
          { error: `invalid template_id: ${d.templateId}` },
          { status: 400 }
        );
      }
      rows.push({
        user_id: user.id,
        template_id: d.templateId,
        title: (d.title ?? "").slice(0, 200),
        fields: d.values ?? {},
        checklist: d.checklist ?? {},
        versions: Array.isArray(d.versions) ? d.versions : [],
        status: "draft",
      });
    } catch {
      return NextResponse.json({ error: "draft processing failed" }, { status: 400 });
    }
  }

  // Проверяем существующие документы с теми же (user_id, template_id) — без force
  // возвращаем 409 Conflict со списком конфликтов. С force=true — обновляем.
  if (!force) {
    const templateIds = rows.map((r) => r.template_id);
    const { data: existing } = await supabase
      .from("documents")
      .select("template_id")
      .eq("user_id", user.id)
      .in("template_id", templateIds)
      .is("deleted_at", null);

    if (existing && existing.length > 0) {
      return NextResponse.json(
        {
          error: "conflict",
          message: "Документы с такими template_id уже существуют. Передайте force=true для перезаписи.",
          conflicts: existing.map((e: { template_id: string }) => e.template_id),
        },
        { status: 409 }
      );
    }
  }

  // С force=true (или без конфликтов) — upsert.
  // ВАЖНО: .upsert() по умолчанию обновляет конфликтные строки. Семантика —
  // "перезаписать черновик" (одна активная версия на шаблон).
  const { data, error } = await supabase
    .from("documents")
    .upsert(rows, { onConflict: "user_id,template_id" })
    .select("id, template_id");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ imported: data?.length ?? 0 });
}

export const POST = withCsrf(postHandler);
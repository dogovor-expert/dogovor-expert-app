import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createDocumentSchema, validateBody } from "@/lib/validations/api";
import { withCsrf } from "@/lib/csrf";
import { isSameOrigin } from "@/lib/admin-auth";
import { limiters, checkRateLimit, rateLimitResponse } from "@/lib/ratelimit";

// 5.1 (аудит): серверная cursor-пагинация. Композитный курсор (updated_at, id)
// соответствует сортировке updated_at desc, id desc и остаётся стабильным при
// коллизиях updated_at. БЕЗ параметров `limit` сохраняется legacy-ответ { data }
// (его используют sync.ts и dashboard — полный список им нужен по смыслу).
const PAGE_SIZE_DEFAULT = 50;
const PAGE_SIZE_MAX = 100;

// Значения для PostgREST-фильтров: запятые/скобки ломают синтаксис or(),
// % и _ — непредсказуемые wildcard'ы в ilike. Вырезаем их.
// 3.10 (аудит): результаты калькуляторов сохраняются как синтетические
// template_id `calc-<kind>-<ts>`; их нет в каталоге шаблонов, и в конструктор
// они не открываются (страница /documents показывает их как протокол).
const CALC_TEMPLATE_RE = /^calc-[a-z0-9-]{1,90}$/;

function sanitizeFilterValue(v: string): string {
  return v.replace(/[,()%_*"\\]/g, " ").trim().slice(0, 100);
}

export async function GET(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const idsOnly = url.searchParams.get("ids") === "1";
  const limitRaw = url.searchParams.get("limit");
  const cursor = url.searchParams.get("cursor");
  const q = sanitizeFilterValue(url.searchParams.get("q") ?? "");
  // tpls — список template_id, чьи русские названия совпали с запросом на клиенте
  // (title в БД часто пустой, а названия шаблонов живут в TEMPLATE_META).
  const tpls = (url.searchParams.get("tpls") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => /^[a-z0-9-_]{1,100}$/i.test(s))
    .slice(0, 300);

  let query = supabase
    .from("documents")
    .select(idsOnly ? "id, template_id" : "id, template_id, title, fields, checklist, versions, status, deleted_at, created_at, updated_at")
    .eq("user_id", user.id)
    .is("deleted_at", null);

  if (q || tpls.length) {
    const conds: string[] = [];
    if (q) conds.push(`title.ilike.%${q}%`);
    if (tpls.length) conds.push(`template_id.in.(${tpls.map((t) => `"${t}"`).join(",")})`);
    query = query.or(conds.join(","));
  }

  // Композитный курсор: "ISO_timestamp|uuid". Страница вперёд = строки,
  // лексикографически меньшие по (updated_at, id) в порядке desc.
  if (cursor) {
    const [cUpd, cId] = cursor.split("|");
    if (!cUpd || !cId || !/^\d{4}-\d{2}-\d{2}T[\d:.+Z]+$/.test(cUpd) || !/^[0-9a-f-]{36}$/i.test(cId)) {
      return NextResponse.json({ error: "invalid_cursor" }, { status: 400 });
    }
    query = query.or(`updated_at.lt.${cUpd},and(updated_at.eq.${cUpd},id.lt.${cId})`);
  }

  query = query.order("updated_at", { ascending: false }).order("id", { ascending: false });

  let limit: number | null = null;
  if (limitRaw !== null) {
    const n = Number(limitRaw);
    limit = Number.isFinite(n) && n > 0 ? Math.min(Math.floor(n), PAGE_SIZE_MAX) : PAGE_SIZE_DEFAULT;
    query = query.limit(limit + 1); // +1 — сигнал hasMore без второго запроса
  }

  // Динамический select (idsOnly) ломает дженерик-вывод supabase-js,
  // поэтому типизируем результат вручную — набор полей известен обоим вариантам.
  type DocRow = { id: string; template_id: string; updated_at?: string };
  const { data, error } = (await query) as {
    data: DocRow[] | null;
    error: { message: string } | null;
  };
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (limit === null) return NextResponse.json({ data });

  const rows = data ?? [];
  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;
  const last = page[page.length - 1];
  return NextResponse.json({
    data: page,
    hasMore,
    nextCursor:
      hasMore && last && last.updated_at ? `${last.updated_at}|${last.id}` : null,
  });
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
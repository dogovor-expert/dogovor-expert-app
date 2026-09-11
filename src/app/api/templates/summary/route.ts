import { NextResponse } from "next/server";
import { LEGAL_TEMPLATES } from "@/data/templates";

// Лёгкий список шаблонов для автодополнения в форме обратной связи.
// Возвращает только id/name/category — без тяжёлых тел шаблонов.
//
// 7.9 (аудит 2026-09): каталог статический (правится только релизами),
// весь summary ≈ 30 КБ. Вместо бессмысленной cursor-пагинации:
// - серверный фильтр ?q= (substring по name/category/id);
// - жёсткий ?limit (по умолчанию и максимум 500 — каталог влезает целиком);
// - CDN-кэш (данные меняются только с деплоем).
// Обратная совместимость: без параметров отдаёт {data:[...]} как раньше.
const MAX_LIMIT = 500;

export function GET(req: Request) {
  const url = new URL(req.url);
  const qRaw = url.searchParams.get("q");
  const q = typeof qRaw === "string" ? qRaw.trim().toLowerCase().slice(0, 100) : "";
  const limitParam = Number(url.searchParams.get("limit"));
  const limit = Number.isFinite(limitParam) && limitParam > 0
    ? Math.min(MAX_LIMIT, Math.floor(limitParam))
    : MAX_LIMIT;

  let rows = LEGAL_TEMPLATES.map((t) => ({ id: t.id, name: t.name, category: t.category }));
  const total = rows.length;
  if (q) {
    rows = rows.filter(
      (t) => t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q) || t.id.toLowerCase().includes(q),
    );
  }
  rows = rows.slice(0, limit);
  return NextResponse.json(
    { data: rows, total },
    { headers: { "Cache-Control": "public, s-maxage=86400, max-age=3600, stale-while-revalidate=604800" } },
  );
}

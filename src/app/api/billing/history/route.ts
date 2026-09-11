import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

const PAGE_SIZE = 20;

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const params = req.nextUrl.searchParams;
  const from = params.get("from");
  const to = params.get("to");
  const cursor = params.get("cursor");

  let query = supabase
    .from("payments")
    .select("id, amount, status, provider, meta, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(PAGE_SIZE + 1);

  if (from && !Number.isNaN(Date.parse(from))) {
    query = query.gte("created_at", new Date(from).toISOString());
  }
  if (to && !Number.isNaN(Date.parse(to))) {
    query = query.lte("created_at", new Date(to).toISOString());
  }
  if (cursor && !Number.isNaN(Date.parse(cursor))) {
    query = query.lt("created_at", new Date(cursor).toISOString());
  }

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = data ?? [];
  const hasMore = rows.length > PAGE_SIZE;
  const page = hasMore ? rows.slice(0, PAGE_SIZE) : rows;
  const nextCursor = page.length > 0 ? page[page.length - 1].created_at : null;

  return NextResponse.json({ data: page, hasMore, nextCursor });
}
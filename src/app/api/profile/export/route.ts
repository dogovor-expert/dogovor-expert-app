import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { limiters, checkRateLimit, rateLimitResponse } from "@/lib/ratelimit";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // S4 (аудит): полный дамп персональных данных — тяжёлая выборка из 4 таблиц.
  const rl = await checkRateLimit(limiters.exportData, user.id);
  if (!rl.ok) return rateLimitResponse(rl.retryAfter);

  const [profile, documents, subscriptions, payments] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()
      .then((r) => {
        const d: unknown = r.data;
        return d ?? null;
      }),
    supabase
      .from("documents")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .then((r) => {
        const d: unknown = r.data;
        return d ?? [];
      }),
    supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then((r) => {
        const d: unknown = r.data;
        return d ?? [];
      }),
    supabase
      .from("payments")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then((r) => {
        const d: unknown = r.data;
        return d ?? [];
      }),
  ]);

  const payload = {
    exported_at: new Date().toISOString(),
    user: {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
    },
    profile,
    documents,
    subscriptions,
    payments,
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="dogovor-export-${user.id.slice(0, 8)}.json"`,
      // Полный дамп ПД (profile + documents + subscriptions + payments).
      // Запрещаем любое кэширование: браузером, прокси, CDN — иначе
      // выгрузка может остаться на shared-кешах после logout.
      "Cache-Control": "no-store, no-cache, must-revalidate, private",
      "Pragma": "no-cache",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
    },
  });
}
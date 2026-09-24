import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSameOrigin } from "@/lib/admin-auth";

/** GET — список диалогов пользователя (последние 30). */
export async function GET(req: Request) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("ai_threads")
    .select("id, title, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(30);
  if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });
  return NextResponse.json({ threads: data ?? [] });
}

/** GET ?threadId= — сообщения одного диалога (свой). */
export async function POST(req: Request) {
  // POST используется как «получить сообщения»: threadId в body,
  // чтобы не светить uuid в query-строке логов.
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const threadId = (body as { threadId?: unknown }).threadId;
  if (typeof threadId !== "string" || threadId.length === 0) {
    return NextResponse.json({ error: "threadId обязателен" }, { status: 400 });
  }

  const admin = createAdminClient();
  const t = await admin
    .from("ai_threads")
    .select("id")
    .eq("id", threadId)
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();
  if (!t.data) return NextResponse.json({ error: "thread_not_found" }, { status: 404 });

  const { data, error } = await admin
    .from("ai_messages")
    .select("role, content, sources, created_at")
    .eq("thread_id", threadId)
    .order("id", { ascending: true })
    .limit(100);
  if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });
  return NextResponse.json({ messages: data ?? [] });
}

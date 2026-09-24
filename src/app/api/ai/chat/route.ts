import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { withCsrf } from "@/lib/csrf";
import { isSameOrigin } from "@/lib/admin-auth";
import { limiters, checkRateLimit, rateLimitResponse } from "@/lib/ratelimit";
import { aiChatSchema, validateBody } from "@/lib/validations/api";
import {
  AI_FREE_QUESTIONS,
  AI_MODEL_CHAT,
  AI_PRICE_MESSAGE_KOPEKS,
  estimateCostKopeks,
} from "@/lib/ai/pricing";
import {
  chatCompletion,
  createEmbedding,
  isProxyApiConfigured,
} from "@/lib/ai/proxyapi";
import {
  AI_SYSTEM_PROMPT,
  buildUserMessage,
  checkCitations,
  type LawChunk,
} from "@/lib/ai/prompt";
import { logUserEvent } from "@/lib/userEvents";

interface BalanceRow {
  balance_kopeks: number;
  free_asked: number;
}

/** RAG-поиск: эмбеддинг вопроса → match_law_chunks. Ошибка = пустой контекст (честный режим), не 500. */
async function findChunks(
  admin: ReturnType<typeof createAdminClient>,
  question: string
): Promise<LawChunk[]> {
  try {
    const vectors = await createEmbedding(question);
    const vec = vectors[0];
    if (!vec) return [];
    const rpcRes: { data: unknown; error: { message: string } | null } = await admin.rpc("match_law_chunks", {
      query_embedding: `[${vec.join(",")}]`,
      match_count: 5,
    });
    if (rpcRes.error) {
      console.error("[ai/chat] match_law_chunks failed:", rpcRes.error.message);
      return [];
    }
    const rows = rpcRes.data as LawChunk[] | null;
    return rows ?? [];
  } catch (e) {
    console.error("[ai/chat] RAG search failed:", e instanceof Error ? e.message : e);
    return [];
  }
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

  const rl = await checkRateLimit(limiters.aiChat, user.id);
  if (!rl.ok) return rateLimitResponse(rl.retryAfter);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const validation = validateBody(aiChatSchema, body);
  if (!validation.success) return validation.error;
  const { text, threadId } = validation.data;

  if (!isProxyApiConfigured()) {
    return NextResponse.json({ error: "ai_unavailable" }, { status: 503 });
  }

  const admin = createAdminClient();

  // Баланс: читаем, при отсутствии строки создаём нулевую.
  const balRes = await admin
    .from("ai_balances")
    .select("balance_kopeks, free_asked")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();
  const rawBal = balRes.data as { balance_kopeks?: unknown; free_asked?: unknown } | null;
  let bal: BalanceRow | null = rawBal
    ? { balance_kopeks: Number(rawBal.balance_kopeks ?? 0), free_asked: Number(rawBal.free_asked ?? 0) }
    : null;
  if (!bal) {
    const ins = await admin
      .from("ai_balances")
      .insert({ user_id: user.id, balance_kopeks: 0, free_asked: 0 })
      .select("balance_kopeks, free_asked")
      .single();
    if (ins.error || !ins.data) return NextResponse.json({ error: "db_error" }, { status: 500 });
    const rawIns = ins.data as { balance_kopeks?: unknown; free_asked?: unknown };
    bal = { balance_kopeks: Number(rawIns.balance_kopeks ?? 0), free_asked: Number(rawIns.free_asked ?? 0) };
  }

  const isFree = bal.free_asked < AI_FREE_QUESTIONS;
  const price = isFree ? 0 : AI_PRICE_MESSAGE_KOPEKS;
  if (!isFree && bal.balance_kopeks < price) {
    return NextResponse.json({ error: "insufficient_funds", balance_kopeks: bal.balance_kopeks }, { status: 402 });
  }

  // Тред: свой существующий или новый.
  let tid = threadId ?? null;
  if (tid) {
    const t = await admin.from("ai_threads").select("id").eq("id", tid).eq("user_id", user.id).limit(1).maybeSingle();
    if (!t.data) return NextResponse.json({ error: "thread_not_found" }, { status: 404 });
  } else {
    const title = text.length > 60 ? text.slice(0, 60) + "…" : text;
    const created = await admin
      .from("ai_threads")
      .insert({ user_id: user.id, title })
      .select("id")
      .single();
    const newId = (created.data as { id?: unknown } | null)?.id;
    if (created.error || typeof newId !== "string") return NextResponse.json({ error: "db_error" }, { status: 500 });
    tid = newId;
  }

  // RAG-контекст (деградация к честному режиму при сбое).
  const chunks = await findChunks(admin, text);

  // История диалога для follow-up («а если…?», «а подробнее?»).
  // Лимит: последние 6 сообщений, каждое до 1000 символов — иначе длинные
  // диалоги раздули бы себестоимость (входные токены платные).
  let history: Array<{ role: "user" | "assistant"; content: string }> = [];
  if (tid && threadId) {
    const h = await admin
      .from("ai_messages")
      .select("role, content")
      .eq("thread_id", tid)
      .order("id", { ascending: false })
      .limit(6);
    const rows = (h.data ?? []) as Array<{ role: unknown; content: unknown }>;
    history = rows
      .reverse()
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: typeof m.content === "string" ? m.content.slice(0, 1000) : "",
      }))
      .filter((m) => m.content.length > 0);
  }

  // Запрос к модели. Ошибка провайдера = 502, деньги НЕ списаны.
  // maxTokens 3000: reasoning-модель тратит ~500-700 токенов на
  // внутренние рассуждения (не видны пользователю), остальное — ответ.
  let answer: string;
  let tokensIn = 0;
  let tokensOut = 0;
  try {
    const result = await chatCompletion(
      AI_MODEL_CHAT,
      [
        { role: "system", content: AI_SYSTEM_PROMPT },
        ...history,
        { role: "user", content: buildUserMessage(text, chunks) },
      ],
      { temperature: 0, maxTokens: 3000 }
    );
    answer = result.text.trim();
    tokensIn = result.usage.prompt_tokens;
    tokensOut = result.usage.completion_tokens;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    console.error("[ai/chat] provider failed:", msg);
    if (msg === "PROXYAPI_NO_FUNDS") {
      return NextResponse.json({ error: "ai_provider_no_funds" }, { status: 503 });
    }
    return NextResponse.json({ error: "ai_provider_error" }, { status: 502 });
  }
  if (!answer) return NextResponse.json({ error: "ai_empty_response" }, { status: 502 });

  const confidence = checkCitations(answer, chunks);
  const costKopeks = estimateCostKopeks(tokensIn, tokensOut);
  const sources = chunks.map((c) => ({
    code: c.code,
    article: c.article,
    edition_date: c.edition_date,
  }));

  // Списание с optimistic locking: update только если баланс не изменился
  // параллельным запросом. Конфликт → 409, клиент повторяет. Потеря при
  // конфликте — только себестоимость одного вызова провайдера (копейки),
  // с клиента при 409 ничего не списано.
  const newBalance = bal.balance_kopeks - price;
  const newFree = isFree ? bal.free_asked + 1 : bal.free_asked;
  const upd = await admin
    .from("ai_balances")
    .update({ balance_kopeks: newBalance, free_asked: newFree, updated_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("balance_kopeks", bal.balance_kopeks)
    .eq("free_asked", bal.free_asked)
    .select("balance_kopeks");
  if (!upd.data || upd.data.length === 0) {
    return NextResponse.json({ error: "balance_conflict_retry" }, { status: 409 });
  }

  await admin.from("ai_messages").insert([
    { thread_id: tid, role: "user", content: text },
    {
      thread_id: tid,
      role: "assistant",
      content: answer,
      tokens_in: tokensIn,
      tokens_out: tokensOut,
      cost_kopeks: costKopeks,
      sources,
    },
  ]);
  await admin.from("ai_ledger").insert({
    user_id: user.id,
    delta_kopeks: -price,
    reason: isFree ? "free_question" : "chat_message",
    meta: { thread_id: tid, tokens_in: tokensIn, tokens_out: tokensOut, cost_kopeks: costKopeks, confidence },
  });

  await logUserEvent({
    event: "ai_message",
    userId: user.id,
    sessionId: `ai:${tid}`,
    path: "/ai-yurist",
    meta: { thread_id: tid, free: isFree, confidence },
  });

  return NextResponse.json({
    answer,
    sources,
    confidence,
    thread_id: tid,
    free: isFree,
    price_kopeks: price,
    cost_kopeks: costKopeks,
    balance_kopeks: newBalance,
  });
}

export const POST = withCsrf(postHandler);

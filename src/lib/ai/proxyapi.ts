/**
 * Клиент ProxyAPI (OpenAI-совместимый): chat, embeddings.
 * Без новых зависимостей — обычный fetch, server-only.
 * Стриминг SSE пробрасывается клиенту как есть.
 */

const BASE_URL = (process.env.PROXYAPI_BASE_URL ?? "https://api.proxyapi.ru/v1").trim();

function apiKey(): string {
  const key = (process.env.PROXYAPI_API_KEY ?? "").trim();
  if (!key) throw new Error("PROXYAPI_API_KEY is not configured");
  return key;
}

export interface ProxyMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ProxyUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface ChatCompletionResult {
  text: string;
  usage: ProxyUsage;
  model: string;
}

async function proxyFetch(path: string, body: unknown, signal?: AbortSignal): Promise<Response> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey()}`,
    },
    body: JSON.stringify(body),
    signal,
  });
  if (res.status === 401 || res.status === 403) {
    throw new Error("PROXYAPI_UNAUTHORIZED");
  }
  if (res.status === 402) {
    throw new Error("PROXYAPI_NO_FUNDS");
  }
  if (res.status === 429) {
    throw new Error("PROXYAPI_RATE_LIMIT");
  }
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`PROXYAPI_ERROR_${res.status}: ${detail.slice(0, 300)}`);
  }
  return res;
}

/** Нестриминговый chat completion. */
export async function chatCompletion(
  model: string,
  messages: ProxyMessage[],
  opts?: { temperature?: number; maxTokens?: number; signal?: AbortSignal }
): Promise<ChatCompletionResult> {
  const res = await proxyFetch(
    "/chat/completions",
    {
      model,
      messages,
      temperature: opts?.temperature ?? 0,
      max_tokens: opts?.maxTokens ?? 1500,
      stream: false,
    },
    opts?.signal
  );
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    usage?: ProxyUsage;
    model?: string;
  };
  const text = data.choices?.[0]?.message?.content ?? "";
  return {
    text,
    usage: data.usage ?? { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
    model: data.model ?? model,
  };
}

/** Стриминговый chat completion — возвращает Response SSE как есть. */
export async function chatCompletionStream(
  model: string,
  messages: ProxyMessage[],
  opts?: { temperature?: number; maxTokens?: number; signal?: AbortSignal }
): Promise<Response> {
  return proxyFetch(
    "/chat/completions",
    {
      model,
      messages,
      temperature: opts?.temperature ?? 0,
      max_tokens: opts?.maxTokens ?? 1500,
      stream: true,
    },
    opts?.signal
  );
}

/** Эмбеддинги для RAG-поиска. */
export async function createEmbedding(input: string | string[]): Promise<number[][]> {
  const res = await proxyFetch("/embeddings", {
    model: (process.env.PROXYAPI_EMBEDDING_MODEL ?? "openai/text-embedding-3-small").trim(),
    input,
  });
  const data = (await res.json()) as { data?: Array<{ embedding: number[]; index: number }> };
  const rows = (data.data ?? []).slice().sort((a, b) => a.index - b.index);
  return rows.map((r) => r.embedding);
}

/** Быстрая проверка конфигурации (для health-check и тестов). */
export function isProxyApiConfigured(): boolean {
  return (process.env.PROXYAPI_API_KEY ?? "").trim().length > 0;
}

/**
 * Клиент Provod AI (OpenAI-совместимый): chat, vision.
 * Эмбеддинги и STT у Provod недоступны (404) — остаются на ProxyAPI.
 */

import type { ChatCompletionResult, ProxyMessage, ProxyUsage } from "./proxyapi";

const BASE_URL = (process.env.PROVOD_BASE_URL ?? "https://api.provod.ai/v1").trim();

function apiKey(): string {
  const key = (process.env.PROVOD_API_KEY ?? "").trim();
  if (!key) throw new Error("PROVOD_API_KEY is not configured");
  return key;
}

async function provodFetch(path: string, body: unknown, signal?: AbortSignal): Promise<Response> {
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
    throw new Error("PROVOD_UNAUTHORIZED");
  }
  if (res.status === 402) {
    throw new Error("PROVOD_NO_FUNDS");
  }
  if (res.status === 429) {
    throw new Error("PROVOD_RATE_LIMIT");
  }
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`PROVOD_ERROR_${res.status}: ${detail.slice(0, 300)}`);
  }
  return res;
}

/** Нестриминговый chat completion. */
export async function chatCompletion(
  model: string,
  messages: ProxyMessage[],
  opts?: { temperature?: number; maxTokens?: number; signal?: AbortSignal }
): Promise<ChatCompletionResult> {
  const res = await provodFetch(
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

/** Быстрая проверка конфигурации (для health-check и тестов). */
export function isProvodConfigured(): boolean {
  return (process.env.PROVOD_API_KEY ?? "").trim().length > 0;
}

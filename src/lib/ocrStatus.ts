/**
 * Утилита для клиента (браузер): проверка доступности occular-сервера.
 *
 * Использует /api/ocr-status (который в свою очередь пингует домашний occular /health
 * через Tailscale Funnel с серверной стороны Vercel — клиенту НЕ нужен прямой доступ).
 *
 * Не бросает ошибок: при любом сбое возвращает { available: false, reason }.
 * Результат можно кешировать в компоненте на 5-10 секунд, чтобы не спамить /api.
 */

export interface OcularStatus {
  available: boolean;
  reason: string;
  languages?: string;
  threads?: number;
  status?: string;
  checked_at?: string;
}

const DEFAULT_TIMEOUT_MS = 4_000;

export async function fetchOcularStatus(
  signal?: AbortSignal,
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<OcularStatus> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const onOuterAbort = () => controller.abort();
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener('abort', onOuterAbort, { once: true });
  }

  try {
    const res = await fetch('/api/ocr-status', {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal,
    });
    if (!res.ok) {
      return { available: false, reason: `http_${res.status}` };
    }
    const data = (await res.json()) as OcularStatus;
    return data;
  } catch (err) {
    const isAbort = err instanceof Error && err.name === 'AbortError';
    return {
      available: false,
      reason: isAbort ? 'client_timeout' : 'network_error',
    };
  } finally {
    clearTimeout(timeout);
    if (signal) signal.removeEventListener('abort', onOuterAbort);
  }
}

export interface OcularProxyLine {
  text: string;
  confidence: number;
  quad: number[][];
}

export interface OcularProxyResult {
  ok: boolean;
  source: 'server' | 'client-fallback';
  reason?: string;
  lines: OcularProxyLine[];
  cached?: boolean;
  upstream_elapsed_ms?: number;
  elapsed_ms: number;
}

const PROXY_TIMEOUT_MS = 60_000;

export async function postOcrRequest(
  blob: Blob,
  filename: string,
  signal?: AbortSignal
): Promise<OcularProxyResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROXY_TIMEOUT_MS);
  const onOuterAbort = () => controller.abort();
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener('abort', onOuterAbort, { once: true });
  }

  try {
    const form = new FormData();
    form.append('file', blob, filename);
    const res = await fetch('/api/ocr-proxy', {
      method: 'POST',
      body: form,
      signal: controller.signal,
    });
    if (!res.ok) {
      return {
        ok: false,
        source: 'client-fallback',
        reason: `http_${res.status}`,
        lines: [],
        elapsed_ms: 0,
      };
    }
    const data = (await res.json()) as OcularProxyResult;
    return data;
  } catch (err) {
    const isAbort = err instanceof Error && err.name === 'AbortError';
    return {
      ok: false,
      source: 'client-fallback',
      reason: isAbort ? 'client_timeout' : 'network_error',
      lines: [],
      elapsed_ms: 0,
    };
  } finally {
    clearTimeout(timeout);
    if (signal) signal.removeEventListener('abort', onOuterAbort);
  }
}

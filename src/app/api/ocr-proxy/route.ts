import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { rateLimiters, withRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // секунд (Vercel Pro до 60; Hobby до 10 — но occular-кеш делает 33ms, а 1-й запрос 7-8с)

interface OccularLine {
  text: string;
  confidence: number;
  quad: number[][];
}

interface OccularResponse {
  ok: boolean;
  cache: boolean;
  lines: OccularLine[];
  elapsed_ms: number;
  error?: string;
}

function getOcularBaseUrl(): string | null {
  return process.env.OCCULAR_BASE_URL?.trim().replace(/\/+$/, '') || null;
}

function getOcularApiKey(): string | null {
  return process.env.OCCULAR_API_KEY?.trim() || null;
}

/**
 * POST /api/ocr-proxy
 *
 * Multipart form-data: { file: Blob, mimeType?: string }
 * Headers: авторизация пользователя Supabase обязательна
 *
 * Проксирует фото на домашний occular-сервер через Tailscale Funnel.
 * Возвращает JSON: { ok, source: "server"|"client-fallback", lines: [{text, confidence, quad}], elapsed_ms, cached }
 *
 * Коды:
 *  200 — успех (даже если source=client-fallback, т.к. сам сервер сканирования упал)
 *  400 — нет файла
 *  401 — пользователь не залогинен
 *  502 — occular-сервер недоступен И клиентский fallback не разрешён (теоретически)
 *  504 — таймаут ожидания occular
 */
export async function POST(req: NextRequest) {
  const startedAt = Date.now();

  // 1) Авторизация (только для авторизованных пользователей)
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  // 1b) Rate limit: heavy-лимит (10/min). Ограничиваем строго, т.к. каждый
  //     вызов проксирует на домашний сервер (Tailscale/домашний ПК).
  const rl = await withRateLimit(req, rateLimiters.heavy, user.id);
  if (!rl.success) {
    return NextResponse.json(
      { ok: false, error: 'rate_limited', message: 'Слишком много запросов. Подождите.' },
      { status: 429, headers: rl.headers }
    );
  }

  // 2) Получаем файл
  let form: FormData;
  try {
    form = await req.formData();
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: 'invalid_form_data', details: err instanceof Error ? err.message : 'unknown' },
      { status: 400 }
    );
  }
  const file = form.get('file');
  if (typeof file === 'string' || file === null) {
    return NextResponse.json({ ok: false, error: 'file_required' }, { status: 400 });
  }
  const blob = file as Blob;
  if (blob.size === 0) {
    return NextResponse.json({ ok: false, error: 'empty_file' }, { status: 400 });
  }
  const maxBytes = Number(process.env.OCCULAR_PROXY_MAX_FILE_BYTES) || 15 * 1024 * 1024; // 15MB
  if (blob.size > maxBytes) {
    return NextResponse.json(
      { ok: false, error: 'file_too_large', maxBytes },
      { status: 413 }
    );
  }

  // 3) Адрес и ключ occular-сервера
  const ocularBaseUrl = getOcularBaseUrl();
  const ocularApiKey = getOcularApiKey();
  if (!ocularBaseUrl) {
    return NextResponse.json(
      {
        ok: true,
        source: 'client-fallback',
        reason: 'server_unconfigured',
        lines: [],
        elapsed_ms: Date.now() - startedAt,
        cached: false,
      },
      { status: 200 }
    );
  }

  // 4) Делаем запрос к occular-серверу
  const timeoutMs = Number(process.env.OCCULAR_PROXY_TIMEOUT_MS) || 55_000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // 4a) Собираем multipart для upstream
    const upstream = new FormData();
    const fileName = (file && typeof file === 'object' && 'name' in file && typeof file.name === 'string')
      ? file.name
      : '';
    const filename = fileName || `scan.${(blob.type.split('/')[1] || 'jpg').toLowerCase()}`;
    upstream.append('file', blob, filename);

    const headers: Record<string, string> = {};
    if (ocularApiKey) headers['X-API-Key'] = ocularApiKey;

    const upstreamRes = await fetch(`${ocularBaseUrl}/ocr`, {
      method: 'POST',
      body: upstream,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!upstreamRes.ok) {
      // 5xx → fallback; 4xx (кроме 408) → пробрасываем
      if (upstreamRes.status >= 500) {
        return NextResponse.json({
          ok: true,
          source: 'client-fallback',
          reason: `upstream_${upstreamRes.status}`,
          lines: [],
          elapsed_ms: Date.now() - startedAt,
          cached: false,
        });
      }
      let details: unknown = null;
      try {
        details = await upstreamRes.json();
      } catch {
        details = await upstreamRes.text().catch(() => null);
      }
      return NextResponse.json(
        { ok: false, error: 'upstream_rejected', status: upstreamRes.status, details },
        { status: 502 }
      );
    }

    const payload = (await upstreamRes.json()) as OccularResponse;
    if (!payload.ok) {
      return NextResponse.json({
        ok: true,
        source: 'client-fallback',
        reason: 'upstream_not_ok',
        lines: [],
        elapsed_ms: Date.now() - startedAt,
        cached: false,
      });
    }

    return NextResponse.json({
      ok: true,
      source: 'server',
      lines: payload.lines,
      cached: payload.cache,
      upstream_elapsed_ms: payload.elapsed_ms,
      elapsed_ms: Date.now() - startedAt,
    });
  } catch (err) {
    clearTimeout(timeoutId);
    const isAbort = err instanceof Error && err.name === 'AbortError';
    return NextResponse.json({
      ok: true,
      source: 'client-fallback',
      reason: isAbort ? 'upstream_timeout' : 'upstream_unreachable',
      details: err instanceof Error ? err.message : 'unknown',
      lines: [],
      elapsed_ms: Date.now() - startedAt,
      cached: false,
    });
  }
}

export const config = {
  api: { bodyParser: false },
};

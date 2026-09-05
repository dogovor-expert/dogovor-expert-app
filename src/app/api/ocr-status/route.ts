import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { limiters, checkRateLimit, rateLimitResponse } from '@/lib/ratelimit';

export const dynamic = 'force-dynamic';
export const maxDuration = 10;

interface OcularHealth {
  ok: boolean;
  status: string;
  languages?: string;
  threads?: number;
}

/**
 * GET /api/ocr-status
 *
 * Лёгкая проверка доступности occular-сервера.
 * Кеширует результат на 10 секунд (CDN/edge), чтобы не заваливать upstream /health.
 * Авторизация обязательна (не светим состояние сервера публично).
 */
export async function GET(_req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  // S4 (аудит): upstream /health — внешний ресурс; опрос без лимита = вектор DoS.
  const rl = await checkRateLimit(limiters.ocrStatus, user.id);
  if (!rl.ok) return rateLimitResponse(rl.retryAfter);

  const baseUrl = process.env.OCCULAR_BASE_URL?.trim().replace(/\/+$/, '');
  if (!baseUrl) {
    return NextResponse.json(
      {
        ok: true,
        available: false,
        reason: 'unconfigured',
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);

  try {
    const res = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json(
        {
          ok: true,
          available: false,
          reason: `http_${res.status}`,
        },
        { status: 200, headers: { 'Cache-Control': 'no-store' } }
      );
    }
    const health = (await res.json()) as OcularHealth;
    const available = Boolean(health.ok) && health.status === 'ready';
    return NextResponse.json(
      {
        ok: true,
        available,
        reason: available ? 'ready' : 'not_ready',
        languages: health.languages,
        threads: health.threads,
        status: health.status,
        checked_at: new Date().toISOString(),
      },
      { status: 200, headers: { 'Cache-Control': 'public, max-age=10' } }
    );
  } catch (err) {
    clearTimeout(timeout);
    const isAbort = err instanceof Error && err.name === 'AbortError';
    return NextResponse.json(
      {
        ok: true,
        available: false,
        reason: isAbort ? 'timeout' : 'unreachable',
        details: err instanceof Error ? err.message : 'unknown',
        checked_at: new Date().toISOString(),
      },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}

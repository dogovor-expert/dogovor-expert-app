import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 5;

// Аудит S3: эндпоинт публичный — не отдаём environment/version/uptime и
// детали ошибок БД (фингерпринтинг инфраструктуры). Только бинарный статус.
export async function GET() {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('profiles').select('id').limit(1);

    if (error) {
      console.error('[health] db check failed:', error.message);
      return NextResponse.json(
        { status: 'degraded', timestamp: new Date().toISOString() },
        { status: 503 }
      );
    }

    return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() });
  } catch (err) {
    console.error('[health] unexpected error:', err instanceof Error ? err.message : err);
    return NextResponse.json(
      { status: 'error', timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}

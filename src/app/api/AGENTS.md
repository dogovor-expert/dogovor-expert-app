# AGENTS.md — src/app/api

## Правила API routes (overrides root)

### Структура
- `src/app/api/<resource>/route.ts` — REST endpoint
- HTTP методы: `export async function GET/POST/PUT/DELETE`
- Каждый endpoint — отдельный файл

### Обязательный стек
1. **CSRF**: оборачивать в `withCsrf` (src/lib/csrf.ts) для state-changing методов
2. **Rate limit**: `checkRateLimit(limiters.<name>, key)` для защиты от спама
3. **Auth**: проверка `getUser()` для приватных endpoints
4. **Zod-валидация**: `validateBody(<schema>, body)` для всех входов
5. **isSameOrigin**: проверка Origin/Referer для state-changing

### Шаблон endpoint
```typescript
import { NextResponse } from "next/server";
import { withCsrf } from "@/lib/csrf";
import { isSameOrigin } from "@/lib/admin-auth";
import { limiters, checkRateLimit, rateLimitResponse } from "@/lib/ratelimit";
import { mySchema, validateBody } from "@/lib/validations/api";

async function postHandler(req: Request) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  // 1. Auth (если нужен)
  // 2. Rate limit
  // 3. Zod validation
  const parsed = await req.json().catch(() => null);
  const validated = validateBody(mySchema, parsed);
  if (!validated.success) return validated.error;
  // 4. Бизнес-логика
  // 5. Structured error или success
  return NextResponse.json({ ok: true });
}

export const POST = withCsrf(postHandler);
```

### Безопасность
- **Никогда** не возвращай `SUPABASE_SERVICE_ROLE_KEY` или другие секреты
- Используй `zod` для ВСЕХ входов (JSON body, query params, headers)
- Для файлов — проверка MIME + size limit (не больше 5MB по умолчанию)
- Логируй подозрительные запросы через Sentry (`Sentry.captureMessage`)
- Не раскрывай внутренние ошибки (`error.message`) — используй generic messages

### Ошибки
- 400 — invalid input (Zod failed)
- 401 — unauthorized (no session)
- 403 — forbidden (CSRF, same-origin, RLS)
- 404 — not found
- 409 — conflict (duplicate)
- 429 — too many requests (rate limit)
- 500 — internal error (логируем в Sentry, не показываем stack)

### Запрещено
- `process.env` на клиенте (только `NEXT_PUBLIC_*`)
- SQL через Supabase без RLS-проверки
- Возврат `data` без `error` check
- Длинные синхронные операции (>3 сек) — выноси в background job

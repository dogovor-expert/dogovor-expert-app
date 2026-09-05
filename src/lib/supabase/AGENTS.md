# AGENTS.md — src/lib/supabase

## Правила работы с Supabase (overrides root)

### Клиенты
- `server.ts` — server client, используется в server actions, API routes, middleware
- `client.ts` — browser client, используется в `"use client"` компонентах
- `admin.ts` — admin client (service role), **только** для фоновых задач, cron, миграций
- **НИКОГДА** не используй admin client в API routes, доступных пользователю

### RLS (Row Level Security) — обязательно
- Каждая новая таблица → сразу `ENABLE ROW LEVEL SECURITY`
- Политики: `SELECT` для authenticated, `INSERT/UPDATE/DELETE` для owner
- Admin client **обходит** RLS — используй только для trusted backend кода
- Проверка: `select * from pg_policies where schemaname = 'public'` перед коммитом

### Миграции
- Файлы в `supabase/migrations/` — `YYYYMMDDHHMMSS_name.sql`
- Одна миграция = одна логическая операция (add column, add table, add policy)
- НЕ редактируй уже применённые миграции — создай новую
- Тестируй на локальной БД (`supabase db reset`) перед коммитом

### Безопасность
- Никогда не коммить `NEXT_PUBLIC_SUPABASE_ANON_KEY` (это публичный ключ, но лучше через env)
- `SUPABASE_SERVICE_ROLE_KEY` — **строго** server-side, **никогда** в `NEXT_PUBLIC_*`
- Auth tokens — только через httpOnly cookies (`@supabase/ssr`)
- Проверяй `data.user` в server actions, **не** доверяй client data

### Типичные ошибки
- Использование `createServerClient` в client component → hydration error
- Забытый `cookies()` await → undefined user
- Прямой SQL через `rpc()` без валидации Zod → SQL-инъекция
- Возврат `data` без проверки на `error` → null pointer в UI

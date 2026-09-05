# Аудит-фиксы 20.08.2026 (важные инварианты, не ломать)

> Вынесено из AGENTS.md (20.08.2026). Причина: эти инварианты — результат боевого аудита, должны быть задокументированы отдельно, чтобы агент не сломал случайно.

## Вебхук YooKassa (`src/app/api/billing/webhook/route.ts`)

- IP-allowlist (официальные подсети YooKassa + env `YOOKASSA_IP_ALLOWLIST` через запятую).
- Верификация платежа через API `GET /v3/payments/{id}` (Basic auth) + сверка `amount.value`/`currency` с таблицей.
- Идемпотентность по `row.status`.
- **НЕ добавлять** HMAC-проверку «для надёжности» — YooKassa НЕ подписывает вебхуки, работает только IP+API-verify.
- Клиентский `x-forwarded-for` на Vercel перезаписывается реальным IP (спуфинг невозможен, проверено).

## RLS write-lock (миграция 009)

- `anon`/`authenticated` НЕ имеют INSERT/UPDATE/DELETE на `subscriptions`/`payments`.
- `profiles_insert_own` WITH CHECK `is_admin=false`.
- Подписки/платежи создаёт ТОЛЬКО сервер (service_role).
- Новые миграции не должны возвращать клиентские гранты/политики на эти таблицы.

## Экранирование

- `renderDocument.ts` НЕ вызывает `escapeHtml` для значений в view — экранирует только Mustache `{{}}`.
- В шаблонах используется `{{x}}`, НЕ `{{{x}}}` (тройные скобки = двойное экранирование, было 5422 таких мест, исправлено).
- Регресс-тесты в `renderDocument.test.ts`.

## Rate limit (`src/lib/ratelimit.ts`)

- Upstash sliding window; `clientIp()` здесь — единственный источник.
- В вебхуке — локальная копия (не импортировать, конфликт имён).
- Без `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` лимитеры no-op.
- Ключи Upstash для прода — ОТКРЫТАЯ ЗАДАЧА (спросить владельца).

## Next 15 API

- `createClient()` из `@/lib/supabase/server` — **async**, вызывать ТОЛЬКО с `await` (28 вызовов уже обновлены).
- `params`/`searchParams` в роутах/страницах — `Promise` (await/useParams).
- Реакт-рефы в пропсах — `RefObject<T | null>`.
- Custom elements объявляются через `declare module "react" { namespace JSX ... }` (не global).

## npm overrides

- `postcss 8.5.26` + `sharp 0.35.3` внутри next (иначе npm audit = 3 high).
- Целевое состояние: 0 vulnerabilities.
- Не обновлять next до 16 без согласования (ломает middleware→proxy, Turbopack).

## Прочее

- `PATCH/DELETE /api/documents/[id]` → 404 при отсутствии строки.
- `/api/export/email` требует авторизацию.
- `/debug` защищён middleware.
- `.env*.production` в `.gitignore`.

Отчёт: `AUDIT-2026-08-19.md` (раздел 7 — статусы исправлений, верифицировано на проде 20.08.2026).
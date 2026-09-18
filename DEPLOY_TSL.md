# 🚀 TSL интеграция (Trust Service List Минцифры) на VDS

Актуализировано 2026-09-18 под self-hosted стек: **прод на VDS** (CapRover + self-hosted Supabase), Vercel больше не используется.

## ⚠️ БЕЗОПАСНОСТЬ

**service_role ключ Supabase:**
- Обходит ВСЕ Row Level Security (RLS) политики
- Даёт полный доступ к БД (любые SELECT/INSERT/UPDATE/DELETE)
- Доступ к Storage, Auth
- Должен использоваться **ТОЛЬКО** для миграций и админ-задач
- **НЕ отправляйте** его в чатах, issues, email
- **НЕ храните** в коде/репо; на проде он живёт в environment variables приложения CapRover (или в контейнере БД — для миграций)
- **Сбрасывайте** после каждого использования (Supabase панель self-hosted → Settings → API Keys)

---

## Миграция применил — что дальше

Миграция TSL уже в репозитории: `supabase/migrations/20260907_tsl_certificates.sql`. Cron на VDS уже настроен (см. docs/DEPLOY.md):

```
0 3 * * * curl -fsS -H "Authorization: Bearer $CRON_SECRET" https://dogovor.expert/api/cron/tsl-refresh
```

## Как применить миграцию к self-hosted БД

**Через SQL Editor self-hosted (рекомендуется):**
1. Откройте панель `https://supabase.vds.dogovor.expert` (вход под владельцем).
2. SQL Editor → вставить содержимое `supabase/migrations/20260907_tsl_certificates.sql` → Run.

**Через npm скрипт (прямой доступ к Postgres):**
```bash
npm run migrate:tsl
# Введите connection string (SUPABASE_DB_POOL_URL) когда попросит
```

**Через Supabase CLI (указав self-hosted URL):**
```bash
npx supabase db push --db-url "postgresql://postgres:<пароль>@supabase.vds.dogovor.expert:5432/postgres"
```

---

## ENV на проде (CapRover)

Среда приложения CapRover уже содержит (или должна содержать):

```env
CRON_SECRET=<случайные_32_символа>
NEXT_PUBLIC_SUPABASE_URL=https://supabase.vds.dogovor.expert
SUPABASE_SERVICE_ROLE_KEY=<...>

# Опционально (offline-режим)
TSL_USE_REMOTE=false
TSL_LOCAL_FILE=/tmp/tsl.xml
```

После правки env — **пересобрать образ** (NEXT_PUBLIC_* инлайнятся при билде), runtime-only переменные достаточно «перезапустить».

---

## Проверка работы

**Через npm скрипт (URL теперь фиксированный, без VERCEL_URL):**
```bash
export CRON_SECRET=ваш_секрет
npm run tsl:status      # GET /api/cron/tsl-refresh?action=status
npm run tsl:refresh     # POST /api/cron/tsl-refresh (принудительный sync)
```

**Через curl:**
```bash
# Проверить статус
curl -sS "https://dogovor.expert/api/cron/tsl-refresh?action=status" \
  -H "Authorization: Bearer $CRON_SECRET"

# Принудительный sync
curl -X POST "https://dogovor.expert/api/cron/tsl-refresh" \
  -H "Authorization: Bearer $CRON_SECRET"
```

**Ожидаемый ответ:**
```json
{
  "success": true,
  "metadata": { "version": 16326, "date": "2026-08-26T..." },
  "statistics": {
    "authorities_count": 481,
    "root_certificates_count": 487,
    "total_certificates_count": 1005
  }
}
```

---

## Проверка в БД

**Таблица `tsl_certificates`:**
```sql
SELECT
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE is_root = true) as root_count,
  MAX(last_synced_at) as last_sync
FROM tsl_certificates;
```
Ожидаемо: ~1000+ строк после первого sync.

**Таблица `tsl_sync_metadata`:**
```sql
SELECT * FROM tsl_sync_metadata;
```
Должна содержать `last_sync_at`, `last_version`, `total_certificates`.

---

## Troubleshooting

### TSL не загружается (fetch failed)
- При `TSL_USE_REMOTE=false`: убедиться, что `TSL_LOCAL_FILE` доступен в контейнере (для self-hosted класть в volume).
- Внешний сетевой доступ с VDS: проверить, что с сервера доступен источник TSL (URL Минцифры) и у контейнера разрешён исходящий трафик.

### Миграция не применяется (psql/connection refused)
- Проверить, что self-hosted Supabase отвечает: `https://supabase.vds.dogovor.expert` → 401 (живой).
- Использовать панель SQL Editor (рекомендуется).

### Chain of trust не работает
- Проверьте, что в `pades-verify.ts` `getTrustedRoots()` возвращает непустой массив.
- Смотрите логи: `docker logs <container>` — `[trusted-roots] TSL loaded ... root certs`.
- Если `root_certificates_count: 0` — возможно, TSL не синхронизировался (запусти `npm run tsl:refresh`).

---

## Мониторинг

### Логи (контейнер CapRover → App Logs):
- `[tsl-refresh] Completed in Xms` — успешный sync.
- `[tsl-refresh] Failed:` — ошибка (алерт в Sentry).
- `[trusted-roots] TSL loaded (from cache/fresh)` — кэш работает.

### Sentry alerts:
- Error: `[tsl-refresh] Remote TSL fetch failed`
- Error: `[trusted-roots] No TSL data available`

### Деплой изменений кода TSL
Собирается и деплоится тем же путём, что и само приложение (docs/DEPLOY.md), т.к. TSL-логика — часть приложения.

---

**Версия:** 2026-09-06 (актуализировано 2026-09-18 под VDS)
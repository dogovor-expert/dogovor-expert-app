# 🚀 Деплой TSL интеграции (Trust Service List Минцифры)

## ⚠️ БЕЗОПАСНОСТЬ

**service_role ключ Supabase:**
- Обходит ВСЕ Row Level Security (RLS) политики
- Даёт полный доступ к БД (любые SELECT/INSERT/UPDATE/DELETE)
- Доступ к Storage, Auth, Edge Functions
- Должен использоваться **ТОЛЬКО** для миграций и админ-задач
- **НЕ отправляйте** его в чатах, issues, email
- Храните только в `.env.local` (НЕ коммитить) или Vercel Environment Variables
- **Сбрасывайте** после каждого использования (Supabase Dashboard → Settings → API)

---

## 🚀 БЫСТРЫЙ ДЕПЛОЙ (всё в одной команде)

Vercel CLI уже установлен. Если вы залогинены (`vercel login`), запустите:

```bash
npm run deploy:tsl
```

**Что делает скрипт:**
1. Проверяет авторизацию Vercel
2. Запрашивает `SUPABASE_PROJECT_REF` и пароль БД
3. Применяет миграцию (через psql или pg)
4. Деплоит на Vercel production
5. Настраивает `CRON_SECRET` (генерирует если не задан)
6. Опционально: `TSL_USE_REMOTE` / `TSL_LOCAL_FILE`
7. Тестирует cron endpoint

**Все credentials вводятся интерактивно, ничего не сохраняется на диск.**

---

## Ручной деплой (если автоматический не подходит)

### Шаг 1: Применить миграцию

**Через Supabase Dashboard (рекомендуется):**
1. Откройте https://supabase.com/dashboard/project/_/sql/new
2. Скопируйте содержимое файла `supabase/migrations/20260907_tsl_certificates.sql`
3. Вставьте в SQL Editor
4. Нажмите **"Run"** (или Ctrl+Enter)

**Через npm скрипт:**
```bash
npm run migrate:tsl
# Введите connection string когда попросит
```

**Через Supabase CLI:**
```bash
npx supabase db push
```

---

### Шаг 2: Закоммитить и запушить

```bash
git add vercel.json scripts/apply-migration.mjs scripts/deploy-tsl.mjs DEPLOY_TSL.md src/lib/tsl-parser.ts src/lib/tsl-fetcher.ts src/lib/trusted-roots.ts src/app/api/cron/tsl-refresh/route.ts
git commit -m "feat: TSL integration (Trust Service List Минцифры)"
git push
```

Vercel автоматически задеплоит и подхватит `vercel.json` (cron в 03:00 UTC).

---

### Шаг 3: Настроить ENV в Vercel Dashboard

1. Vercel Dashboard → Project → Settings → Environment Variables
2. Добавить:

```env
# Обязательно
CRON_SECRET=<случайные_32_символа>
# Сгенерировать: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Опционально (для offline режима)
TSL_USE_REMOTE=false
TSL_LOCAL_FILE=/tmp/tsl.xml
```

3. **Redeploy** проект

---

### Шаг 4: Проверить работу

**Через npm скрипт:**
```bash
export VERCEL_URL=https://dogovor.expert
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

### Шаг 5: Сбросить service_role ключ

⚠️ **ОБЯЗАТЕЛЬНО после применения миграции!**

1. Supabase Dashboard → Settings → API
2. **Generate new service_role key** → затем **Revoke** старый
3. **НЕ сохраняйте** новый ключ в коде, репо, чатах
4. Если используется Vercel env var — обновите там

---

## Проверка в Supabase Dashboard

### Что должно появиться в БД:

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
- Vercel → Settings → Functions → увеличить timeout
- Попробуйте `TSL_USE_REMOTE=false` + `TSL_LOCAL_FILE=/tmp/tsl.xml`
- Положите `tsl.xml` в `/tmp/` через Vercel CLI: `vercel cp ./tsl.xml /tmp/tsl.xml`

### Миграция не применяется (psql не найден)
- Установите PostgreSQL client: https://www.postgresql.org/download/
- Или используйте Supabase Dashboard (рекомендуется)
- Скрипт `scripts/apply-migration.mjs` сам установит `pg` если нужно

### Vercel CLI не авторизован
```bash
vercel login
# Введите email, перейдите по ссылке в email
```

### Cron не запускается
- Проверьте Vercel Dashboard → Settings → Cron Jobs
- Должна быть запись `/api/cron/tsl-refresh` с `0 3 * * *`
- Vercel Hobby: только 2 cron, может быть конфликт с auto-renew/trash-cleanup

### Цепочка доверия не работает
- Проверьте, что в `pades-verify.ts` `getTrustedRoots()` возвращает непустой массив
- Смотрите логи: `[trusted-roots] TSL loaded ... root certs`
- Если `root_certificates_count: 0` — возможно, TSL не синхронизировался

---

## Мониторинг

### Логи (Vercel Dashboard → Logs):
- `[tsl-refresh] Completed in Xms` — успешный sync
- `[tsl-refresh] Failed:` — ошибка (алерт в Sentry)
- `[trusted-roots] TSL loaded (from cache/fresh)` — кэш работает

### Sentry alerts:
- Error: `[tsl-refresh] Remote TSL fetch failed`
- Error: `[trusted-roots] No TSL data available`

### Vercel Functions метрики:
- `/api/cron/tsl-refresh` → invocations, errors, duration

---

**Версия:** 2026-09-06
**Автор:** Claude (opencode)
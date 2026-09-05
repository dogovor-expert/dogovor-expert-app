# AGENTS.md — src/app/admin

## Правила админки (overrides root)

### Доступ
- **Только** пользователи с `app_metadata.is_admin === true` в Supabase
- Проверка в middleware (см. src/middleware.ts) — редирект на /login если не admin
- Двойная проверка: и в middleware, и в server action / API route

### Аудит
- Все admin-действия логируются в `audit_log` таблицу (Supabase)
- Поля: `actor_id`, `action`, `resource`, `metadata`, `created_at`
- Используй `lib/audit.ts` хелперы (`audit.log(...)`)
- Sentry для критичных действий (delete, ban, payment refund)

### UI
- Отдельный layout `src/app/admin/layout.tsx` (sidebar + main)
- НЕ показывать пользовательский header/sidebar
- Все формы — с подтверждением (confirm dialog) для destructive actions
- Loading states обязательны

### Безопасность
- **Service role key** — НИКОГДА в admin UI (только server-side через admin client)
- IP whitelist (опционально, через middleware)
- 2FA обязательна для admin (Supabase Auth + aal2)
- Запрещено: показывать `SUPABASE_SERVICE_ROLE_KEY` где-либо

### Типичные ошибки
- Прямой `supabase.from('users').update()` через admin client без логирования
- `select *` на sensitive tables (только нужные поля)
- Возврат admin-данных в public API
- Отсутствие rate limit на admin endpoints

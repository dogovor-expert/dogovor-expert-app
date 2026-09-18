# 🗄️ КАРТА БАЗЫ ДАННЫХ (SUPABASE)

**Project ref:** self-hosted на VDS (без облачного ref)  
**URL:** `https://supabase.vds.dogovor.expert` (прод; VDS 82.146.35.220)  
**Auth:** Supabase Auth (email/password, Google OAuth, Yandex OAuth через `custom:yandex` provider, 2FA TOTP)  
**Миграции:** `supabase/migrations/*.sql` (30 файлов, в т.ч. `20260918_ocr_consent_log.sql`)  
**RLS:** Включён на всех пользовательских таблицах.

> Облачный ref `xkakhztknlpzqarklewq.supabase.co` остался только в локальном dev-окружении (`.env.local`/`.env.production.local`). Прод использует БД на VDS.

## 1. Таблицы

| Таблица | Назначение | RLS | Ключевые колонки |
|---------|-----------|-----|------------------|
| `auth.users` | Встроенная Supabase | встроенная | id, email, encrypted_password, email_confirmed_at, raw_user_meta_data |
| `public.profiles` | Профиль пользователя | ✓ (self) | id (= auth.users.id), full_name, phone, is_admin, created_at |
| `public.profile_settings` | Настройки пользователя | ✓ (self) | user_id, language, theme, notifications_*, two_factor_enabled |
| `public.accounts` | Аккаунты (ЮKassa sub-аккаунты) | ✓ (self+admin) | id, user_id, yookassa_customer_id, created_at |
| `public.contracts` / `documents` | Черновики документов | ✓ (self) | id, user_id, template_id, values (jsonb), status, created_at, updated_at |
| `public.contractors` | Сохранённые юрлица | ✓ (self) | id, user_id, name, inn, ogrn, kpp, address, contacts, type |
| `public.persons` | Сохранённые физлица (с 19.08.2026) | ✓ (self) | id, user_id, fio, birthday, phone, passport_series, passport_number, passport_issued_by, passport_code, address |
| `public.leads` | Лиды (форма обратной связи) | ✗ (admin only) | id, name, email, phone, message, source, created_at |
| `public.approvals` | Approve-токены для подписания | ✓ (mixed) | id, document_id, token, expires_at, used_at, signer_email, signer_name |
| `public.subscriptions` | PRO-подписки | ✓ (self read, service_role write) | id, user_id, status, yookassa_payment_method_id, current_period_end, auto_renew |
| `public.payments` | История платежей | ✓ (self read, service_role write) | id, user_id, yookassa_payment_id, amount, currency, status, description, created_at |
| `public.feedback` | Отзывы (публичные) | ✓ (public read, auth write) | id, user_id, rating, text, published, created_at |
| `public.feedback_private` | Приватные заметки по фидбеку (с 20260831) | admin only | id, feedback_id, internal_note, admin_id |
| `public.autoteka_usage` | Использование проверок ТС (с 20260829) | ✓ (self) | id, user_id, vin, report_id, status, created_at |
| `public.admin_audit` | Аудит-лог админских действий (с 20260823) | admin only | id, admin_id, action, target_type, target_id, payload, created_at |
| `public.reports` | Отчёты (admin) | admin only | id, type, payload, created_at |
| `public.trash`, `public.favorites` | Корзина и избранное (с 20260830) | ✓ (self) | id, user_id, document_id, deleted_at |
| `public.signatures` | УКЭП подписи (с 20260903) | ✓ (self+admin) | id, document_id, signer_id, certificate, signed_at, status |
| `public.sign_audit_meta` | Метаданные аудита подписания (с 20260904) | admin only | id, signature_id, ip, user_agent, geo, created_at |

## 2. Миграции (история)

| Файл | Дата | Описание |
|------|------|----------|
| `001_accounts.sql` | – | accounts + RLS |
| `002_profile_settings.sql` | – | profile_settings + RLS |
| `003_contractors.sql` | – | contractors + RLS |
| `004_leads.sql` | – | leads (без RLS, только admin) |
| `005_approvals.sql` | – | approvals + RLS |
| `006_fix_payments_rls.sql` | – | Фикс RLS payments |
| `007_reports.sql` | – | reports (admin) |
| `008_persons.sql` | 19.08.2026 | persons (сохранённые физлица) |
| `009_billing_write_lock.sql` | 20.08.2026 | Write-lock: `anon`/`authenticated` НЕ имеют INSERT/UPDATE/DELETE на `subscriptions`/`payments` |
| `20260822_feedback.sql` | 22.08.2026 | feedback (публичные отзывы) |
| `20260823_admin_audit.sql` | 23.08.2026 | admin_audit (аудит действий) |
| `20260829_autoteka_usage.sql` | 29.08.2026 | autoteka_usage (учёт проверок) |
| `20260830_trash_favorites_columns.sql` | 30.08.2026 | trash + favorites колонки |
| `20260831_autoteka_policy.sql` | 31.08.2026 | Политики autoteka_usage |
| `20260831_feedback_private.sql` | 31.08.2026 | feedback_private (внутренние заметки) |
| `20260902_payments_rls_service_only.sql` | 02.09.2026 | Усиление RLS: payments только service_role |
| `20260903_signatures.sql` | 03.09.2026 | signatures (УКЭП) |
| `20260904_sign_audit_meta.sql` | 04.09.2026 | sign_audit_meta (аудит подписания) |

## 3. RLS-паттерны

### Self-only (пользователь видит/редактирует только свои строки)
```sql
CREATE POLICY "self_select" ON public.documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "self_insert" ON public.documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```
Применяется к: `profiles`, `profile_settings`, `contracts/documents`, `contractors`, `persons`, `subscriptions`, `payments`, `approvals`, `autoteka_usage`, `trash`, `favorites`, `signatures`.

### Service-role only (ТОЛЬКО сервер)
- `subscriptions` INSERT/UPDATE/DELETE — **ТОЛЬКО** `service_role` (миграция 009).
- `payments` INSERT/UPDATE/DELETE — **ТОЛЬКО** `service_role` (миграция 20260902).
- `profiles` INSERT — `WITH CHECK (is_admin = false)` — пользователь не может создать себе admin-профиль.

### Admin only
- `admin_audit`, `feedback_private`, `reports`, `sign_audit_meta` — только `is_admin = true` через `auth.jwt() -> 'is_admin' = true` ИЛИ проверка в коде через admin-клиент.

### Public read, auth write
- `feedback` — SELECT публичный, INSERT для авторизованных, UPDATE/DELETE для admin.

### Mixed (для approval-flow)
- `approvals` — владелец документа видит свои, signer по token видит по `signer_email` (rate-limited).

## 4. Service Role — где используется

**Единственный файл:** `src/lib/supabase/admin.ts`

**Где импортируется (server-side):**
- `/api/billing/create-payment` — создание payment, subscription
- `/api/billing/auto-renew`, `/api/billing/auto-renewal` — продление подписки
- `/api/billing/webhook` — обновление payment status
- `/api/cron/auto-renew`, `/api/cron/trash-cleanup` — фоновые задачи
- `/api/admin/*` — админские операции
- `/api/persons`, `/api/contractors` — нет (используется user-scoped client)
- `/api/import` — bulk import черновиков (admin или service_role)
- `/api/sign/*` — операции с подписями
- `/api/ocr-*` — ⚠️ ЗАБЛОКИРОВАНО, но в коде есть (см. AGENTS.md)

**Правило:** Если новый роут хочет service_role — обосновать в PR и убедиться, что нет утечки к client-стороне.

## 5. Триггеры (если есть)

(Изучить `supabase/migrations/*.sql` на наличие `CREATE TRIGGER` — должны быть упомянуты в миграциях, например updated_at auto-update.)

## 6. Enum-типы

(Изучить `supabase/migrations/*.sql` на наличие `CREATE TYPE ... AS ENUM`.)

## 7. Индексы

(Изучить `supabase/migrations/*.sql` на наличие `CREATE INDEX`. Особое внимание: `documents.user_id`, `documents.template_id`, `payments.yookassa_payment_id`, `subscriptions.user_id`, `signatures.document_id`.)

## 8. Backup и восстановление

- На self-hosted Supabase облачные auto-daily backup/PITR **не действуют**: резервирование настраивается на уровне базы/VDS (например, pg_dump по crontab или бэкап снапшотами). Текущую схему бэкапа прод-БД уточнить у владельца и зафиксировать здесь.
- Владелец: `pochta.alik@gmail.com` (id `1c402366-877a-412e-83d8-d19cc507458a`).

## 9. Правила для новых миграций

1. Файл `YYYYMMDD_<name>.sql` в `supabase/migrations/`.
2. Идемпотентность: `IF NOT EXISTS`, `CREATE OR REPLACE` где возможно.
3. RLS-политики: явно `ENABLE ROW LEVEL SECURITY` + `CREATE POLICY` для каждой операции.
4. Service-role only: `GRANT ... TO service_role`, **отзывать** у `anon`/`authenticated`.
5. **Не возвращать** клиентские GRANT'ы на `subscriptions`/`payments` (миграции 009, 20260902).
6. После написания миграции — применить к прод-БД (self-hosted) через панель `https://supabase.vds.dogovor.expert` → SQL Editor, либо `npx supabase db push --db-url ...` (см. docs/DEPLOY.md и DEPLOY_TSL.md).
7. Зафиксировать в `docs/CHANGELOG_AGENTS.md` (раздел "DB").

---

**Последнее обновление:** 2026-09-18.

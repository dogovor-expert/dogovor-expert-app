# 0001. Использовать Supabase как бэкенд

## Status

Accepted (2024-Q2, обновлено 2026-09-05)

## Context

Проект Dogovor-Эксперт нуждается в:
- Реляционной БД (шаблоны документов, пользователи, платежи)
- Аутентификации (email + VK ID + 2FA)
- Row Level Security (юридические документы — критичная приватность)
- Файловом хранилище (PDF-превью, аватарки)
- Realtime (чаты поддержки, уведомления)
- Edge Functions (опционально, для автоматизации)

## Decision

Используем **Supabase** (managed PostgreSQL + Auth + Storage + Realtime + Edge Functions).

### Причины
1. **PostgreSQL под капотом** — мощь, RLS, миграции, JSONB
2. **RLS из коробки** — критично для GDPR/152-ФЗ compliance
3. **Auth поддерживает OAuth (VK, Yandex, Google)** + email/password + 2FA
4. **Realtime через WebSocket** — не нужен отдельный socket-сервер
5. **Self-hosted опция** — если в будущем нужна миграция с облака
6. **Один SDK** для всех сервисов (auth, db, storage, functions)

## Consequences

### Положительные
- Единый source of truth (PostgreSQL)
- RLS гарантирует безопасность на уровне БД
- Миграции через `supabase/migrations/`
- Локальная разработка через `supabase start` (Docker)
- Встроенный dashboard для администрирования

### Отрицательные
- **Vendor lock-in** — Realtime, Edge Functions специфичны для Supabase
- **Холодный старт Edge Functions** на Deno — может тормозить
- **Лимиты на бесплатном плане** — 500 MB DB, 1 GB Storage
- **Нет SQL JOIN через API** — нужны view или manual join

## Alternatives Considered

### Firebase
- ❌ Документо-ориентированный (NoSQL) — не подходит для юр. документов
- ❌ Нет SQL JOIN'ов
- ❌ Сложные миграции

### Custom Node.js + PostgreSQL
- ❌ Больше работы (auth, RLS, storage своими руками)
- ❌ Нет realtime из коробки
- ❌ Нужен отдельный S3-совместимый storage

### Convex
- ❌ Молодая экосистема
- ❌ Нет миграций (только schema)
- ❌ Сложная миграция с/на Convex

### Pocketbase
- ❌ Single-binary, не масштабируется для production
- ❌ Нет Edge Functions
- ❌ Один разработчик, риски abandoned

## References

- <https://supabase.com/docs>
- <https://supabase.com/docs/guides/auth/row-level-security>
- <https://github.com/supabase/supabase> (MIT)
- AGENTS.md → `src/lib/supabase/AGENTS.md`

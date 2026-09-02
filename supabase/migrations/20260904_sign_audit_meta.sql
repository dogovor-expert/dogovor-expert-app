-- 20260904_sign_audit_meta.sql
-- Добавляет произвольные метаданные в аудит подписаний.
-- Нужно, чтобы записывать результат проверок (hashMatch, byteRangeValid и т.п.),
-- не расширяя схему под каждый новый признак.

alter table public.sign_audit
  add column if not exists meta jsonb;

comment on column public.sign_audit.meta is
  'Произвольные метаданные события: результат проверок, thumbprint, алгоритм подписи.';

create index if not exists sign_audit_action_idx
  on public.sign_audit (action, created_at desc);

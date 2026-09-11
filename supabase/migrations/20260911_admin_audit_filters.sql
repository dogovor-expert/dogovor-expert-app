-- 2026-09-11: аудит 6.3 — фильтры журнала действий по action и admin_id.
-- Индексы created_at desc и (resource, created_at desc) уже есть (20260823_admin_audit.sql).
create index if not exists admin_audit_action_idx
  on public.admin_audit (action, created_at desc);

create index if not exists admin_audit_admin_idx
  on public.admin_audit (admin_id, created_at desc);

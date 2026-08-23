-- 20260823: audit log админских действий
-- Только service_role (сервер) пишет; клиенту доступ закрыт (только чтение для админов).

create table if not exists public.admin_audit (
  id bigserial primary key,
  admin_id uuid references auth.users (id) on delete set null,
  action text not null,
  resource text not null,
  resource_id text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.admin_audit enable row level security;

drop policy if exists "admin_audit_select_admin" on public.admin_audit;
create policy "admin_audit_select_admin" on public.admin_audit
  for select using (public.is_admin());

-- Клиент не должен писать/менять аудит напрямую.
revoke insert, update, delete on public.admin_audit from anon, authenticated;

create index if not exists admin_audit_created_idx on public.admin_audit (created_at desc);
create index if not exists admin_audit_resource_idx on public.admin_audit (resource, created_at desc);

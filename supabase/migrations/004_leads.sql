-- 004: лид-заявки (растаможка под ключ и др.)
-- Вставка — через серверный API (service role), чтение/изменение — только админы.

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  service text not null default 'docs',
  brand text not null default '',
  vin text not null default '',
  phone text not null default '',
  status text not null default 'new',
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.leads enable row level security;

drop policy if exists "leads_select_admin" on public.leads;
create policy "leads_select_admin" on public.leads
  for select using (public.is_admin());
drop policy if exists "leads_update_admin" on public.leads;
create policy "leads_update_admin" on public.leads
  for update using (public.is_admin());
drop policy if exists "leads_delete_admin" on public.leads;
create policy "leads_delete_admin" on public.leads
  for delete using (public.is_admin());

create index if not exists leads_status_idx on public.leads (status, created_at desc);
-- 005: согласование документа с контрагентом

create table if not exists public.approvals (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  user_id uuid not null references auth.users (id) on delete cascade,
  template_id text not null,
  mode text not null default 'fill' check (mode in ('fill', 'edit')),
  values jsonb not null default '{}'::jsonb,
  checklist jsonb not null default '{}'::jsonb,
  opened_count integer not null default 0,
  changed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null
);

alter table public.approvals enable row level security;

create policy "approvals_select_own" on public.approvals
  for select using (auth.uid() = user_id);
create policy "approvals_insert_own" on public.approvals
  for insert with check (auth.uid() = user_id);
create policy "approvals_update_own" on public.approvals
  for update using (auth.uid() = user_id);
create policy "approvals_delete_own" on public.approvals
  for delete using (auth.uid() = user_id);

grant select, insert, update, delete on public.approvals to authenticated;

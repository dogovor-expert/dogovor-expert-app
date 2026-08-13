-- 003: база контрагентов

create table if not exists public.contractors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null default '',
  inn text not null default '',
  kpp text not null default '',
  ogrn text not null default '',
  address text not null default '',
  email text not null default '',
  phone text not null default '',
  note text not null default '',
  created_at timestamptz not null default now()
);

alter table public.contractors enable row level security;

create policy "contractors_select_own" on public.contractors
  for select using (auth.uid() = user_id);
create policy "contractors_insert_own" on public.contractors
  for insert with check (auth.uid() = user_id);
create policy "contractors_update_own" on public.contractors
  for update using (auth.uid() = user_id);
create policy "contractors_delete_own" on public.contractors
  for delete using (auth.uid() = user_id);

grant select, insert, update, delete on public.contractors to authenticated;
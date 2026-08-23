-- 008: база сохранённых лиц (физлиц) для подстановки в роли шаблонов

create table if not exists public.persons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  fio text not null default '',
  birthday text not null default '',
  phone text not null default '',
  passport_series text not null default '',
  passport_number text not null default '',
  passport_issued_by text not null default '',
  passport_code text not null default '',
  address text not null default '',
  note text not null default '',
  created_at timestamptz not null default now()
);

alter table public.persons enable row level security;

create policy "persons_select_own" on public.persons
  for select using (auth.uid() = user_id);
create policy "persons_insert_own" on public.persons
  for insert with check (auth.uid() = user_id);
create policy "persons_update_own" on public.persons
  for update using (auth.uid() = user_id);
create policy "persons_delete_own" on public.persons
  for delete using (auth.uid() = user_id);

grant select, insert, update, delete on public.persons to authenticated;
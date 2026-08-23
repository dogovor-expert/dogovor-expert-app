-- 007: отчёты Автотеки (покупка отчёта по VIN, кэш по VIN для дедупликации)
-- Пользователь платит через ЮKassa -> webhook собирает данные через apipoint -> payload сохраняется здесь.
-- Повторная покупка того же VIN копирует payload без нового вызова apipoint.

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  vin text not null,
  payment_id uuid,
  status text not null default 'pending',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.reports enable row level security;

drop policy if exists "reports_select_own" on public.reports;
create policy "reports_select_own" on public.reports
  for select using (auth.uid() = user_id or public.is_admin());
drop policy if exists "reports_insert_own" on public.reports;
create policy "reports_insert_own" on public.reports
  for insert with check (auth.uid() = user_id);

create index if not exists reports_user_vin_idx on public.reports (user_id, vin);
create index if not exists reports_vin_idx on public.reports (vin);
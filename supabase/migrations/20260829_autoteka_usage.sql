-- Квота бесплатных отчётов Autoteka для PRO-подписчиков (5/мес).
create table if not exists public.autoteka_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  ym text not null,
  used int not null default 0,
  updated_at timestamptz not null default now (),
  primary key (user_id, ym)
);

alter table public.autoteka_usage enable row level security;

drop policy if exists "autoteka_usage_owner" on public.autoteka_usage;

create policy "autoteka_usage_owner" on public.autoteka_usage for all using (auth.uid () = user_id) with check (auth.uid () = user_id);

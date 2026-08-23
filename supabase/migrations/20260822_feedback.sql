-- Миграция: таблица обращений обратной связи + Storage бакет.
-- Применить одним из способов:
--   1) Supabase Dashboard → SQL Editor → вставить и выполнить этот файл;
--   2) либо установить CLI (`npm i -g supabase`) и выполнить `supabase db push`
--      в корне проекта (рядом с supabase/).
-- Повторный запуск безопасен (используются IF NOT EXISTS / ON CONFLICT).

create table if not exists public.feedback (
  id          uuid primary key,
  created_at  timestamptz not null default now(),
  ticket_no   text not null,
  type        text not null
                check (type in ('doc_error','site_bug','feature_request','other')),
  doc_slug    text,
  doc_name    text,
  tool        text,
  message     text not null,
  email       text not null,
  user_id     uuid references auth.users(id) on delete set null,
  screenshots text[],
  tech        jsonb,
  consent     boolean not null default true,
  status      text not null default 'new'
);

create index if not exists feedback_created_at_idx on public.feedback (created_at desc);
create unique index if not exists feedback_ticket_no_idx on public.feedback (ticket_no);

alter table public.feedback enable row level security;

-- Любой (в т.ч. гость) может создавать обращение; серверная валидация в /api/feedback.
drop policy if exists feedback_insert_public on public.feedback;
create policy feedback_insert_public
  on public.feedback
  for insert
  to anon, authenticated
  with check (true);

-- Авторизованный пользователь видит только свои обращения (по user_id).
drop policy if exists feedback_select_owner on public.feedback;
create policy feedback_select_owner
  on public.feedback
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Админ (profiles.is_admin) видит все обращения.
drop policy if exists feedback_select_admin on public.feedback;
create policy feedback_select_admin
  on public.feedback
  for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin
    )
  );

-- Storage: бакет для скриншотов (публичный — для ссылок в письме уведомления).
insert into storage.buckets (id, name, public)
values ('feedback', 'feedback', true)
on conflict (id) do nothing;

drop policy if exists feedback_upload_anon on storage.objects;
create policy feedback_upload_anon
  on storage.objects
  for insert
  to anon, authenticated
  with check (bucket_id = 'feedback');

drop policy if exists feedback_read_public on storage.objects;
create policy feedback_read_public
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'feedback');

-- AI-юрист: баланс, диалоги, леджер списаний, RAG-база норм.
-- Паттерн безопасности — как payments (20260902): запись только через
-- service_role (createAdminClient), чтение своих — через SELECT-политики.
-- Миграция идемпотентна (create table if not exists / drop policy if exists).

-- 1. Кошелёк: одна строка на пользователя, баланс в копейках.
create table if not exists public.ai_balances (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance_kopeks bigint not null default 0 check (balance_kopeks >= 0),
  free_asked int not null default 0 check (free_asked >= 0),
  updated_at timestamptz not null default now()
);

-- 2. Диалоги.
create table if not exists public.ai_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Новый вопрос',
  created_at timestamptz not null default now()
);
create index if not exists ai_threads_user_idx on public.ai_threads (user_id, created_at desc);

-- 3. Сообщения с фактурой: токены и себестоимость каждого ответа.
create table if not exists public.ai_messages (
  id bigint generated always as identity primary key,
  thread_id uuid not null references public.ai_threads(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  tokens_in int,
  tokens_out int,
  cost_kopeks int,
  sources jsonb,
  created_at timestamptz not null default now()
);
create index if not exists ai_messages_thread_idx on public.ai_messages (thread_id, id);

-- 4. Леджер всех движений баланса (аудит «куда делись деньги»).
create table if not exists public.ai_ledger (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  delta_kopeks bigint not null,
  reason text not null,
  meta jsonb,
  created_at timestamptz not null default now()
);
create index if not exists ai_ledger_user_idx on public.ai_ledger (user_id, id desc);

-- 5. RAG: чанки норм права с датой редакции.
create extension if not exists vector;

create table if not exists public.law_chunks (
  id bigint generated always as identity primary key,
  code text not null,
  article text not null,
  chunk text not null,
  edition_date date,
  is_active boolean not null default true,
  embedding vector(1536)
);
create index if not exists law_chunks_code_article_idx on public.law_chunks (code, article);

-- Поиск релевантных чанков: только действующие редакции.
create or replace function public.match_law_chunks(
  query_embedding vector(1536),
  match_count int default 5
)
returns table (
  id bigint,
  code text,
  article text,
  chunk text,
  edition_date date,
  distance float
)
language sql stable
as $$
  select lc.id, lc.code, lc.article, lc.chunk, lc.edition_date,
         lc.embedding <=> query_embedding as distance
  from public.law_chunks lc
  where lc.is_active = true and lc.embedding is not null
  order by lc.embedding <=> query_embedding
  limit match_count;
$$;

-- RLS: включаем на всех таблицах.
alter table public.ai_balances enable row level security;
alter table public.ai_threads enable row level security;
alter table public.ai_messages enable row level security;
alter table public.ai_ledger enable row level security;
alter table public.law_chunks enable row level security;

-- Чтение своих строк (user_id напрямую или через thread).
drop policy if exists "ai_balances_select_own" on public.ai_balances;
create policy "ai_balances_select_own" on public.ai_balances
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "ai_threads_select_own" on public.ai_threads;
create policy "ai_threads_select_own" on public.ai_threads
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "ai_messages_select_own" on public.ai_messages;
create policy "ai_messages_select_own" on public.ai_messages
  for select to authenticated using (
    exists (select 1 from public.ai_threads t
            where t.id = ai_messages.thread_id and t.user_id = auth.uid())
  );

drop policy if exists "ai_ledger_select_own" on public.ai_ledger;
create policy "ai_ledger_select_own" on public.ai_ledger
  for select to authenticated using (auth.uid() = user_id);

-- Запись — только service_role (аналог payments_insert_service).
drop policy if exists "ai_write_service" on public.ai_balances;
create policy "ai_write_service" on public.ai_balances
  for all to service_role using (true) with check (true);

drop policy if exists "ai_threads_write_service" on public.ai_threads;
create policy "ai_threads_write_service" on public.ai_threads
  for all to service_role using (true) with check (true);

drop policy if exists "ai_messages_write_service" on public.ai_messages;
create policy "ai_messages_write_service" on public.ai_messages
  for all to service_role using (true) with check (true);

drop policy if exists "ai_ledger_write_service" on public.ai_ledger;
create policy "ai_ledger_write_service" on public.ai_ledger
  for all to service_role using (true) with check (true);

-- law_chunks: чтение — всем аутентифицированным (нужно для проверки
-- цитат на клиенте), запись — только service_role (наполнение скриптом).
drop policy if exists "law_chunks_select_auth" on public.law_chunks;
create policy "law_chunks_select_auth" on public.law_chunks
  for select to authenticated using (true);

drop policy if exists "law_chunks_write_service" on public.law_chunks;
create policy "law_chunks_write_service" on public.law_chunks
  for all to service_role using (true) with check (true);

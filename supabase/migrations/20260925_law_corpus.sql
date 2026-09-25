-- Версионированный корпус НПА для AI-юриста.
--
-- Безопасная политика: новые документы и редакции создаются как draft.
-- В RAG-поиск попадают только чанки редакции со статусом active. Это не
-- позволяет случайно показать пользователю непроверенный или устаревший текст.

create extension if not exists pgcrypto;

do $$
begin
  create type public.law_edition_status as enum ('draft', 'verified', 'active', 'retired');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.law_documents (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  nd text not null unique,
  official_source_url text not null,
  source_name text not null default 'publication.pravo.gov.ru',
  source_license text not null default 'Официальные открытые данные publication.pravo.gov.ru',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (length(trim(code)) > 0),
  check (length(trim(title)) > 0),
  check (length(trim(official_source_url)) > 0)
);

create table if not exists public.law_document_editions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.law_documents(id) on delete cascade,
  status public.law_edition_status not null default 'draft',
  edition_date date,
  effective_from date,
  effective_to date,
  source_url text not null,
  source_retrieved_at timestamptz not null default now(),
  source_sha256 text not null,
  parser_version text not null,
  content_sha256 text not null,
  legal_reviewed_at timestamptz,
  legal_reviewed_by text,
  supersedes_id uuid references public.law_document_editions(id),
  created_at timestamptz not null default now(),
  unique (document_id, content_sha256),
  check (length(source_sha256) = 64),
  check (length(content_sha256) = 64),
  check ((status not in ('verified', 'active')) or legal_reviewed_at is not null),
  check ((status <> 'active') or effective_from is not null)
);

create index if not exists law_document_editions_active_idx
  on public.law_document_editions (document_id, status, effective_from desc);

alter table public.law_chunks
  add column if not exists edition_id uuid references public.law_document_editions(id) on delete cascade,
  add column if not exists chunk_index integer,
  add column if not exists heading text,
  add column if not exists locator text,
  add column if not exists source_url text,
  add column if not exists content_sha256 text,
  add column if not exists parser_version text;

create unique index if not exists law_chunks_edition_chunk_idx
  on public.law_chunks (edition_id, chunk_index)
  where edition_id is not null and chunk_index is not null;

create index if not exists law_chunks_edition_active_idx
  on public.law_chunks (edition_id, is_active);

-- Старые записи без provenance не считаются пригодными для юридических ответов.
drop function if exists public.match_law_chunks(vector, integer);

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
  distance float,
  source_url text,
  edition_id uuid,
  locator text
)
language sql stable
as $$
  select lc.id, d.code, lc.article, lc.chunk, e.edition_date,
         lc.embedding <=> query_embedding as distance,
         lc.source_url, e.id, lc.locator
  from public.law_chunks lc
  join public.law_document_editions e on e.id = lc.edition_id
  join public.law_documents d on d.id = e.document_id
  where lc.is_active = true
    and lc.embedding is not null
    and e.status = 'active'
    and e.effective_from <= current_date
    and (e.effective_to is null or e.effective_to >= current_date)
  order by lc.embedding <=> query_embedding
  limit greatest(1, least(match_count, 20));
$$;

alter table public.law_documents enable row level security;
alter table public.law_document_editions enable row level security;

drop policy if exists "law_documents_select_auth" on public.law_documents;
create policy "law_documents_select_auth" on public.law_documents
  for select to authenticated using (true);

drop policy if exists "law_editions_select_auth" on public.law_document_editions;
create policy "law_editions_select_auth" on public.law_document_editions
  for select to authenticated using (status = 'active');

drop policy if exists "law_documents_write_service" on public.law_documents;
create policy "law_documents_write_service" on public.law_documents
  for all to service_role using (true) with check (true);

drop policy if exists "law_editions_write_service" on public.law_document_editions;
create policy "law_editions_write_service" on public.law_document_editions
  for all to service_role using (true) with check (true);

comment on table public.law_documents is
  'Канонические НПА. Источник должен быть официальным и указан в official_source_url.';
comment on table public.law_document_editions is
  'Неизменяемые снапшоты редакций НПА. Активировать можно только после проверки.';
comment on column public.law_chunks.edition_id is
  'Обязательная provenance-связь с проверенной редакцией для RAG.';

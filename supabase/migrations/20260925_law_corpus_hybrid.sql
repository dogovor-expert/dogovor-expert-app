-- Гибридный RAG-поиск: векторная близость + полнотекстовый ранг (russian),
-- fusion через Reciprocal Rank Fusion. Чистый вектор на длинных статьях
-- размывается (ТК ст. 80 была на 31 месте), FTS ловит точные термины.
--
-- Обратная совместимость: query_text имеет DEFAULT '', старый код
-- (match_law_chunks(embedding, count)) продолжает работать как чистый вектор.
alter table public.law_chunks
  add column if not exists chunk_tsv tsvector
    generated always as (
      to_tsvector('russian', coalesce(code, '') || ' ' || coalesce(article, '') || ' ' || coalesce(chunk, ''))
    ) stored;

create index if not exists law_chunks_tsv_idx on public.law_chunks using gin (chunk_tsv);

drop function if exists public.match_law_chunks(vector, integer);

create or replace function public.match_law_chunks(
  query_embedding vector(1536),
  match_count int default 5,
  query_text text default ''
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
  with vec as (
    select lc.id, rank() over (order by lc.embedding <=> query_embedding) as rnk,
           lc.embedding <=> query_embedding as dist
    from public.law_chunks lc
    join public.law_document_editions e on e.id = lc.edition_id
    where lc.is_active = true
      and lc.embedding is not null
      and e.status = 'active'
      and e.effective_from <= current_date
      and (e.effective_to is null or e.effective_to >= current_date)
  ),
  fts as (
    select lc.id, rank() over (order by ts_rank(lc.chunk_tsv, plainto_tsquery('russian', query_text)) desc) as rnk
    from public.law_chunks lc
    join public.law_document_editions e on e.id = lc.edition_id
    where query_text <> ''
      and lc.chunk_tsv @@ plainto_tsquery('russian', query_text)
      and lc.is_active = true
      and lc.embedding is not null
      and e.status = 'active'
      and e.effective_from <= current_date
      and (e.effective_to is null or e.effective_to >= current_date)
  ),
  fused as (
    select coalesce(v.id, f.id) as id,
           coalesce(1.0 / (60 + v.rnk), 0) + coalesce(1.0 / (60 + f.rnk), 0) as rrf
    from vec v full outer join fts f on f.id = v.id
  )
  select lc.id, d.code, lc.article, lc.chunk, e.edition_date,
         (select dist from vec where vec.id = lc.id),
         lc.source_url, e.id, lc.locator
  from fused
  join public.law_chunks lc on lc.id = fused.id
  join public.law_document_editions e on e.id = lc.edition_id
  join public.law_documents d on d.id = e.document_id
  order by fused.rrf desc
  limit greatest(1, least(match_count, 20));
$$;

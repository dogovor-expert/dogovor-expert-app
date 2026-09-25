-- Исправление идемпотентности загрузки чанков: ON CONFLICT не работает
-- с partial-индексом без указания предиката. Полный unique-индекс безопасен:
-- legacy-строки с edition_id IS NULL в Postgres не конфликтуют между собой.
drop index if exists public.law_chunks_edition_chunk_idx;
create unique index if not exists law_chunks_edition_chunk_idx
  on public.law_chunks (edition_id, chunk_index);

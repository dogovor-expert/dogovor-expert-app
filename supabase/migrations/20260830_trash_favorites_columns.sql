-- C3 (из MASTER_FIX_PLAN.md): корзина и избранное падают, потому что колонок
-- deleted_at / is_favorite нет ни в одной миграции репо. Код их активно использует:
--   src/app/api/documents/[id]/route.ts:71  .update({ status: "trashed", deleted_at: ... })
--   src/app/api/documents/route.ts:15        .is("deleted_at", null)
--   src/app/api/trash/route.ts:15            .not("deleted_at", "is", null)
--   src/app/api/cron/trash-cleanup/route.ts  .not("deleted_at","is",null) + .lt("deleted_at", cutoff)
--   src/app/api/documents/[id]/route.ts:25   select "is_favorite"
--
-- Идемпотентно (if not exists), чтобы не упасть, если колонки уже добавлены
-- вручную в проде через SQL-редактор Supabase.

alter table public.documents
  add column if not exists deleted_at  timestamptz,
  add column if not exists is_favorite boolean not null default false;

-- Частичный индекс: быстрый доступ к корзине (deleted_at is not null).
-- Активный список (deleted_at is null) пользуется существующим documents_user_idx.
create index if not exists documents_trash_idx
  on public.documents (user_id, deleted_at desc)
  where deleted_at is not null;

comment on column public.documents.deleted_at  is 'Soft-delete timestamp. NULL = документ активен.';
comment on column public.documents.is_favorite is 'Отметка «в избранном» пользователя.';

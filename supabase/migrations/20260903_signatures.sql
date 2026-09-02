-- 20260903_signatures.sql
-- User-side CryptoPro: подпись пользователем на своём ключе
-- Таблицы аудита подписаний и хранения подписанных документов

-- 1. Таблица аудита действий с подписями
create table if not exists public.sign_audit (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete set null,
  document_id uuid references public.documents(id) on delete set null,
  action text not null check (action in ('prepare','accept','download','verify')),
  document_hash_sha256 text,
  ip text,
  user_agent text,
  created_at timestamptz not null default now()
);

alter table public.sign_audit enable row level security;

create policy sign_audit_select_own on public.sign_audit
  for select using (auth.uid() = user_id or public.is_admin());

create index sign_audit_user_created_idx on public.sign_audit (user_id, created_at desc);
create index sign_audit_document_idx on public.sign_audit (document_id, created_at desc);

-- 2. Таблица подписанных документов
create table if not exists public.document_signatures (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  certificate_thumbprint text not null,
  certificate_subject text not null,
  certificate_valid_to timestamptz not null,
  signature_algorithm text not null check (signature_algorithm in ('CAdES-BES','CAdES-X-Long-Type-1')),
  signature_path text not null,
  document_hash_sha256 text not null,
  ip text,
  user_agent text,
  created_at timestamptz not null default now()
);

alter table public.document_signatures enable row level security;

create policy document_signatures_select_own on public.document_signatures
  for select using (auth.uid() = user_id or public.is_admin());

create policy document_signatures_insert_own on public.document_signatures
  for insert with check (auth.uid() = user_id);

create index document_signatures_doc_idx on public.document_signatures (document_id, created_at desc);
create index document_signatures_user_idx on public.document_signatures (user_id, created_at desc);
create index document_signatures_thumbprint_idx on public.document_signatures (certificate_thumbprint);

-- 3. Storage bucket для подписанных документов (приватный)
insert into storage.buckets (id, name, public)
values ('signed-documents', 'signed-documents', false)
on conflict (id) do nothing;

-- Политики для signed-documents bucket
create policy signed_documents_select_own on storage.objects
  for select using (
    bucket_id = 'signed-documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy signed_documents_insert_own on storage.objects
  for insert with check (
    bucket_id = 'signed-documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy signed_documents_update_own on storage.objects
  for update using (
    bucket_id = 'signed-documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- 4. Функция для генерации подписанного пути (внутренняя, не экспортируемая)
-- Путь: signed/${user_id}/${documentId}-${timestamp}.pdf
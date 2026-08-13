-- Dogovor: profile settings & user data rights (P0/P1)

-- ============ PROFILES: new columns ============
alter table public.profiles
  add column if not exists phone text,
  add column if not exists avatar_url text,
  add column if not exists signature text,
  add column if not exists notify_email boolean not null default true;

-- Column-level privileges: authenticated may UPDATE only allowed columns.
-- Prevents users from escalating is_admin/created_at via the Data API.
revoke update on public.profiles from authenticated;
grant update (full_name, phone, company, inn, avatar_url, signature, notify_email) on public.profiles to authenticated;

-- ============ AVATARS STORAGE ============
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "avatars_select_public" on storage.objects;
create policy "avatars_select_public" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "avatars_insert_own" on storage.objects;
create policy "avatars_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_update_own" on storage.objects;
create policy "avatars_update_own" on storage.objects
  for update using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_delete_own" on storage.objects;
create policy "avatars_delete_own" on storage.objects
  for delete using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
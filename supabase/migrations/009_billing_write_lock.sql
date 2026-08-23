-- Dogovor: tighten write access on billing tables.
-- Subscriptions and payments are created only by server-side code
-- (service_role, e.g. billing webhook) — clients must not write them directly.

-- ============ SUBSCRIPTIONS: SELECT-only for clients ============
drop policy if exists "subscriptions_insert_own" on public.subscriptions;
drop policy if exists "subscriptions_update_own" on public.subscriptions;
drop policy if exists "subscriptions_delete_own" on public.subscriptions;
revoke insert, update, delete on public.subscriptions from anon, authenticated;

-- ============ PAYMENTS: SELECT-only for clients ============
drop policy if exists "payments_insert_service" on public.payments;
drop policy if exists "payments_update_service" on public.payments;
revoke insert, update, delete on public.payments from anon, authenticated;

-- ============ PROFILES: cannot self-grant admin at signup ============
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated
  with check (auth.uid() = id and is_admin = false);
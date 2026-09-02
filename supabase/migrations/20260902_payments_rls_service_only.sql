-- B2: payments RLS был открыт (with check (true) / using (true)) —
-- любой authenticated юзер мог создать фейковый платёж или обновить чужой.
-- Закрываем: INSERT/UPDATE — только service_role (createAdminClient).
-- SELECT уже ограничен в 001_accounts.sql: payments_select_own.
-- Миграция идемпотентна (drop if exists).

drop policy if exists "payments_insert_service" on public.payments;
create policy "payments_insert_service" on public.payments
  for insert
  to service_role
  with check (true);

drop policy if exists "payments_update_service" on public.payments;
create policy "payments_update_service" on public.payments
  for update
  to service_role
  using (true)
  with check (true);

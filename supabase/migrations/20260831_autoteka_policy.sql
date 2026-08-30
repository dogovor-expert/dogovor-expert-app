-- H1: политика autoteka_usage была `for all` (select+insert+update+delete) для
-- владельца. Пользователь мог бы через UPDATE сбросить `used = 0` и обойти квоту
-- PRO (5 бесплатных отчётов/мес). Инкремент квоты в коде идёт через service_role
-- (src/app/api/autoteka/pay/route.ts использует createAdminClient), поэтому
-- пользователю достаточно только SELECT/INSERT своей строки. UPDATE/DELETE
-- оставляем исключительно service_role (обходит RLS) — явной policy для
-- anon/authenticated на UPDATE/DELETE нет => default-deny.

drop policy if exists "autoteka_usage_owner" on public.autoteka_usage;

create policy "autoteka_usage_select_own"
  on public.autoteka_usage
  for select
  using (auth.uid() = user_id);

create policy "autoteka_usage_insert_own"
  on public.autoteka_usage
  for insert
  with check (auth.uid() = user_id);

-- 6.5 RBAC: трёхуровневые роли админки (superadmin > admin > moderator).
-- Источник истины ролей — profiles.admin_role; JWT app_metadata.is_admin
-- остаётся только грубым гейтом входа в /admin (middleware), роль всегда
-- читается из БД в getAdminUser().
--
-- Безопасный бойстрап: все существующие админы становятся «admin», самый
-- старый по created_at (владелец) — «superadmin». Пока суперадминов ровно
-- один, снять его нельзя (гард в setUserRole), потеря управления исключена.

alter table profiles
  add column if not exists admin_role text
    constraint profiles_admin_role_check
    check (admin_role in ('superadmin', 'admin', 'moderator'));

comment on column profiles.admin_role is
  '6.5 RBAC: superadmin | admin | moderator; NULL = не админ. Истина здесь, не в JWT.';

-- 1) Существующие админы → admin
update profiles
   set admin_role = 'admin'
 where is_admin = true
   and admin_role is null;

-- 2) Самый старый админ (владелец) → superadmin
update profiles
   set admin_role = 'superadmin'
 where id = (
   select id from profiles
    where is_admin = true
    order by created_at asc
    limit 1
 );

-- 3) Инвариант согласованности: флаг is_admin ⇔ наличие роли.
--    (Приложение пишет оба поля вместе; колонка-страховка на случай ручных правок.)
update profiles
   set admin_role = 'admin'
 where is_admin = true
   and admin_role is null;

update profiles
   set is_admin = false
 where admin_role is not null
   and is_admin = false;

-- 4) Частичный индекс: быстрый поиск админов и проверка «последний суперадмин».
create index if not exists profiles_admin_role_idx
  on profiles (admin_role)
 where admin_role is not null;

-- 5) RLS не добавляем сознательно: все админ-чтения/записи идут через
--    service_role (createAdminClient), который RLS обходит; единая точка
--    enforcement — getAdminUser()/atLeast() в src/lib/admin-auth.ts.

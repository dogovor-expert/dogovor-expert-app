-- C5: бакет feedback был public + разрешал anon upload/read.
-- Любой мог загрузить файл и прочитать чужие скриншоты (ПДн) по угадываемому URL.
-- Делаем бакет приватным; загрузка/чтение — только через service_role (роуты
-- используют createAdminClient), который обходит RLS storage. anonymous-политики
-- убираем. Скриншоты отдаются админу через signed URL (см. /api/feedback GET).

-- 1) Приватный бакет
update storage.buckets
  set public = false
  where id = 'feedback';

-- 2) Убираем anonymous/authenticated доступ к объектам бакета.
--    После удаления этих политик anon/authenticated НЕТ ни одной policy на
--    объекты feedback => RLS по умолчанию запрещает (default-deny). Загрузка и
--    чтение идут только через service_role (createAdminClient в роутах), который
--    обходит RLS storage. НЕ добавляем широкую policy «for all» — иначе можно
--    случайно открыть доступ к другим бакетам.
drop policy if exists feedback_upload_anon on storage.objects;
drop policy if exists feedback_read_public on storage.objects;

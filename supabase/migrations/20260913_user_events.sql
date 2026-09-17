-- Внутренняя аналитика действий пользователей (админ-панель /admin/analytics).
--
-- Зачем отдельная таблица, а не только Яндекс.Метрика:
--  1) свои данные не покидают инфраструктуру (152-ФЗ, self-hosted VDS);
--  2) можно построить карточку конкретного пользователя для саппорта
--     («что он делал перед тем как написать в поддержку»);
--  3) не зависит от cookie-consent конкретного стороннего счётчика.
--
-- ЖЁСТКОЕ ПРАВИЛО (см. src/lib/userEvents.ts): в meta НИКОГДА не пишется
-- содержимое полей форм (ФИО, паспорт, ИНН, адрес и т.п.) — только
-- идентификаторы (template_id), булевы флаги, статусы, суммы без реквизитов.
-- Таблица не предназначена для персональных данных сверх user_id.

create table if not exists public.user_events (
  id uuid primary key default gen_random_uuid(),
  -- NULL для анонимных событий (посетитель ещё не вошёл в аккаунт).
  user_id uuid references auth.users(id) on delete set null,
  -- Анонимный идентификатор визита (случайная строка на клиенте, НЕ ПДн),
  -- связывает события одного визита до и после логина.
  session_id text not null,
  event text not null,
  -- Только путь, без query-строки (в query могут быть чувствительные параметры).
  path text,
  referrer_host text,
  -- 'mobile' | 'desktop' | 'tablet' — не полный User-Agent (fingerprinting).
  device text,
  meta jsonb,
  created_at timestamptz not null default now()
);

comment on table public.user_events is
  'Внутренний журнал действий пользователей для /admin/analytics. Не хранить в meta содержимое полей форм — см. src/lib/userEvents.ts (EVENT_META_SCHEMA).';
comment on column public.user_events.session_id is
  'Анонимный client-side id визита (localStorage), не ПДн, ротируется раз в 30 дней.';

-- Частые запросы дашборда: воронка/динамика по event+дате, лента конкретного
-- пользователя, склейка анонимных событий визита с событиями после логина.
create index if not exists user_events_event_created_idx
  on public.user_events (event, created_at desc);
create index if not exists user_events_user_created_idx
  on public.user_events (user_id, created_at desc);
create index if not exists user_events_session_created_idx
  on public.user_events (session_id, created_at desc);
create index if not exists user_events_created_idx
  on public.user_events (created_at desc);

-- RLS: таблица недоступна напрямую ни anon, ни authenticated — запись и
-- чтение только через service_role (см. src/lib/userEvents.ts,
-- src/app/api/events/route.ts, admin-страницы используют createAdminClient()).
-- Так проще и безопаснее, чем городить RLS-политику на смешанный
-- анонимный+авторизованный insert.
alter table public.user_events enable row level security;

-- Автоочистка: 152-ФЗ требует не хранить ПДн дольше необходимого для цели.
-- session_id/user_id сами по себе не «избыточные» ПДн, но 12 месяцев —
-- разумный потолок для поведенческой аналитики; переопределяемо позже.
create or replace function public.purge_old_user_events() returns void
language sql as $$
  delete from public.user_events where created_at < now() - interval '12 months';
$$;

comment on function public.purge_old_user_events is
  'Вызывать по расписанию (см. /api/cron/daily-maintenance) — удаляет события старше 12 месяцев.';

-- Агрегация на стороне БД для дашборда /admin/analytics — тянуть все сырые
-- строки в JS и группировать там же не масштабируется. security definer,
-- потому что RLS на user_events закрыт для всех ролей (см. выше); функция
-- сама ничего не принимает от клиента, кроме числа дней, и не возвращает
-- ничего, кроме агрегатов (event/day/count) — ни user_id, ни meta наружу
-- не идёт.
create or replace function public.user_events_daily(p_days int default 30)
returns table (event text, day date, count bigint)
language sql
security definer
set search_path = public
as $$
  select event, created_at::date as day, count(*)::bigint
  from public.user_events
  where created_at >= now() - (p_days || ' days')::interval
  group by event, created_at::date
  order by day asc;
$$;

comment on function public.user_events_daily is
  'Агрегат событий по дням за p_days для дашборда /admin/analytics. Возвращает только (event, day, count) — без user_id/meta.';

revoke all on function public.user_events_daily(int) from public, anon, authenticated;
grant execute on function public.user_events_daily(int) to service_role;

revoke all on function public.purge_old_user_events() from public, anon, authenticated;
grant execute on function public.purge_old_user_events() to service_role;

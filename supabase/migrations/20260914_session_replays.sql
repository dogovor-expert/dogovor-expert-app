-- Запись визитов (session replay) на базе rrweb — собственная, self-hosted.
--
-- Отличие от журнала user_events (см. 20260913_user_events.sql):
--   * user_events — обезличенные события (event/day/count), ведётся на
--     основании законного интереса, всегда включён;
--   * session_replays — воспроизведение поведения (DOM-мутации), поэтому
--     пишется ТОЛЬКО по согласию (cookie-consent, categories.analytics) и
--     с маскировкой полей ввода на клиенте (maskAllInputs).
--
-- Данные не покидают наш сервер (РФ). Срок хранения ограничен автоочисткой.

create table if not exists public.session_replays (
  session_id text primary key,
  -- NULL для анонимных визитов (до входа в аккаунт).
  user_id uuid references auth.users(id) on delete set null,
  started_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  chunk_count integer not null default 0,
  size_bytes bigint not null default 0,
  device text,
  entry_path text
);

comment on table public.session_replays is
  'Метаданные записей визитов (rrweb). Чтение/запись только через service_role; см. /admin/replays.';

create index if not exists session_replays_last_seen_idx
  on public.session_replays (last_seen_at desc);
create index if not exists session_replays_user_idx
  on public.session_replays (user_id, last_seen_at desc);

create table if not exists public.session_replay_chunks (
  session_id text not null references public.session_replays(session_id) on delete cascade,
  seq integer not null,
  -- base64(gzip(JSON-массив событий rrweb)). Храним текстом: не нужен
  -- отдельный S3-бакет, а автоочистка удаляет строки без «осиротевших» файлов.
  data text not null,
  created_at timestamptz not null default now(),
  primary key (session_id, seq)
);

comment on table public.session_replay_chunks is
  'Чанки событий rrweb (base64 gzip) по визитам; удаляются каскадом с session_replays.';

-- RLS: прямого доступа нет ни у anon, ни у authenticated — только service_role
-- (роут /api/replay и админ-страницы используют createAdminClient()).
alter table public.session_replays enable row level security;
alter table public.session_replay_chunks enable row level security;

revoke all on public.session_replays from anon, authenticated;
revoke all on public.session_replay_chunks from anon, authenticated;

-- Запись чанка + обновление метаданных сессии в одной транзакции.
-- Идемпотентно: повторная отправка того же (session_id, seq) счётчики не
-- задваивает.
create or replace function public.record_replay_chunk(
  p_session_id text,
  p_seq integer,
  p_data text,
  p_user_id uuid default null,
  p_device text default null,
  p_path text default null
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rows integer;
begin
  insert into public.session_replays (session_id, user_id, device, entry_path, last_seen_at)
  values (p_session_id, p_user_id, p_device, p_path, now())
  on conflict (session_id) do update
    set last_seen_at = now(),
        user_id = coalesce(public.session_replays.user_id, excluded.user_id);

  insert into public.session_replay_chunks (session_id, seq, data)
  values (p_session_id, p_seq, p_data)
  on conflict (session_id, seq) do nothing;

  get diagnostics v_rows = row_count;
  if v_rows > 0 then
    update public.session_replays
       set chunk_count = chunk_count + 1,
           size_bytes = size_bytes + length(p_data)
     where session_id = p_session_id;
  end if;
end;
$$;

comment on function public.record_replay_chunk is
  'Идемпотентно пишет чанк записи и обновляет агрегаты session_replays.';

-- Автоочистка: поведенческие записи храним не дольше 30 дней по умолчанию.
create or replace function public.purge_old_session_replays(p_days integer default 30)
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.session_replay_chunks
   where session_id in (
     select session_id from public.session_replays
      where last_seen_at < now() - make_interval(days => p_days)
   );
  delete from public.session_replays
   where last_seen_at < now() - make_interval(days => p_days);
$$;

comment on function public.purge_old_session_replays is
  'Удаляет записи визитов старше p_days дней (вызывается из /api/cron/daily-maintenance).';

revoke all on function public.record_replay_chunk(text, integer, text, uuid, text, text) from public, anon, authenticated;
grant execute on function public.record_replay_chunk(text, integer, text, uuid, text, text) to service_role;

revoke all on function public.purge_old_session_replays(integer) from public, anon, authenticated;
grant execute on function public.purge_old_session_replays(integer) to service_role;

-- Словарь разговорных юридических терминов -> статутные формулировки.
-- Проблема: пользователь пишет «уволиться», «ОСАГО», «развод», а в текстах
-- НПА — «расторжение трудового договора», «обязательное страхование...»,
-- «расторжение брака». Чистый вектор на коротких запросах плывёт
-- (ТК ст. 80 была на 79 месте), AND-FTS вообще ничего не находит.
-- Решение: law_expand_query дописывает статутные эквиваленты к запросу;
-- маршрут эмбеддит расширенный текст и передаёт его же в FTS.
-- Таблица — данные, ревьюится как юридический контент, а не код.

create table if not exists public.law_synonyms (
  id bigint generated always as identity primary key,
  pattern text not null unique,
  expansion text not null,
  note text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.law_synonyms (pattern, expansion, note) values
  ('осаго', 'обязательное страхование гражданской ответственности владельцев транспортных средств', 'аббревиатура отсутствует в тексте КоАП'),
  ('каско', 'добровольное страхование транспортного средства', ''),
  ('гибдд', 'государственная инспекция безопасности дорожного движения', ''),
  ('\yгаи\y', 'государственная инспекция безопасности дорожного движения', 'границы слова: не срабатывать внутри слов'),
  ('дтп', 'дорожно-транспортное происшествие', ''),
  ('\yразвод\w*\y', 'расторжение брака', 'словоформы: развод/развода/разводов'),
  ('развес', 'расторжение брака', 'развестись/разведусь: другой корень, чем развод'),
  ('увольн|уволи', 'расторжение трудового договора по инициативе работника', 'уволиться/увольнение/уволили'),
  ('декрет', 'отпуск по беременности и родам отпуск по уходу за ребенком', ''),
  ('больничн', 'пособие по временной нетрудоспособности листок нетрудоспособности', ''),
  ('зарплат', 'заработная плата', ''),
  ('коммунал|жкх', 'жилищно-коммунальные услуги плата за жилое помещение', ''),
  ('капремонт', 'взносы на капитальный ремонт общего имущества многоквартирного дома', ''),
  ('встречк', 'выезд на полосу встречного движения', ''),
  ('лишен\w* прав|лишили прав', 'лишение права управления транспортными средствами', ''),
  ('пеней|\yпени\y|\yпеня\y|\yпеню\y|\yпеням\y', 'неустойка', 'пени — разговорное; границы чтобы не цеплять пенсию'),
  ('\yаванс\y', 'предварительная оплата', ''),
  ('штрафстоянк', 'задержание транспортного средства', ''),
  ('аудит|провер\w* договор|риски договора|экспертиз', 'проверка соответствия условий договора требованиям законодательства', 'аудит договора: пользовательский термин'),
  ('неустойк', 'неустойка', 'аудит: пеня/штраф в договоре'),
  ('залог|обеспечительн', 'обеспечительный платеж', 'аудит: залог/обеспечение'),
  ('односторонн\w* отказ|расторгн\w* в одностороннем', 'односторонний отказ от исполнения обязательства', 'аудит: расторжение'),
  ('самозанят|гпх|подряд', 'договор подряда возмездного оказания услуг', 'аудит: ГПХ vs трудовые'),
  ('переквалификац', 'признание отношений трудовыми', 'аудит: самозанятые'),
  ('аренд', 'договор найма жилого помещения', 'аудит: аренда'),
  ('задат', 'задаток', 'аудит: задаток vs аванс'),
  ('приемк|акт сдачи', 'приемка выполненных работ', 'аудит: подряд'),
  ('фото|фотографи|скан|картинк|изображени', 'документ визуальный носитель', 'фото-контур: разбор изображений'),
  ('видео|ролик|запис', 'видеозапись доказательство', 'видео-контур: разбор видео'),
  ('голос|аудио|надикт', 'аудиозапись устное обращение', 'голосовой ввод')
on conflict (pattern) do update set
  expansion = excluded.expansion,
  note = excluded.note,
  is_active = true;

-- Расширение запроса: исходный текст + найденные статутные эквиваленты.
-- Возвращает исходник без изменений, если ничего не подошло.
create or replace function public.law_expand_query(q text)
returns text
language sql stable
as $$
  select q || coalesce(
    (select string_agg(' ' || s.expansion, '' order by s.pattern)
     from public.law_synonyms s
     where s.is_active and q ~* ('(?:' || s.pattern || ')')),
    ''
  );
$$;

-- match_law_chunks: FTS-ветка на OR (AND требовал ВСЕ лексемы и молчал
-- при лексическом расхождении), RRF k=10 (резче поощряет топ-позиции:
-- замеры дали k=10 не хуже k=60 везде и лучше на 3/6 кейсах).
create or replace function public.match_law_chunks(
  query_embedding vector(1536),
  match_count int default 5,
  query_text text default ''
)
returns table (
  id bigint,
  code text,
  article text,
  chunk text,
  edition_date date,
  distance float,
  source_url text,
  edition_id uuid,
  locator text
)
language sql stable
as $$
  with orq as (
    select case when plainto_tsquery('russian', query_text)::text <> ''
      then replace(plainto_tsquery('russian', query_text)::text, '&', '|')::tsquery end as q
  ),
  vec as (
    select lc.id, rank() over (order by lc.embedding <=> query_embedding) as rnk,
           lc.embedding <=> query_embedding as dist
    from public.law_chunks lc
    join public.law_document_editions e on e.id = lc.edition_id
    where lc.is_active = true
      and lc.embedding is not null
      and e.status = 'active'
      and e.effective_from <= current_date
      and (e.effective_to is null or e.effective_to >= current_date)
  ),
  fts as (
    select lc.id, rank() over (order by ts_rank(lc.chunk_tsv, orq.q) desc) as rnk
    from public.law_chunks lc
    cross join orq
    join public.law_document_editions e on e.id = lc.edition_id
    where orq.q is not null
      and lc.chunk_tsv @@ orq.q
      and lc.is_active = true
      and lc.embedding is not null
      and e.status = 'active'
      and e.effective_from <= current_date
      and (e.effective_to is null or e.effective_to >= current_date)
  ),
  fused as (
    select coalesce(v.id, f.id) as id,
           coalesce(1.0 / (10 + v.rnk), 0) + coalesce(1.0 / (10 + f.rnk), 0) as rrf
    from vec v full outer join fts f on f.id = v.id
  )
  select lc.id, d.code, lc.article, lc.chunk, e.edition_date,
         (select dist from vec where vec.id = lc.id),
         lc.source_url, e.id, lc.locator
  from fused
  join public.law_chunks lc on lc.id = fused.id
  join public.law_document_editions e on e.id = lc.edition_id
  join public.law_documents d on d.id = e.document_id
  order by fused.rrf desc
  limit greatest(1, least(match_count, 20));
$$;

-- Тариф «AI-юрист»: месячная квота вопросов на ai_balances.
-- quota_month — календарный месяц 'YYYY-MM'; при смене месяца код
-- обнуляет quota_used (квота не переносится). quota_total выставляется
-- вебхуком при активации подписки plan='ai'. Без подписки все нули —
-- гейт чата идёт по балансу/бесплатным, как раньше.
alter table public.ai_balances
  add column if not exists quota_total integer not null default 0,
  add column if not exists quota_used integer not null default 0,
  add column if not exists quota_month text not null default '';

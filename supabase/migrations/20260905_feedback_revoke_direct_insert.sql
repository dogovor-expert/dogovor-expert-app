-- S7 (аудит 2026-09-05): отозвать прямой INSERT на public.feedback для anon/authenticated.
--
-- Почему: политика feedback_insert_public (20260822_feedback.sql:33-37) разрешала
-- ЛЮБОЙ anon/authenticated INSERT с WITH CHECK (true) — шире, чем нужно: все записи
-- создаёт ТОЛЬКО service role через /api/feedback (createAdminClient, zod-валидация,
-- rate-limit, isSameOrigin). Прямая запись клиентом в обход API не используется.
-- RLS-policies select_owner/select_admin остаются без изменений.

drop policy if exists feedback_insert_public on public.feedback;

revoke insert on table public.feedback from anon;
revoke insert on table public.feedback from authenticated;

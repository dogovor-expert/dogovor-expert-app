-- TICKET-1 (2026-09-12): доказательная база согласия на серверный OCR.
-- Фото документов уходит на occular-сервер только после явного opt-in
-- пользователя (152-ФЗ ст. 9). Храним момент согласия; при отзыве — NULL.

alter table public.profiles
  add column if not exists ocr_consent_at timestamptz;

comment on column public.profiles.ocr_consent_at is
  'UTC-момент явного согласия пользователя на передачу фото документов серверу распознавания (OCR). NULL = согласия нет или оно отозвано.';

-- 152-ФЗ ст.9: append-only аудит согласия на серверный OCR.
-- Каждое действие (grant/revoke) = новая строка. История не перезаписывается.
-- Не содержит ПДн — только факт согласия/отзыва, IP, UA, версию текста.

CREATE TABLE IF NOT EXISTS public.ocr_consent_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action text NOT NULL CHECK (action IN ('grant', 'revoke')),
  consent_version text NOT NULL DEFAULT '1.0',
  ip inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ocr_consent_log_user_time
  ON public.ocr_consent_log(user_id, created_at DESC);

ALTER TABLE public.ocr_consent_log ENABLE ROW LEVEL SECURITY;

-- Пользователь видит свои записи
CREATE POLICY "Users see own consent log"
  ON public.ocr_consent_log FOR SELECT
  USING (auth.uid() = user_id);

-- Пользователь пишет только свои записи (append-only, без update/delete)
CREATE POLICY "Users insert own consent log"
  ON public.ocr_consent_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admin видит все записи
CREATE POLICY "Admins see all consent logs"
  ON public.ocr_consent_log FOR SELECT
  USING (public.is_admin());

COMMENT ON TABLE public.ocr_consent_log IS
  'Append-only аудит согласий на серверный OCR (152-ФЗ ст.9). Не содержит ПДн — только факт согласия/отзыва.';

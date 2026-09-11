-- 2.1 Approval security hardening
-- Adds: password protection, audit access log, removes mode column usage.

-- 1. Add password_hash column to approvals (nullable for backward compat)
ALTER TABLE approvals ADD COLUMN IF NOT EXISTS password_hash text;

-- 2. Create approval_access_log for audit trail
CREATE TABLE IF NOT EXISTS approval_access_log (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  approval_id uuid NOT NULL REFERENCES approvals(id) ON DELETE CASCADE,
  action     text NOT NULL CHECK (action IN ('view', 'unlock', 'edit', 'unlock_failed')),
  ip         inet,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_approval_access_log_approval ON approval_access_log(approval_id);
CREATE INDEX IF NOT EXISTS idx_approval_access_log_created ON approval_access_log(created_at);

-- 3. RLS: only service role (admin client) accesses logs; no public read/write
ALTER TABLE approval_access_log ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'approval_access_log_service_role' AND tablename = 'approval_access_log'
  ) THEN
    CREATE POLICY "approval_access_log_service_role" ON approval_access_log
      FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
  END IF;
END $$;

-- 4. Unlock sessions: выданный после успешного ввода пароля access_token.
--    Хранится как SHA-256 хеш (access токен — высокоэнтропийный, scrypt не нужен).
CREATE TABLE IF NOT EXISTS approval_unlocks (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  approval_id  uuid NOT NULL REFERENCES approvals(id) ON DELETE CASCADE,
  token_hash   text NOT NULL UNIQUE,
  ip           inet,
  created_at   timestamptz NOT NULL DEFAULT now(),
  expires_at   timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_approval_unlocks_approval ON approval_unlocks(approval_id);

ALTER TABLE approval_unlocks ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'approval_unlocks_service_role' AND tablename = 'approval_unlocks'
  ) THEN
    CREATE POLICY "approval_unlocks_service_role" ON approval_unlocks
      FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
  END IF;
END $$;

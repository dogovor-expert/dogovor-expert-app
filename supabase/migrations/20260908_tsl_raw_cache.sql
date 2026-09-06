-- 20260908_tsl_raw_cache.sql
-- Stores the raw TSL XML so trust data survives without /tmp (ephemeral on Vercel)

CREATE TABLE IF NOT EXISTS public.tsl_raw_cache (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  raw_xml text NOT NULL,
  tsl_version integer NOT NULL,
  tsl_date timestamptz NOT NULL,
  fetched_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT only_one_row CHECK (id = 1)
);

COMMENT ON TABLE public.tsl_raw_cache IS 'Single-row cache of the raw TSL XML (Минцифры)';

ALTER TABLE public.tsl_raw_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY tsl_raw_cache_service_all ON public.tsl_raw_cache
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY tsl_raw_cache_read ON public.tsl_raw_cache
  FOR SELECT
  USING (true);
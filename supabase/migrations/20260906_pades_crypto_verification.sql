-- 20260906_pades_crypto_verification.sql
-- Add fields for PAdES cryptographic verification results

ALTER TABLE public.document_signatures
ADD COLUMN IF NOT EXISTS certificate_issuer text,
ADD COLUMN IF NOT EXISTS certificate_serial text,
ADD COLUMN IF NOT EXISTS certificate_valid_from timestamptz,
ADD COLUMN IF NOT EXISTS is_qualified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS crypto_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS chain_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS revocation_status text CHECK (revocation_status IN ('valid','revoked','unknown','offline')),
ADD COLUMN IF NOT EXISTS chain_details jsonb,
ADD COLUMN IF NOT EXISTS tsa_info jsonb,
ADD COLUMN IF NOT EXISTS verification_errors text[];

COMMENT ON COLUMN public.document_signatures.certificate_issuer IS 'Issuer DN from certificate in CMS';
COMMENT ON COLUMN public.document_signatures.certificate_serial IS 'Serial number from certificate in CMS';
COMMENT ON COLUMN public.document_signatures.certificate_valid_from IS 'NotBefore from certificate in CMS';
COMMENT ON COLUMN public.document_signatures.is_qualified IS 'Whether certificate has id-kp-qcSign EKU (1.2.643.7.1.1.1.1)';
COMMENT ON COLUMN public.document_signatures.crypto_verified IS 'Mathematical signature verification passed (GOST R 34.10-2012)';
COMMENT ON COLUMN public.document_signatures.chain_verified IS 'Certificate chain leads to trusted root CA';
COMMENT ON COLUMN public.document_signatures.revocation_status IS 'CRL/OCSP revocation check result';
COMMENT ON COLUMN public.document_signatures.chain_details IS 'Full certificate chain with trust status';
COMMENT ON COLUMN public.document_signatures.tsa_info IS 'Timestamp Authority (RFC 3161) info if present';
COMMENT ON COLUMN public.document_signatures.verification_errors IS 'Array of verification errors if any';

CREATE INDEX IF NOT EXISTS document_signatures_crypto_verified_idx
  ON public.document_signatures (crypto_verified);
CREATE INDEX IF NOT EXISTS document_signatures_revocation_status_idx
  ON public.document_signatures (revocation_status);
-- Add new separate columns
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS mail_city text,
  ADD COLUMN IF NOT EXISTS mail_state text,
  ADD COLUMN IF NOT EXISTS mail_zip text;

-- Backfill from existing mailing_address_2 (format: "City ST 12345")
UPDATE public.leads
SET
  mail_city = COALESCE(NULLIF(regexp_replace(mailing_address_2, '^(.+?)\s+([A-Z]{2})\s+(\d{5}).*$', '\1'), mailing_address_2), mail_city),
  mail_state = COALESCE(NULLIF(regexp_replace(mailing_address_2, '^(.+?)\s+([A-Z]{2})\s+(\d{5}).*$', '\2'), mailing_address_2), mail_state),
  mail_zip = COALESCE(NULLIF(regexp_replace(mailing_address_2, '^(.+?)\s+([A-Z]{2})\s+(\d{5}).*$', '\3'), mailing_address_2), mail_zip)
WHERE mailing_address_2 IS NOT NULL;

-- Rename mailing_address_1 to mail_address
ALTER TABLE public.leads RENAME COLUMN mailing_address_1 TO mail_address;

-- Drop old combined column
ALTER TABLE public.leads DROP COLUMN IF EXISTS mailing_address_2;
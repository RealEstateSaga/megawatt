ALTER TABLE public.leads
  DROP COLUMN IF EXISTS status,
  DROP COLUMN IF EXISTS list,
  DROP COLUMN IF EXISTS analysis_reason,
  DROP COLUMN IF EXISTS has_tax_data,
  DROP COLUMN IF EXISTS has_history_data,
  DROP COLUMN IF EXISTS off_market_date,
  DROP COLUMN IF EXISTS sale_date,
  DROP COLUMN IF EXISTS last_recording_date;
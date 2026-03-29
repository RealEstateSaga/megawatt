
-- Table 1: File hash registry for cross-device deduplication
CREATE TABLE public.file_hashes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sha256 text NOT NULL UNIQUE,
  file_name text NOT NULL,
  file_size bigint NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.file_hashes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read file_hashes" ON public.file_hashes
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow public insert file_hashes" ON public.file_hashes
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Table 2: Processing jobs (one per batch upload)
CREATE TABLE public.processing_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  total_files integer NOT NULL DEFAULT 0,
  completed_files integer NOT NULL DEFAULT 0,
  failed_files integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.processing_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public all processing_jobs" ON public.processing_jobs
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Enable realtime for job progress
ALTER PUBLICATION supabase_realtime ADD TABLE public.processing_jobs;

-- Table 3: Individual files within a job
CREATE TABLE public.job_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.processing_jobs(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_hash text NOT NULL,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'skipped')),
  error_message text,
  total_pages integer,
  processed_pages integer DEFAULT 0,
  leads_found integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.job_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public all job_files" ON public.job_files
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Enable realtime for per-file progress
ALTER PUBLICATION supabase_realtime ADD TABLE public.job_files;

-- Table 4: Processing logs (per-page audit trail)
CREATE TABLE public.processing_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_file_id uuid NOT NULL REFERENCES public.job_files(id) ON DELETE CASCADE,
  page_number integer NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'empty')),
  extracted_data jsonb,
  error_message text,
  source_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.processing_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public all processing_logs" ON public.processing_logs
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

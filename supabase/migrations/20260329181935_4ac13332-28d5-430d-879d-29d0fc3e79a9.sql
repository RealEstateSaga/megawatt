
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  address TEXT NOT NULL,
  address_key TEXT NOT NULL,
  owner_last_name TEXT,
  mailing_address_1 TEXT,
  mailing_address_2 TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('GOOD', 'BAD', 'PENDING')),
  analysis_reason TEXT DEFAULT 'Awaiting additional documentation for 360-degree view.',
  off_market_date TEXT,
  sale_date TEXT,
  last_recording_date TEXT,
  has_tax_data BOOLEAN NOT NULL DEFAULT false,
  has_history_data BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(address_key)
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read leads" ON public.leads FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow public insert leads" ON public.leads FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow public update leads" ON public.leads FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

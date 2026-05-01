REVOKE EXECUTE ON FUNCTION public.insert_leads_batch(jsonb) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_leads_batch(uuid[]) FROM anon, authenticated;
DROP FUNCTION IF EXISTS public.insert_leads_batch(jsonb);
DROP FUNCTION IF EXISTS public.delete_leads_batch(uuid[]);

CREATE POLICY "Allow public insert leads" ON public.leads FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow public update leads" ON public.leads FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete leads" ON public.leads FOR DELETE TO anon, authenticated USING (true);
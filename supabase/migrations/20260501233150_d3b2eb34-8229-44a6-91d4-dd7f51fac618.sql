DROP POLICY IF EXISTS "Allow public insert leads" ON public.leads;
DROP POLICY IF EXISTS "Allow public update leads" ON public.leads;
DROP POLICY IF EXISTS "Allow public delete leads" ON public.leads;

CREATE OR REPLACE FUNCTION public.insert_leads_batch(_rows jsonb)
RETURNS TABLE (
  id uuid,
  address_key text,
  owner_last_name text,
  mail_address text,
  mail_city text,
  mail_state text,
  mail_zip text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH payload AS (
    SELECT
      NULLIF(trim(item->>'address'), '') AS address,
      NULLIF(trim(item->>'address_key'), '') AS address_key,
      NULLIF(trim(item->>'owner_last_name'), '') AS owner_last_name,
      NULLIF(trim(item->>'mail_address'), '') AS mail_address,
      NULLIF(trim(item->>'mail_city'), '') AS mail_city,
      NULLIF(trim(item->>'mail_state'), '') AS mail_state,
      NULLIF(trim(item->>'mail_zip'), '') AS mail_zip
    FROM jsonb_array_elements(COALESCE(_rows, '[]'::jsonb)) AS item
  ),
  normalized AS (
    SELECT *
    FROM payload
    WHERE address IS NOT NULL AND address_key IS NOT NULL
  )
  INSERT INTO public.leads (
    address,
    address_key,
    owner_last_name,
    mail_address,
    mail_city,
    mail_state,
    mail_zip
  )
  SELECT
    address,
    address_key,
    owner_last_name,
    mail_address,
    mail_city,
    mail_state,
    mail_zip
  FROM normalized
  ON CONFLICT (address_key) DO NOTHING
  RETURNING
    leads.id,
    leads.address_key,
    leads.owner_last_name,
    leads.mail_address,
    leads.mail_city,
    leads.mail_state,
    leads.mail_zip;
END;
$$;

GRANT EXECUTE ON FUNCTION public.insert_leads_batch(jsonb) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.delete_leads_batch(_ids uuid[])
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.leads
  WHERE id = ANY(COALESCE(_ids, ARRAY[]::uuid[]));

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_leads_batch(uuid[]) TO anon, authenticated;
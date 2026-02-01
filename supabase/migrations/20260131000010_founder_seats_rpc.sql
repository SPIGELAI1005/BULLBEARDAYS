-- Migration: Founder seats counter RPC
-- Date: 2026-01-31
--
-- Provides a public read-only counter for Founder Lifetime (Limited) seat availability.
-- Remaining seats are computed from active-ish subscriptions with plan_id = 'founder'.
--
-- NOTE: This assumes Founder purchases create/maintain a row in public.subscriptions.

CREATE OR REPLACE FUNCTION public.get_founder_seats()
RETURNS TABLE (
  total_seats INT,
  remaining_seats INT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total INT := 300;
  used INT := 0;
BEGIN
  SELECT COUNT(*)
  INTO used
  FROM public.subscriptions s
  WHERE s.plan_id = 'founder'
    AND s.status IN ('active', 'trialing', 'past_due', 'incomplete');

  RETURN QUERY
  SELECT total, GREATEST(total - used, 0);
END;
$$;

COMMENT ON FUNCTION public.get_founder_seats IS
'Returns total and remaining seats for Founder plan. Remaining is computed from active-ish founder subscriptions.';

GRANT EXECUTE ON FUNCTION public.get_founder_seats TO anon, authenticated;


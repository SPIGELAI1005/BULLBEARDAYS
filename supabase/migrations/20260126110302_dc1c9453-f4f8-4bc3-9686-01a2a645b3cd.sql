-- Fix market_data_cache to be properly restricted
-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Service role can manage cache" ON public.market_data_cache;

-- The table should only be accessible via edge functions using service role
-- With RLS enabled and no policies, regular users (anon/authenticated) cannot access the table
-- This is the correct behavior since market data is fetched via secured edge functions
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Service role can manage cache" ON public.market_data_cache;

-- Create a properly scoped policy that only allows the service role to manage cache
-- The service role is used by edge functions for backend operations
CREATE POLICY "Service role can manage cache" 
ON public.market_data_cache 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);
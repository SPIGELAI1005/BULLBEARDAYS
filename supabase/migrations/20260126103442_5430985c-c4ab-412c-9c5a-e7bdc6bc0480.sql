-- Drop the public SELECT policy
DROP POLICY IF EXISTS "Anyone can read market data cache" ON public.market_data_cache;

-- Create a new policy that only allows authenticated users to read market data
CREATE POLICY "Authenticated users can read market data cache" 
ON public.market_data_cache 
FOR SELECT 
TO authenticated
USING (true);
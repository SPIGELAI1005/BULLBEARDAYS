-- Allow service role to manage cache (for edge functions)
CREATE POLICY "Service role can manage cache"
ON public.market_data_cache
FOR ALL
USING (true)
WITH CHECK (true);
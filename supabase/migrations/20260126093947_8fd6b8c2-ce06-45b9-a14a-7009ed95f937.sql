-- Create market data cache table
CREATE TABLE public.market_data_cache (
  symbol TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS (public read access for market data)
ALTER TABLE public.market_data_cache ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read cached market data
CREATE POLICY "Anyone can read market data cache"
ON public.market_data_cache
FOR SELECT
USING (true);

-- Create index for faster expiry checks
CREATE INDEX idx_market_data_cache_expires_at ON public.market_data_cache(expires_at);

-- Add trigger for updated_at
CREATE TRIGGER update_market_data_cache_updated_at
BEFORE UPDATE ON public.market_data_cache
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
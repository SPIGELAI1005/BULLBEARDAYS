-- Create analyses history table
CREATE TABLE public.analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  chart_image_url TEXT,
  detected_asset TEXT,
  timeframe TEXT,
  signal TEXT NOT NULL CHECK (signal IN ('BUY', 'SELL', 'HOLD')),
  probability INTEGER NOT NULL CHECK (probability >= 0 AND probability <= 100),
  take_profit TEXT,
  stop_loss TEXT,
  risk_reward TEXT,
  chart_analysis TEXT,
  market_sentiment TEXT,
  bullish_reasons TEXT[],
  bearish_reasons TEXT[],
  ai_model TEXT NOT NULL,
  outcome TEXT CHECK (outcome IN ('WIN', 'LOSS', 'PENDING', NULL)),
  outcome_notes TEXT,
  session_id TEXT
);

-- Enable Row Level Security
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;

-- Public read/write for now (no auth required for demo)
CREATE POLICY "Allow public read access"
ON public.analyses FOR SELECT
USING (true);

CREATE POLICY "Allow public insert access"
ON public.analyses FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public update access"
ON public.analyses FOR UPDATE
USING (true);

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.analyses;
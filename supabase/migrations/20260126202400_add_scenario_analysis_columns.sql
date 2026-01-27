-- Migration: Add Scenario Analysis Columns to analyses table
-- Phase 1: Support new scenario-based analysis format alongside legacy format
-- This enables storing bull/bear scenarios, strategy, timeframe, and instrument data

-- Add new scenario analysis columns
ALTER TABLE public.analyses
  -- Core scenario fields
  ADD COLUMN IF NOT EXISTS trend_bias TEXT CHECK (trend_bias IN ('BULLISH', 'BEARISH', 'NEUTRAL', NULL)),
  ADD COLUMN IF NOT EXISTS confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100 OR confidence_score IS NULL),

  -- Scenario data (stored as JSON)
  ADD COLUMN IF NOT EXISTS bull_scenario JSONB,
  ADD COLUMN IF NOT EXISTS bear_scenario JSONB,

  -- Trading context
  ADD COLUMN IF NOT EXISTS strategy TEXT CHECK (strategy IN ('scalper', 'dayTrader', 'swingTrader', 'positionTrader', 'investor', NULL)),

  -- Timeframe tracking (detected vs selected vs final)
  ADD COLUMN IF NOT EXISTS detected_timeframe TEXT,
  ADD COLUMN IF NOT EXISTS selected_timeframe TEXT,
  ADD COLUMN IF NOT EXISTS final_timeframe TEXT,

  -- Instrument tracking (detected vs selected vs final)
  ADD COLUMN IF NOT EXISTS detected_instrument TEXT,
  ADD COLUMN IF NOT EXISTS selected_instrument TEXT,
  ADD COLUMN IF NOT EXISTS final_instrument TEXT,
  ADD COLUMN IF NOT EXISTS instrument_confidence INTEGER CHECK (instrument_confidence >= 0 AND instrument_confidence <= 100 OR instrument_confidence IS NULL),

  -- Price data
  ADD COLUMN IF NOT EXISTS current_price NUMERIC,

  -- AI metadata
  ADD COLUMN IF NOT EXISTS prompt_version TEXT,
  ADD COLUMN IF NOT EXISTS api_version TEXT,
  ADD COLUMN IF NOT EXISTS models_used TEXT[];

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_analyses_trend_bias ON public.analyses(trend_bias) WHERE trend_bias IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_analyses_strategy ON public.analyses(strategy) WHERE strategy IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_analyses_final_instrument ON public.analyses(final_instrument) WHERE final_instrument IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_analyses_final_timeframe ON public.analyses(final_timeframe) WHERE final_timeframe IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_analyses_confidence_score ON public.analyses(confidence_score) WHERE confidence_score IS NOT NULL;

-- Create index for JSON scenario queries (GIN index for JSONB)
CREATE INDEX IF NOT EXISTS idx_analyses_bull_scenario_gin ON public.analyses USING GIN (bull_scenario) WHERE bull_scenario IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_analyses_bear_scenario_gin ON public.analyses USING GIN (bear_scenario) WHERE bear_scenario IS NOT NULL;

-- Add comment explaining the dual-format support
COMMENT ON TABLE public.analyses IS 'Stores both legacy (signal/probability) and new (scenario-based) analysis formats. During transition period, both formats are supported.';
COMMENT ON COLUMN public.analyses.trend_bias IS 'New format: Overall trend bias (BULLISH/BEARISH/NEUTRAL)';
COMMENT ON COLUMN public.analyses.confidence_score IS 'New format: Confidence in chart read quality (0-100)';
COMMENT ON COLUMN public.analyses.bull_scenario IS 'New format: Bull scenario with thesis, evidence, key levels, invalidation, and risks';
COMMENT ON COLUMN public.analyses.bear_scenario IS 'New format: Bear scenario with thesis, evidence, key levels, invalidation, and risks';
COMMENT ON COLUMN public.analyses.signal IS 'Legacy format: Trading signal (BUY/SELL/HOLD)';
COMMENT ON COLUMN public.analyses.probability IS 'Legacy format: Signal confidence (0-100)';

-- Note: Legacy columns (signal, probability, take_profit, stop_loss, etc.) are kept for backward compatibility
-- They will be deprecated in a future migration after full transition to scenario format

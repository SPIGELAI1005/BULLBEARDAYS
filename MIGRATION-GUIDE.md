# Database Migration Guide - Phase 1

This guide covers running the database migration to add scenario analysis columns.

## Migration File

**Location:** `supabase/migrations/20260126202400_add_scenario_analysis_columns.sql`

## What This Migration Does

This migration adds support for the new scenario-based analysis format while maintaining backward compatibility with the legacy signal-based format.

### New Columns Added

**Core Scenario Fields:**
- `trend_bias` - Overall trend bias (BULLISH/BEARISH/NEUTRAL)
- `confidence_score` - Confidence in chart read quality (0-100)
- `bull_scenario` - JSONB containing bull scenario data
- `bear_scenario` - JSONB containing bear scenario data
- `strategy` - Trading strategy (scalper/dayTrader/swingTrader/positionTrader/investor)

**Timeframe Tracking:**
- `detected_timeframe` - AI-detected timeframe
- `selected_timeframe` - User-selected timeframe
- `final_timeframe` - Final timeframe used (selected || detected)

**Instrument Tracking:**
- `detected_instrument` - AI-detected instrument
- `selected_instrument` - User-selected instrument
- `final_instrument` - Final instrument used (selected || detected)
- `instrument_confidence` - AI confidence in instrument detection (0-100)

**Additional Fields:**
- `current_price` - Current price if visible on chart
- `prompt_version` - AI prompt version used
- `api_version` - API version
- `models_used` - Array of AI models used

### Indexes Created

For optimal query performance:
- `idx_analyses_trend_bias` - Query by trend bias
- `idx_analyses_strategy` - Query by trading strategy
- `idx_analyses_final_instrument` - Query by instrument
- `idx_analyses_final_timeframe` - Query by timeframe
- `idx_analyses_confidence_score` - Query by confidence
- `idx_analyses_bull_scenario_gin` - GIN index for JSONB bull scenario queries
- `idx_analyses_bear_scenario_gin` - GIN index for JSONB bear scenario queries

## Running the Migration

### Option 1: Supabase CLI (Recommended)

If you have the Supabase CLI installed:

```bash
# Make sure you're in the project directory
cd C:\Users\georg\bullbeardays\chart-insights-ai

# Run the migration
supabase db push
```

### Option 2: Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the migration file: `supabase/migrations/20260126202400_add_scenario_analysis_columns.sql`
4. Copy the SQL content
5. Paste into the SQL Editor
6. Click **Run** to execute the migration

### Option 3: Manual psql

If you have direct database access:

```bash
psql -h <your-supabase-host> -U postgres -d postgres -f supabase/migrations/20260126202400_add_scenario_analysis_columns.sql
```

## Verifying the Migration

After running the migration, verify it was successful:

```sql
-- Check if new columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'analyses'
  AND column_name IN (
    'trend_bias',
    'confidence_score',
    'bull_scenario',
    'bear_scenario',
    'strategy',
    'final_instrument',
    'final_timeframe'
  );

-- Check if indexes were created
SELECT indexname
FROM pg_indexes
WHERE tablename = 'analyses'
  AND indexname LIKE 'idx_analyses_%';
```

Expected output: All 7 columns and 7 indexes should be present.

## Backward Compatibility

**Legacy columns are preserved:**
- `signal` (BUY/SELL/HOLD)
- `probability` (0-100)
- `take_profit`
- `stop_loss`
- `risk_reward`
- `chart_analysis`
- `market_sentiment`
- `bullish_reasons`
- `bearish_reasons`

**Dual format support:**
- The application will save BOTH new and legacy formats for each analysis
- Old analyses (legacy format only) will still display correctly
- New analyses (scenario format) populate both new and legacy columns
- This allows gradual migration and zero downtime

## Data Format Examples

### Bull/Bear Scenario JSONB Structure

```json
{
  "thesis": "Price is showing bullish momentum with strong support at $42,000",
  "evidence": [
    "Higher lows forming since Jan 20",
    "RSI showing bullish divergence",
    "Volume increasing on up moves",
    "Breaking above 50-day MA"
  ],
  "keyLevels": {
    "support": ["$42,000", "$40,500"],
    "resistance": ["$45,000", "$47,200"]
  },
  "invalidation": "$41,500 - Break below this level invalidates bullish setup",
  "riskNotes": [
    "Overhead resistance at $45k may cap upside",
    "Broader market correlation risk"
  ]
}
```

## Rollback (If Needed)

If you need to rollback this migration:

```sql
-- Drop new columns
ALTER TABLE public.analyses
  DROP COLUMN IF EXISTS trend_bias,
  DROP COLUMN IF EXISTS confidence_score,
  DROP COLUMN IF EXISTS bull_scenario,
  DROP COLUMN IF EXISTS bear_scenario,
  DROP COLUMN IF EXISTS strategy,
  DROP COLUMN IF EXISTS detected_timeframe,
  DROP COLUMN IF EXISTS selected_timeframe,
  DROP COLUMN IF EXISTS final_timeframe,
  DROP COLUMN IF EXISTS detected_instrument,
  DROP COLUMN IF EXISTS selected_instrument,
  DROP COLUMN IF EXISTS final_instrument,
  DROP COLUMN IF EXISTS instrument_confidence,
  DROP COLUMN IF EXISTS current_price,
  DROP COLUMN IF EXISTS prompt_version,
  DROP COLUMN IF EXISTS api_version,
  DROP COLUMN IF EXISTS models_used;

-- Drop indexes
DROP INDEX IF EXISTS idx_analyses_trend_bias;
DROP INDEX IF EXISTS idx_analyses_strategy;
DROP INDEX IF EXISTS idx_analyses_final_instrument;
DROP INDEX IF EXISTS idx_analyses_final_timeframe;
DROP INDEX IF EXISTS idx_analyses_confidence_score;
DROP INDEX IF EXISTS idx_analyses_bull_scenario_gin;
DROP INDEX IF EXISTS idx_analyses_bear_scenario_gin;
```

## Next Steps After Migration

1. **Test the application** - Upload a chart and verify analysis is saved correctly
2. **Check database** - Verify new analyses populate both legacy and scenario columns
3. **Monitor performance** - Ensure indexes are being used for queries
4. **Update analytics queries** - If you have custom analytics, update them to use new columns

## Support

If you encounter issues:
1. Check Supabase logs in the dashboard
2. Verify your database user has ALTER TABLE permissions
3. Ensure you're running the migration on the correct database (production vs development)

## Migration Status

- [x] Migration file created
- [ ] Migration executed on development database
- [ ] Verified in development
- [ ] Migration executed on production database
- [ ] Verified in production

---

**Created:** 2026-01-26
**Part of:** Phase 1 - First-Class Inputs & Scenario Analysis
**Related Tasks:** Task #18 (ROADMAP.md)

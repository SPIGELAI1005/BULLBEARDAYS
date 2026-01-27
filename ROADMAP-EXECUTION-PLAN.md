# Roadmap Execution Plan - BullBearDays

This document maps the ROADMAP.md requirements to actionable tasks and tracks progress.

## 📊 Roadmap Progress Overview

| Phase | Description | Status | Tasks |
|-------|-------------|--------|-------|
| **Phase 0** | Stop being a signals app | 🔴 Not Started | #12, #13 |
| **Phase 1** | Strategy + Timeframe + Instrument first-class | 🔴 Not Started | #14-#21 |
| **Phase 2** | Robustness + Quality | 🟡 Partially Done | #4-#6, #20 |
| **Phase 3** | Evaluation loop | 🔴 Not Started | Future |
| **Phase 4** | Public sharing links | 🔴 Not Started | Future |

---

## 🎯 Core Transformation Tasks (from ROADMAP.md)

### Phase 0: Language & Compliance (1-2 days)

#### Task #12: Update UI language from signals to scenarios
**Roadmap ID:** `product-guardrails`
**Priority:** 🔴 Critical
**Status:** Pending

**Files to modify:**
- `src/components/AnalysisResults.tsx`
- `src/components/AnalyzeButton.tsx`
- `src/components/Hero.tsx`
- `src/pages/Index.tsx`
- `USER-GUIDE.md`

**Changes:**
- Replace "BUY/SELL/HOLD" → "Bull/Bear/Neutral"
- Replace "Signal" → "Trend Bias"
- Replace "Probability" → "Confidence Score"
- Update all button labels and descriptions

#### Task #13: Add disclaimers throughout app
**Roadmap ID:** `product-guardrails`
**Priority:** 🔴 Critical
**Status:** Pending

**Deliverables:**
- Create `DisclaimerBanner.tsx` component
- Add to Header (persistent)
- Add to AnalysisResults footer
- Add to export/share cards
- Update onboarding tour
- Update USER-GUIDE.md

**Disclaimer text:**
> "This is scenario analysis for educational purposes only. Not financial advice. Trade at your own risk."

---

### Phase 1: First-Class Inputs (3-7 days)

#### Task #14: Create InstrumentSelector component
**Roadmap ID:** `first-class-inputs`
**Priority:** 🟠 High
**Status:** Pending

**Features:**
- Search functionality
- Category filters (Crypto, Forex, Indices, Stocks)
- Recent instruments list
- Manual override for AI detection
- Integration with MarketTicker

**Design reference:** `TradingStrategySelector.tsx`

#### Task #15: Create TimeframeSelector component
**Roadmap ID:** `first-class-inputs`
**Priority:** 🟠 High
**Status:** Pending

**Timeframes:**
- 1M, 5M, 15M, 30M, 1H, 4H, 1D, 1W, 1M

**Features:**
- Strategy-based suggestions
- Visual selector (buttons/dropdown)
- Persist with analysis

#### Task #16: Unify Analysis types across codebase
**Roadmap ID:** `refactor-types-state`
**Priority:** 🟠 High
**Status:** Pending

**Problem:**
- `AnalysisData` duplicated in Index.tsx and AnalysisResults.tsx
- `AnalysisResult` in api.ts differs
- Type confusion causing maintenance issues

**Solution:**
- Create `src/lib/types.ts` with unified `ScenarioAnalysis` type
- Remove all duplicates
- Update all imports

**New type structure:**
```typescript
interface ScenarioAnalysis {
  id?: string;
  trendBias: 'BULL' | 'BEAR' | 'NEUTRAL';
  confidenceScore: number; // 0-100
  instrument: {
    detected?: string;
    selected?: string;
    final: string;
  };
  timeframe: {
    detected?: string;
    selected: string;
    final: string;
  };
  strategy: TradingStrategy;
  bullScenario: Scenario;
  bearScenario: Scenario;
  aiModel: string;
  createdAt?: string;
}

interface Scenario {
  thesis: string;
  evidence: string[];
  keyLevels?: {
    support?: string[];
    resistance?: string[];
  };
  invalidation: string;
  riskNotes: string[];
}
```

#### Task #17: Update analyze-chart API contract
**Roadmap ID:** `api-contract`
**Priority:** 🔴 Critical
**Status:** Pending

**Backend changes:**
- `supabase/functions/analyze-chart/index.ts`
  - Rewrite system prompt (no buy/sell language)
  - Generate bull/bear scenarios
  - Remove probability calculations
  - Add confidence scoring

**Frontend changes:**
- `src/lib/api.ts`
  - Update `analyzeChart()` signature
  - Pass strategy, timeframe, instrument
  - Handle new response structure

**Request shape:**
```typescript
{
  imageBase64: string;
  strategy: TradingStrategy;
  timeframe: string;
  instrument?: string;
  selectedModels: string[];
  referenceModel: string;
  userContext?: string;
}
```

**Response shape:**
```typescript
{
  trendBias: 'BULL' | 'BEAR' | 'NEUTRAL';
  confidenceScore: number;
  instrument: { detected: string; selected?: string; final: string };
  timeframe: { detected?: string; selected: string; final: string };
  strategy: string;
  bullScenario: Scenario;
  bearScenario: Scenario;
  aiModel: string;
}
```

#### Task #18: Update database schema for scenarios
**Roadmap ID:** `schema-updates`
**Priority:** 🟠 High
**Status:** Pending

**Migration file:** `supabase/migrations/YYYYMMDD_scenario_analysis.sql`

**Add to `analyses` table:**
```sql
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS strategy TEXT;
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS selected_timeframe TEXT;
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS final_timeframe TEXT;
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS selected_instrument TEXT;
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS final_instrument TEXT;
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS detected_instrument TEXT;
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS trend_bias TEXT;
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS confidence_score INTEGER;
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS bull_scenario JSONB;
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS bear_scenario JSONB;
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS prompt_version TEXT;
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS api_version TEXT;
```

**Optional audit table:**
```sql
CREATE TABLE IF NOT EXISTS analysis_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID REFERENCES analyses(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB
);
```

**Note:** Keep existing columns for backward compatibility during transition.

#### Task #19: Refactor Index.tsx into smaller components
**Roadmap ID:** `refactor-types-state`
**Priority:** 🟡 Medium
**Status:** Pending

**Current problem:** 600+ line file, hard to maintain

**New structure:**

Create hooks:
- `src/hooks/useAnalysisFlow.tsx` - orchestration
- `src/hooks/useChartUpload.tsx` - upload state
- `src/hooks/useAnalysisHistory.tsx` - history management

Create components:
- `src/components/AnalysisContainer.tsx` - main container
- `src/components/InputSection.tsx` - upload + selectors
- `src/components/ResultsSection.tsx` - results display

**Index.tsx becomes:**
```typescript
const Index = () => {
  const analysisFlow = useAnalysisFlow();

  return (
    <div>
      <Header />
      <Hero />
      <AnalysisContainer {...analysisFlow} />
      <HistoryPanel />
    </div>
  );
};
```

#### Task #20: Add Zod validation for API responses
**Roadmap ID:** `robust-validation`
**Priority:** 🟠 High
**Status:** Pending

**Create:** `src/lib/schemas.ts`

**Schemas:**
- `ScenarioAnalysisSchema` - validates full response
- `BullScenarioSchema` - validates bull scenario
- `BearScenarioSchema` - validates bear scenario
- `InstrumentSchema` - validates instrument data
- `TimeframeSchema` - validates timeframe data

**Edge function validation:**
- Validate AI responses before returning
- Return structured errors
- Check image readability
- Validate image size/format

**Benefits:**
- Catch malformed AI responses early
- Better error messages
- Type safety at runtime
- Easier debugging

#### Task #21: Redesign AnalysisResults to show bull/bear cards
**Roadmap ID:** `product-guardrails` + `api-contract`
**Priority:** 🔴 Critical
**Status:** Pending

**New design:**

```
┌─────────────────────────────────────────┐
│  Trend Bias: BULLISH  Confidence: 85%  │
└─────────────────────────────────────────┘

┌──────────────────┐  ┌──────────────────┐
│  🟢 Bull Scenario│  │  🔴 Bear Scenario│
│                  │  │                  │
│  Thesis:         │  │  Thesis:         │
│  Strong breakout │  │  False breakout  │
│                  │  │                  │
│  Evidence:       │  │  Evidence:       │
│  • Higher highs  │  │  • Weak volume   │
│  • RSI bullish   │  │  • Resistance    │
│  • Volume surge  │  │  • Divergence    │
│                  │  │                  │
│  Key Levels:     │  │  Key Levels:     │
│  Support: $100   │  │  Support: $95    │
│  Resistance: $110│  │  Resistance: $105│
│                  │  │                  │
│  Invalidation:   │  │  Invalidation:   │
│  Below $98       │  │  Above $108      │
│                  │  │                  │
│  Risks:          │  │  Risks:          │
│  • Overbought    │  │  • Trend reversal│
└──────────────────┘  └──────────────────┘
```

**Remove:** All BUY/SELL/HOLD badges and action language

---

## ✅ Already Completed (Polish Tasks)

These were completed in my previous work but are NOT part of the core transformation:

- ✅ Task #1: Branding in index.html
- ✅ Task #2: Package.json metadata
- ✅ Task #3: PWA manifest
- ✅ Task #4: Test coverage (partially relevant to Phase 2)
- ✅ Task #5: Performance optimization (partially relevant to Phase 2)
- ✅ Task #6: Error boundary (partially relevant to Phase 2)
- ✅ Task #7: SEO and accessibility
- ✅ Task #8: Documentation
- ✅ Task #9: Rate limiting UI
- ✅ Task #10: Export and sharing
- ✅ Task #11: Production deployment prep (pending)

**Note:** These are good foundation work but don't address the core product transformation.

---

## 🚦 Recommended Execution Order

### Week 1: Phase 0 Foundation
1. **Day 1-2:** Tasks #12, #13 (Language + Disclaimers)
   - Low risk, high impact
   - Gets compliance language in place
   - No backend changes

### Week 2-3: Phase 1 Type System + UI
2. **Day 3-4:** Task #16 (Unify types)
   - Critical foundation for all other work
   - Prevents rework

3. **Day 5-7:** Tasks #14, #15 (Selectors)
   - New UI components
   - Can be done in parallel

4. **Day 8-10:** Task #21 (Redesign AnalysisResults)
   - Major UI change
   - Must happen after types unified

### Week 3-4: Phase 1 Backend + Data
5. **Day 11-13:** Task #18 (Database schema)
   - Must precede API changes
   - Test migration thoroughly

6. **Day 14-16:** Task #17 (API contract)
   - Backend transformation
   - Update prompts carefully
   - Test extensively

7. **Day 17-18:** Task #20 (Zod validation)
   - Hardens the new API
   - Catches edge cases

### Week 4-5: Phase 1 Refactor
8. **Day 19-21:** Task #19 (Refactor Index.tsx)
   - Improves maintainability
   - Can be done last
   - Safest when everything else works

---

## 🧪 Testing Strategy

After each phase:

1. **Manual testing:**
   - Upload various chart screenshots
   - Test all instrument/timeframe combinations
   - Verify scenarios make sense
   - Check mobile responsiveness

2. **Automated tests:**
   - Update existing tests for new types
   - Add Zod schema validation tests
   - Test component rendering

3. **User acceptance:**
   - Share with beta users
   - Get feedback on scenario clarity
   - Verify disclaimers are clear

---

## 📝 Migration Notes

**Data migration considerations:**

1. **Backward compatibility:**
   - Keep old columns (signal, probability) during transition
   - Add new columns without breaking existing data
   - Run both old and new systems in parallel initially

2. **Historical data:**
   - Existing analyses stay as "signal" format
   - New analyses use "scenario" format
   - UI can handle both formats

3. **User communication:**
   - Announce product changes via email
   - Update USER-GUIDE.md prominently
   - Add "What's New" modal on first visit

---

## 🎯 Success Metrics

**Phase 0 (Language):**
- [ ] Zero instances of "BUY/SELL/HOLD" in UI
- [ ] Disclaimer visible on all pages
- [ ] USER-GUIDE updated

**Phase 1 (Inputs):**
- [ ] Instrument selection works for all categories
- [ ] Timeframe persisted with each analysis
- [ ] Strategy affects analysis prompts
- [ ] API returns bull + bear scenarios
- [ ] Database stores new structure

**Phase 2 (Quality):**
- [ ] Zod catches invalid AI responses
- [ ] Image validation prevents bad uploads
- [ ] Error messages are helpful
- [ ] 95%+ successful analysis rate

---

## 🚀 Post-Transformation Tasks (Phase 2-4)

After core transformation:

**Phase 2: Robustness**
- Image readability pre-checks
- Multi-model consensus voting
- "Explain methodology" panel

**Phase 3: Evaluation**
- Historical pattern matching
- User-marked scenario outcomes
- Backtest analytics (not forecasts)

**Phase 4: Public Sharing**
- Hosted share pages
- Moderation system
- Compliance review

---

**Status:** Ready to begin Phase 0
**Next action:** Start Task #12 (Update UI language)
**Estimated time to MVP:** 3-4 weeks for Phase 0 + Phase 1

*Last updated: January 26, 2026*

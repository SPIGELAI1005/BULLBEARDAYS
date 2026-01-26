# USER-GUIDE.md Updates Needed

The USER-GUIDE.md was created during the polish phase but needs to be updated for the Phase 0 language transformation.

## Required Changes

### Section: "Understanding Signals" → "Understanding Scenario Analysis"

**Current (lines 71-89):**
- 🟢 BUY Signal
- 🔴 SELL Signal
- 🟡 HOLD Signal

**Should be:**
- 🟢 BULLISH Bias
- 🔴 BEARISH Bias
- 🟡 NEUTRAL Bias

**Key changes:**
1. Replace "Signal" with "Trend Bias" throughout
2. Change "BUY/SELL/HOLD" to "BULLISH/BEARISH/NEUTRAL"
3. Remove action-oriented language:
   - Remove: "Consider entering a long position"
   - Replace with: "Chart shows bullish characteristics"
4. Change "Probability Score" to "Confidence Score"
5. Add disclaimer that this is NOT a trading recommendation

### Section: "Analysis Components"

**Current (lines 92-98):**
- "Probability Score" with interpretation about "confidence in signal"

**Should be:**
- "Confidence Score" - confidence in *chart read quality* (not profit probability)
- Interpretation: clarity of patterns, image quality, data availability

### New Section Needed: "Bull/Bear Scenarios"

Add comprehensive section explaining:
- What bull scenario means (conditions for upward move)
- What bear scenario means (conditions for downward move)
- Evidence points
- Key levels (support/resistance)
- Invalidation levels
- Risk notes

### Disclaimers to Add

**Top of document (after title):**
> ⚠️ **IMPORTANT DISCLAIMER**
>
> BullBearDays provides scenario analysis for educational and informational purposes only.
> This is NOT financial advice, investment advice, or trading advice. All trading decisions
> carry substantial risk of loss. Always conduct your own research and consult with licensed
> financial professionals before making investment decisions.

**Throughout the guide:**
- Replace "trading signals" → "scenario analysis"
- Replace "trade setups" → "market scenarios"
- Replace "actionable insights" → "educational analysis"
- Remove all directive language ("should", "consider", "enter", "exit")

### FAQ Updates

**Question: "How accurate are the AI signals?"**
Should be: "How should I interpret the scenarios?"

**Answer changes:**
- Remove: "past performance doesn't guarantee future results"
- Replace with: "These are educational scenarios showing possible outcomes based on technical patterns. They are not predictions or trading recommendations."

**Add new FAQ:**
Q: "Is this financial advice?"
A: "No. BullBearDays provides educational scenario analysis only. This is not financial, investment, or trading advice. Never make trading decisions based solely on AI analysis."

## Files to Update

1. `USER-GUIDE.md` - Complete language transformation
2. `DEVELOPER-GUIDE.md` - Update API examples to show new response format
3. `ARCHITECTURE.md` - Update from signals to scenarios terminology
4. `README.md` - Update project description

## Priority

- **High Priority:** USER-GUIDE.md (user-facing)
- **Medium Priority:** Other documentation files
- **Low Priority:** Code comments (can be done gradually)

## Completion Criteria

- [ ] Zero mentions of "BUY/SELL/HOLD" as recommendations
- [ ] All "signal" references changed to "trend bias" or "scenario"
- [ ] Disclaimers prominently displayed
- [ ] Language is educational, not prescriptive
- [ ] No directive trading advice

---

**Note:** This file documents changes needed. Actual updates should be made as part of Phase 0 completion.

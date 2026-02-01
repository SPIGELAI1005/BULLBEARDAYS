---
name: Bull/Bear scenario analysis roadmap
overview: Refactor the app from BUY/SELL “signals” into two-sided bull/bear scenario analysis driven by chart screenshots, with explicit instrument + timeframe + strategy inputs, strong UI/prompt guardrails, and an audit-friendly data model suitable for a public SaaS (export-only sharing).
todos:
  - id: product-guardrails
    content: Rewrite prompts/UI from BUY/SELL to bull/bear scenarios + confidenceScore (no profit probability), update disclaimers and export footer
    status: completed
  - id: first-class-inputs
    content: Add InstrumentSelector + TimeframeSelector and persist selected strategy/timeframe/instrument with each analysis
    status: completed
  - id: api-contract
    content: Update analyze-chart request/response contract to accept (strategy,timeframe,instrument) and return structured bullScenario/bearScenario + trendBias
    status: completed
  - id: schema-updates
    content: Add DB columns (strategy/timeframe/instrument/bias/confidence + scenario JSON) and optional append-only analysis_events for auditability
    status: completed
  - id: refactor-types-state
    content: Unify Analysis types and refactor Index.tsx into smaller components/hooks for maintainability
    status: in_progress
  - id: robust-validation
    content: Add Zod validation for edge function responses + improved error handling and image readability checks
    status: pending
isProject: false
---

## Current state (what I found)

- The app already supports **chart screenshot upload**, model selection, and result display.
- Analysis is currently framed as **“actionable trading signals”** and returns **BUY/SELL/HOLD + probability**, which is higher regulatory risk.
- Strategy selection exists but is **UI-only**; it does **not** affect analysis prompts or stored data.

Key seams:

```54:62:c:\Users\georg\bullbeardays\chart-insights-ai\src\lib\api.ts
export async function analyzeChart(
  imageBase64: string,
  selectedModels: string[],
  referenceModel: string
): Promise<AnalysisResult> {
  const { data, error } = await supabase.functions.invoke('analyze-chart', {
    body: { imageBase64, selectedModels, referenceModel },
  });
```
```89:112:c:\Users\georg\bullbeardays\chart-insights-ai\supabase\functions\analyze-chart\index.ts
const systemPrompt = `You are an expert trading analyst with deep knowledge of technical analysis, chart patterns, market microstructure, and risk management. You analyze chart screenshots to provide actionable trading insights.

Your task is to analyze the provided chart image and return a JSON response with the following structure:
{
  "signal": "BUY" | "SELL" | "HOLD",
  "probability": number (0-100, your confidence in the signal),
  "takeProfit": string (e.g., "+2.5%" or "+$150"),
  "stopLoss": string (e.g., "-1.2%" or "-$75"),
  "riskReward": string (e.g., "1:2.1"),
  "detectedAsset": string (the trading pair or asset you identify, e.g., "BTC/USDT", "EUR/USD", "AAPL"),
  "timeframe": string (the chart timeframe you detect, e.g., "15m", "1H", "4H", "Daily"),
  "chartAnalysis": string (2-3 sentences about the technical setup, patterns, indicators),
  "marketSentiment": string (1-2 sentences about broader market context),
  "bullishReasons": string[] (3-4 reasons why this trade could succeed),
  "bearishReasons": string[] (2-3 risk factors or reasons it might fail)
}

Guidelines:
- Look for candlestick patterns, support/resistance levels, trend lines, and common indicators
- Be specific about price levels when possible
- Consider risk/reward ratio in your analysis
- Be honest about uncertainty - if the chart is unclear, reflect that in lower probability
- Always provide balanced analysis with both bullish and bearish considerations
- Return ONLY valid JSON, no markdown or extra text`;
```

## Target product behavior (low-risk posture)

- **No “Buy/Sell” calls**. The default output is always:
  - **Bull scenario** (what would need to be true; invalidation; key levels)
  - **Bear scenario** (what would need to be true; invalidation; key levels)
- Replace “probability of success” with two safer scores:
  - **TrendBias**: Bullish / Bearish / Neutral (for the selected timeframe)
  - **ConfidenceScore**: model confidence in *its read of the chart* (image quality + pattern clarity), not a profit forecast
- Strategy and timeframe become explicit inputs (not just inferred), because your core promise is: “bull/bear perspective on selected timeframe + strategy.”
- **Export-only sharing**: generate share cards / PDFs with method + timestamp + disclaimers; no hosted public links in v1.

## Architecture changes (minimal but decisive)

### 1) API contract

Update the edge function contract to accept explicit context and return structured scenarios.

- **Request**: `{ imageBase64, instrument?, timeframe, strategy, selectedModels, referenceModel, userContext? }`
- **Response** (example shape):
  - `trendBias: 'BULL' | 'BEAR' | 'NEUTRAL'`
  - `confidenceScore: number (0-100)`
  - `instrument: { detected: string; selected?: string; final: string; confidence?: number }`
  - `timeframe: { detected?: string; selected: string; final: string }`
  - `strategy: 'scalper' | 'dayTrader' | ...`
  - `bullScenario: { thesis: string; evidence: string[]; keyLevels?: { support?: string[]; resistance?: string[] }; invalidation: string; riskNotes: string[] }`
  - `bearScenario: { ... }`
  - (Optional later) `targets: { bull?: ..., bear?: ... }`

### 2) Frontend flow

- Add **InstrumentSelector** + **TimeframeSelector** next to `TradingStrategySelector`.
- UI always renders **two scenario cards** with bull/bear icons, and a neutral “bias” indicator (not a directive).
- Store `strategy/timeframe/instrument` with each analysis record; allow user override when AI detection is wrong.

### 3) Data model / auditability

For a public SaaS you’ll want a slightly more structured schema (not just `signal/probability`).

- Add columns to `analyses` for `strategy`, `selected_timeframe`, `final_timeframe`, `selected_instrument`, `final_instrument`, `trend_bias`, `confidence_score`, `bull_scenario`, `bear_scenario`, `prompt_version`, `api_version`.
- Optional but recommended: `analysis_events` (append-only) for audit trail (create/update/export).

## Roadmap

### Phase 0 (1–2 days): “Stop being a signals app”

- Replace language in UI/docs from “signals” to **scenario analysis**.
- Remove/rename BUY/SELL/HOLD in UI, and replace with bull/bear bias.
- Add persistent disclaimers and “decision-support only” copy in:
  - UI header/footer
  - export card footer
  - onboarding

### Phase 1 (3–7 days): Strategy + timeframe + instrument become first-class

- **Frontend**
  - Create `InstrumentSelector` (search + recent + categories from `MarketCategory`).
  - Create `TimeframeSelector` (enum-backed; strategy provides suggested defaults).
  - Refactor `src/pages/Index.tsx` into a smaller container + hooks (reduce the 600+ line orchestration).
  - Unify types: eliminate duplicated `AnalysisData` vs `AnalysisResult`.
- **Backend**
  - Update `supabase/functions/analyze-chart/index.ts` prompt to:
    - produce two scenario objects
    - produce `trendBias` and `confidenceScore`
    - explicitly avoid “buy/sell” language
  - Update `src/lib/api.ts` `analyzeChart(...)` to pass `strategy/timeframe/instrument`.

### Phase 2 (1–2 weeks): Robustness + quality

- Add strict response validation (Zod) in the edge function before returning.
- Add image validation (size/format) and a “chart readability” pre-check; lower confidence if unreadable.
- Multi-model: optional **consensus** (bull/bear vote) + show disagreement as uncertainty.
- Add “Explain methodology” panel and export it with each analysis.

### Phase 3 (2–4 weeks): Evaluation loop (without ‘profit promises’)

- Replace “probability of success” entirely.
- Add **historical evaluation** phrased as “past pattern match outcomes” / “backtest on labelled examples” (not a forecast), with sample size and dates.
- Track which scenario played out (user-marked or price-based) to improve model + analytics.

### Phase 4 (later): Public sharing links (optional)

- If you ever add hosted public share pages, plan for moderation + takedown and stronger compliance posture.

## Concrete code improvements (what to fix even if you change nothing else)

- **De-duplicate types**: `AnalysisData` in `src/pages/Index.tsx` and `src/components/AnalysisResults.tsx` duplicates `AnalysisResult` from `src/lib/api.ts`.
- **Refactor `Index.tsx`**: extract an `useAnalysisFlow` hook and split UI into smaller components/hooks for maintainability.
- **Make strategy/timeframe real inputs**: today they’re not used by `analyzeChart`.
- **Harden AI response parsing**: `analyze-chart/index.ts` regex-parses JSON; add schema validation and structured error reporting.
- **CORS tightening**: `Access-Control-Allow-Origin: '*'` is fine for dev, but for public SaaS you’ll want environment-based allowed origins.
- **Database normalization**: standardize timeframe strings and store both selected and detected.

## Deliverables for v1

- Bull/bear scenario output for screenshot-based analysis with selected strategy + timeframe
- Instrument selection (manual + AI-detected override)
- Beautiful bull/bear iconography (custom SVGs + consistent usage)
- Export-only sharing (share card + PDF) with method/timestamp/disclaimer footer
- Safer language everywhere (no buy/sell commands, no “chance of profit”)

---

## Status (single source of truth)

For active progress tracking, see `ROADMAP-EXECUTION-PLAN.md`. This document describes the intended product direction and architecture, but the tracker is authoritative.

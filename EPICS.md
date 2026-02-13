# BULLBEARDAYS.COM — Epics, Features & Task Breakdown

This file structures the project work into **epics → features → concrete tasks**.

> Repo snapshot reviewed: `C:\Users\georg\BULLBEARDAYS\chart-insights-ai` (Vite + React + TS + Supabase + Stripe).

## 0) Current Concept (as implemented)

**BullBearDays.com** is an AI-assisted **chart screenshot scenario analyzer**.

Core flow:
1) User signs in
2) Chooses **instrument + timeframe + strategy** (first-class inputs)
3) Uploads a chart screenshot
4) Edge Function calls AI model(s) and returns **two-sided bull/bear scenarios** + **trend bias** + **confidence score**
5) Result is stored (Supabase Postgres + optional Storage image URL)
6) User can view history, export/share cards, watchlist, alerts, market widgets

Important posture already adopted:
- **Scenario analysis** (not “BUY/SELL signals”) + prominent disclaimers
- Structured response format + DB columns for auditability

## 1) Current Structure (what exists)

### Frontend
- Vite + React 18 + TypeScript
- Tailwind + shadcn/ui (Radix)
- React Router routes include: `/`, `/pricing`, `/signup`, `/billing`, legal pages (`/terms`, `/privacy`, `/refund-policy`, `/risk-disclosure`, `/methodology`)
- React Query for server state

### Backend
- Supabase:
  - Auth + Postgres + Storage + Edge Functions
  - Edge Functions: `analyze-chart`, `analyze-market`, `market-data`
  - Migrations for scenario columns + billing/usage schema
- Stripe:
  - Vercel functions under `/api/stripe/*` for checkout, portal, webhook

### Documentation
- Strong existing docs: `ARCHITECTURE.md`, `ROADMAP.md`, `ROADMAP-EXECUTION-PLAN.md`, SaaS readiness docs, phase completion summaries.
- **README.md is still the default Lovable template** → should be replaced.

## 2) What’s already developed (high-signal)

### Product / UX
- Scenario-based results UI (bull & bear cards)
- InstrumentSelector + TimeframeSelector components
- Theming + glassmorphism design system
- Onboarding and persistent disclaimers
- History view and detail modal
- Sharing/export primitives (per docs)

### Core analysis pipeline
- Updated `analyze-chart` contract to accept `strategy/timeframe/instrument`
- Scenario response format + trend bias + confidence score
- Backward compatibility for legacy analysis format

### SaaS foundation
- Stripe checkout/portal/webhook endpoints
- Supabase tables for cached billing + usage enforcement
- Usage check before AI calls (RPC `check_usage_limit`)

## 3) Biggest gaps / highest ROI improvements

1) **Phase 2 robustness** is the next obvious win:
   - Zod validation at the boundary (edge function + client)
   - image validation/readability scoring
   - better structured error reporting

2) **Repo hygiene / naming**:
   - Replace template README with project README
   - Align git remote + package.json repository URL with `SPIGELAI1005/BULLBEARDAYS`

3) **Operational readiness** (if going to prod soon):
   - webhook monitoring / replay workflow
   - payment failure handling (past_due grace, banners)
   - basic support + admin lookup

---

# EPICS

## EPIC A — Brand, Repo & Documentation Alignment (foundation)

### A1. Project naming + repo metadata
- **Task:** Decide canonical folder/repo name: `BULLBEARDAYS` vs `chart-insights-ai` (recommend: repo name `BULLBEARDAYS`, app folder can remain `app/` or `web/` for clarity)
- **Task:** Update `package.json`:
  - `name`, `description` (already scenario-based, remove legacy “signals” wording)
  - `repository.url` → `https://github.com/SPIGELAI1005/BULLBEARDAYS`
  - consider `private: false` if you want public (keep private if not)
- **Task:** Update Vercel/Supabase docs to reference the correct repo + domain

### A2. Replace README.md (currently a Lovable template)
- **Feature:** Real README with:
  - product description + posture (scenario analysis)
  - local dev steps
  - env var list
  - Supabase migration + function deploy steps
  - Stripe setup steps

### A3. Single source of truth docs
- **Task:** Add `docs/` folder or keep root docs but add an index file like `DOCS.md` linking: Architecture, Roadmap, Deployment, Billing, Supabase

---

## EPIC B — Core Scenario Analysis (quality & correctness)

### B1. Boundary validation (Phase 2 / Task #20)
- **Feature:** Zod schemas for ScenarioAnalysis response + request
- **Tasks:**
  - Create `src/lib/schemas.ts` (Zod) for:
    - Scenario (bull/bear)
    - Instrument/timeframe objects
    - ScenarioAnalysis payload
  - Validate edge function output before returning to client
  - Validate client-side before rendering/saving
  - Provide safe fallbacks + user-facing error messages when invalid

### B2. Image validation + readability heuristics
- **Feature:** “Chart readability check” before expensive AI call
- **Tasks:**
  - Enforce upload type/size limits (client + server)
  - Optional preprocessing (resize/compress; strip EXIF)
  - Heuristic readability score (e.g., resolution, contrast, text legibility signals)
  - UX: show “image looks blurry / crop your chart” guidance

### B3. Multi-model consensus (optional, but strong differentiator)
- **Feature:** Run 2–3 models and show agreement/disagreement
- **Tasks:**
  - Define consensus rules (bias vote + confidence weighting)
  - UI: “Models disagree” banner increases uncertainty
  - Store `models_used` and per-model outputs (optional)

### B4. Prompt/versioning discipline
- **Feature:** audit-friendly prompt versioning
- **Tasks:**
  - Centralize prompt templates + `prompt_version`
  - Store `api_version` and prompt version on each analysis
  - Add changelog note when prompt changes

---

## EPIC C — Data Model & Analytics (user value + retention)

### C1. Outcome tracking (careful framing)
- **Feature:** User marks which scenario played out (not “profit probability”)
- **Tasks:**
  - UI: “What happened next?” (bull/bear/unclear)
  - Store outcome + notes + timestamp
  - Dashboard: scenario hit-rate by strategy/timeframe/instrument

### C2. Performance dashboards (validate usefulness)
- **Feature:** Improve analytics screens with cohort filters
- **Tasks:**
  - Filters: instrument, timeframe, strategy, date range
  - Export: CSV for user’s own records

### C3. Data export + deletion (privacy + trust)
- **Feature:** User data export (JSON) + account deletion flow
- **Tasks:**
  - Build edge function/API endpoint for export
  - UI: settings page actions
  - Define retention policy (billing events vs analysis content)

---

## EPIC D — Market Data, Watchlists & Alerts (daily use)

### D1. Market data reliability
- **Feature:** harden `market-data` caching + fallbacks
- **Tasks:**
  - Improve cache invalidation & TTL handling
  - Add provider failover if CoinGecko down
  - Add observability/logging

### D2. Watchlist UX
- **Feature:** watchlist as daily entry point
- **Tasks:**
  - Add “Analyze latest chart for this instrument” shortcut
  - Notes/tags per watchlist item
  - Sorting by volatility/change

### D3. Price alerts
- **Feature:** robust alert triggering + notifications
- **Tasks:**
  - Server-side scheduler/worker (or Supabase scheduled triggers)
  - Notification channel decision (email first; push later)

---

## EPIC E — Billing, Plans & Entitlements (SaaS readiness)

### E1. Stripe productization
- **Tasks:**
  - Create Stripe Products/Prices
  - Set env vars (`STRIPE_PRICE_*`, webhook secret)
  - Verify checkout → webhook → cached subscription

### E2. Payment failure + dunning
- **Feature:** handle `invoice.payment_failed`, `past_due`
- **Tasks:**
  - Grace period + UI banner
  - Portal CTA
  - Email notifications

### E3. Usage UX
- **Feature:** “80% of limit used” warnings + usage history
- **Tasks:**
  - DB: usage events table (optional)
  - UI: usage indicator in header/billing page

---

## EPIC F — Security, Compliance & Trust (production-grade)

### F1. Consistent legal pages + acceptance logging
- **Tasks:**
  - Ensure `/terms`, `/privacy`, `/refund-policy`, `/risk-disclosure` are complete + linked in footer
  - Log acceptance version per user

### F2. Storage privacy
- **Tasks:**
  - Ensure chart bucket is private
  - Only use signed URLs; no public exposure

### F3. CORS & rate limits
- **Tasks:**
  - Tighten allowed origins for prod
  - Per-user and per-IP enforcement rules

---

## EPIC G — Deployment, Observability & DevEx

### G1. Production deploy checklist (Vercel + Supabase)
- **Tasks:**
  - Document end-to-end deploy steps
  - Create staging env separation
  - Smoke test scripts

### G2. Monitoring
- **Tasks:**
  - Add error tracking (Sentry or equivalent)
  - Alert on webhook failures + edge function spikes

### G3. CI
- **Tasks:**
  - Add GitHub Actions for typecheck/lint/test
  - Optional: migrate-check step

---

## EPIC H — Growth: SEO, Content & Conversion

### H1. SEO baseline
- **Tasks:**
  - Verify meta tags, sitemap, robots, OpenGraph
  - Content pages aligned with scenario-analysis posture

### H2. Conversion funnel
- **Tasks:**
  - Improve onboarding to “first analysis under 60 seconds”
  - Add sample chart demo mode
  - A/B test plan page copy (later)

---

# Suggested next 10 tasks (practical sequence)

1) Replace README.md template with real project README
2) Align git remote + package.json repository URL to `SPIGELAI1005/BULLBEARDAYS`
3) Phase 2 / Task #20: add Zod schemas + validation (edge + client)
4) Add image validation + readability check + better UX errors
5) Refactor `src/pages/Index.tsx` (Task #19) to improve maintainability
6) Add webhook failure handling + basic monitoring hooks
7) Add payment failure UX (banner + portal CTA)
8) Add usage warnings (80%/100%)
9) Implement user data export
10) Implement account deletion flow

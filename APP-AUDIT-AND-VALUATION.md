# App Audit & Market Value Evaluation
**Project:** BullBearDays – Chart Insights AI  
**Repo:** `chart-insights-ai`  
**Date:** 2026-02-01  
**Scope:** Codebase inventory, feature/function audit, production readiness notes, and a market value estimate with value-boosting recommendations.

---

## Executive summary

BullBearDays is a **Vite + React + TypeScript** web app that lets users upload trading chart screenshots and receive **AI-generated scenario analysis**, with supporting UX (history, share cards, onboarding, market widgets), plus a **Stripe + Supabase** billing and usage-limit enforcement foundation.

At a glance, the project is beyond “prototype” (billing schema, webhooks, usage enforcement, legal pages, UI polish), but its **production value** depends heavily on finishing the remaining deployment steps (Stripe price IDs, webhook config, Supabase migrations/functions pushed to production) and proving traction (conversion + retention).

---

## Codebase metrics (current snapshot)

### Size / composition
- **Tracked files (git):** 189
- **Tracked lines (source + docs):** 29,777 total lines
  - **TSX:** 13,031
  - **TS:** 3,648
  - **CSS:** 482
  - **SQL (migrations):** 427
  - **Markdown (docs):** 3,514
  - **JSON:** 8,637 (includes lockfiles and config)
  - **TOML:** 7

### Frontend surface area (approx. by file count)
- **Pages (`src/pages/*.tsx`):** 12  
  `Index`, `Pricing`, `Signup`, `Billing`, `PricingConditions`, `Terms`, `Privacy`, `RefundPolicy`, `RiskDisclosure`, `Methodology`, `NotFound`, plus an `Index.optimized` variant.
- **Components (`src/components/**/*.tsx`):** 93 (includes shadcn/ui wrappers and app-specific components)
- **Hooks (`src/hooks/*`):** 16 files (includes one test file)
- **Tests (`*.test.*` / `*.spec.*`):** 9

### Backend / “functions”
- **Supabase Edge Functions:** 3
  - `analyze-chart`
  - `analyze-market`
  - `market-data`
- **Vercel Serverless API routes (Stripe):** 3 (+ 1 shared module)
  - `POST /api/stripe/checkout`
  - `POST /api/stripe/portal`
  - `POST /api/stripe/webhook`
- **Supabase migrations:** 17 SQL files
- **Key Supabase RPCs (from migrations / usage):**
  - `check_usage_limit` (usage enforcement + increment)
  - `get_user_subscription` (billing status + usage summary)
  - `get_founder_seats` (founder seats remaining counter)

### Code function count (approx.)
This is not “all functions in the app”, but a useful proxy:
- **Exported functions in `src/`:** 44 matches of `export function` / `export async function` across 17 files.

---

## Functional audit (what the app does)

### Core user journey
- **Landing / app shell**
  - Header navigation, hero section, footer, theming, keyboard shortcuts
  - Disclaimer gating and cookie consent
- **Authentication**
  - Email/password signup and sign-in via Supabase Auth
  - Profile loading and profile updates
- **Chart analysis**
  - Upload chart images (including multi-chart mode)
  - Select strategy/timeframe/instrument inputs (UX supports first-class inputs)
  - Trigger analysis against Supabase Edge Functions
  - Robust client-side validation and fallbacks (Zod + defensive rendering)
- **Results experience**
  - Bull/bear scenario presentation (scenario-based posture)
  - Sharing via share cards (watermarking policy by tier is reflected in pricing text)
  - History view / detail modal for past analyses
- **Market widgets**
  - Market data fetch and comparison overlay (driven via `market-data` edge function)
  - “Analyze market” flow (AI-generated market analysis based on ticker data)
- **Pricing & billing**
  - Pricing page with tiers (Free, Week Pass, Starter, Pro, Elite, Founder)
  - Founder seats remaining display (RPC-driven, falls back cleanly)
  - Billing page reads cached subscription + usage summary (RPC-driven)
  - Stripe Checkout + Portal flows via `/api/stripe/*`
  - Usage enforcement via `check_usage_limit` before expensive operations
- **Legal & trust**
  - Terms, Privacy, Risk Disclosure, Refund Policy, Methodology
  - Pricing Conditions page (per-plan “See Conditions” link)

---

## Function / endpoint inventory (high-signal)

### Supabase Edge Functions
- **`analyze-chart`**
  - Inputs: chart image + model choices + explicit context
  - Does: auth verification, rate limit, usage enforcement, calls AI gateway, returns structured analysis
- **`analyze-market`**
  - Inputs: market ticker snapshot
  - Does: auth verification, rate limit, usage enforcement, calls AI gateway, returns analysis payload
- **`market-data`**
  - Inputs: optional auth
  - Does: cache-backed market data aggregation + rate limiting for signed-in users

### Vercel API routes (Stripe)
- **`POST /api/stripe/checkout`**
  - Creates Stripe Checkout Session; for one-time purchases it also upserts a cached subscription-like row
- **`POST /api/stripe/portal`**
  - Creates Stripe customer portal session
- **`POST /api/stripe/webhook`**
  - Verifies signature; records events for idempotency; upserts subscription status and one-time purchase state

### Database / enforcement
- Plan entitlements, usage counters, subscription cache, and event idempotency tables exist via migrations.

---

## Architecture audit (how it’s built)

### Frontend
- **Framework:** React 18 + Vite
- **UI:** Tailwind + shadcn/ui (Radix)
- **Routing:** `react-router-dom`
- **State/data:** React Query + custom hooks
- **Reliability:** Zod validation (client-side) and defensive rendering

### Backend
- **Primary backend:** Supabase (Auth, Postgres, Storage, Edge Functions)
- **Billing:** Stripe via Vercel serverless routes + DB caching in Supabase
- **Usage enforcement:** RPC `check_usage_limit` is called inside Edge Functions before AI work
- **Security posture:** Private storage bucket + RLS policies; JWT verification enabled on functions

---

## Production readiness (current status)

### What is already in place
- SPA deploy config (`vercel.json`)
- Stripe API routes exist and expect env vars (keys + price IDs)
- Supabase migrations exist for billing + usage enforcement + founder seats counter
- CORS allowlist logic supports production domain + Vercel URL + configurable `ALLOWED_ORIGINS`
- Tests and lint/build reportedly passing locally

### Remaining steps that gate “real production”
- **Stripe**
  - Create Products/Prices and populate the `STRIPE_PRICE_*` env vars with **Price IDs** (`price_...`)
  - Configure webhook endpoint to `/api/stripe/webhook` and set `STRIPE_WEBHOOK_SECRET`
- **Supabase**
  - Apply migrations to the production DB
  - Deploy Edge Functions to production
  - Set Edge Function secrets (`LOVABLE_API_KEY`, plus `ALLOWED_ORIGINS` as needed)
- **Ops**
  - Error tracking (Sentry or similar), logging hygiene, incident/rollback steps
  - Support channel + basic customer comms

---

## Market value estimate (practical, scenario-based)

This section is inherently approximate. Market value depends far more on **traction and defensibility** than code size. Still, the codebase’s breadth sets a meaningful floor via replacement cost.

### Replacement cost (engineering)
Given the feature surface (auth, analysis pipeline, storage hardening, pricing/billing plumbing, usage enforcement, legal pages), a reasonable rebuild estimate is:
- **200–500 engineering hours** (depending on quality bar, UX polish, and compliance posture)
- At **€60–€120/hour**, that’s roughly **€12k–€60k** in development cost, excluding marketing/ops and ongoing AI inference costs.

### Asset value (codebase only, little/no revenue)
If sold as an asset (repo + setup docs) without meaningful revenue/traction:
- **~€5k–€25k** is a typical “buyer-justified” range, depending on perceived readiness and how quickly it can be deployed.

### SaaS value (with revenue)
For small SaaS acquisitions, common heuristics are:
- **2×–5× ARR** (or **20×–50× monthly net profit**) depending on growth, churn, risk, and operational maturity.

Examples (illustrative):
- **€1k MRR with stable churn and low support load** → often **€24k–€60k** (wide range)
- **€5k MRR with growing trend + clean ops** → often **€120k–€300k+**

### Factors that increase value immediately
- Evidence of **PMF signals**: conversion rate, retention, and paid usage
- Reduced operational risk: robust webhooks, monitoring, support, refunds and disputes
- Clear compliance posture: “educational scenario analysis”, consistent disclaimers, no “financial advice” positioning

### Factors that reduce value
- Reliance on a single external AI gateway without fallback vendor strategy/cost controls
- Unproven billing/revenue flows in production (Stripe prices + webhooks not live)
- Regulatory/compliance ambiguity (especially around “signals” vs “scenarios” language)

---

## Recommendations to increase market value (highest ROI first)

### A) Revenue + conversion (highest leverage)
- **Improve activation funnel**: “first analysis in < 60 seconds” onboarding, guided sample chart, clearer empty states.
- **Lifecycle prompts**: usage warnings (80% used), contextual upgrade prompts, “what you get if you upgrade” previews.
- **Pricing experimentation**: introduce annual defaults for recurring tiers, better plan comparison, and checkout friction reduction.

### B) Operational maturity (buyer confidence multiplier)
- **Add error tracking + alerting** (Sentry + alerts on function failures/webhook failures).
- **Stripe hardening**:
  - handle failed payments (`invoice.payment_failed`), retries, and in-app banners
  - webhook monitoring + replay tooling (you already store `stripe_events`, which is great)
- **Support baseline**:
  - support email + ticket table or lightweight tool
  - admin “lookup user” internal page (plan + usage + last errors)

### C) Compliance & trust (reduces downside risk)
- Keep language strictly **scenario-based** (avoid “buy/sell commands”, avoid profit probabilities).
- Add **data export + account deletion** (GDPR/CCPA readiness), plus clear data retention policy.
- Add explicit **service continuity + limitations** messaging (already started via Pricing Conditions).

### D) Product differentiation (moat-building)
- **Model evaluation loop** (careful framing): user marks scenario outcome; build a personal performance journal.
- **Reusable templates**: “strategy packs” / presets that improve perceived value.
- **Collaborative features** (later): share-to-team workspace, watchlists, alerts.

### E) Performance and reliability (supports scale)
- Cache and debounce expensive calls; display queue/rate limit feedback consistently.
- Tighten image validation and client-side preprocessing (compression, EXIF strip, WebP conversion where possible).

---

## What to measure (to justify a higher valuation)

Minimum metrics to track for investors/buyers:
- **Activation**: % of new signups completing first analysis within 24h
- **Conversion**: free → paid conversion rate by cohort
- **Retention**: 7-day / 30-day retention, cohort-based
- **Churn**: monthly churn and reasons
- **Unit economics**: gross margin after AI costs, CAC, LTV
- **Support load**: tickets per 100 paid users, time-to-resolution

---

## Appendix: current routes

From the router:
- `/` (Index / main app)
- `/pricing`
- `/pricing-conditions`
- `/signup`
- `/billing`
- `/terms`
- `/privacy`
- `/refund-policy`
- `/risk-disclosure`
- `/methodology`
- `*` (NotFound)


# Memory Bank

Context, conventions, and recent decisions for **BullBearDays** (`chart-insights-ai`). Use this for onboarding, AI assistants, and quick reference.

---

## Project identity

- **Product:** bullbeardays.com — AI-powered trading scenario analysis (educational; not financial advice).
- **Stack:** React 18 + TypeScript + Vite, Tailwind CSS, shadcn/ui, React Router, React Query, Supabase (Auth, DB, Edge Functions).
- **Version:** 1.0.0 (`package.json`).

---

## Key files & structure

| Path | Purpose |
|------|--------|
| `src/App.tsx` | Root: `DisclaimerGate`, `BrowserRouter`, `Routes`. App content gets `pointer-events-none` + blur when gate open. |
| `src/pages/Index.tsx` | Home; analyze UI, hero, Footer with `onShortcutsClick`. |
| `src/pages/Pricing.tsx` | Pricing page; liquid-glass UI, billing toggle, plans, Founder offer, FAQ, Footer. |
| `src/pages/Signup.tsx` | Placeholder signup; reads `?plan=`, prompts user to sign in/create account via AuthModal before continuing. |
| `src/pages/Billing.tsx` | Billing page; `get_user_subscription` RPC, Refresh, `?success=true` banner, and “Manage billing” (Stripe Billing Portal). |
| `src/pages/Terms.tsx`, `Privacy.tsx`, `RiskDisclosure.tsx`, `Methodology.tsx` | Legal/info pages; “Back to Home”, glass panel, Footer. |
| `src/components/Header.tsx` | Fixed header: logo, nav (Analyze, Performance, About, Pricing), mobile hamburger + Sheet (&lt; md), CurrencyToggle, ThemeToggle, market status chip, user menu. AuthModal (Sign In) portaled from Header. |
| `src/components/Footer.tsx` | Shared footer: Terms, Risk Disclosure, Privacy, Methodology, copyright, disclaimers, optional Keyboard Shortcuts. |
| `src/components/DisclaimerGate.tsx` | Modal before use; Agree / Exit. |
| `src/components/DisclaimerBanner.tsx` | Dismissible banner in header (variant `dismissible`, position `header`). |
| `src/lib/pricing.ts` | Plan types, `PRICING_PLANS`, `FOUNDER_PLAN`, `getYearlyPrices`, `YEARLY_DISCOUNT`, `PLANS_WITH_YEARLY`. |
| `src/lib/billing/startCheckout.ts` | Client helper: POST `/api/stripe/checkout` with Supabase Bearer token, redirect to Stripe Checkout. |
| `src/lib/billing/startPortal.ts` | Client helper: POST `/api/stripe/portal` with Supabase Bearer token, redirect to Stripe Billing Portal. |
| `src/hooks/useTheme.tsx` | Theme (light/dark/system), accent, validation, `localStorage` sync. |
| `src/hooks/useCurrency.tsx` | Currency (USD/EUR/GBP), conversion, `formatConverted`. |
| `src/hooks/useMarketSession.ts` | `timeOfDay`, `session` (icon + label) for market status. |
| `src/hooks/useAnalysisFlow.ts` | Main analysis orchestration (analyze-chart/analyze-market); handles `USAGE_LIMIT_REACHED` with Upgrade CTA. |
| `src/lib/api.ts` | Invokes Supabase edge functions; maps `USAGE_LIMIT_REACHED` payloads into a typed client error. |
| `api/stripe/*` | Vercel Functions: `/api/stripe/checkout`, `/api/stripe/webhook`, `/api/stripe/portal`. |

---

## Conventions & decisions

### Routing

- Home `/`, Pricing `/pricing`, Billing `/billing`, Signup `/signup`, Terms `/terms`, Privacy `/privacy`, Risk Disclosure `/risk-disclosure`, Methodology `/methodology`. Catch-all `*` → `NotFound`.

### Layout & main padding

- **Fixed header** = nav + DisclaimerBanner. Both are in one fixed block; banner can extend well below the nav.
- **Main content** on subpages uses `pt-52` so “Back to Home” / “Back to Pricing” **start below the header**. Previously `pt-28`/`pt-32` caused the banner to overlap those buttons and block clicks.
- Pages with “Back to Home” or “Back to Pricing”: Pricing, Terms, Privacy, RiskDisclosure, Methodology, Signup.

### Footer

- **Same `Footer`** on Index, Pricing, Signup, Terms, Privacy, RiskDisclosure, Methodology. `Footer` accepts optional `onShortcutsClick` (used only on Index for “Keyboard Shortcuts (?)”). **Not** on `NotFound`.

### Theming

- `useTheme` + `ThemeProvider`. Stored in `localStorage`; validated on read.
- `index.html` includes an inline script that applies `light`/`dark` and `color-scheme` **before** React hydrates to avoid theme flash.

### Currency

- `useCurrency` provides `symbol`, `formatConverted`, etc. `MarketTicker` and `PriceTargets` use it for instrument prices and volumes.

### Pricing

- **Week Pass** (ex–Day Pass): €2.80 / 7 days; no yearly.
- **Starter, Pro, Elite**: monthly + yearly (18% off). Yearly shows “€X/month” and “€Y/year · billed annually”.
- **Founder Lifetime (Limited)**: one-time; golden styling.

### Brand colors

- Magenta `#d81b5c` (primary, CTAs), Bull green `#38b449`, Bear red `#de382f`, golden gradient for prices/Founder/PROFIT.

### Modals & overlays

- **User menu** (profile dropdown) and **AuthModal** (Sign In) render via `createPortal(..., document.body)` so they are not children of the Header DOM. This avoids React `insertBefore` errors when the Header tree updates (auth state, Sheet open/close). AuthModal uses `z-[120]`, mobile Sheet `z-[110]`.
- **Toasts** — Radix Toast viewport uses `z-[250]` so messages render above the glass modal overlays.

---

## Billing & Stripe (current architecture)

### Sources of truth

- **Stripe** is the source of truth for subscriptions and payment status.
- **Supabase DB** stores cached billing state:
  - `stripe_customers`: maps `auth.users.id` → `stripe_customer_id`
  - `subscriptions`: cached status/period bounds + plan id
  - `plan_entitlements`: plan limits (public-readable)
  - `usage_tracking`: calendar-month usage counters (writes via RPC/service role)
  - `stripe_events`: webhook idempotency + audit

### Usage limits

- **Server-side enforcement** is done in Supabase edge functions:
  - `supabase/functions/analyze-chart/index.ts`
  - `supabase/functions/analyze-market/index.ts`
  - They call `check_usage_limit(user_id, 'analysis', 1)` before expensive AI calls.
  - If blocked, the functions return payload `code: "USAGE_LIMIT_REACHED"` (HTTP 402).
- **Client UX**:
  - `src/lib/api.ts` maps the structured payload to a typed `USAGE_LIMIT_REACHED` error.
  - `src/hooks/useAnalysisFlow.ts` shows a toast with an Upgrade CTA.

### Stripe on Vercel

- Implemented under `api/stripe/*` (Vercel Functions):
  - `POST /api/stripe/checkout`: creates Stripe Checkout session and returns `{ url }`
  - `POST /api/stripe/webhook`: verifies signature, stores `stripe_events`, upserts `subscriptions` and `stripe_customers`
  - `POST /api/stripe/portal`: creates Stripe Billing Portal session and returns `{ url }`

### Vercel env vars (server-side)

- **Supabase**: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- **Stripe**: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `APP_BASE_URL`
- **Price IDs mapping**:
  - `STRIPE_PRICE_WEEK_PASS`
  - `STRIPE_PRICE_STARTER_MONTHLY`, `STRIPE_PRICE_STARTER_YEARLY`
  - `STRIPE_PRICE_PRO_MONTHLY`, `STRIPE_PRICE_PRO_YEARLY`
  - `STRIPE_PRICE_ELITE_MONTHLY`, `STRIPE_PRICE_ELITE_YEARLY`
  - `STRIPE_PRICE_FOUNDER`

---

## Last changes (summary)

*Detailed entries live in [CHANGELOG.md](./CHANGELOG.md).*

1. **Horizontal scroll / long line** — `glass-panel-subtle::before` shimmer overflowed (200% width, -100% left). Fixed by constraining to 100% width, animating `background-position` instead of `transform`, and adding `overflow-x: hidden` on `html`/`body`.
2. **Back to Home / Back to Pricing not working** — Header + disclaimer overlapped the buttons. Fix: `pt-52` on main for Pricing, Terms, Privacy, RiskDisclosure, Methodology, Signup.
3. **Footer copyright** — Set to `© 2026 bullbeardays.com // AI-powered trading scenario analysis.`
4. **Profile menu "insertBefore" error** — User dropdown now portaled to `document.body` with `position: fixed`; menu closes when `user` or `isLoading` changes.
5. **AuthModal "insertBefore" error** — Sign In modal now portaled to `document.body` when open; `z-[120]` so it appears above the mobile Sheet.
6. **Billing + Stripe** — Added billing schema migration, `/billing` page, Stripe Vercel Functions (`/api/stripe/*`), and server-side usage limit enforcement in Supabase edge functions.
7. **Toast layering** — Toast viewport raised to render above modal overlays.

---

## External docs

- [ARCHITECTURE.md](./ARCHITECTURE.md) — Tech stack, design system, components, API.
- [DEVELOPER-GUIDE.md](./DEVELOPER-GUIDE.md) — Dev setup, scripts, conventions.
- [ROADMAP.md](./ROADMAP.md), [PHASE-1-COMPLETION-SUMMARY.md](./PHASE-1-COMPLETION-SUMMARY.md) — Planning and phase deliverables.

---

*Last updated: 2026-01-30*

# Changelog

All notable changes to **BullBearDays** are documented here. Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

### Added

- **Mobile hamburger menu** — On viewports &lt; `md`, the header shows a hamburger button that opens a slide-over Sheet from the right. The menu includes nav links (Analyze, Performance, About, Pricing), market status, Currency and Theme toggles, and Sign In / user profile + Sign Out. Desktop layout unchanged.
- **Billing schema (Supabase)** — New migration `supabase/migrations/20260130000000_billing_schema_v1.sql` adds `stripe_customers`, `subscriptions`, `plan_entitlements` (seeded), `usage_tracking`, `stripe_events` plus RPCs `get_user_subscription()` and `check_usage_limit()` for calendar-month usage enforcement.
- **Billing page** (`/billing`) — Shows plan/status and monthly analysis usage via `get_user_subscription`, supports `?success=true` return from Stripe and a Refresh button. Includes “Manage billing” to open Stripe Billing Portal.
- **Stripe checkout wiring (frontend)** — Pricing CTAs now start Stripe Checkout for signed-in users and route logged-out users to the existing signup/auth flow.
- **Stripe Vercel Functions** — Added `api/stripe/checkout`, `api/stripe/webhook` (signature verification + idempotency via `stripe_events`), and `api/stripe/portal`.
- **Usage limits enforced server-side** — Supabase Edge Functions `analyze-chart` and `analyze-market` call RPC `check_usage_limit` before invoking expensive AI calls; returns `USAGE_LIMIT_REACHED` when blocked.

### Fixed

- **Profile menu "insertBefore" error on Vercel** — Clicking the profile icon could throw `Failed to execute 'insertBefore' on 'Node'` when auth state updated during open (e.g. Supabase session refresh). The user dropdown was rendered inline in the header's conditional `{user ? ... : ...}` tree; React attempted to insert the menu into a parent that could unmount. The dropdown now renders via `createPortal(..., document.body)` with `position: fixed` and coordinates from the button's `getBoundingClientRect()`. The menu is no longer a child of the header DOM, avoiding the insertBefore race. Also close the menu when `user` or `isLoading` changes.
- **AuthModal "insertBefore" error when opening Sign In** — The same `insertBefore` error occurred when opening the Sign In modal (e.g. from the mobile menu or desktop header). AuthModal used `if (!isOpen) return null` and rendered the modal as a direct child of the Header fragment; toggling to visible caused React to insert new DOM into the Header tree, which could conflict with Sheet open/close or other updates. AuthModal now renders via `createPortal(..., document.body)` when open, so the modal DOM lives in `body` and never touches the Header tree. Uses `z-[120]` so it appears above the mobile Sheet.
- **Toasts hidden behind glass overlay** — The Radix Toast viewport z-index was below the AuthModal overlay, causing bottom-right messages to appear behind the “frozen glass”. The toast viewport now uses a higher z-index so toasts render above modals/overlays.
- **Horizontal scroll / long line below header and pricing cards** — The `glass-panel-subtle::before` shimmer used `left: -100%` and `width: 200%`, and the header uses `!overflow-visible` for the user dropdown. The pseudo-element extended beyond the viewport and caused horizontal scroll. The shimmer now uses `left: 0; width: 100%`, `background-size: 200% 100%`, and `liquid-wave` animates `background-position` instead of `transform`, so it stays within bounds. Added `overflow-x: hidden` on `html` and `body` to prevent horizontal scroll globally.
- **Back to Home / Back to Pricing buttons not clickable** — The fixed header (nav + disclaimer banner) overlapped the top of main content, so clicks hit the overlay instead of the links. Increased main `padding-top` from `pt-28` / `pt-32` to `pt-52` on Pricing, Terms, Privacy, Risk Disclosure, Methodology, and Signup so the buttons sit below the header.

### Changed

- **Footer copyright** — Updated to `© 2026 bullbeardays.com // AI-powered trading scenario analysis.`
- **Mobile layout** — Header padding and logo scale down on small screens; Footer and main content use `px-4` / `pt-44` / `pb-16` on mobile. Hero, MarketTicker, Pricing (billing toggle, cards), and Index grid use responsive spacing and touch-friendly targets. Added `overlayClassName` to `SheetContent` and `z-[110]` for the mobile menu so it appears above the header. Global `-webkit-tap-highlight-color: transparent` and `touch-action: manipulation` for taps on touch devices.
- **Vercel SPA rewrites** — SPA fallback rewrite now excludes `/api/*` so Vercel Functions under `/api/stripe/*` are not rewritten to `/index.html`.
- **Signup placeholder copy** — Updated to guide users to sign in/create an account before continuing to checkout (uses existing AuthModal).

---

## [1.0.0] – 2026-01-26 (and prior)

### Added

- **Pricing page** (`/pricing`) — Liquid-glass UI, hero, billing toggle (monthly/yearly), pricing cards (Week Pass, Starter, Pro, Elite), Founder Lifetime (Limited) offer, credits explainer, FAQ accordion, links to Terms/Privacy/Risk Disclosure. CTAs point to `/signup?plan=...`.
- **Signup placeholder** (`/signup`) — “Coming soon” page showing selected plan, with “Back to Pricing” and “View Pricing” links.
- **Stub routes** — Terms (`/terms`), Privacy (`/privacy`), Risk Disclosure (`/risk-disclosure`), Methodology (`/methodology`), each with “Back to Home” and shared Footer.
- **Yearly billing** — 18% discount on Starter, Pro, Elite; toggle shows monthly equivalent and total per year.
- **Week Pass** — Renamed from Day Pass; €2.80 / 7 days.
- **`useMarketSession` hook** — Centralized market session (Asian, Markets Open, After Hours, etc.) used by `AnimatedLogo` and Header status chip.
- **`useCurrency` hook** — Currency selection (USD, EUR, GBP) and conversion for instrument prices and volumes in `MarketTicker` and `PriceTargets`.
- **Footer** — Shared `Footer` component with links (Terms, Risk Disclosure, Privacy, Methodology), copyright, disclaimers, optional “Keyboard Shortcuts (?)” on Index.

### Changed

- **Theme (light/dark/system)** — `useTheme` validation, `index.html` inline script for instant theme apply, `color-scheme` on `document.documentElement`. ThemeToggle closes dropdown on selection.
- **Header** — Market status chip matches logo (e.g. “After Hours”); profile dropdown closes on outside click or Escape (same pattern as ThemeToggle).
- **Pricing page** — CandlestickBackground, hero text (“Some days are unBULLivable…”), “PROFIT” and plan prices use golden gradient; Founder card has golden shine effect; Founder card moved above comparison grid.
- **Currency display** — Instrument prices and volumes in `MarketTicker` respect selected currency; `PriceTargets` uses `formatConverted` consistently.

### Fixed

- **Theme flash on load** — Inline script applies stored theme before React paint.
- **`useTheme` tests** — `useAuth` mocked so `ThemeProvider` tests run without `AuthProvider`.

---

## Version history

| Version   | Date       | Notes                                                                 |
|----------|------------|-----------------------------------------------------------------------|
| Unreleased | 2026-01-30 | Billing + Stripe (Vercel functions), usage limits, toasts overlay fix, plus prior UI fixes |
| 1.0.0    | 2026-01-26 | Pricing, theme, footer, Phase 1                                       |

[Unreleased]: https://github.com/bullbeardays/chart-insights-ai/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/bullbeardays/chart-insights-ai/releases/tag/v1.0.0

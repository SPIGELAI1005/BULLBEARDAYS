# Changelog

All notable changes to **BullBearDays** are documented here. Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

### Fixed

- **Horizontal scroll / long line below header and pricing cards** — The `glass-panel-subtle::before` shimmer used `left: -100%` and `width: 200%`, and the header uses `!overflow-visible` for the user dropdown. The pseudo-element extended beyond the viewport and caused horizontal scroll. The shimmer now uses `left: 0; width: 100%`, `background-size: 200% 100%`, and `liquid-wave` animates `background-position` instead of `transform`, so it stays within bounds. Added `overflow-x: hidden` on `html` and `body` to prevent horizontal scroll globally.
- **Back to Home / Back to Pricing buttons not clickable** — The fixed header (nav + disclaimer banner) overlapped the top of main content, so clicks hit the overlay instead of the links. Increased main `padding-top` from `pt-28` / `pt-32` to `pt-52` on Pricing, Terms, Privacy, Risk Disclosure, Methodology, and Signup so the buttons sit below the header.

### Changed

- **Footer copyright** — Updated to `© 2026 bullbeardays.com // AI-powered trading scenario analysis.`

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

| Version   | Date       | Notes                          |
|----------|------------|--------------------------------|
| Unreleased | 2026-01-27 | Back to Home fix, copyright    |
| 1.0.0    | 2026-01-26 | Pricing, theme, footer, Phase 1 |

[Unreleased]: https://github.com/bullbeardays/chart-insights-ai/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/bullbeardays/chart-insights-ai/releases/tag/v1.0.0

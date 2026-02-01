# SaaS Readiness Plan (BullBearDays)

Practical plan to make BullBearDays **deployable as a production SaaS**. This focuses on the minimum set of work to ship a secure, billable product with plan enforcement, great UX, and operational readiness.

> **Source of truth for task status:** `ROADMAP-EXECUTION-PLAN.md`  
> **Scope note:** This document is a launch-focused plan; it complements the product roadmap.

---

## Goals (definition of “deployable SaaS”)

- **Secure by default**: authenticated endpoints enforce JWT, CORS is restricted, storage is private by default, rate limiting + payload limits exist.
- **Billing works end-to-end**: Stripe Checkout + webhook-driven entitlement state + Billing portal.
- **Plan enforcement is real**: analyses/context pulls are limited by plan and tracked per billing period.
- **Reliable UX**: clear error handling, retries, accessibility basics, mobile-safe behavior.
- **Operational readiness**: logging/monitoring, environment separation, CI checks, migration workflow.

---

## P0 — Security hardening (launch blockers)

### P0.1 Enable JWT verification for Edge Functions

- **Current:** `supabase/config.toml` sets `verify_jwt = false` for all functions.
- **Change:** set `verify_jwt = true` for:
  - `functions.analyze-chart`
  - `functions.analyze-market`
  - `functions.market-data` (recommended; even if “public”, you still want consistent auth + throttling behavior)

**Acceptance:**
- Unauthorized calls return **401** from Supabase before your handler runs.

### P0.2 Restrict CORS

- Replace `Access-Control-Allow-Origin: '*'` with a controlled allowlist:
  - `https://bullbeardays.com`
  - `https://www.bullbeardays.com`
  - `https://*.vercel.app` (optional for previews)
- Keep `OPTIONS` fast-path.

**Acceptance:**
- Calls from unknown origins fail CORS.
- Calls from approved origins succeed.

### P0.3 Storage: make charts private + serve via signed URLs

- **Current:** `src/lib/chartStorage.ts` uses `getPublicUrl()` for `"chart-images"`.
- **Change:** make `"chart-images"` private; switch to **signed URLs** or server-side proxy.

**Recommended approach:**
- Store **storage path** in DB (not a public URL).
- On read, generate a signed URL (short TTL) for the authenticated user.

**Acceptance:**
- Charts are not accessible without auth.
- Signed URLs expire.

### P0.4 Payload limits + timeouts

- Add explicit max payload constraints for base64 images (DoS prevention).
- Return structured errors (`IMAGE_TOO_LARGE`, `INVALID_IMAGE_FORMAT`).

**Acceptance:**
- Oversized requests return **400** with a clear message.

### P0.5 Anonymous endpoint hardening (`market-data`)

Choose one:
- **Option A (recommended):** require auth for `market-data`.
- **Option B:** allow anonymous but add IP-based throttling + caching.

**Acceptance:**
- Anonymous abuse doesn’t cause runaway spend or degradation.

---

## P1 — Billing foundation (Stripe) + entitlements

### P1.1 Database schema (Stripe + subscriptions + usage)

Add new tables (with RLS):
- `stripe_customers`: `user_id → stripe_customer_id`
- `subscriptions`: current active plan + status + billing period bounds
- `usage_tracking`: counters for analyses/context pulls per period
- `plan_entitlements`: static limits + feature flags (source of truth for plan capabilities)

Add RPC helpers (SECURITY DEFINER, with deny-all direct policies):
- `get_user_subscription(user_id)`
- `check_usage_limit(user_id, resource_type, increment)`

**Acceptance:**
- A user can query their own subscription + usage (via RPC or SELECT with RLS).
- Usage increments atomically and prevents overage.

### P1.2 Edge Functions: Checkout + Webhook + Billing Portal

Create Edge Functions:
- `stripe-checkout`: creates Stripe Checkout Session for selected plan
- `stripe-webhook`: verifies signature and upserts subscription state
- `stripe-billing-portal`: creates a Stripe Customer Portal session

**Acceptance:**
- Checkout completes and redirects back with success.
- Webhook updates DB status (`active`, `canceled`, `past_due`, etc.).
- Billing portal opens for authenticated users.

### P1.3 Stripe configuration (products/prices)

In Stripe Dashboard:
- Create Products + Prices for:
  - Week Pass (7d) — decide: subscription with 7-day interval vs one-time access token
  - Starter / Pro / Elite — monthly + yearly prices
  - Founder — one-time payment (or lifetime entitlement with monthly reset)

**Environment variables (server-side):**
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_*` ids per plan/billing period

---

## P2 — Enforcement (make plans real)

### P2.1 Enforce subscription + usage in analysis endpoints

In:
- `supabase/functions/analyze-chart/index.ts`
- `supabase/functions/analyze-market/index.ts`

Before doing AI work:
- Validate active subscription
- Check & increment usage:
  - `analysis` increments by 1 (or by number of models if ensemble consumes more credits)
  - `context_pull` increments when online context is requested

Return consistent structured errors:
- `NO_SUBSCRIPTION`
- `LIMIT_REACHED` (include reset date)
- `PAYMENT_REQUIRED` (when `past_due`)

**Acceptance:**
- Users cannot exceed plan limits.
- App shows clear next step (upgrade / wait for reset).

### P2.2 UI: show plan + usage meter + upgrade entry points

Add:
- `Billing` page (`/billing`)
- Header/user menu link → Billing
- Pricing CTA buttons → real checkout session
- Usage indicators in relevant spots (analysis UI + billing page)

**Acceptance:**
- User can always understand: current plan, usage, reset date, upgrade path.

---

## P3 — UX + accessibility + reliability polish (pre-launch)

### P3.1 Modal accessibility (DisclaimerGate + AuthModal)

- Focus trap
- Escape to close
- initial focus and focus restoration
- proper ARIA (`role="dialog"`, `aria-modal`, labels/descriptions)

### P3.2 Error handling + retry

- Clear error states for:
  - network/offline
  - validation errors (Zod failures)
  - rate limit / usage limit
- Provide a one-click **Retry** for failed analyses where safe.

### P3.3 Hero pinning safety on mobile

- Consider disabling ScrollTrigger pinning on small screens.
- Provide “Skip animation” to jump to main content.

### P3.4 Accessibility baseline

- “Skip to content” link (especially with fixed header)
- Consistent `:focus-visible` styles globally
- `aria-live` for loading / completion

---

## P4 — Ops readiness (so you can run it like a SaaS)

### P4.1 Monitoring + error tracking

- Add request IDs in edge function logs
- Add client error tracking (e.g., Sentry) with environment separation
- Track key business events: checkout started, checkout completed, subscription state changes, limit reached

### P4.2 Environment separation

- dev / preview / prod configuration
- locked-down CORS allowlists per environment

### P4.3 CI / migrations workflow

- CI runs: typecheck, lint, tests, build
- Define a migration deployment flow (Supabase CLI)

### P4.4 Documentation alignment

- Update `USER-GUIDE.md` using `USER-GUIDE-UPDATES-NEEDED.md`
- Update `ARCHITECTURE.md` to scenario-analysis language (it currently references BUY/SELL/HOLD)
- Replace Lovable template `README.md` with real setup + deploy instructions

---

## Suggested implementation order (fastest path to paid SaaS)

1. **P0**: JWT verification + restricted CORS + private chart storage + payload limits
2. **P1**: Stripe schema + checkout + webhook + billing portal
3. **P2**: enforce entitlements in edge functions + add Billing UI + wire Pricing CTAs
4. **P3**: a11y + error handling + mobile/pinning UX polish
5. **P4**: monitoring + CI + docs

---

## Open design decisions (decide before building billing)

- **Week Pass (7 days)**:
  - subscription with 7-day billing interval vs one-time purchase that grants a 7-day entitlement
- **Founder**:
  - one-time payment with monthly reset (tracked in `usage_tracking`) vs “true lifetime unlimited”
- **Yearly pricing**:
  - separate Stripe price IDs for yearly plans (recommended) rather than computed client-side only


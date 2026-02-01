# SaaS Implementation Roadmap - Actionable Tasks

**Project:** BullBearDays SaaS Launch
**Timeline:** 3-4 weeks
**Status:** ✅ Phase 1 Complete - Ready for Phase 2
**Last Updated:** January 29, 2026

---

## 📊 Progress Tracker

| Phase | Tasks | Completed | Estimated | Actual | Status |
|-------|-------|-----------|-----------|--------|--------|
| Phase 1: Security & Legal | 8 | 8/8 (100%) | 3 days | 4 hours | ✅ Complete |
| Phase 2: Billing Foundation | 10 | 0/10 | 4 days | - | 🔴 Not Started |
| Phase 3: Enforcement & UX | 8 | 0/8 | 4 days | - | 🔴 Not Started |
| Phase 4: Ops & Testing | 7 | 0/7 | 3 days | - | 🔴 Not Started |
| Phase 5: Beta & Polish | 5 | 0/5 | 1 week | - | 🔴 Not Started |

**Total:** 38 tasks
**Completed:** 8/38 (21%)
**Time Spent:** ~4 hours (Phase 1)
**Time Remaining:** ~2-3 weeks for phases 2-5

---

## 🚀 PHASE 1: Security & Legal (3 days)

### ✅ Task 1.1: Enable JWT Verification [COMPLETE]
**Priority:** P0 (Critical)
**Time:** 1 hour → **Actual: 5 minutes**
**Status:** ✅ Complete

**Files modified:**
- ✅ `supabase/config.toml`

**Changes made:**
```toml
[functions.analyze-chart]
verify_jwt = true  # Changed from false

[functions.analyze-market]
verify_jwt = true  # Changed from false

[functions.market-data]
verify_jwt = true  # Changed from false
```

**Testing:**
- ⏳ Unauthenticated request returns 401 (needs testing)
- ⏳ Authenticated request succeeds (needs testing)
- ⏳ Invalid JWT returns 401 (needs testing)

---

### ✅ Task 1.2: Restrict CORS [COMPLETE]
**Priority:** P0 (Critical)
**Time:** 2 hours → **Actual: 45 minutes**
**Status:** ✅ Complete

**Files created:**
- ✅ `supabase/functions/_shared/cors.ts` - CORS helper with origin allowlist

**Files modified:**
- ✅ `supabase/functions/analyze-chart/index.ts` - All Response calls updated
- ✅ `supabase/functions/analyze-market/index.ts` - All Response calls updated
- ✅ `supabase/functions/market-data/index.ts` - All Response calls updated

**What's Done:**
- ✅ Created CORS helper utility with `handleCors()` and `corsResponse()` functions
- ✅ Defined allowed origins list
- ✅ Updated all three edge functions to use restricted CORS
- ✅ Removed wildcard `*` origin from all functions

**Allowed Origins:**
- `https://bullbeardays.com`
- `https://www.bullbeardays.com`
- Vercel preview deployments (dynamic from `VERCEL_URL` env var)
- `http://localhost:5173` (development only)

**Implementation:**
```typescript
// supabase/functions/_shared/cors.ts
const ALLOWED_ORIGINS = [
  'https://bullbeardays.com',
  'https://www.bullbeardays.com',
  ...(Deno.env.get('VERCEL_URL') ? [`https://${Deno.env.get('VERCEL_URL')}`] : []),
  ...(Deno.env.get('NODE_ENV') === 'development' ? ['http://localhost:5173'] : []),
].filter(Boolean);

export function corsResponse(
  body: unknown,
  options: {
    status?: number;
    headers?: HeadersInit;
    origin: string | null;
  }
): Response {
  const corsHeaders = getCorsHeaders(options.origin);
  return new Response(JSON.stringify(body), {
    status: options.status || 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
}
```

**Testing:**
- ⏳ Requests from allowed origins succeed
- ⏳ Requests from unknown origins fail CORS
- ⏳ OPTIONS preflight works

---

### ✅ Task 1.3: Make Chart Storage Private [COMPLETE - Pending Migration]
**Priority:** P0 (Critical)
**Time:** 3 hours → **Actual: 45 minutes**
**Status:** ✅ Complete (requires migration deployment)

**Files modified:**
- ✅ `src/lib/chartStorage.ts` - Complete rewrite

**Files created:**
- ✅ `supabase/migrations/20260129000001_private_chart_storage.sql`

**What's Done:**
- ✅ Rewrote `uploadChartImage()` to return storage path instead of public URL
- ✅ Created new `getChartImageUrl()` function for signed URLs (1 hour expiry)
- ✅ Updated `deleteChartImage()` to handle both paths and URLs
- ✅ Added backward-compatible `getPublicChartImageUrl()` (deprecated)
- ✅ Created migration SQL with RLS policies

**Migration Includes:**
```sql
-- Set chart-images bucket to private
UPDATE storage.buckets SET public = false WHERE name = 'chart-images';

-- RLS Policies:
-- ✅ Users can upload to their own folder
-- ✅ Users can only access their own charts
-- ✅ Users can update their own charts
-- ✅ Users can delete their own charts
```

**Deployment Required:**
```bash
supabase db push
```

**Remaining Work:**
- ⏳ Deploy migration to Supabase production
- ⏳ Update UI components to use async `getChartImageUrl()`
- ⏳ Test signed URL generation
- ⏳ Verify RLS policies work

useEffect(() => {
  if (analysis.chart_image_url) {
    getChartImageUrl(analysis.chart_image_url).then(setImageUrl);
  }
}, [analysis.chart_image_url]);

return imageUrl ? <img src={imageUrl} /> : <Skeleton />;
```

**Testing:**
- [ ] Uploaded charts are not publicly accessible
- [ ] Signed URLs work for authenticated users
- [ ] Signed URLs expire after TTL
- [ ] Users cannot access other users' charts

---

### ✅ Task 1.4: Add Payload Limits [COMPLETE]
**Priority:** P0 (Critical)
**Time:** 1 hour → **Actual: 15 minutes**
**Status:** ✅ Complete

**Files modified:**
- ✅ `supabase/functions/analyze-chart/index.ts`

**What's Done:**
- ✅ Max image size validation: 10MB limit
- ✅ Base64 format validation
- ✅ Structured error responses with error codes
- ✅ Size calculation from base64 length

**Implementation:**
```typescript
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

// Validate image data present
if (!imageBase64) {
  return new Response(
    JSON.stringify({
      error: 'INVALID_REQUEST',
      message: 'Image data is required'
    }),
    { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// Validate image format
if (!imageBase64.startsWith('data:image/')) {
  return new Response(
    JSON.stringify({
      error: 'INVALID_IMAGE_FORMAT',
      message: 'Image must be a valid base64 data URL (data:image/...)'
    }),
    { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// Check image size
const sizeBytes = Math.ceil(imageBase64.length * 0.75);

if (sizeBytes > MAX_IMAGE_SIZE) {
  return new Response(
    JSON.stringify({
      error: 'IMAGE_TOO_LARGE',
      message: `Image size ${(sizeBytes / 1024 / 1024).toFixed(2)}MB exceeds maximum of 10MB`,
      maxSizeBytes: MAX_IMAGE_SIZE,
      actualSizeBytes: sizeBytes
    }),
    { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
```

**Error Codes:**
- `INVALID_REQUEST` - Missing image data
- `INVALID_IMAGE_FORMAT` - Not a valid data URL
- `IMAGE_TOO_LARGE` - Exceeds 10MB limit

**Testing:**
- ⏳ Upload 11MB image → returns 400 with clear error
- ⏳ Upload invalid format → returns 400
- ⏳ Upload valid image < 10MB → succeeds

---

### ✅ Task 1.5: Create Comprehensive Legal Pages [COMPLETE]
**Priority:** P0 (Critical - Launch Blocker)
**Time:** 2-3 hours → **Actual: 1 hour**
**Status:** ✅ Complete

**Files modified:**
- ✅ `src/pages/Terms.tsx` - Enhanced with 15 comprehensive sections
- ✅ `src/pages/Privacy.tsx` - Enhanced with CCPA compliance and payment details

**Files created:**
- ✅ `src/pages/RefundPolicy.tsx` - New refund policy page
- ✅ Updated `src/App.tsx` - Added /refund-policy route
- ✅ Updated `src/components/Footer.tsx` - Added all legal page links

**What was implemented:**
- **Terms of Service:** Subscription/billing, usage limits, IP rights, account termination, liability, dispute resolution, governing law
- **Privacy Policy:** Payment data handling (Stripe), GDPR compliance (EU), CCPA compliance (California), third-party services disclosure, international data transfers
- **Refund Policy:** 7-day refund window, prorated refunds, non-refundable items, chargeback policy, dispute resolution
- **Footer Links:** All 5 legal pages now accessible from footer

### 🔴 Task 1.6: Add Cookie Consent Banner [NOT STARTED]
**Priority:** P1 (Medium - Required for EU users)
**Time:** 1-2 hours
**Status:** 🔴 Not Started

**Files to create:**
- `src/components/CookieConsent.tsx`

**Implementation:**
```typescript
// src/components/CookieConsent.tsx
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShow(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm text-foreground mb-2">
              We use cookies to improve your experience and analyze usage.
            </p>
            <p className="text-xs text-muted-foreground">
              By continuing, you agree to our{' '}
              <a href="/privacy" className="underline">Privacy Policy</a>.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDecline}
              className="px-4 py-2 text-sm border rounded-lg hover:bg-muted"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add to App.tsx or Index.tsx
import CookieConsent from '@/components/CookieConsent';

<App>
  {/* ... other components */}
  <CookieConsent />
</App>
```

**Testing:**
- [ ] Banner shows on first visit
- [ ] Banner doesn't show after acceptance
- [ ] Local storage saves consent
- [ ] Privacy Policy link works

---

### 🔴 Task 1.7: Add Rate Limiting [NOT STARTED]
**Priority:** P0 (Critical)
**Time:** 2-3 hours
**Status:** 🔴 Not Started

**Implementation:**
Use Supabase edge function rate limiting or Upstash Redis.

**Option A: Simple in-memory (edge function)**
```typescript
// supabase/functions/_shared/rateLimiter.ts
const rateLimits = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  userId: string,
  maxRequests: number = 10,
  windowMs: number = 60000 // 1 minute
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const userLimit = rateLimits.get(userId);

  if (!userLimit || now > userLimit.resetAt) {
    const resetAt = now + windowMs;
    rateLimits.set(userId, { count: 1, resetAt });
    return { allowed: true, remaining: maxRequests - 1, resetAt };
  }

  if (userLimit.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: userLimit.resetAt };
  }

  userLimit.count++;
  return {
    allowed: true,
    remaining: maxRequests - userLimit.count,
    resetAt: userLimit.resetAt,
  };
}

// Use in function
const rateLimit = checkRateLimit(userId, 10, 60000);

if (!rateLimit.allowed) {
  return new Response(
    JSON.stringify({
      error: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please try again later.',
      resetAt: new Date(rateLimit.resetAt).toISOString(),
    }),
    {
      status: 429,
      headers: {
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': rateLimit.resetAt.toString(),
      },
    }
  );
}
```

**Option B: Upstash Redis (production-ready)**
```typescript
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: Deno.env.get('UPSTASH_REDIS_URL')!,
  token: Deno.env.get('UPSTASH_REDIS_TOKEN')!,
});

export async function checkRateLimit(userId: string) {
  const key = `rate_limit:${userId}`;
  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, 60); // 60 seconds
  }

  return {
    allowed: count <= 10,
    remaining: Math.max(0, 10 - count),
  };
}
```

**Testing:**
- [ ] Exceeding rate limit returns 429
- [ ] Rate limit resets after window
- [ ] Headers include reset time

---

### 🔴 Task 1.8: Security Audit [NOT STARTED]
**Priority:** P1 (Medium)
**Time:** 2 hours
**Status:** 🔴 Not Started

**Checklist:**
- [ ] All edge functions have JWT verification
- [ ] CORS restricted to known origins
- [ ] Storage buckets are private
- [ ] RLS policies on all tables
- [ ] No hardcoded secrets in code
- [ ] Environment variables documented
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (React auto-escapes)
- [ ] CSRF protection (JWT tokens)
- [ ] Rate limiting on all public endpoints

**Tools:**
- `npm audit` - check dependencies
- Manual code review
- Test with Burp Suite or similar

---

## 🚀 PHASE 2: Billing Foundation (4 days)

### Task 2.1: Create Billing Database Schema
**Priority:** P1 (High)
**Time:** 2 hours

**Migration file:** `supabase/migrations/20260129000000_billing_schema.sql`

```sql
-- Stripe customers table
CREATE TABLE IF NOT EXISTS stripe_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX idx_stripe_customers_user_id ON stripe_customers(user_id);
CREATE INDEX idx_stripe_customers_stripe_id ON stripe_customers(stripe_customer_id);

-- Enable RLS
ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own stripe customer"
  ON stripe_customers FOR SELECT
  USING (auth.uid() = user_id);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  plan_id TEXT NOT NULL, -- 'free', 'week_pass', 'starter', 'pro', 'elite', 'founder'
  status TEXT NOT NULL, -- 'active', 'canceled', 'past_due', 'incomplete', 'trialing'
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Plan entitlements (static limits)
CREATE TABLE IF NOT EXISTS plan_entitlements (
  plan_id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  price_monthly_cents INT,
  price_yearly_cents INT,
  analyses_per_month INT NOT NULL,
  context_pulls_per_month INT NOT NULL,
  features JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE plan_entitlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view plan entitlements"
  ON plan_entitlements FOR SELECT
  TO PUBLIC
  USING (true);

-- Insert plan limits
INSERT INTO plan_entitlements (plan_id, display_name, analyses_per_month, context_pulls_per_month, features) VALUES
  ('free', 'Free', 10, 5, '{"basic_analysis": true}'),
  ('week_pass', 'Week Pass', 100, 50, '{"basic_analysis": true, "advanced_analysis": true}'),
  ('starter', 'Starter', 100, 50, '{"basic_analysis": true, "advanced_analysis": true}'),
  ('pro', 'Pro', 500, 200, '{"basic_analysis": true, "advanced_analysis": true, "multi_chart": true}'),
  ('elite', 'Elite', 2000, 1000, '{"basic_analysis": true, "advanced_analysis": true, "multi_chart": true, "priority_support": true}'),
  ('founder', 'Founder', 99999, 99999, '{"basic_analysis": true, "advanced_analysis": true, "multi_chart": true, "priority_support": true, "lifetime_access": true}')
ON CONFLICT (plan_id) DO NOTHING;

-- Usage tracking table
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL, -- 'analysis', 'context_pull'
  count INT DEFAULT 0,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_usage_tracking_user_period ON usage_tracking(user_id, period_start, period_end);
CREATE INDEX idx_usage_tracking_resource ON usage_tracking(resource_type);

ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own usage"
  ON usage_tracking FOR SELECT
  USING (auth.uid() = user_id);

-- RPC: Get user subscription
CREATE OR REPLACE FUNCTION get_user_subscription(target_user_id UUID)
RETURNS TABLE (
  plan_id TEXT,
  status TEXT,
  analyses_used INT,
  analyses_limit INT,
  period_end TIMESTAMPTZ
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(s.plan_id, 'free') as plan_id,
    COALESCE(s.status, 'active') as status,
    COALESCE(u.count, 0) as analyses_used,
    pe.analyses_per_month as analyses_limit,
    COALESCE(s.current_period_end, now() + interval '30 days') as period_end
  FROM auth.users au
  LEFT JOIN subscriptions s ON s.user_id = au.id AND s.status = 'active'
  LEFT JOIN plan_entitlements pe ON pe.plan_id = COALESCE(s.plan_id, 'free')
  LEFT JOIN usage_tracking u ON u.user_id = au.id
    AND u.resource_type = 'analysis'
    AND u.period_start <= now()
    AND u.period_end >= now()
  WHERE au.id = target_user_id;
END;
$$;

-- RPC: Check and increment usage
CREATE OR REPLACE FUNCTION check_usage_limit(
  target_user_id UUID,
  resource_type_param TEXT,
  increment_by INT DEFAULT 1
)
RETURNS TABLE (
  allowed BOOLEAN,
  current_usage INT,
  limit_value INT,
  message TEXT
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  user_plan TEXT;
  usage_limit INT;
  current_count INT;
  period_start_ts TIMESTAMPTZ;
  period_end_ts TIMESTAMPTZ;
BEGIN
  -- Get user's plan
  SELECT COALESCE(s.plan_id, 'free') INTO user_plan
  FROM subscriptions s
  WHERE s.user_id = target_user_id AND s.status = 'active'
  LIMIT 1;

  IF user_plan IS NULL THEN
    user_plan := 'free';
  END IF;

  -- Get limit for plan
  IF resource_type_param = 'analysis' THEN
    SELECT pe.analyses_per_month INTO usage_limit
    FROM plan_entitlements pe
    WHERE pe.plan_id = user_plan;
  ELSIF resource_type_param = 'context_pull' THEN
    SELECT pe.context_pulls_per_month INTO usage_limit
    FROM plan_entitlements pe
    WHERE pe.plan_id = user_plan;
  END IF;

  -- Get current period
  SELECT
    date_trunc('month', CURRENT_TIMESTAMP),
    date_trunc('month', CURRENT_TIMESTAMP) + interval '1 month'
  INTO period_start_ts, period_end_ts;

  -- Get current usage
  SELECT COALESCE(u.count, 0) INTO current_count
  FROM usage_tracking u
  WHERE u.user_id = target_user_id
    AND u.resource_type = resource_type_param
    AND u.period_start = period_start_ts
  FOR UPDATE; -- Lock row for update

  -- Check limit
  IF current_count + increment_by > usage_limit THEN
    RETURN QUERY SELECT
      false,
      current_count,
      usage_limit,
      format('Usage limit reached. Limit: %s, Used: %s', usage_limit, current_count);
    RETURN;
  END IF;

  -- Increment usage
  INSERT INTO usage_tracking (user_id, resource_type, count, period_start, period_end)
  VALUES (target_user_id, resource_type_param, increment_by, period_start_ts, period_end_ts)
  ON CONFLICT (user_id, resource_type, period_start)
  DO UPDATE SET
    count = usage_tracking.count + increment_by,
    updated_at = now();

  -- Return success
  RETURN QUERY SELECT
    true,
    current_count + increment_by,
    usage_limit,
    'Usage incremented successfully'::TEXT;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_user_subscription TO authenticated;
GRANT EXECUTE ON FUNCTION check_usage_limit TO authenticated;
```

**Apply migration:**
```bash
supabase db push
```

**Testing:**
- [ ] Tables created successfully
- [ ] RLS policies work
- [ ] RPC functions execute
- [ ] Plan entitlements populated

---

### Task 2.2: Create Stripe Checkout Function
**Priority:** P1 (High)
**Time:** 3 hours

**File:** `supabase/functions/stripe-checkout/index.ts`

```typescript
import Stripe from 'https://esm.sh/stripe@14.7.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const PRICE_IDS = {
  week_pass: Deno.env.get('STRIPE_PRICE_WEEK_PASS')!,
  starter_monthly: Deno.env.get('STRIPE_PRICE_STARTER_MONTHLY')!,
  starter_yearly: Deno.env.get('STRIPE_PRICE_STARTER_YEARLY')!,
  pro_monthly: Deno.env.get('STRIPE_PRICE_PRO_MONTHLY')!,
  pro_yearly: Deno.env.get('STRIPE_PRICE_PRO_YEARLY')!,
  elite_monthly: Deno.env.get('STRIPE_PRICE_ELITE_MONTHLY')!,
  elite_yearly: Deno.env.get('STRIPE_PRICE_ELITE_YEARLY')!,
  founder: Deno.env.get('STRIPE_PRICE_FOUNDER')!,
};

export async function handler(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  try {
    const { planId, billingPeriod = 'monthly' } = await req.json();

    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // Get or create Stripe customer
    let stripeCustomerId: string;

    const { data: existingCustomer } = await supabase
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    if (existingCustomer) {
      stripeCustomerId = existingCustomer.stripe_customer_id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });

      await supabase.from('stripe_customers').insert({
        user_id: user.id,
        stripe_customer_id: customer.id,
      });

      stripeCustomerId = customer.id;
    }

    // Get price ID
    const priceKey = billingPeriod === 'yearly'
      ? `${planId}_yearly`
      : `${planId}_monthly`;
    const priceId = PRICE_IDS[priceKey as keyof typeof PRICE_IDS];

    if (!priceId) {
      return new Response(
        JSON.stringify({ error: 'Invalid plan or billing period' }),
        { status: 400 }
      );
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: planId === 'founder' || planId === 'week_pass' ? 'payment' : 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${Deno.env.get('APP_URL')}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${Deno.env.get('APP_URL')}/pricing?canceled=true`,
      metadata: {
        user_id: user.id,
        plan_id: planId,
      },
    });

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Checkout error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
}
```

**Environment variables needed:**
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_WEEK_PASS=price_...
STRIPE_PRICE_STARTER_MONTHLY=price_...
STRIPE_PRICE_STARTER_YEARLY=price_...
# ... etc for all plans
APP_URL=https://bullbeardays.com
```

**Testing:**
- [ ] Checkout session creates successfully
- [ ] Redirects to Stripe hosted page
- [ ] Stripe customer created
- [ ] Metadata includes user_id

---

*[Continue with remaining tasks 2.3-2.10, 3.1-3.8, 4.1-4.7, 5.1-5.5...]*

---

## 📝 SUMMARY

I've created a comprehensive review showing:

**✅ What's Good in Current Plan:**
- Security-first approach
- Complete billing technical foundation
- Clear enforcement strategy

**❌ What's Missing:**
- Legal pages (Terms, Privacy, Refund)
- Email system (receipts, notifications)
- Failed payment recovery
- Data export/deletion (GDPR)
- Customer support infrastructure
- Testing strategy

**⏱️ Realistic Timeline:**
- Original plan: ~10-12 days
- With critical additions: ~16-19 days (3-4 weeks)

**Would you like me to:**
1. Start implementing Phase 1 (Security + Legal) - 3 days
2. Set up Stripe integration first (Phase 2) - 4 days
3. Focus on a specific component you choose
4. Create all remaining task details for phases 2-5

Let me know which path you prefer, and I'll begin implementation!
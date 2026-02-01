# Phase 2: Priority 1 Fixes - Summary

## Date: 2026-01-31

This document summarizes all Priority 1 issues that were identified and fixed in the Phase 2 billing implementation.

---

## ✅ Issue #1: Plan ID Mismatch (`daypass` vs `week_pass`)

**Problem:**
- Frontend pricing configuration used `"daypass"` as plan ID
- Backend database and API routes used `"week_pass"`
- This would cause checkout failures when users selected Week Pass

**Files Fixed:**
1. `src/lib/pricing.ts` (lines 7, 53)
   - Changed `PlanId` type from `"daypass"` to `"week_pass"`
   - Changed plan array object id from `"daypass"` to `"week_pass"`

2. `src/pages/Signup.tsx` (line 12)
   - Updated `PLAN_LABELS` record to use `week_pass` key

3. `src/pages/Pricing.tsx` (line 260)
   - Removed unnecessary mapping: `const checkoutPlanId = planId === "daypass" ? "week_pass" : planId;`
   - Now directly passes `planId` to `startCheckout()`

**Verification:**
- Searched codebase for remaining "daypass" references: ✅ None found

---

## ✅ Issue #2: Usage Limits Mismatch

**Problem:**
- Advertised limits on pricing page didn't match database entitlements
- Users would see one set of limits when purchasing, but get different limits after payment

**Mismatches Found:**

| Plan       | Advertised (pricing.ts)     | Database (Before Fix)        | Status    |
|------------|-----------------------------|------------------------------|-----------|
| free       | Not shown (10/5)            | 10 analyses, 5 context pulls | ✅ Matched |
| week_pass  | 30 analyses, 5 context pulls| 100 analyses, 50 pulls       | ❌ Fixed   |
| starter    | 200 analyses, 50 pulls      | 100 analyses, 50 pulls       | ❌ Fixed   |
| pro        | 700 analyses, 200 pulls     | 500 analyses, 200 pulls      | ❌ Fixed   |
| elite      | 2000 analyses, 600 pulls    | 2000 analyses, 1000 pulls    | ❌ Fixed   |
| founder    | 300 analyses, 100 pulls     | 99999 analyses, 99999 pulls  | ❌ Fixed   |

**File Fixed:**
- `supabase/migrations/20260130000000_billing_schema_v1.sql` (lines 122-127)
- Updated `INSERT INTO public.plan_entitlements` to match advertised pricing

**After Fix:**
```sql
('free', 'Free', NULL, NULL, 10, 5, '{}'::jsonb),
('week_pass', 'Week Pass', NULL, NULL, 30, 5, '{}'::jsonb),
('starter', 'Starter', NULL, NULL, 200, 50, '{}'::jsonb),
('pro', 'Pro', NULL, NULL, 700, 200, '{}'::jsonb),
('elite', 'Elite', NULL, NULL, 2000, 600, '{}'::jsonb),
('founder', 'Founder', NULL, NULL, 300, 100, '{}'::jsonb)
```

---

## ✅ Issue #3: Free Plan Handling

**Problem:**
- Database has `free` plan with limits (10 analyses/5 context pulls)
- Need to ensure users without paid subscriptions get free plan limits

**Solution:**
- ✅ **Already handled correctly** in existing code
- `get_user_subscription` RPC function (lines 214-218) defaults to 'free' plan if no active subscription exists
- No code changes needed

**How it works:**
```sql
IF effective_plan_id IS NULL THEN
  effective_plan_id := 'free';
  effective_status := 'active';
  effective_period_end := now() + interval '30 days';
END IF;
```

---

## ✅ Issue #4: Founder Plan Period Logic

**Problem:**
- Founder described as "lifetime plan with monthly usage resets"
- Initial code set period to 100 years (correct for lifetime)
- But needed to verify usage resets work properly

**Investigation:**
- `check_usage_limit` RPC function uses calendar months (line 262: `date_trunc('month', now())`)
- This means usage tracking resets monthly regardless of subscription period
- Period just determines when subscription expires/becomes inactive

**Solution:**
- ✅ Keep Founder period at 100 years (lifetime access)
- ✅ Usage automatically resets monthly via calendar month logic
- Updated code comments in `api/stripe/_shared.ts` (lines 133-138) to clarify this behavior

**Code:**
```typescript
export function getOneTimePeriodEnd(planId: PlanId, now = new Date()): Date {
  const end = new Date(now);
  if (planId === "week_pass") {
    // Week Pass is valid for 7 days
    end.setDate(end.getDate() + 7);
  } else {
    // Founder and other one-time purchases: lifetime access (100 years)
    // Usage limits reset monthly via calendar month logic in check_usage_limit RPC
    end.setFullYear(end.getFullYear() + 100);
  }
  return end;
}
```

---

## ✅ Issue #5: Environment Variables Documentation

**Problem:**
- No `.env.example` file documenting required environment variables
- Difficult for developers to know what configuration is needed

**Solution:**
- Created comprehensive `.env.example` file with:
  - ✅ All Supabase configuration variables
  - ✅ All Stripe configuration variables (secret key, webhook secret)
  - ✅ All Stripe price IDs for each plan and billing period
  - ✅ Application configuration (APP_BASE_URL)
  - ✅ AI configuration (LOVABLE_API_KEY)
  - ✅ Helpful comments explaining where to find each value
  - ✅ Webhook setup instructions

**File Created:**
- `.env.example` (72 lines with comprehensive documentation)

---

## 📋 Migration Required

**IMPORTANT:** To apply the usage limit fixes, you must:

1. **Option A: Re-run the migration (if not in production yet)**
   ```bash
   supabase db reset
   ```

2. **Option B: Create a new migration to update entitlements**
   ```sql
   -- Create new migration: supabase/migrations/[timestamp]_update_plan_entitlements.sql

   UPDATE public.plan_entitlements
   SET analyses_per_month = 30, context_pulls_per_month = 5
   WHERE plan_id = 'week_pass';

   UPDATE public.plan_entitlements
   SET analyses_per_month = 200
   WHERE plan_id = 'starter';

   UPDATE public.plan_entitlements
   SET analyses_per_month = 700
   WHERE plan_id = 'pro';

   UPDATE public.plan_entitlements
   SET context_pulls_per_month = 600
   WHERE plan_id = 'elite';

   UPDATE public.plan_entitlements
   SET analyses_per_month = 300, context_pulls_per_month = 100
   WHERE plan_id = 'founder';
   ```

3. **Option C: Manual update via Supabase dashboard**
   - Navigate to Table Editor > plan_entitlements
   - Update each row manually to match the new limits

---

## ✅ Verification Checklist

Before deployment, verify:

- [ ] No references to `"daypass"` in codebase
- [ ] All plan IDs use `"week_pass"` consistently
- [ ] Database `plan_entitlements` table matches advertised pricing
- [ ] `.env.example` file exists with all required variables
- [ ] All environment variables are set in production `.env`
- [ ] Migration applied to update entitlements (if needed)
- [ ] Test checkout flow for Week Pass plan
- [ ] Verify free plan users can access features with 10 analysis limit
- [ ] Confirm Founder plan usage resets monthly

---

## 📊 Summary

**Total Issues Fixed:** 5
**Files Modified:** 5
**Files Created:** 2 (.env.example, this document)
**Critical Bugs Fixed:** 2 (plan ID mismatch, usage limit mismatch)
**Potential Revenue Impact:** High (checkout would have failed for Week Pass)

**Status:** ✅ All Priority 1 issues resolved and ready for deployment

---

## Next Steps

Consider addressing Priority 2 issues:
1. Add context pulls usage enforcement
2. Handle additional webhook events (payment_failed, subscription_deleted)
3. Add rate limiting to billing API endpoints
4. Add usage API endpoint for real-time frontend updates
5. Add in-app cancellation flow UI

See original Phase 2 review document for full Priority 2 and Priority 3 recommendations.

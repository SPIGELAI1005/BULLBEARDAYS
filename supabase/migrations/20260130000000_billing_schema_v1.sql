-- Migration: Billing schema v1 (Stripe customers/subscriptions/usage)
-- Date: 2026-01-30
--
-- Notes:
-- - Stripe is the source of truth; DB stores cached status and usage counters.
-- - Usage resets by calendar month.
-- - stripe_events provides idempotency/debugging for webhooks.

-- Required for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) stripe_customers
CREATE TABLE IF NOT EXISTS public.stripe_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT stripe_customers_user_id_unique UNIQUE (user_id),
  CONSTRAINT stripe_customers_stripe_customer_id_unique UNIQUE (stripe_customer_id)
);

CREATE INDEX IF NOT EXISTS stripe_customers_stripe_customer_id_idx
ON public.stripe_customers (stripe_customer_id);

ALTER TABLE public.stripe_customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own stripe customer" ON public.stripe_customers;
CREATE POLICY "Users can view their own stripe customer"
ON public.stripe_customers
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_stripe_customers_updated_at ON public.stripe_customers;
CREATE TRIGGER update_stripe_customers_updated_at
BEFORE UPDATE ON public.stripe_customers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.stripe_customers IS 'Stripe customer mapping (Stripe is source of truth; DB stores cached status and IDs).';

-- 2) subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  plan_id TEXT NOT NULL, -- free, week_pass, starter, pro, elite, founder
  status TEXT NOT NULL,  -- active, trialing, past_due, incomplete, canceled, etc.
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  canceled_at TIMESTAMPTZ NULL,
  trial_end TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT subscriptions_stripe_subscription_id_unique UNIQUE (stripe_subscription_id)
);

CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx
ON public.subscriptions (user_id);

CREATE INDEX IF NOT EXISTS subscriptions_stripe_customer_id_idx
ON public.subscriptions (stripe_customer_id);

CREATE INDEX IF NOT EXISTS subscriptions_status_idx
ON public.subscriptions (status);

-- At most one active-ish subscription per user (do NOT enforce UNIQUE(user_id) globally)
CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_user_id_activeish_unique
ON public.subscriptions (user_id)
WHERE status IN ('active', 'trialing', 'past_due', 'incomplete');

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can view their own subscriptions"
ON public.subscriptions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.subscriptions IS 'Stripe subscription cache (Stripe is source of truth; DB stores cached status and period bounds).';

-- 3) plan_entitlements
CREATE TABLE IF NOT EXISTS public.plan_entitlements (
  plan_id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  price_monthly_cents INT NULL,
  price_yearly_cents INT NULL,
  analyses_per_month INT NOT NULL,
  context_pulls_per_month INT NOT NULL,
  features JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.plan_entitlements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view plan entitlements" ON public.plan_entitlements;
CREATE POLICY "Public can view plan entitlements"
ON public.plan_entitlements
FOR SELECT
TO public
USING (true);

INSERT INTO public.plan_entitlements (
  plan_id,
  display_name,
  price_monthly_cents,
  price_yearly_cents,
  analyses_per_month,
  context_pulls_per_month,
  features
) VALUES
  ('free', 'Free', NULL, NULL, 10, 5, '{}'::jsonb),
  ('week_pass', 'Week Pass', NULL, NULL, 30, 5, '{}'::jsonb),
  ('starter', 'Starter', NULL, NULL, 200, 50, '{}'::jsonb),
  ('pro', 'Pro', NULL, NULL, 700, 200, '{}'::jsonb),
  ('elite', 'Elite', NULL, NULL, 2000, 600, '{}'::jsonb),
  ('founder', 'Founder', NULL, NULL, 300, 100, '{}'::jsonb)
ON CONFLICT (plan_id) DO NOTHING;

COMMENT ON TABLE public.plan_entitlements IS 'Plan entitlements (Usage resets by calendar month).';

-- 4) usage_tracking
CREATE TABLE IF NOT EXISTS public.usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL, -- analysis, context_pull
  count INT NOT NULL DEFAULT 0,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT usage_tracking_user_resource_period_unique UNIQUE (user_id, resource_type, period_start)
);

CREATE INDEX IF NOT EXISTS usage_tracking_user_resource_period_idx
ON public.usage_tracking (user_id, resource_type, period_start);

ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own usage" ON public.usage_tracking;
CREATE POLICY "Users can view their own usage"
ON public.usage_tracking
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_usage_tracking_updated_at ON public.usage_tracking;
CREATE TRIGGER update_usage_tracking_updated_at
BEFORE UPDATE ON public.usage_tracking
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.usage_tracking IS 'Usage counters by calendar month (Usage resets by calendar month).';

-- 5) stripe_events (webhook idempotency + audit)
CREATE TABLE IF NOT EXISTS public.stripe_events (
  event_id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  created TIMESTAMPTZ NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  payload JSONB NOT NULL
);

ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.stripe_events IS 'Stripe webhook event store for idempotency/debugging (stripe_events provides idempotency/debugging for webhooks).';

-- RPC A) get_user_subscription(target_user_id UUID)
CREATE OR REPLACE FUNCTION public.get_user_subscription(target_user_id UUID)
RETURNS TABLE (
  plan_id TEXT,
  status TEXT,
  analyses_used INT,
  analyses_limit INT,
  period_end TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  effective_plan_id TEXT;
  effective_status TEXT;
  effective_period_end TIMESTAMPTZ;
  month_start TIMESTAMPTZ := date_trunc('month', now());
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  IF target_user_id <> auth.uid() AND auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  SELECT s.plan_id, s.status, s.current_period_end
  INTO effective_plan_id, effective_status, effective_period_end
  FROM public.subscriptions s
  WHERE s.user_id = target_user_id
    AND s.status IN ('active', 'trialing', 'past_due', 'incomplete')
  ORDER BY s.current_period_end DESC
  LIMIT 1;

  IF effective_plan_id IS NULL THEN
    effective_plan_id := 'free';
    effective_status := 'active';
    effective_period_end := now() + interval '30 days';
  END IF;

  RETURN QUERY
  SELECT
    effective_plan_id,
    effective_status,
    COALESCE((
      SELECT ut.count
      FROM public.usage_tracking ut
      WHERE ut.user_id = target_user_id
        AND ut.resource_type = 'analysis'
        AND ut.period_start = month_start
      LIMIT 1
    ), 0),
    COALESCE((
      SELECT pe.analyses_per_month
      FROM public.plan_entitlements pe
      WHERE pe.plan_id = effective_plan_id
      LIMIT 1
    ), 0),
    effective_period_end;
END;
$$;

COMMENT ON FUNCTION public.get_user_subscription(UUID) IS 'Returns effective plan/status and usage for the current calendar month (Usage resets by calendar month; Stripe is source of truth; DB stores cached status).';

-- RPC B) check_usage_limit(target_user_id UUID, resource_type_param TEXT, increment_by INT DEFAULT 1)
CREATE OR REPLACE FUNCTION public.check_usage_limit(
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
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  effective_plan_id TEXT;
  month_start TIMESTAMPTZ := date_trunc('month', now());
  month_end TIMESTAMPTZ := date_trunc('month', now()) + interval '1 month';
BEGIN
  IF auth.uid() IS NULL THEN
    allowed := false;
    current_usage := 0;
    limit_value := 0;
    message := 'not authenticated';
    RETURN NEXT;
    RETURN;
  END IF;

  IF target_user_id <> auth.uid() AND auth.role() <> 'service_role' THEN
    allowed := false;
    current_usage := 0;
    limit_value := 0;
    message := 'not authorized';
    RETURN NEXT;
    RETURN;
  END IF;

  IF increment_by IS NULL OR increment_by <= 0 THEN
    allowed := false;
    current_usage := 0;
    limit_value := 0;
    message := 'increment_by must be positive';
    RETURN NEXT;
    RETURN;
  END IF;

  -- Determine active-ish plan (fallback to free)
  SELECT s.plan_id
  INTO effective_plan_id
  FROM public.subscriptions s
  WHERE s.user_id = target_user_id
    AND s.status IN ('active', 'trialing', 'past_due', 'incomplete')
  ORDER BY s.current_period_end DESC
  LIMIT 1;

  IF effective_plan_id IS NULL THEN
    effective_plan_id := 'free';
  END IF;

  -- Resolve entitlement limit for the resource type
  SELECT
    CASE resource_type_param
      WHEN 'analysis' THEN pe.analyses_per_month
      WHEN 'context_pull' THEN pe.context_pulls_per_month
      ELSE 0
    END
  INTO limit_value
  FROM public.plan_entitlements pe
  WHERE pe.plan_id = effective_plan_id
  LIMIT 1;

  limit_value := COALESCE(limit_value, 0);

  -- Lock existing usage row (if present)
  SELECT ut.count
  INTO current_usage
  FROM public.usage_tracking ut
  WHERE ut.user_id = target_user_id
    AND ut.resource_type = resource_type_param
    AND ut.period_start = month_start
  FOR UPDATE;

  current_usage := COALESCE(current_usage, 0);

  IF current_usage + increment_by > limit_value THEN
    allowed := false;
    message := 'usage limit reached for current month';
    RETURN NEXT;
    RETURN;
  END IF;

  -- Upsert + increment atomically (ON CONFLICT uses UNIQUE(user_id, resource_type, period_start))
  INSERT INTO public.usage_tracking (
    user_id,
    resource_type,
    count,
    period_start,
    period_end
  ) VALUES (
    target_user_id,
    resource_type_param,
    increment_by,
    month_start,
    month_end
  )
  ON CONFLICT (user_id, resource_type, period_start)
  DO UPDATE SET
    count = public.usage_tracking.count + EXCLUDED.count,
    period_end = EXCLUDED.period_end
  RETURNING public.usage_tracking.count
  INTO current_usage;

  allowed := true;
  message := 'ok';
  RETURN NEXT;
END;
$$;

COMMENT ON FUNCTION public.check_usage_limit(UUID, TEXT, INT) IS 'Checks and increments usage for the current calendar month (Usage resets by calendar month; Stripe is source of truth; DB stores cached status).';

GRANT EXECUTE ON FUNCTION public.get_user_subscription(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_usage_limit(UUID, TEXT, INT) TO authenticated;

-- Grants (RLS still applies; writes are via service role / SECURITY DEFINER RPC)
GRANT SELECT ON TABLE public.plan_entitlements TO anon, authenticated;
GRANT SELECT ON TABLE public.stripe_customers TO authenticated;
GRANT SELECT ON TABLE public.subscriptions TO authenticated;
GRANT SELECT ON TABLE public.usage_tracking TO authenticated;


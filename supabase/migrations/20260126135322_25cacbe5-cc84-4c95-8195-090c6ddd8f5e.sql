-- Create rate limiting table
CREATE TABLE public.rate_limits (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  endpoint text NOT NULL,
  request_count integer NOT NULL DEFAULT 1,
  window_start timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

-- Enable RLS (no policies - only service role access)
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Create index for fast lookups
CREATE INDEX idx_rate_limits_user_endpoint ON public.rate_limits(user_id, endpoint);
CREATE INDEX idx_rate_limits_window ON public.rate_limits(window_start);

-- Function to check and update rate limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_user_id uuid,
  p_endpoint text,
  p_max_requests integer DEFAULT 30,
  p_window_minutes integer DEFAULT 1
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_count integer;
  v_window_start timestamp with time zone;
BEGIN
  -- Get current rate limit record
  SELECT request_count, window_start INTO v_current_count, v_window_start
  FROM rate_limits
  WHERE user_id = p_user_id AND endpoint = p_endpoint
  FOR UPDATE;

  -- If no record exists or window expired, create/reset
  IF v_current_count IS NULL OR v_window_start < now() - (p_window_minutes || ' minutes')::interval THEN
    INSERT INTO rate_limits (user_id, endpoint, request_count, window_start)
    VALUES (p_user_id, p_endpoint, 1, now())
    ON CONFLICT (user_id, endpoint) 
    DO UPDATE SET request_count = 1, window_start = now();
    RETURN true;
  END IF;

  -- Check if limit exceeded
  IF v_current_count >= p_max_requests THEN
    RETURN false;
  END IF;

  -- Increment counter
  UPDATE rate_limits
  SET request_count = request_count + 1
  WHERE user_id = p_user_id AND endpoint = p_endpoint;

  RETURN true;
END;
$$;

-- Cleanup function for old rate limit records
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM rate_limits WHERE window_start < now() - interval '1 hour';
END;
$$;
/**
 * Rate Limiting Helper for Supabase Edge Functions
 * Works with the check_rate_limit database function
 */

import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface RateLimitConfig {
  maxRequests: number;
  windowMinutes: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  headers: Record<string, string>;
}

// Default rate limits per endpoint
export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  'analyze-chart': { maxRequests: 10, windowMinutes: 1 },
  'analyze-market': { maxRequests: 20, windowMinutes: 1 },
  'market-data': { maxRequests: 60, windowMinutes: 1 },
};

/**
 * Check rate limit for a user and endpoint
 * Returns rate limit status with headers for client feedback
 */
export async function checkRateLimit(
  supabase: SupabaseClient,
  userId: string,
  endpoint: string,
  customConfig?: RateLimitConfig
): Promise<RateLimitResult> {
  const config = customConfig || RATE_LIMITS[endpoint] || { maxRequests: 30, windowMinutes: 1 };

  try {
    // Call database function to check/update rate limit
    const { data: allowed, error } = await supabase.rpc('check_rate_limit', {
      p_user_id: userId,
      p_endpoint: endpoint,
      p_max_requests: config.maxRequests,
      p_window_minutes: config.windowMinutes,
    });

    if (error) {
      console.error('Rate limit check error:', error);
      // Fail open - allow request if rate limit check fails
      return {
        allowed: true,
        remaining: config.maxRequests,
        resetAt: new Date(Date.now() + config.windowMinutes * 60 * 1000),
        headers: {},
      };
    }

    // Get current usage to calculate remaining
    const { data: rateLimitData } = await supabase
      .from('rate_limits')
      .select('request_count, window_start')
      .eq('user_id', userId)
      .eq('endpoint', endpoint)
      .single();

    const requestCount = rateLimitData?.request_count || 0;
    const windowStart = rateLimitData?.window_start
      ? new Date(rateLimitData.window_start)
      : new Date();

    const resetAt = new Date(windowStart.getTime() + config.windowMinutes * 60 * 1000);
    const remaining = Math.max(0, config.maxRequests - requestCount);

    const headers = {
      'X-RateLimit-Limit': config.maxRequests.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': Math.floor(resetAt.getTime() / 1000).toString(), // Unix timestamp
      'X-RateLimit-Window': `${config.windowMinutes}m`,
    };

    // If rate limit exceeded, add Retry-After header
    if (!allowed) {
      const retryAfterSeconds = Math.ceil((resetAt.getTime() - Date.now()) / 1000);
      headers['Retry-After'] = Math.max(1, retryAfterSeconds).toString();
    }

    return {
      allowed: allowed || false,
      remaining,
      resetAt,
      headers,
    };
  } catch (error) {
    console.error('Rate limiter error:', error);
    // Fail open - allow request if something goes wrong
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetAt: new Date(Date.now() + config.windowMinutes * 60 * 1000),
      headers: {},
    };
  }
}

/**
 * Create a rate limit exceeded response
 */
export function rateLimitExceededResponse(rateLimitResult: RateLimitResult, origin: string | null) {
  const { resetAt, remaining } = rateLimitResult;
  const resetInSeconds = Math.ceil((resetAt.getTime() - Date.now()) / 1000);

  return {
    error: 'RATE_LIMIT_EXCEEDED',
    message: `Rate limit exceeded. Please try again in ${resetInSeconds} seconds.`,
    remaining: 0,
    resetAt: resetAt.toISOString(),
    resetInSeconds,
  };
}

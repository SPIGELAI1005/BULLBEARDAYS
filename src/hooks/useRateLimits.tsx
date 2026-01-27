import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";

export interface RateLimitInfo {
  endpoint: string;
  limit: number;
  remaining: number;
  resetAt: Date;
  isLimited: boolean;
}

interface RateLimitState {
  analyzeChart: RateLimitInfo;
  analyzeMarket: RateLimitInfo;
  marketData: RateLimitInfo;
}

const DEFAULT_LIMITS = {
  analyzeChart: { limit: 10, window: 60000 }, // 10 per minute
  analyzeMarket: { limit: 20, window: 60000 }, // 20 per minute
  marketData: { limit: 60, window: 60000 },   // 60 per minute
};

export const useRateLimits = () => {
  const { user } = useAuth();
  const [rateLimits, setRateLimits] = useState<RateLimitState>({
    analyzeChart: {
      endpoint: "analyze-chart",
      limit: DEFAULT_LIMITS.analyzeChart.limit,
      remaining: DEFAULT_LIMITS.analyzeChart.limit,
      resetAt: new Date(Date.now() + DEFAULT_LIMITS.analyzeChart.window),
      isLimited: false,
    },
    analyzeMarket: {
      endpoint: "analyze-market",
      limit: DEFAULT_LIMITS.analyzeMarket.limit,
      remaining: DEFAULT_LIMITS.analyzeMarket.limit,
      resetAt: new Date(Date.now() + DEFAULT_LIMITS.analyzeMarket.window),
      isLimited: false,
    },
    marketData: {
      endpoint: "market-data",
      limit: DEFAULT_LIMITS.marketData.limit,
      remaining: DEFAULT_LIMITS.marketData.limit,
      resetAt: new Date(Date.now() + DEFAULT_LIMITS.marketData.window),
      isLimited: false,
    },
  });

  // Parse rate limit headers from API response
  const updateFromHeaders = useCallback((endpoint: keyof RateLimitState, headers: Headers) => {
    const limit = parseInt(headers.get("X-RateLimit-Limit") || "0");
    const remaining = parseInt(headers.get("X-RateLimit-Remaining") || "0");
    const reset = parseInt(headers.get("X-RateLimit-Reset") || "0");

    if (limit > 0) {
      setRateLimits((prev) => ({
        ...prev,
        [endpoint]: {
          endpoint,
          limit,
          remaining,
          resetAt: new Date(reset * 1000),
          isLimited: remaining === 0,
        },
      }));
    }
  }, []);

  // Decrement remaining count locally (optimistic update)
  const decrementRemaining = useCallback((endpoint: keyof RateLimitState) => {
    setRateLimits((prev) => ({
      ...prev,
      [endpoint]: {
        ...prev[endpoint],
        remaining: Math.max(0, prev[endpoint].remaining - 1),
        isLimited: prev[endpoint].remaining - 1 <= 0,
      },
    }));
  }, []);

  // Get time until rate limit resets
  const getTimeUntilReset = useCallback((endpoint: keyof RateLimitState): number => {
    const now = Date.now();
    const resetTime = rateLimits[endpoint].resetAt.getTime();
    return Math.max(0, Math.ceil((resetTime - now) / 1000));
  }, [rateLimits]);

  // Format time remaining as human-readable string
  const formatTimeRemaining = useCallback((endpoint: keyof RateLimitState): string => {
    const seconds = getTimeUntilReset(endpoint);

    if (seconds === 0) return "Available now";
    if (seconds < 60) return `${seconds}s`;

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (remainingSeconds === 0) return `${minutes}m`;
    return `${minutes}m ${remainingSeconds}s`;
  }, [getTimeUntilReset]);

  // Check if user can make request
  const canMakeRequest = useCallback((endpoint: keyof RateLimitState): boolean => {
    const limit = rateLimits[endpoint];

    // If limit is reset, allow request
    if (Date.now() >= limit.resetAt.getTime()) {
      return true;
    }

    return limit.remaining > 0;
  }, [rateLimits]);

  // Get usage percentage
  const getUsagePercentage = useCallback((endpoint: keyof RateLimitState): number => {
    const limit = rateLimits[endpoint];
    return ((limit.limit - limit.remaining) / limit.limit) * 100;
  }, [rateLimits]);

  // Auto-reset when time expires
  useEffect(() => {
    const intervals: NodeJS.Timeout[] = [];

    Object.keys(rateLimits).forEach((key) => {
      const endpoint = key as keyof RateLimitState;
      const limit = rateLimits[endpoint];

      if (limit.isLimited) {
        const timeUntilReset = getTimeUntilReset(endpoint);

        const interval = setInterval(() => {
          const now = Date.now();
          if (now >= limit.resetAt.getTime()) {
            setRateLimits((prev) => ({
              ...prev,
              [endpoint]: {
                ...prev[endpoint],
                remaining: prev[endpoint].limit,
                resetAt: new Date(now + DEFAULT_LIMITS[endpoint].window),
                isLimited: false,
              },
            }));
            clearInterval(interval);
          }
        }, 1000);

        intervals.push(interval);
      }
    });

    return () => {
      intervals.forEach(clearInterval);
    };
  }, [rateLimits, getTimeUntilReset]);

  return {
    rateLimits,
    updateFromHeaders,
    decrementRemaining,
    canMakeRequest,
    getTimeUntilReset,
    formatTimeRemaining,
    getUsagePercentage,
  };
};

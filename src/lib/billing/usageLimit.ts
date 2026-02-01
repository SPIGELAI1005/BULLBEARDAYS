export interface UsageLimitReachedError extends Error {
  code: "USAGE_LIMIT_REACHED";
  currentUsage?: number;
  limitValue?: number;
}

export function createUsageLimitReachedError(args: {
  message: string;
  currentUsage?: number;
  limitValue?: number;
}): UsageLimitReachedError {
  const error = new Error(args.message) as UsageLimitReachedError;
  error.code = "USAGE_LIMIT_REACHED";
  error.currentUsage = args.currentUsage;
  error.limitValue = args.limitValue;
  return error;
}

export function isUsageLimitReachedError(error: unknown): error is UsageLimitReachedError {
  return (
    error instanceof Error &&
    typeof (error as { code?: unknown }).code === "string" &&
    (error as { code?: string }).code === "USAGE_LIMIT_REACHED"
  );
}


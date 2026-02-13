export type ProviderErrorCode =
  | "AI_PROVIDER_BILLING_ERROR"
  | "AI_PROVIDER_RATE_LIMIT"
  | "AI_PROVIDER_ERROR";

export interface ProviderErrorDetails {
  code: ProviderErrorCode;
  message: string;
  providerHint?: string;
  httpStatus?: number;
}

export interface ProviderError extends Error {
  code: ProviderErrorCode;
  providerHint?: string;
  httpStatus?: number;
}

export function createProviderError(details: ProviderErrorDetails): ProviderError {
  const err = new Error(details.message) as ProviderError;
  err.code = details.code;
  err.providerHint = details.providerHint;
  err.httpStatus = details.httpStatus;
  return err;
}

export function isProviderError(error: unknown): error is ProviderError {
  return (
    error instanceof Error &&
    typeof (error as { code?: unknown }).code === "string" &&
    String((error as { code?: string }).code).startsWith("AI_PROVIDER_")
  );
}

export function isProviderBillingError(error: unknown): boolean {
  return isProviderError(error) && (error as ProviderError).code === "AI_PROVIDER_BILLING_ERROR";
}

export function isProviderRateLimitError(error: unknown): boolean {
  return isProviderError(error) && (error as ProviderError).code === "AI_PROVIDER_RATE_LIMIT";
}

import { supabase } from "@/integrations/supabase/client";
import type { BillingPeriod } from "@/lib/pricing";

interface CheckoutResponse {
  url: string;
}

interface ApiErrorPayload {
  error?: { message?: string } | string;
  message?: string;
}

export interface AuthRequiredError extends Error {
  code: "AUTH_REQUIRED";
}

function createAuthRequiredError(): AuthRequiredError {
  const error = new Error("Authentication required") as AuthRequiredError;
  error.code = "AUTH_REQUIRED";
  return error;
}

export function isAuthRequiredError(error: unknown): error is AuthRequiredError {
  return (
    error instanceof Error &&
    typeof (error as { code?: unknown }).code === "string" &&
    (error as { code?: string }).code === "AUTH_REQUIRED"
  );
}

function parseJsonSafely(text: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function getApiErrorMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const p = payload as ApiErrorPayload;
  if (typeof p.message === "string" && p.message.trim()) return p.message;
  if (typeof p.error === "string" && p.error.trim()) return p.error;
  if (p.error && typeof p.error === "object") {
    const message = p.error.message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return null;
}

export async function startCheckout(planId: string, billingPeriod: BillingPeriod): Promise<void> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error("Unable to verify your session. Please try again.");

  const token = data.session?.access_token;
  if (!token) throw createAuthRequiredError();

  const response = await fetch("/api/stripe/checkout", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ planId, billingPeriod }),
  });

  const text = await response.text();
  const json = text ? parseJsonSafely(text) : null;

  if (!response.ok) {
    const messageFromApi = getApiErrorMessage(json);
    throw new Error(messageFromApi ?? "Unable to start checkout. Please try again.");
  }

  if (!json || typeof json !== "object") {
    throw new Error("Unexpected checkout response. Please try again.");
  }

  const { url } = json as CheckoutResponse;
  if (typeof url !== "string" || !url.trim()) {
    throw new Error("Checkout URL was missing. Please try again.");
  }

  window.location.href = url;
}


import { supabase } from "@/integrations/supabase/client";

interface PortalResponse {
  url: string;
}

interface ApiErrorPayload {
  error?: { message?: string } | string;
  message?: string;
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

export async function startPortal(): Promise<void> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error("Unable to verify your session. Please try again.");

  const token = data.session?.access_token;
  if (!token) {
    // Reuse the same AUTH_REQUIRED shape so callers can handle consistently.
    throw Object.assign(new Error("Authentication required"), { code: "AUTH_REQUIRED" });
  }

  const response = await fetch("/api/stripe/portal", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const text = await response.text();
  const json = text ? parseJsonSafely(text) : null;

  if (!response.ok) {
    const messageFromApi = getApiErrorMessage(json);
    const message = messageFromApi ?? "Unable to open billing portal. Please try again.";
    // Preserve AUTH_REQUIRED if returned by the API
    if (typeof json === "object" && json) {
      const errorCode = (json as Record<string, unknown>).error;
      if (errorCode === "AUTH_REQUIRED") {
        throw Object.assign(new Error(message), { code: "AUTH_REQUIRED" });
      }
    }
    throw new Error(message);
  }

  if (!json || typeof json !== "object") throw new Error("Unexpected portal response. Please try again.");

  const { url } = json as PortalResponse;
  if (typeof url !== "string" || !url.trim()) throw new Error("Portal URL was missing. Please try again.");

  window.location.href = url;
}


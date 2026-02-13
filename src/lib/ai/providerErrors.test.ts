import { describe, expect, it } from "vitest";
import { createProviderError, isProviderError } from "@/lib/ai/providerErrors";

describe("providerErrors", () => {
  it("creates a typed provider error", () => {
    const err = createProviderError({
      code: "AI_PROVIDER_BILLING_ERROR",
      message: "Billing",
      providerHint: "OpenAI",
      httpStatus: 402,
    });

    expect(err).toBeInstanceOf(Error);
    expect(err.code).toBe("AI_PROVIDER_BILLING_ERROR");
    expect(err.providerHint).toBe("OpenAI");
    expect(err.httpStatus).toBe(402);
    expect(isProviderError(err)).toBe(true);
  });
});

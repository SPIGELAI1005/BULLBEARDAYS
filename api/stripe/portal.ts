import type { IncomingMessage, ServerResponse } from "http";
import {
  getRequiredEnv,
  getStripe,
  getStripeCustomerIdByUserId,
  getUserFromAuthHeader,
  json,
} from "./_shared";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== "POST") return json(res, 405, { error: "METHOD_NOT_ALLOWED" });

  try {
    const user = await getUserFromAuthHeader(req.headers?.authorization ?? null);
    const stripeCustomerId = await getStripeCustomerIdByUserId(user.id);
    if (!stripeCustomerId) return json(res, 404, { error: "NO_STRIPE_CUSTOMER", message: "No billing profile found." });

    const appBaseUrl = getRequiredEnv("APP_BASE_URL").replace(/\/+$/, "");
    const stripe = getStripe();

    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${appBaseUrl}/billing`,
    });

    return json(res, 200, { url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to open billing portal";
    if (message === "AUTH_REQUIRED") return json(res, 401, { error: "AUTH_REQUIRED", message: "Sign in required" });
    return json(res, 500, { error: "PORTAL_ERROR", message });
  }
}


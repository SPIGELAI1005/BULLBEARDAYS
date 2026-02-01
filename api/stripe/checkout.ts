import type { IncomingMessage, ServerResponse } from "http";
import {
  badRequest,
  getCheckoutMode,
  getOneTimePeriodEnd,
  getPriceId,
  getRequiredEnv,
  getStripe,
  getStripeCustomerIdByUserId,
  getSupabaseAdmin,
  getUserFromAuthHeader,
  json,
  parseBillingPeriod,
  parsePlanId,
  upsertStripeCustomer,
} from "./_shared";

async function readJson(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return null;
  return JSON.parse(raw) as unknown;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== "POST") return json(res, 405, { error: "METHOD_NOT_ALLOWED" });

  try {
    const user = await getUserFromAuthHeader(req.headers?.authorization ?? null);
    const body = await readJson(req);
    if (!body || typeof body !== "object") return badRequest(res, "Invalid JSON body");

    const payload = body as Record<string, unknown>;
    const planId = parsePlanId(payload.planId);
    const billingPeriod = parseBillingPeriod(payload.billingPeriod);

    if (!planId || planId === "free") return badRequest(res, "Invalid planId");
    if (!billingPeriod) return badRequest(res, "Invalid billingPeriod");

    const appBaseUrl = getRequiredEnv("APP_BASE_URL").replace(/\/+$/, "");

    const stripe = getStripe();
    const supabaseAdmin = getSupabaseAdmin();

    let stripeCustomerId = await getStripeCustomerIdByUserId(user.id);
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: user.id },
      });
      stripeCustomerId = customer.id;
      await upsertStripeCustomer({ userId: user.id, stripeCustomerId });
    }

    const priceId = getPriceId(planId, billingPeriod);
    const mode = getCheckoutMode(planId);

    const successUrl = `${appBaseUrl}/billing?success=true`;
    const cancelUrl = `${appBaseUrl}/pricing?canceled=true`;

    const session = await stripe.checkout.sessions.create({
      mode,
      customer: stripeCustomerId,
      client_reference_id: user.id,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        user_id: user.id,
        plan_id: planId,
        billing_period: billingPeriod,
      },
      ...(mode === "subscription"
        ? {
            subscription_data: {
              metadata: {
                user_id: user.id,
                plan_id: planId,
                billing_period: billingPeriod,
              },
            },
          }
        : {
            payment_intent_data: {
              metadata: {
                user_id: user.id,
                plan_id: planId,
                billing_period: billingPeriod,
              },
            },
          }),
    });

    // For one-time plans, you can optionally pre-create a cached subscription row immediately.
    // The webhook will also upsert and is the source of truth.
    if (mode === "payment") {
      const now = new Date();
      const periodEnd = getOneTimePeriodEnd(planId, now);
      await supabaseAdmin.from("subscriptions").upsert(
        {
          user_id: user.id,
          stripe_subscription_id: `one_time_${session.id}`,
          stripe_customer_id: stripeCustomerId,
          plan_id: planId,
          status: "active",
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          cancel_at_period_end: true,
          canceled_at: null,
          trial_end: null,
        },
        { onConflict: "stripe_subscription_id" }
      );
    }

    return json(res, 200, { url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to start checkout";
    if (message === "AUTH_REQUIRED") return json(res, 401, { error: "AUTH_REQUIRED", message: "Sign in required" });
    return json(res, 500, { error: "CHECKOUT_ERROR", message });
  }
}


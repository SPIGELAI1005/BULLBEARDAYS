import type { IncomingMessage, ServerResponse } from "http";
import Stripe from "stripe";
import {
  getOneTimePeriodEnd,
  getRequiredEnv,
  getStripe,
  getSupabaseAdmin,
  getUserIdByStripeCustomerId,
  json,
  recordStripeEvent,
  upsertStripeCustomer,
  upsertSubscription,
} from "./_shared";

async function readRawBody(req: IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return Buffer.concat(chunks);
}

function toIsoFromUnixSeconds(value: number | null | undefined): string | null {
  if (!value || typeof value !== "number") return null;
  return new Date(value * 1000).toISOString();
}

function reversePlanIdFromPriceId(priceId: string): "week_pass" | "starter" | "pro" | "elite" | "founder" | null {
  const pairs: Array<[string | undefined, "week_pass" | "starter" | "pro" | "elite" | "founder"]> = [
    [process.env.STRIPE_PRICE_WEEK_PASS, "week_pass"],
    [process.env.STRIPE_PRICE_STARTER_MONTHLY, "starter"],
    [process.env.STRIPE_PRICE_STARTER_YEARLY, "starter"],
    [process.env.STRIPE_PRICE_PRO_MONTHLY, "pro"],
    [process.env.STRIPE_PRICE_PRO_YEARLY, "pro"],
    [process.env.STRIPE_PRICE_ELITE_MONTHLY, "elite"],
    [process.env.STRIPE_PRICE_ELITE_YEARLY, "elite"],
    [process.env.STRIPE_PRICE_FOUNDER, "founder"],
  ];

  for (const [envValue, planId] of pairs) {
    if (envValue && envValue === priceId) return planId;
  }
  return null;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== "POST") return json(res, 405, { error: "METHOD_NOT_ALLOWED" });

  const sig = req.headers["stripe-signature"] as string | undefined;
  if (!sig) return json(res, 400, { error: "MISSING_SIGNATURE" });

  const webhookSecret = getRequiredEnv("STRIPE_WEBHOOK_SECRET");
  const stripe = getStripe();

  let event: Stripe.Event;
  let rawBody: Buffer;

  try {
    rawBody = await readRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid webhook signature";
    return json(res, 400, { error: "INVALID_SIGNATURE", message });
  }

  // Record event for idempotency/audit
  try {
    const createdIso = typeof event.created === "number" ? new Date(event.created * 1000).toISOString() : null;
    const recorded = await recordStripeEvent({
      event_id: event.id,
      type: event.type,
      created: createdIso,
      payload: event as unknown,
    });
    if (recorded === "duplicate") return json(res, 200, { received: true, duplicate: true });
  } catch (error) {
    console.error("Failed to record stripe event:", error);
    return json(res, 500, { error: "EVENT_STORE_FAILED" });
  }

  try {
    const supabase = getSupabaseAdmin();

    // --- subscription lifecycle events ---
    if (event.type.startsWith("customer.subscription.")) {
      const subscription = event.data.object as Stripe.Subscription;
      const stripeCustomerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;

      let userId = await getUserIdByStripeCustomerId(stripeCustomerId);
      const metadataUserId = subscription.metadata?.user_id;
      if (!userId && metadataUserId) {
        userId = metadataUserId;
        await upsertStripeCustomer({ userId, stripeCustomerId });
      }

      if (!userId) {
        console.warn("No user mapping for customer:", stripeCustomerId);
        return json(res, 200, { received: true, warning: "missing_user_mapping" });
      }

      const firstItem = subscription.items.data[0];
      const priceId =
        typeof firstItem?.price === "string"
          ? firstItem.price
          : (firstItem?.price?.id ?? null);

      const planId = priceId ? reversePlanIdFromPriceId(priceId) : null;
      if (!planId) {
        console.warn("Unable to map plan from price:", priceId);
        return json(res, 200, { received: true, warning: "unknown_price" });
      }

      await upsertSubscription({
        user_id: userId,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: stripeCustomerId,
        plan_id: planId,
        status: subscription.status,
        current_period_start: toIsoFromUnixSeconds(subscription.current_period_start) ?? new Date().toISOString(),
        current_period_end: toIsoFromUnixSeconds(subscription.current_period_end) ?? new Date().toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end ?? false,
        canceled_at: toIsoFromUnixSeconds(subscription.canceled_at),
        trial_end: toIsoFromUnixSeconds(subscription.trial_end),
      });

      return json(res, 200, { received: true });
    }

    // --- checkout complete (one-time purchases + safety for customer mapping) ---
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const stripeCustomerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
      const userId = (session.client_reference_id ?? session.metadata?.user_id) as string | null;

      if (stripeCustomerId && userId) {
        await upsertStripeCustomer({ userId, stripeCustomerId });
      }

      // For one-time purchases, create/update a cached subscription-like row.
      // For subscriptions, customer.subscription.* will handle canonical state.
      if (session.mode === "payment" && stripeCustomerId && userId) {
        const stripe = getStripe();
        const full = await stripe.checkout.sessions.retrieve(session.id, {
          expand: ["line_items.data.price"],
        });
        const line = full.line_items?.data?.[0];
        const priceId =
          typeof line?.price === "string"
            ? line.price
            : (line?.price?.id ?? null);

        const planId = priceId ? reversePlanIdFromPriceId(priceId) : null;
        if (!planId) return json(res, 200, { received: true, warning: "unknown_price" });

        const now = new Date();
        const end = getOneTimePeriodEnd(planId, now);
        await upsertSubscription({
          user_id: userId,
          stripe_subscription_id: `one_time_${session.id}`,
          stripe_customer_id: stripeCustomerId,
          plan_id: planId,
          status: "active",
          current_period_start: now.toISOString(),
          current_period_end: end.toISOString(),
          cancel_at_period_end: true,
          canceled_at: null,
          trial_end: null,
        });
      }

      return json(res, 200, { received: true });
    }

    // Other events: acknowledged for idempotency/audit
    return json(res, 200, { received: true });
  } catch (error) {
    console.error("Webhook handling error:", error);
    return json(res, 500, { error: "WEBHOOK_HANDLER_FAILED" });
  }
}


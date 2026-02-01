import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import type { ServerResponse } from "http";

export type PlanId = "free" | "week_pass" | "starter" | "pro" | "elite" | "founder";
export type BillingPeriod = "monthly" | "yearly";

export interface StripeCustomerRow {
  user_id: string;
  stripe_customer_id: string;
}

export interface StripeSubscriptionUpsert {
  user_id: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  plan_id: PlanId;
  status: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  trial_end: string | null;
}

export interface UsageLimitReachedPayload {
  code: "USAGE_LIMIT_REACHED";
  message: string;
  current_usage?: number;
  limit_value?: number;
}

export function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
}

export function getStripe(): Stripe {
  const secretKey = getRequiredEnv("STRIPE_SECRET_KEY");
  return new Stripe(secretKey, {
    // Keep default API version unless you want to pin it explicitly.
    // apiVersion: "2024-06-20",
  });
}

export function getSupabaseAdmin() {
  const url = getRequiredEnv("SUPABASE_URL");
  const serviceRoleKey = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function getUserFromAuthHeader(authHeader: string | null): Promise<{ id: string; email?: string }> {
  if (!authHeader?.startsWith("Bearer ")) throw new Error("AUTH_REQUIRED");
  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) throw new Error("AUTH_REQUIRED");

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) throw new Error("AUTH_REQUIRED");
  return { id: data.user.id, email: data.user.email ?? undefined };
}

export function json(res: ServerResponse, status: number, payload: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

export function methodNotAllowed(res: ServerResponse) {
  json(res, 405, { error: "METHOD_NOT_ALLOWED" });
}

export function badRequest(res: ServerResponse, message: string) {
  json(res, 400, { error: "BAD_REQUEST", message });
}

export function unauthorized(res: ServerResponse) {
  json(res, 401, { error: "AUTH_REQUIRED", message: "Authentication required" });
}

export function internalError(res: ServerResponse, message = "Internal server error") {
  json(res, 500, { error: "INTERNAL_ERROR", message });
}

export function usageLimitReached(res: ServerResponse, payload: UsageLimitReachedPayload) {
  json(res, 402, payload);
}

export function parsePlanId(value: unknown): PlanId | null {
  if (typeof value !== "string") return null;
  const allowed: PlanId[] = ["week_pass", "starter", "pro", "elite", "founder", "free"];
  return allowed.includes(value as PlanId) ? (value as PlanId) : null;
}

export function parseBillingPeriod(value: unknown): BillingPeriod | null {
  if (typeof value !== "string") return null;
  return value === "monthly" || value === "yearly" ? (value as BillingPeriod) : null;
}

export function getPriceId(planId: PlanId, billingPeriod: BillingPeriod): string {
  const map: Record<Exclude<PlanId, "free">, { monthly?: string; yearly?: string; oneTime?: string }> = {
    week_pass: { oneTime: process.env.STRIPE_PRICE_WEEK_PASS },
    starter: { monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY, yearly: process.env.STRIPE_PRICE_STARTER_YEARLY },
    pro: { monthly: process.env.STRIPE_PRICE_PRO_MONTHLY, yearly: process.env.STRIPE_PRICE_PRO_YEARLY },
    elite: { monthly: process.env.STRIPE_PRICE_ELITE_MONTHLY, yearly: process.env.STRIPE_PRICE_ELITE_YEARLY },
    founder: { oneTime: process.env.STRIPE_PRICE_FOUNDER },
  };

  if (planId === "free") throw new Error("Free plan does not have a Stripe price.");

  const entry = map[planId];
  const priceId =
    planId === "week_pass" || planId === "founder"
      ? entry.oneTime
      : billingPeriod === "yearly"
        ? entry.yearly
        : entry.monthly;

  if (!priceId) throw new Error(`Missing Stripe price ID env var for ${planId} (${billingPeriod})`);
  return priceId;
}

export function getCheckoutMode(planId: PlanId): "payment" | "subscription" {
  if (planId === "week_pass" || planId === "founder") return "payment";
  return "subscription";
}

export function getOneTimePeriodEnd(planId: PlanId, now = new Date()): Date {
  const end = new Date(now);
  if (planId === "week_pass") {
    // Week Pass is valid for 7 days
    end.setDate(end.getDate() + 7);
  } else {
    // Founder and other one-time purchases: lifetime access (100 years)
    // Usage limits reset monthly via calendar month logic in check_usage_limit RPC
    end.setFullYear(end.getFullYear() + 100);
  }
  return end;
}

export async function upsertStripeCustomer(args: {
  userId: string;
  stripeCustomerId: string;
}): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("stripe_customers")
    .upsert(
      { user_id: args.userId, stripe_customer_id: args.stripeCustomerId },
      { onConflict: "user_id" }
    );
  if (error) throw error;
}

export async function getStripeCustomerIdByUserId(userId: string): Promise<string | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("stripe_customers")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data?.stripe_customer_id ?? null;
}

export async function getUserIdByStripeCustomerId(stripeCustomerId: string): Promise<string | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("stripe_customers")
    .select("user_id")
    .eq("stripe_customer_id", stripeCustomerId)
    .maybeSingle();
  if (error) throw error;
  return data?.user_id ?? null;
}

export async function upsertSubscription(row: StripeSubscriptionUpsert): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("subscriptions")
    .upsert(row, { onConflict: "stripe_subscription_id" });
  if (error) throw error;
}

export async function recordStripeEvent(args: {
  event_id: string;
  type: string;
  created: string | null;
  payload: unknown;
}): Promise<"inserted" | "duplicate"> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("stripe_events").insert({
    event_id: args.event_id,
    type: args.type,
    created: args.created,
    payload: args.payload,
  });

  if (!error) return "inserted";
  // Duplicate primary key => already processed
  const code = (error as unknown as { code?: unknown })?.code;
  if (code === "23505") return "duplicate";
  throw error;
}


/**
 * Pricing configuration for BullBearDays plans.
 * EU prices incl. VAT. Billing toggle: Monthly (default) / Yearly.
 * Yearly = 12 × monthly, 18% discount. Applicable to Starter, Pro, Elite only.
 */

export type PlanId = "daypass" | "starter" | "pro" | "elite" | "founder";

export type BillingPeriod = "monthly" | "yearly";

export const YEARLY_DISCOUNT = 0.18;

export interface PricingPlan {
  id: PlanId;
  name: string;
  price: string;
  /** e.g. "month", "7 days", "one-time" */
  period: string;
  /** Numeric monthly price (EUR) for plans with yearly billing. */
  priceMonthlyNum?: number;
  /** Optional footnote for credits/limits */
  footnote?: string;
  features: string[];
  cta: string;
  /** "Most popular" etc. */
  badge?: string;
  /** Exclude from main grid (e.g. Founder shown separately) */
  isFeatured?: boolean;
}

/** Yearly applies only to Starter, Pro, Elite. */
export const PLANS_WITH_YEARLY: PlanId[] = ["starter", "pro", "elite"];

export function getYearlyPrices(monthlyNum: number): {
  perMonth: number;
  totalYear: number;
  perMonthFormatted: string;
  totalYearFormatted: string;
} {
  const fullYear = monthlyNum * 12;
  const totalYear = fullYear * (1 - YEARLY_DISCOUNT);
  const perMonth = totalYear / 12;
  return {
    perMonth,
    totalYear,
    perMonthFormatted: `€${perMonth.toFixed(2)}`,
    totalYearFormatted: `€${totalYear.toFixed(2)}`,
  };
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "daypass",
    name: "Week Pass",
    price: "€2.80",
    period: "7 days",
    footnote: "30 analyses / 7 days · 5 context pulls / 7 days · non-renewing",
    features: [
      "Bull + Bear scenarios",
      "30 analyses / 7 days",
      "1 reference AI (choose one: GPT OR Gemini OR Claude)",
      "Basic plan: entry range, SL, TP targets, R:R, invalidation",
      "Share: download share-card (watermarked + disclaimer)",
      "No ensemble mode",
      "Online context: 5 pulls / 7 days",
    ],
    cta: "Start Week Pass",
  },
  {
    id: "starter",
    name: "Starter",
    price: "€8.99",
    period: "month",
    priceMonthlyNum: 8.99,
    footnote: "200 analyses / month · 50 context pulls / month",
    features: [
      "Everything in Week Pass",
      "200 analyses / month",
      "1–2 AI providers selectable as reference",
      "Online context: 50 pulls / month",
      "Saved analyses + export JSON",
      "Share: share-card + private link (viewer must be logged in)",
    ],
    cta: "Choose Starter",
  },
  {
    id: "pro",
    name: "Pro",
    price: "€19.99",
    period: "month",
    priceMonthlyNum: 19.99,
    badge: "Most popular",
    footnote: "700 analyses / month · 200 context pulls / month",
    features: [
      "700 analyses / month",
      "All AI providers (GPT + Gemini + Claude)",
      "Ensemble mode (side-by-side opinions + consensus)",
      "Backtest window up to 1000 candles",
      "Online context: 200 pulls / month",
      "Share: share-card + public share links (methodology + timestamp + disclaimer footer)",
      "Priority processing (moderate)",
    ],
    cta: "Go Pro",
  },
  {
    id: "elite",
    name: "Elite",
    price: "€39.99",
    period: "month",
    priceMonthlyNum: 39.99,
    footnote: "2000 analyses / month · 600 context pulls / month",
    features: [
      "2000 analyses / month",
      "Higher rate limits + faster queue",
      "Advanced context: 600 pulls / month",
      "Personal performance logging (optional)",
      "Early access to new features",
    ],
    cta: "Choose Elite",
  },
];

export const FOUNDER_PLAN: PricingPlan = {
  id: "founder",
  name: "Founder Lifetime (Limited)",
  price: "€49",
  period: "one-time",
  footnote: "300 analyses / month · 100 context pulls / month · resets monthly",
  features: [
    "Pro feature set (all AIs + ensemble + public share links)",
    "300 analyses / month (resets monthly)",
    "100 context pulls / month",
    "Founder badge",
  ],
  cta: "Get Founder",
  isFeatured: true,
};

export const TIER_PLANS = PRICING_PLANS.filter((p) => !p.isFeatured);

export function getSignupUrl(planId: PlanId): string {
  return `/signup?plan=${planId}`;
}

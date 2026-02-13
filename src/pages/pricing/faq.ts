export const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: "Is this financial advice?",
    a: "No. BullBearDays provides educational scenario analysis only. It is not financial, investment, or trading advice. Always do your own research and consider consulting a licensed advisor.",
  },
  {
    q: 'What does "Historical win rate" mean?',
    a: "Historical win rate reflects past outcomes of analyses in backtests or saved trades. It is based on historical data only and does not guarantee future results.",
  },
  {
    q: "Why do analyses use credits?",
    a: "Credits help us manage AI and infrastructure costs fairly. Each analysis consumes credits based on the number of AI models used and whether online context is included.",
  },
  {
    q: "What happens if I run out?",
    a: "When you use all credits in your plan period, you can upgrade, wait for the next reset, or add a Week Pass for short-term access. We will notify you as you approach your limit.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. You can cancel your subscription at any time. You will retain access until the end of your current billing period. No refunds for partial periods.",
  },
  {
    q: "Do you store screenshots?",
    a: "By default we do not store your chart screenshots. Storage is optional (e.g. for saved analyses) and can be configured in your account. We process images only to run analyses.",
  },
];

export const FAQ_MORE_ITEMS: { q: string; a: string }[] = [
  {
    q: "Can I upgrade or downgrade my plan later?",
    a: "Yes. You can change plans at any time. Upgrades take effect immediately (you get the higher limits/features), and downgrades typically take effect at the next billing reset. Any plan-specific limits reset on the schedule shown on the Pricing page.",
  },
  {
    q: "Can I choose which AI provider is used for my analyses?",
    a: "It depends on your plan. Free and Week Pass let you pick one reference AI. Higher tiers unlock multiple providers and (where available) ensemble mode. Availability can vary by region and provider status.",
  },
  {
    q: "How do online context pulls work?",
    a: "A context pull is counted when the app fetches external market/context data during an analysis. Your plan includes a limited number of pulls per period (e.g. per 7 days or per month). When you reach the limit, analyses still work but must run without online context until your next reset or upgrade.",
  },
  {
    q: "What’s the difference between private links and public share links?",
    a: "Private links are designed for sharing with someone who has an account and is logged in. Public share links are accessible without logging in and include extra context like methodology and timestamps. The exact share options depend on your plan tier.",
  },
  {
    q: "What does “watermarked + disclaimer” mean for share-cards?",
    a: "On Free, downloaded share-cards include a watermark and a disclaimer footer to avoid misuse. Paid tiers remove the watermark wording on the pricing page and may unlock richer sharing options, while keeping compliance disclaimers where required.",
  },
  {
    q: "Is the Founder plan a subscription?",
    a: "No. Founder Lifetime (Limited) is a one-time purchase. It grants access according to the terms shown in Pricing Conditions, including monthly resets for usage limits and the ability to evolve the service over time (with advance communication).",
  },
  {
    q: "How is the Founder “seats remaining” counter calculated?",
    a: "Seats remaining is computed from current Founder access records and then displayed as remaining/total. The count may lag briefly due to payment confirmation timing or backend processing, but it is intended to reflect availability as accurately as possible.",
  },
  {
    q: "Are prices including VAT?",
    a: "EU prices shown are intended to be VAT-inclusive. Taxes may still vary depending on location and applicable regulations. Your final amount is shown during checkout before you confirm payment.",
  },
  {
    q: "What happens if the AI or the service is temporarily unavailable?",
    a: "Occasional outages can happen due to provider or infrastructure issues. If you experience errors, please report them via the app so we can investigate. For extended disruptions, we may evaluate remedies in line with the Pricing Conditions and Refund Policy.",
  },
  {
    q: "How do I report a bug or request a feature?",
    a: "Use the in-app support/reporting options (or contact the support channel listed in the app). Include the timeframe, symbol/timeframe, and any error message. We use this information to reproduce issues and improve model prompts, stability, and UX.",
  },
];

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, Sparkles, Info, ArrowLeft, Loader2, ChevronDown } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CandlestickBackground from "@/components/CandlestickBackground";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  FREE_PLAN,
  FOUNDER_PLAN,
  TIER_PLANS,
  getSignupUrl,
  getYearlyPrices,
  PLANS_WITH_YEARLY,
  type PlanId,
  type PricingPlan,
  type BillingPeriod,
} from "@/lib/pricing";
import { isAuthRequiredError, startCheckout } from "@/lib/billing/startCheckout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { FAQ_ITEMS, FAQ_MORE_ITEMS } from "@/pages/pricing/faq";

const BRAND = {
  magenta: "#d81b5c",
  bullGreen: "#38b449",
  bearRed: "#de382f",
  softHighlight: "#dedfae",
} as const;

function PricingCard({
  plan,
  billingPeriod,
  ctaLabel,
  isLoading,
  onCtaClick,
}: {
  plan: PricingPlan;
  billingPeriod: BillingPeriod;
  ctaLabel: string;
  isLoading: boolean;
  onCtaClick: (planId: PlanId) => void;
}) {
  const isPro = plan.id === "pro";
  const hasYearly = PLANS_WITH_YEARLY.includes(plan.id as PlanId);
  const isYearly = billingPeriod === "yearly" && hasYearly;

  const yearlyPrices =
    hasYearly && plan.priceMonthlyNum != null
      ? getYearlyPrices(plan.priceMonthlyNum)
      : null;

  return (
    <article
      className={cn(
        "relative glass-panel !overflow-visible p-6 flex flex-col h-full",
        "transition-all duration-300 motion-reduce:transition-none",
        "hover:shadow-[0_0_40px_-12px_rgba(216,27,92,0.25)]",
        isPro && "ring-2 ring-[#d81b5c]/40"
      )}
    >
      {plan.badge && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold"
          style={{
            background: BRAND.magenta,
            color: "white",
            boxShadow: `0 0 20px -4px ${BRAND.magenta}`,
          }}
        >
          {plan.badge}
        </div>
      )}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
        <div className="mt-2 flex flex-col gap-0.5">
          {isYearly && yearlyPrices ? (
            <>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold tabular-nums bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
                  {yearlyPrices.perMonthFormatted}
                </span>
                <span className="text-muted-foreground text-sm">/ month</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {yearlyPrices.totalYearFormatted} / year · billed annually
              </span>
            </>
          ) : (
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold tabular-nums bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
                {plan.price}
              </span>
              <span className="text-muted-foreground text-sm">
                / {plan.period}
              </span>
            </div>
          )}
        </div>
      </div>
      <ul className="flex-1 space-y-3 mb-6" role="list">
        {plan.features.map((f, i) => (
          <li key={i} className="flex gap-3 text-sm text-muted-foreground">
            <Check
              className="h-4 w-4 shrink-0 mt-0.5"
              style={{ color: BRAND.bullGreen }}
              aria-hidden
            />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      {plan.footnote && (
        <p className="text-xs text-muted-foreground mb-4">{plan.footnote}</p>
      )}
      <div className="mb-2 flex items-center justify-center">
        <Link
          to={`/pricing-conditions#${plan.id}`}
          className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
        >
          See Conditions
        </Link>
      </div>
      <Button
        type="button"
        onClick={() => onCtaClick(plan.id as PlanId)}
        disabled={isLoading}
        className={cn(
          "w-full font-semibold rounded-xl transition-all duration-300 motion-reduce:transition-none",
          "h-auto min-h-[44px] px-3 sm:px-4 py-2.5 text-[11px] sm:text-xs lg:text-sm leading-snug whitespace-normal break-words text-center",
          "hover:brightness-110 hover:shadow-[0_0_24px_-6px_rgba(216,27,92,0.5)]"
        )}
        style={{
          backgroundColor: BRAND.magenta,
          color: "white",
        }}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Processing…
          </>
        ) : (
          ctaLabel
        )}
      </Button>
    </article>
  );
}

function PlanComparisonTable() {
  const headers = ["", FREE_PLAN.name, ...TIER_PLANS.map((p) => p.name)];
  const rows: string[][] = [
    ["Analyses", "10 / 7d", "30 / 7d", "200 / mo", "700 / mo", "2000 / mo"],
    ["Context pulls", "5 / 7d", "5 / 7d", "50 / mo", "200 / mo", "600 / mo"],
    ["AI providers", "1", "1", "1–2", "All (3)", "All (3)"],
    ["Ensemble mode", "—", "—", "—", "✓", "✓"],
    ["Public share links", "—", "—", "—", "✓", "✓"],
    ["Backtest candles", "—", "—", "—", "1000", "1000"],
  ];
  return (
    <div className="rounded-2xl overflow-hidden glass-panel-subtle">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {headers.map((h, i) => (
              <TableHead
                key={i}
                className={cn(
                  "text-foreground font-semibold",
                  i === 0 ? "w-[140px]" : ""
                )}
              >
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, ri) => (
            <TableRow
              key={ri}
              className="hover:bg-muted/30"
            >
              {row.map((cell, ci) => (
                <TableCell
                  key={ci}
                  className={cn(
                    "text-muted-foreground",
                    ci === 0 && "font-medium text-foreground"
                  )}
                >
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function Pricing() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly");
  const [isCheckingOutByPlanId, setIsCheckingOutByPlanId] = useState<Record<string, boolean>>({});
  const isFounderCheckingOut = isCheckingOutByPlanId.founder === true;
  const [isShowingMoreFaq, setIsShowingMoreFaq] = useState(false);
  const [founderSeats, setFounderSeats] = useState<{ total: number; remaining: number }>({
    total: 300,
    remaining: 300,
  });

  const founderSeatsLabel = useMemo(() => {
    return `${founderSeats.remaining}/${founderSeats.total}`;
  }, [founderSeats]);

  const handleCtaClick = useCallback(
    async (planId: PlanId) => {
      if (isAuthLoading) return;

      if (!user) {
        toast({
          title: "Create an account first to continue",
          description:
            planId === "free"
              ? "Sign in to start on the Free plan."
              : "Sign in to continue to Stripe Checkout.",
          variant: "destructive",
        });
        navigate(getSignupUrl(planId));
        return;
      }

      if (planId === "free") {
        navigate("/#analyze");
        return;
      }

      const effectiveBillingPeriod =
        billingPeriod === "yearly" && PLANS_WITH_YEARLY.includes(planId) ? "yearly" : "monthly";

      setIsCheckingOutByPlanId((prev) => ({ ...prev, [planId]: true }));
      try {
        await startCheckout(planId, effectiveBillingPeriod);
      } catch (error) {
        if (isAuthRequiredError(error)) {
          toast({
            title: "Sign in required",
            description: "Please sign in again to continue to checkout.",
            variant: "destructive",
          });
          navigate(getSignupUrl(planId));
          return;
        }

        toast({
          title: "Unable to start checkout",
          description: error instanceof Error ? error.message : "Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsCheckingOutByPlanId((prev) => ({ ...prev, [planId]: false }));
      }
    },
    [billingPeriod, isAuthLoading, navigate, toast, user]
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    let isCancelled = false;

    async function loadFounderSeats() {
      try {
        const rpc = (supabase as unknown as {
          rpc: (fn: string, args?: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>;
        }).rpc;

        const { data, error } = await rpc("get_founder_seats");
        if (error) return;

        const row = Array.isArray(data) ? data[0] : data;
        if (!row || typeof row !== "object") return;

        const r = row as Partial<{ total_seats: unknown; remaining_seats: unknown }>;
        if (typeof r.total_seats !== "number" || typeof r.remaining_seats !== "number") return;

        if (!isCancelled) setFounderSeats({ total: r.total_seats, remaining: r.remaining_seats });
      } catch {
        // ignore
      }
    }

    void loadFounderSeats();
    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    const t = document.title;
    const desc = document.querySelector('meta[name="description"]');
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDesc = document.querySelector('meta[property="og:description"]');
    document.title = "Pricing | BullBearDays";
    if (desc) desc.setAttribute("content", "Plans and pricing for BullBearDays. Week Pass, Starter, Pro, Elite, and Founder Lifetime. EU incl. VAT. Educational scenario analysis — not financial advice.");
    if (ogTitle) ogTitle.setAttribute("content", "Pricing | BullBearDays");
    if (ogDesc) ogDesc.setAttribute("content", "Plans and pricing for BullBearDays. Week Pass, Starter, Pro, Elite, Founder Lifetime. Educational scenario analysis — not financial advice.");
    return () => {
      document.title = t;
      if (desc) desc.setAttribute("content", "AI-powered trading analysis platform. Upload chart screenshots and get BUY/SELL/HOLD signals with confidence percentages, take profit and stop loss levels. Track your trading performance and win rates.");
      if (ogTitle) ogTitle.setAttribute("content", "BullBearDays - AI Trading Chart Analyzer");
      if (ogDesc) ogDesc.setAttribute("content", "Upload a chart screenshot → Get AI analysis with trading recommendation → Track your trades → Measure performance. unBULLivable. unBEARable. PROFITable?");
    };
  }, []);

  return (
    <div className="min-h-screen bg-background relative text-foreground">
      <CandlestickBackground />
      <div className="relative z-10">
        <Header />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-44 pb-16 md:pt-52 md:pb-20">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted/50 hover:bg-muted border border-border text-sm font-medium text-foreground mb-8 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d81b5c] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Hero — spacing preserves layout as if "Pricing" title were present */}
        <section className="text-center pt-16 mb-16" aria-label="Pricing hero">
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto space-y-1">
            <span className="block">Some days are un<strong className="text-[#38b449]">BULL</strong>ivable.</span>
            <span className="block">Other days are un<strong className="text-[#de382f]">BEAR</strong>able.</span>
            <span className="block">Can you make it <strong className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent font-semibold">PROFIT</strong>able?</span>
          </p>
          <p className="mt-4 text-sm text-muted-foreground/90 max-w-xl mx-auto">
            Educational scenario analysis. Not financial advice. Backtests reflect past data only.
          </p>
        </section>

        {/* Billing toggle */}
        <div className="flex flex-col items-center gap-3 md:gap-4 mb-8 md:mb-12">
          <span className="text-sm text-muted-foreground">Billing period</span>
          <div
            className="flex flex-wrap justify-center gap-1 rounded-xl p-1 bg-muted/30 border border-border"
            role="group"
            aria-label="Billing period"
          >
            <button
              type="button"
              onClick={() => setBillingPeriod("monthly")}
              className={cn(
                "px-4 sm:px-6 py-2.5 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d81b5c] focus-visible:ring-offset-2 focus-visible:ring-offset-background min-h-[44px]",
                billingPeriod === "monthly"
                  ? "bg-[#d81b5c] text-white"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-pressed={billingPeriod === "monthly"}
              aria-label="Monthly billing"
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingPeriod("yearly")}
              className={cn(
                "px-4 sm:px-6 py-2.5 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d81b5c] focus-visible:ring-offset-2 focus-visible:ring-offset-background min-h-[44px]",
                billingPeriod === "yearly"
                  ? "bg-[#d81b5c] text-white"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-pressed={billingPeriod === "yearly"}
              aria-label="Yearly billing (18% off)"
            >
              Yearly <span className="text-[10px] opacity-80">(18% off)</span>
            </button>
          </div>
        </div>

        {/* Pricing cards */}
        <section
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-12 md:mb-20"
          aria-label="Plans"
        >
          {TIER_PLANS.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              billingPeriod={billingPeriod}
              ctaLabel={plan.cta}
              isLoading={!!isCheckingOutByPlanId[plan.id]}
              onCtaClick={handleCtaClick}
            />
          ))}
        </section>

        {/* Free + Founder */}
        <section
          className="mb-20"
          aria-label="Free and Founder plans"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 max-w-6xl mx-auto">
            <PricingCard
              plan={FREE_PLAN}
              billingPeriod={billingPeriod}
              ctaLabel={FREE_PLAN.cta}
              isLoading={false}
              onCtaClick={handleCtaClick}
            />

            <div
              className={cn(
                "relative rounded-2xl p-6 overflow-hidden h-full",
                "bg-gradient-to-b from-amber-500/15 via-amber-500/5 to-transparent",
                "backdrop-blur-xl border-2 border-amber-400/40",
                "shadow-[0_0_0_1px_rgba(251,191,36,0.2)_inset,0_0_60px_-12px_rgba(245,158,11,0.35),0_0_100px_-24px_rgba(251,191,36,0.2)]",
                "transition-all duration-300 motion-reduce:transition-none",
                "hover:shadow-[0_0_0_1px_rgba(251,191,36,0.3)_inset,0_0_72px_-12px_rgba(245,158,11,0.45),0_0_120px_-20px_rgba(251,191,36,0.25)]",
                "hover:border-amber-400/50"
              )}
            >
              {/* Golden shine sweep */}
              <div
                className="absolute inset-0 pointer-events-none opacity-30 animate-founder-shine motion-reduce:animate-none"
                style={{
                  background:
                    "linear-gradient(105deg, transparent 0%, transparent 40%, rgba(251,191,36,0.15) 50%, transparent 60%, transparent 100%)",
                  backgroundSize: "200% 100%",
                }}
                aria-hidden
              />
              <div className="relative flex flex-col h-full">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5 text-amber-400" aria-hidden />
                  <h2 className="text-xl font-semibold text-foreground">
                    {FOUNDER_PLAN.name}
                  </h2>
                </div>
                <div className="flex flex-wrap items-baseline gap-2 mb-4">
                  <span className="text-3xl font-bold tabular-nums bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
                    {FOUNDER_PLAN.price}
                  </span>
                  <span className="text-muted-foreground">one-time</span>
                </div>
                <ul className="flex-1 space-y-2 mb-6" role="list">
                  {FOUNDER_PLAN.features.map((f, i) => (
                    <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" aria-hidden />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="text-xs text-muted-foreground mb-4">
                  {FOUNDER_PLAN.footnote && <p>{FOUNDER_PLAN.footnote}</p>}
                  <p className="mt-1">
                    Seats remaining:{" "}
                    <span className="font-medium text-foreground tabular-nums">{founderSeatsLabel}</span>
                  </p>
                </div>
                <div className="mb-2 flex items-center justify-center">
                  <Link
                    to="/pricing-conditions#founder"
                    className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
                  >
                    See Conditions
                  </Link>
                </div>
                <Button
                  type="button"
                  className={cn(
                    "font-semibold rounded-xl transition-all duration-300",
                    "h-auto min-h-[44px] px-3 sm:px-4 py-2.5 text-[11px] sm:text-xs lg:text-sm leading-snug whitespace-normal break-words text-center",
                    "bg-gradient-to-r from-amber-500 to-amber-600 text-white",
                    "hover:from-amber-400 hover:to-amber-500",
                    "hover:shadow-[0_0_24px_-6px_rgba(245,158,11,0.5)]"
                  )}
                  disabled={isFounderCheckingOut}
                  onClick={() => void handleCtaClick("founder")}
                >
                  {isFounderCheckingOut ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      Processing…
                    </>
                  ) : (
                    FOUNDER_PLAN.cta
                  )}
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Plan comparison table — desktop only */}
        <section
          className="mb-20 hidden lg:block"
          aria-label="Plan comparison"
        >
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Compare plans
          </h2>
          <PlanComparisonTable />
        </section>

        {/* Credits explainer */}
        <section
          className="rounded-xl border border-border bg-muted/20 p-6 mb-20 max-w-3xl mx-auto"
          aria-labelledby="credits-title"
        >
          <div className="flex items-center gap-2 mb-4">
            <Info className="h-5 w-5 text-[#38b449]" aria-hidden />
            <h2 id="credits-title" className="text-lg font-semibold text-foreground">
              How credits work
            </h2>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground mb-4" role="list">
            <li>• 1 analysis = 1 credit (single reference AI, no online context)</li>
            <li>• Ensemble (3 AIs) = 3 credits</li>
            <li>• Online context fetch = +1 credit</li>
            <li>• Backtest compute included</li>
          </ul>
          <p className="text-xs text-muted-foreground/90 border-l-2 border-[#de382f]/50 pl-4">
            No guarantees. Verify levels with your broker/chart.
          </p>
        </section>

        {/* FAQ */}
        <section className="max-w-3xl mx-auto mb-20" aria-labelledby="faq-title">
          <h2 id="faq-title" className="text-xl font-semibold text-foreground mb-6">
            Frequently asked questions
          </h2>
          <Accordion type="single" collapsible className="space-y-2">
            {FAQ_ITEMS.map((item, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="rounded-xl border border-border border-b-0 bg-muted/20 px-4 data-[state=open]:bg-muted/30"
              >
                <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline py-4">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm pb-4">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="mt-4">
            <Button
              type="button"
              variant="secondary"
                className="w-full rounded-xl bg-muted/20 hover:bg-muted/30 text-foreground"
              onClick={() => setIsShowingMoreFaq((v) => !v)}
              aria-expanded={isShowingMoreFaq}
              aria-controls="faq-more"
            >
              Further Questions and Answers
              <ChevronDown
                className={cn(
                    "ml-2 h-4 w-4 transition-transform duration-200",
                  isShowingMoreFaq && "rotate-180"
                )}
                aria-hidden
              />
            </Button>
            {isShowingMoreFaq && (
              <div id="faq-more" className="mt-2">
                <Accordion type="single" collapsible className="space-y-2">
                  {FAQ_MORE_ITEMS.map((item, i) => (
                    <AccordionItem
                      key={i}
                      value={`faq-more-${i}`}
                      className="rounded-xl border border-border border-b-0 bg-muted/20 px-4 data-[state=open]:bg-muted/30"
                    >
                      <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline py-4">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground text-sm pb-4">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}
          </div>
        </section>

        </main>
        <Footer />
      </div>
    </div>
  );
}

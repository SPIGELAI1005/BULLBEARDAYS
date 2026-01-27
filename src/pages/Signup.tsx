import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { type PlanId } from "@/lib/pricing";

const PLAN_LABELS: Record<PlanId, string> = {
  daypass: "Week Pass",
  starter: "Starter",
  pro: "Pro",
  elite: "Elite",
  founder: "Founder Lifetime (Limited)",
};

export default function Signup() {
  const [searchParams] = useSearchParams();
  const plan = (searchParams.get("plan") ?? "") as PlanId;
  const isValidPlan = Object.keys(PLAN_LABELS).includes(plan);
  const planLabel = isValidPlan ? PLAN_LABELS[plan] : null;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const prev = document.title;
    document.title = planLabel
      ? `Sign up — ${planLabel} | BullBearDays`
      : "Sign up | BullBearDays";
    return () => {
      document.title = prev;
    };
  }, [planLabel]);

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-foreground">
      <Header />
      <main className="max-w-xl mx-auto px-4 sm:px-6 pt-44 pb-16 md:pt-52 md:pb-20">
        <Link
          to="/pricing"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-sm font-medium text-foreground mb-8 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d81b5c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0b]"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Pricing
        </Link>

        <div
          className={`
            rounded-2xl p-8 text-center
            bg-gradient-to-b from-white/[0.08] to-white/[0.02]
            backdrop-blur-xl border border-white/10
            shadow-[0_0_0_1px_rgba(255,255,255,0.05)_inset,0_8px_32px_-8px_rgba(0,0,0,0.4)]
          `}
        >
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Coming soon
          </h1>
          <p className="text-muted-foreground mb-6">
            Sign-up and checkout are not yet available. We’re working on it.
          </p>
          {planLabel && (
            <p className="text-sm text-muted-foreground mb-6">
              Selected plan: <strong className="text-foreground">{planLabel}</strong>
            </p>
          )}
          <Button
            asChild
            className="font-semibold rounded-xl"
            style={{
              backgroundColor: "#d81b5c",
              color: "white",
            }}
          >
            <Link to="/pricing">View Pricing</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}

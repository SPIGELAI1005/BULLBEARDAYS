import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { type PlanId } from "@/lib/pricing";

const PLAN_LABELS: Record<PlanId, string> = {
  free: "Free",
  week_pass: "Week Pass",
  starter: "Starter",
  pro: "Pro",
  elite: "Elite",
  founder: "Founder Lifetime (Limited)",
};

export default function Signup() {
  const { user, isLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const plan = (searchParams.get("plan") ?? "") as PlanId;
  const isValidPlan = Object.keys(PLAN_LABELS).includes(plan);
  const planLabel = isValidPlan ? PLAN_LABELS[plan] : null;
  const isFreePlan = plan === "free";
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="max-w-xl mx-auto px-4 sm:px-6 pt-44 pb-16 md:pt-52 md:pb-20">
        <Link
          to="/pricing"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl glass-panel-subtle text-sm font-medium text-foreground mb-8 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Pricing
        </Link>

        <div className="glass-panel rounded-2xl p-8 text-center shadow-2xl">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {user ? "You’re signed in" : "Create an account first to continue"}
          </h1>
          <p className="text-muted-foreground mb-6">
            {user
              ? isFreePlan
                ? "You're on the Free plan. Continue to the app to start analyzing."
                : "Return to Pricing and click your plan again to continue to checkout."
              : isFreePlan
                ? "Sign in or create an account to start on the Free plan."
                : "Sign in or create an account to continue to Stripe Checkout."}
          </p>
          {planLabel && (
            <p className="text-sm text-muted-foreground mb-6">
              Selected plan: <strong className="text-foreground">{planLabel}</strong>
            </p>
          )}
          <div className="flex flex-col sm:flex-row items-stretch justify-center gap-3">
            {!user && !isLoading ? (
              <Button
                type="button"
                className="font-semibold rounded-xl"
                style={{ backgroundColor: "#d81b5c", color: "white" }}
                onClick={() => setIsAuthModalOpen(true)}
              >
                Sign in / Create account
              </Button>
            ) : (
              <Button
                asChild
                className="font-semibold rounded-xl"
                style={{ backgroundColor: "#d81b5c", color: "white" }}
              >
                <Link to={isFreePlan ? "/#analyze" : "/pricing"}>
                  {isFreePlan ? "Continue to app" : "Back to Pricing"}
                </Link>
              </Button>
            )}
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/billing">Go to Billing</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}

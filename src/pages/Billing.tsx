import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CreditCard, RefreshCw } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { startPortal } from "@/lib/billing/startPortal";

interface SubscriptionSummary {
  plan_id: string;
  status: string;
  analyses_used: number;
  analyses_limit: number;
  period_end: string;
}

interface RpcResponse {
  data: unknown;
  error: unknown;
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function isErrorWithMessage(value: unknown): value is { message: string } {
  return (
    !!value &&
    typeof value === "object" &&
    "message" in value &&
    typeof (value as { message?: unknown }).message === "string"
  );
}

function parseSubscriptionSummary(value: unknown): SubscriptionSummary | null {
  const row = Array.isArray(value) ? value[0] : value;
  if (!row || typeof row !== "object") return null;

  const r = row as Partial<Record<keyof SubscriptionSummary, unknown>>;
  if (
    typeof r.plan_id !== "string" ||
    typeof r.status !== "string" ||
    typeof r.analyses_used !== "number" ||
    typeof r.analyses_limit !== "number" ||
    typeof r.period_end !== "string"
  ) {
    return null;
  }

  return {
    plan_id: r.plan_id,
    status: r.status,
    analyses_used: r.analyses_used,
    analyses_limit: r.analyses_limit,
    period_end: r.period_end,
  };
}

export default function Billing() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const isSuccess = searchParams.get("success") === "true";

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  const [summary, setSummary] = useState<SubscriptionSummary | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const canRefresh = !!user && !isAuthLoading;
  const canOpenPortal = !!user && !isAuthLoading;

  const handleRefresh = useCallback(async () => {
    if (!user) return;
    setIsRefreshing(true);
    setErrorMessage(null);

    try {
      const rpc = (supabase as unknown as { rpc: (fn: string, args: Record<string, unknown>) => Promise<RpcResponse> })
        .rpc;

      const { data, error } = await rpc("get_user_subscription", { target_user_id: user.id });
      if (error) {
        if (isErrorWithMessage(error)) throw new Error(error.message);
        throw new Error("Unable to load billing details.");
      }

      const parsed = parseSubscriptionSummary(data);
      setSummary(parsed);
      if (!parsed) setErrorMessage("Unexpected billing response. Please click Refresh.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to load billing details.");
      setSummary(null);
    } finally {
      setIsRefreshing(false);
    }
  }, [user]);

  const handleManageBilling = useCallback(async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    setIsOpeningPortal(true);
    try {
      await startPortal();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to open billing portal.";
      toast({
        title: "Couldn’t open billing portal",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsOpeningPortal(false);
    }
  }, [toast, user]);

  useEffect(() => {
    if (!user || isAuthLoading) return;
    void handleRefresh();
  }, [user, isAuthLoading, handleRefresh]);

  const title = useMemo(() => {
    if (!user) return "Billing | BullBearDays";
    return "Billing | BullBearDays";
  }, [user]);

  useEffect(() => {
    const prev = document.title;
    document.title = title;
    return () => {
      document.title = prev;
    };
  }, [title]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-44 pb-16 md:pt-52 md:pb-20">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Billing</h1>
            <p className="text-sm text-muted-foreground">
              Stripe is the source of truth. This page shows cached plan status and usage.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={!canOpenPortal || isOpeningPortal}
              onClick={handleManageBilling}
            >
              <CreditCard className={cn("h-4 w-4", isOpeningPortal && "animate-pulse")} />
              Manage billing
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={!canRefresh || isRefreshing}
              onClick={handleRefresh}
            >
              <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </div>

        {isSuccess && (
          <div className="mb-6 rounded-xl border border-border bg-muted/20 p-4">
            <div className="font-medium text-foreground">Payment processed.</div>
            <div className="text-sm text-muted-foreground mt-1">
              If your plan doesn’t update immediately, click Refresh.
            </div>
          </div>
        )}

        {isAuthLoading ? (
          <div className="rounded-2xl border border-border bg-muted/10 p-6">
            <div className="h-5 w-36 bg-muted animate-pulse rounded mb-3" />
            <div className="h-4 w-64 bg-muted animate-pulse rounded" />
          </div>
        ) : !user ? (
          <div className="rounded-2xl border border-border bg-muted/10 p-8 text-center">
            <h2 className="text-lg font-semibold text-foreground mb-2">Sign in to view billing</h2>
            <p className="text-sm text-muted-foreground mb-6">
              You’ll see your current plan, usage, and reset date after signing in.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                type="button"
                className="font-semibold rounded-xl"
                style={{ backgroundColor: "#d81b5c", color: "white" }}
                onClick={() => setIsAuthModalOpen(true)}
              >
                Sign in / Create account
              </Button>
              <Button type="button" variant="outline" asChild className="rounded-xl">
                <Link to="/pricing">View pricing</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {errorMessage && (
              <div className="rounded-xl border border-bearish/30 bg-bearish/10 p-4">
                <div className="font-medium text-foreground">Couldn’t load billing</div>
                <div className="text-sm text-muted-foreground mt-1">{errorMessage}</div>
              </div>
            )}

            {summary && (
              <div className="rounded-2xl border border-border bg-muted/10 p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">Plan</div>
                    <div className="text-base font-semibold text-foreground mt-1">
                      {summary.plan_id}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">Status</div>
                    <div className="text-base font-semibold text-foreground mt-1">
                      {summary.status}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">Analyses used</div>
                    <div className="text-base font-semibold text-foreground mt-1">
                      {summary.analyses_used} / {summary.analyses_limit}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">Period end</div>
                    <div className="text-base font-semibold text-foreground mt-1">
                      {formatDateTime(summary.period_end)}
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-xs text-muted-foreground">
                  Usage resets by calendar month.
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}


import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { CurrencyProvider } from "@/hooks/useCurrency";
import ErrorBoundary from "@/components/ErrorBoundary";
import { DisclaimerGate, DisclaimerExitScreen } from "@/components/DisclaimerGate";
import CookieConsent from "@/components/CookieConsent";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Terms from "./pages/Terms";
import RiskDisclosure from "./pages/RiskDisclosure";
import Privacy from "./pages/Privacy";
import RefundPolicy from "./pages/RefundPolicy";
import Methodology from "./pages/Methodology";
import Pricing from "./pages/Pricing";
import PricingConditions from "./pages/PricingConditions";
import Billing from "./pages/Billing";
import Signup from "./pages/Signup";
import About from "./pages/About";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const [hasAcceptedDisclaimer, setHasAcceptedDisclaimer] = useState(false);
  const [hasExited, setHasExited] = useState(false);
  const isGateOpen = !hasAcceptedDisclaimer;

  if (hasExited) return <DisclaimerExitScreen />;

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider>
            <CurrencyProvider>
              <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <div className={isGateOpen ? "pointer-events-none select-none blur-md brightness-90" : ""}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/risk-disclosure" element={<RiskDisclosure />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/refund-policy" element={<RefundPolicy />} />
                    <Route path="/methodology" element={<Methodology />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/pricing-conditions" element={<PricingConditions />} />
                    <Route path="/billing" element={<Billing />} />
                    <Route path="/signup" element={<Signup />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
                <DisclaimerGate
                  isOpen={isGateOpen}
                  onAgree={() => setHasAcceptedDisclaimer(true)}
                  onExit={() => setHasExited(true)}
                />
                <CookieConsent />
              </BrowserRouter>
              </TooltipProvider>
            </CurrencyProvider>
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
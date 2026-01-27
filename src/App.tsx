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
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Terms from "./pages/Terms";
import RiskDisclosure from "./pages/RiskDisclosure";
import Privacy from "./pages/Privacy";
import Methodology from "./pages/Methodology";
import Pricing from "./pages/Pricing";
import Signup from "./pages/Signup";

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
              <div className={isGateOpen ? "pointer-events-none select-none blur-md brightness-90" : ""}>
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/risk-disclosure" element={<RiskDisclosure />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/methodology" element={<Methodology />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/signup" element={<Signup />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </div>
              <DisclaimerGate
                isOpen={isGateOpen}
                onAgree={() => setHasAcceptedDisclaimer(true)}
                onExit={() => setHasExited(true)}
              />
              </TooltipProvider>
            </CurrencyProvider>
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
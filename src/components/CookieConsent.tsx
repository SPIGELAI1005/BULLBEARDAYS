import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const COOKIE_CONSENT_KEY = "cookie-consent";

export const CookieConsent = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => {
        setShow(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setShow(false);
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "declined");
    setShow(false);
  };

  const handleClose = () => {
    // Temporary close (will show again next session if not decided)
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 animate-in slide-in-from-bottom duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="glass-panel p-4 md:p-6 shadow-2xl border-2 border-primary/20">
          <div className="flex items-start gap-3 md:gap-4">
            <div className="flex-shrink-0 mt-1">
              <Cookie className="w-6 h-6 md:w-7 md:h-7 text-primary" />
            </div>

            <div className="flex-1 space-y-3">
              <div className="space-y-2">
                <h3 className="text-base md:text-lg font-semibold text-foreground">
                  Cookie Consent
                </h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  We use cookies and similar technologies to maintain your session, remember your preferences, and analyze service usage. By accepting, you consent to our use of cookies as described in our{" "}
                  <Link to="/privacy" className="text-primary hover:underline font-medium">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button
                  onClick={handleAccept}
                  className="w-full sm:w-auto px-6"
                  size="default"
                >
                  Accept Cookies
                </Button>
                <Button
                  onClick={handleDecline}
                  variant="outline"
                  className="w-full sm:w-auto px-6"
                  size="default"
                >
                  Decline
                </Button>
                <Button
                  onClick={handleClose}
                  variant="ghost"
                  size="icon"
                  className="absolute top-3 right-3 md:relative md:top-0 md:right-0"
                  aria-label="Close cookie banner"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Essential cookies are required for the service to function. You can manage your preferences in your browser settings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;

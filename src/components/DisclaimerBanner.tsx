import React from "react";
import { AlertTriangle, Info, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DisclaimerBannerProps {
  variant?: "persistent" | "dismissible";
  position?: "header" | "inline" | "footer";
  compact?: boolean;
}

const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({
  variant = "persistent",
  position = "inline",
  compact = false,
}) => {
  const [isDismissed, setIsDismissed] = React.useState(false);

  if (variant === "dismissible" && isDismissed) {
    return null;
  }

  if (compact) {
    return (
      <div className="text-xs text-muted-foreground text-center py-2 border-t border-border/50">
        <span className="inline-flex items-center gap-1">
          <Info className="h-3 w-3" />
          Educational purposes only • Not financial advice
        </span>
      </div>
    );
  }

  const isHeader = position === "header";
  const isFooter = position === "footer";

  return (
    <Alert
      className={`
        disclaimer-banner
        ${isHeader ? "rounded-xl border border-amber-500/40 shadow-sm" : ""}
        ${isFooter ? "rounded-xl border border-amber-500/40 mt-8" : ""}
        bg-amber-500/10 text-foreground
      `}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <AlertDescription className="text-sm">
            <strong className="font-semibold">Important Disclaimer:</strong>{" "}
            This platform provides scenario analysis for educational and
            informational purposes only. It is not financial advice, investment
            advice, trading advice, or a recommendation to buy or sell any
            securities. All trading and investment decisions carry risk. You
            should conduct your own research and consult with a licensed
            financial advisor before making any investment decisions.
          </AlertDescription>
        </div>
        {variant === "dismissible" && (
          <button
            onClick={() => setIsDismissed(true)}
            className="flex-shrink-0 p-1 hover:bg-muted/50 rounded transition-colors"
            aria-label="Dismiss disclaimer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </Alert>
  );
};

export default DisclaimerBanner;

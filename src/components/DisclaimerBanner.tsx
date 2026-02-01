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
      <div className="text-xs text-foreground/80 text-center py-2 border-t border-border/50">
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
        ${isHeader ? "rounded-xl shadow-sm" : ""}
        ${isFooter ? "rounded-xl mt-8" : ""}
        backdrop-blur-xl
        bg-background/70 dark:bg-background/45 text-foreground
        border border-amber-500/25 dark:border-amber-400/20
      `}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-700 dark:text-amber-300 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <AlertDescription className="text-sm leading-relaxed text-foreground/90">
            <strong className="font-semibold text-foreground">Important Disclaimer:</strong>{" "}
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
            className="flex-shrink-0 p-1 rounded transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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

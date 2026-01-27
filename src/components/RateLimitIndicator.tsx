import React from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Clock, TrendingUp } from "lucide-react";
import { useRateLimits } from "@/hooks/useRateLimits";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface RateLimitIndicatorProps {
  endpoint?: "analyzeChart" | "analyzeMarket" | "marketData";
  compact?: boolean;
}

const RateLimitIndicator: React.FC<RateLimitIndicatorProps> = ({
  endpoint = "analyzeChart",
  compact = false,
}) => {
  const {
    rateLimits,
    canMakeRequest,
    formatTimeRemaining,
    getUsagePercentage,
  } = useRateLimits();

  const limit = rateLimits[endpoint];
  const usage = getUsagePercentage(endpoint);
  const canRequest = canMakeRequest(endpoint);

  // Get color based on remaining requests
  const getStatusColor = () => {
    if (limit.remaining === 0) return "text-destructive";
    if (limit.remaining <= limit.limit * 0.2) return "text-amber-500";
    return "text-bullish";
  };

  const getProgressColor = () => {
    if (usage >= 90) return "bg-destructive";
    if (usage >= 70) return "bg-amber-500";
    return "bg-bullish";
  };

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2 text-sm">
              <Badge
                variant={canRequest ? "default" : "destructive"}
                className="flex items-center gap-1"
              >
                <TrendingUp className="h-3 w-3" />
                {limit.remaining}/{limit.limit}
              </Badge>
              {!canRequest && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTimeRemaining(endpoint)}
                </span>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-semibold">Rate Limit Status</p>
            <p className="text-xs text-muted-foreground">
              {limit.remaining} requests remaining
            </p>
            {!canRequest && (
              <p className="text-xs text-destructive">
                Resets in {formatTimeRemaining(endpoint)}
              </p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Card className="glass-panel-subtle">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            API Usage
          </CardTitle>
          {limit.isLimited && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Limit Reached
            </Badge>
          )}
        </div>
        <CardDescription>
          Monitor your request limits and usage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Chart Analysis */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Chart Analysis</span>
            <span className={getStatusColor()}>
              {rateLimits.analyzeChart.remaining}/{rateLimits.analyzeChart.limit}
            </span>
          </div>
          <Progress
            value={getUsagePercentage("analyzeChart")}
            className="h-2"
          />
          {rateLimits.analyzeChart.isLimited && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Resets in {formatTimeRemaining("analyzeChart")}
            </p>
          )}
        </div>

        {/* Market Analysis */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Market Analysis</span>
            <span className={getStatusColor()}>
              {rateLimits.analyzeMarket.remaining}/{rateLimits.analyzeMarket.limit}
            </span>
          </div>
          <Progress
            value={getUsagePercentage("analyzeMarket")}
            className="h-2"
          />
          {rateLimits.analyzeMarket.isLimited && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Resets in {formatTimeRemaining("analyzeMarket")}
            </p>
          )}
        </div>

        {/* Market Data */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Market Data</span>
            <span className={getStatusColor()}>
              {rateLimits.marketData.remaining}/{rateLimits.marketData.limit}
            </span>
          </div>
          <Progress
            value={getUsagePercentage("marketData")}
            className="h-2"
          />
          {rateLimits.marketData.isLimited && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Resets in {formatTimeRemaining("marketData")}
            </p>
          )}
        </div>

        {/* Info message */}
        {Object.values(rateLimits).some((limit) => limit.isLimited) && (
          <div className="bg-muted/50 p-3 rounded-lg border border-border">
            <p className="text-xs text-muted-foreground">
              <strong>Rate limit reached.</strong> Please wait for the cooldown
              period to expire before making more requests.
            </p>
          </div>
        )}

        {/* Upgrade message (if applicable) */}
        <div className="bg-primary/10 p-3 rounded-lg border border-primary/20">
          <p className="text-xs text-foreground">
            <strong>Need more requests?</strong> Upgrade to premium for higher
            rate limits and priority processing.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RateLimitIndicator;

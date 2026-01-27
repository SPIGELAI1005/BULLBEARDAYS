import { Target, TrendingUp, AlertTriangle, Crosshair } from "lucide-react";
import { TradingStrategy, TRADING_STRATEGIES } from "./TradingStrategySelector";
import { useCurrency } from "@/hooks/useCurrency";

interface PriceTarget {
  price: number;
  confidence: number;
}

interface ConfidenceInterval {
  low: number;
  high: number;
  timeframe: string;
}

interface PriceTargetsProps {
  currentPrice?: number;
  priceTargets?: {
    conservative?: PriceTarget;
    moderate?: PriceTarget;
    aggressive?: PriceTarget;
  };
  confidenceIntervals?: {
    short?: ConfidenceInterval;
    medium?: ConfidenceInterval;
    long?: ConfidenceInterval;
  };
  signal: "BUY" | "SELL" | "HOLD";
  tradingStrategy?: TradingStrategy;
}

const PriceTargets = ({ currentPrice, priceTargets, confidenceIntervals, signal, tradingStrategy = 'swingTrader' }: PriceTargetsProps) => {
  const { formatConverted } = useCurrency();
  
  if (!priceTargets && !confidenceIntervals) return null;

  const getTargetColor = (confidence: number) => {
    if (confidence >= 70) return "text-bullish";
    if (confidence >= 50) return "text-accent";
    return "text-bearish";
  };

  const isBullish = signal === "BUY";
  
  // Get timeframe labels based on trading strategy
  const strategyConfig = TRADING_STRATEGIES.find(s => s.id === tradingStrategy) || TRADING_STRATEGIES[2];
  const timeframeLabels = strategyConfig.timeframes;

  return (
    <div className="space-y-4">
      {/* Price Targets */}
      {priceTargets && (
        <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            Price Targets
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {priceTargets.conservative && (
              <div className="p-3 rounded-lg bg-bullish/5 border border-bullish/20 text-center">
                <div className="text-xs text-muted-foreground mb-1">Conservative</div>
                <div className="font-semibold text-bullish">
                  {formatConverted(priceTargets.conservative.price, "USD")}
                </div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <div className="h-1.5 w-full max-w-[40px] rounded-full bg-muted/30 overflow-hidden">
                    <div 
                      className="h-full bg-bullish transition-all"
                      style={{ width: `${priceTargets.conservative.confidence}%` }}
                    />
                  </div>
                  <span className="text-xs text-bullish">{priceTargets.conservative.confidence}%</span>
                </div>
              </div>
            )}
            {priceTargets.moderate && (
              <div className="p-3 rounded-lg bg-accent/5 border border-accent/20 text-center">
                <div className="text-xs text-muted-foreground mb-1">Moderate</div>
                <div className="font-semibold text-accent">
                  {formatConverted(priceTargets.moderate.price, "USD")}
                </div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <div className="h-1.5 w-full max-w-[40px] rounded-full bg-muted/30 overflow-hidden">
                    <div 
                      className="h-full bg-accent transition-all"
                      style={{ width: `${priceTargets.moderate.confidence}%` }}
                    />
                  </div>
                  <span className="text-xs text-accent">{priceTargets.moderate.confidence}%</span>
                </div>
              </div>
            )}
            {priceTargets.aggressive && (
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-center">
                <div className="text-xs text-muted-foreground mb-1">Aggressive</div>
                <div className="font-semibold text-primary">
                  {formatConverted(priceTargets.aggressive.price, "USD")}
                </div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <div className="h-1.5 w-full max-w-[40px] rounded-full bg-muted/30 overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all"
                      style={{ width: `${priceTargets.aggressive.confidence}%` }}
                    />
                  </div>
                  <span className="text-xs text-primary">{priceTargets.aggressive.confidence}%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confidence Intervals */}
      {confidenceIntervals && (
        <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-primary" />
            Price Range Predictions
          </h4>
          <div className="space-y-3">
            {confidenceIntervals.short && (
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-12">{timeframeLabels.short.label}</span>
                <div className="flex-1 relative h-6 rounded-lg bg-muted/30 overflow-hidden">
                  {currentPrice && (
                    <>
                      <div 
                        className="absolute top-0 bottom-0 bg-primary/20 border-x border-primary/40"
                        style={{
                          left: `${Math.max(0, ((confidenceIntervals.short.low - currentPrice * 0.9) / (currentPrice * 0.2)) * 100)}%`,
                          width: `${Math.min(100, ((confidenceIntervals.short.high - confidenceIntervals.short.low) / (currentPrice * 0.2)) * 100)}%`
                        }}
                      />
                      <div 
                        className="absolute top-0 bottom-0 w-0.5 bg-foreground"
                        style={{ left: '50%' }}
                      />
                    </>
                  )}
                </div>
                <div className="text-xs text-right min-w-[100px]">
                  <span className="text-bearish">{formatConverted(confidenceIntervals.short.low, "USD")}</span>
                  <span className="text-muted-foreground"> - </span>
                  <span className="text-bullish">{formatConverted(confidenceIntervals.short.high, "USD")}</span>
                </div>
              </div>
            )}
            {confidenceIntervals.medium && (
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-12">{timeframeLabels.medium.label}</span>
                <div className="flex-1 relative h-6 rounded-lg bg-muted/30 overflow-hidden">
                  {currentPrice && (
                    <>
                      <div 
                        className="absolute top-0 bottom-0 bg-accent/20 border-x border-accent/40"
                        style={{
                          left: `${Math.max(0, ((confidenceIntervals.medium.low - currentPrice * 0.85) / (currentPrice * 0.3)) * 100)}%`,
                          width: `${Math.min(100, ((confidenceIntervals.medium.high - confidenceIntervals.medium.low) / (currentPrice * 0.3)) * 100)}%`
                        }}
                      />
                      <div 
                        className="absolute top-0 bottom-0 w-0.5 bg-foreground"
                        style={{ left: '50%' }}
                      />
                    </>
                  )}
                </div>
                <div className="text-xs text-right min-w-[100px]">
                  <span className="text-bearish">{formatConverted(confidenceIntervals.medium.low, "USD")}</span>
                  <span className="text-muted-foreground"> - </span>
                  <span className="text-bullish">{formatConverted(confidenceIntervals.medium.high, "USD")}</span>
                </div>
              </div>
            )}
            {confidenceIntervals.long && (
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-12">{timeframeLabels.long.label}</span>
                <div className="flex-1 relative h-6 rounded-lg bg-muted/30 overflow-hidden">
                  {currentPrice && (
                    <>
                      <div 
                        className="absolute top-0 bottom-0 bg-bullish/20 border-x border-bullish/40"
                        style={{
                          left: `${Math.max(0, ((confidenceIntervals.long.low - currentPrice * 0.7) / (currentPrice * 0.6)) * 100)}%`,
                          width: `${Math.min(100, ((confidenceIntervals.long.high - confidenceIntervals.long.low) / (currentPrice * 0.6)) * 100)}%`
                        }}
                      />
                      <div 
                        className="absolute top-0 bottom-0 w-0.5 bg-foreground"
                        style={{ left: '50%' }}
                      />
                    </>
                  )}
                </div>
                <div className="text-xs text-right min-w-[100px]">
                  <span className="text-bearish">{formatConverted(confidenceIntervals.long.low, "USD")}</span>
                  <span className="text-muted-foreground"> - </span>
                  <span className="text-bullish">{formatConverted(confidenceIntervals.long.high, "USD")}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceTargets;
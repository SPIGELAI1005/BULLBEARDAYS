import { TrendingUp, TrendingDown, Target, Shield, Percent, Brain, AlertTriangle, CheckCircle2 } from "lucide-react";
import PriceTargets from "./PriceTargets";
import QuickActions from "./QuickActions";
import TradingStrategySelector, { TradingStrategy } from "./TradingStrategySelector";

interface PriceTarget {
  price: number;
  confidence: number;
}

interface ConfidenceInterval {
  low: number;
  high: number;
  timeframe: string;
}

interface AnalysisData {
  signal: "BUY" | "SELL" | "HOLD";
  probability: number;
  takeProfit: string;
  stopLoss: string;
  riskReward: string;
  reasoning: {
    bullish: string[];
    bearish: string[];
  };
  chartAnalysis: string;
  marketSentiment: string;
  aiModel: string;
  detectedAsset?: string;
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
}

interface AnalysisResultsProps {
  analysis: AnalysisData | null;
  isLoading: boolean;
  tradingStrategy?: TradingStrategy;
  onStrategyChange?: (strategy: TradingStrategy) => void;
}

const AnalysisResults = ({ analysis, isLoading, tradingStrategy = 'swingTrader', onStrategyChange }: AnalysisResultsProps) => {
  if (isLoading) {
    return (
      <div className="glass-trading p-8">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="relative w-20 h-20 mb-6">
            <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
            <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <div className="absolute inset-2 rounded-full border-2 border-accent/30 border-b-transparent animate-spin animation-delay-150" style={{ animationDirection: 'reverse' }} />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">Analyzing Chart</h3>
          <p className="text-sm text-muted-foreground text-center max-w-xs">
            Running technical analysis, market sentiment check, and AI inference...
          </p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="glass-trading p-8">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <div className="p-4 rounded-2xl bg-muted/50 mb-4">
            <Brain className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            Ready to Analyze
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Upload a chart screenshot and select AI models to receive trading insights
          </p>
        </div>
      </div>
    );
  }

  const isBullish = analysis.signal === "BUY";
  const isBearish = analysis.signal === "SELL";

  return (
    <div className={`glass-trading p-6 ${isBullish ? 'signal-pulse-bullish glow-bullish' : isBearish ? 'signal-pulse-bearish glow-bearish' : ''}`}>
      {/* Signal Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${
            isBullish ? 'bg-bullish/20' : isBearish ? 'bg-bearish/20' : 'bg-neutral/20'
          }`}>
            {isBullish ? (
              <TrendingUp className="w-6 h-6 text-bullish" />
            ) : (
              <TrendingDown className="w-6 h-6 text-bearish" />
            )}
          </div>
          <div>
            <div className={`text-2xl font-bold ${
              isBullish ? 'text-gradient-bullish' : isBearish ? 'text-gradient-bearish' : 'text-gradient-gold'
            }`}>
              {analysis.signal}
            </div>
            <div className="text-sm text-muted-foreground">
              via {analysis.aiModel}
            </div>
          </div>
        </div>
        
        {/* Probability Ring */}
        <div className="relative w-16 h-16">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="2"
            />
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              stroke={isBullish ? "hsl(var(--bullish))" : isBearish ? "hsl(var(--bearish))" : "hsl(var(--neutral))"}
              strokeWidth="2"
              strokeDasharray={`${analysis.probability} 100`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold">{analysis.probability}%</span>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-bullish" />
            <span className="text-xs text-muted-foreground">Take Profit</span>
          </div>
          <div className="font-semibold text-bullish">{analysis.takeProfit}</div>
        </div>
        
        <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-bearish" />
            <span className="text-xs text-muted-foreground">Stop Loss</span>
          </div>
          <div className="font-semibold text-bearish">{analysis.stopLoss}</div>
        </div>
        
        <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
          <div className="flex items-center gap-2 mb-1">
            <Percent className="w-4 h-4 text-accent" />
            <span className="text-xs text-muted-foreground">R:R Ratio</span>
          </div>
          <div className="font-semibold text-accent">{analysis.riskReward}</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <QuickActions 
          asset={analysis.detectedAsset}
          takeProfit={analysis.takeProfit}
          stopLoss={analysis.stopLoss}
          currentPrice={analysis.currentPrice}
        />
      </div>

      {/* Trading Strategy Selector */}
      {onStrategyChange && (
        <div className="mb-6">
          <TradingStrategySelector
            selectedStrategy={tradingStrategy}
            onStrategyChange={onStrategyChange}
          />
        </div>
      )}

      {/* Price Targets & Confidence Intervals */}
      {(analysis.priceTargets || analysis.confidenceIntervals) && (
        <div className="mb-6">
          <PriceTargets
            currentPrice={analysis.currentPrice}
            priceTargets={analysis.priceTargets}
            confidenceIntervals={analysis.confidenceIntervals}
            signal={analysis.signal}
            tradingStrategy={tradingStrategy}
          />
        </div>
      )}

      {/* Analysis Sections */}
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
          <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary" />
            Chart Analysis
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {analysis.chartAnalysis}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
          <h4 className="text-sm font-medium text-foreground mb-2">Market Sentiment</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {analysis.marketSentiment}
          </p>
        </div>

        {/* Reasoning */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-bullish/5 border border-bullish/20">
            <h4 className="text-sm font-medium text-bullish mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Why It Could Succeed
            </h4>
            <ul className="space-y-2">
              {analysis.reasoning.bullish.map((reason, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                  <span className="text-bullish mt-0.5">•</span>
                  {reason}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="p-4 rounded-xl bg-bearish/5 border border-bearish/20">
            <h4 className="text-sm font-medium text-bearish mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Risk Factors
            </h4>
            <ul className="space-y-2">
              {analysis.reasoning.bearish.map((reason, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                  <span className="text-bearish mt-0.5">•</span>
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResults;
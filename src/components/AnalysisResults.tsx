import { TrendingUp, TrendingDown, Target, Shield, Percent, Brain, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import PriceTargets from "./PriceTargets";
import QuickActions from "./QuickActions";
import TradingStrategySelector from "./TradingStrategySelector";
import DisclaimerBanner from "./DisclaimerBanner";
import {
  UnifiedAnalysis,
  TradingStrategy,
  isScenarioAnalysis,
  isLegacyAnalysis,
  Scenario,
} from "@/lib/types";

interface AnalysisResultsProps {
  analysis: UnifiedAnalysis | null;
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
            Ready for Scenario Analysis
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Upload a chart screenshot to receive bull/bear scenario analysis
          </p>
        </div>
      </div>
    );
  }

  // Support both old (signal/probability) and new (trendBias/confidenceScore) formats
  const displayBias = isScenarioAnalysis(analysis)
    ? analysis.trendBias
    : (analysis.signal === "BUY" ? "BULLISH" :
       analysis.signal === "SELL" ? "BEARISH" : "NEUTRAL");

  const displayConfidence = isScenarioAnalysis(analysis)
    ? analysis.confidenceScore
    : analysis.probability;

  const isBullish = displayBias === "BULLISH";
  const isBearish = displayBias === "BEARISH";
  const isNeutral = displayBias === "NEUTRAL";

  // Extract or construct scenario data
  const bullScenario: Scenario | null = isScenarioAnalysis(analysis)
    ? analysis.bullScenario
    : isLegacyAnalysis(analysis)
    ? {
        thesis: analysis.chartAnalysis || "Potential bullish setup based on technical analysis",
        evidence: analysis.reasoning?.bullish ?? [],
        keyLevels: {
          support: [],
          resistance: analysis.takeProfit ? [analysis.takeProfit] : []
        },
        invalidation: analysis.stopLoss || "N/A",
        riskNotes: analysis.reasoning?.bearish ?? []
      }
    : null;

  const bearScenario: Scenario | null = isScenarioAnalysis(analysis)
    ? analysis.bearScenario
    : isLegacyAnalysis(analysis)
    ? {
        thesis: analysis.marketSentiment || "Potential bearish risks based on market conditions",
        evidence: analysis.reasoning?.bearish ?? [],
        keyLevels: {
          support: analysis.stopLoss ? [analysis.stopLoss] : [],
          resistance: []
        },
        invalidation: analysis.takeProfit || "N/A",
        riskNotes: analysis.reasoning?.bullish ?? []
      }
    : null;

  return (
    <div className="space-y-6">
      {/* Trend Bias Header - Neutral presentation */}
      <div className="glass-trading p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${
              isBullish ? 'bg-bullish/20' : isBearish ? 'bg-bearish/20' : 'bg-neutral/20'
            }`}>
              {isBullish ? (
                <TrendingUp className="w-6 h-6 text-bullish" />
              ) : isBearish ? (
                <TrendingDown className="w-6 h-6 text-bearish" />
              ) : (
                <TrendingUp className="w-6 h-6 text-neutral" />
              )}
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Current Technical Bias
              </div>
              <div className={`text-2xl font-bold ${
                isBullish ? 'text-gradient-bullish' : isBearish ? 'text-gradient-bearish' : 'text-gradient-gold'
              }`}>
                {displayBias}
              </div>
              <div className="text-sm text-muted-foreground">
                via {analysis.aiModel}
              </div>
            </div>
          </div>

          {/* Confidence Ring */}
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
                strokeDasharray={`${displayConfidence} 100`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-sm font-bold">{displayConfidence}%</span>
              <span className="text-[8px] text-muted-foreground">confidence</span>
            </div>
          </div>
        </div>

        {/* Context Info */}
        {isScenarioAnalysis(analysis) && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-border/30 pt-4">
            <div className="flex items-center gap-1">
              <span className="font-medium">Instrument:</span>
              <span>{analysis.instrument.final}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-medium">Timeframe:</span>
              <span>{analysis.timeframe.final}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-medium">Strategy:</span>
              <span className="capitalize">{analysis.strategy}</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions & Strategy Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-trading p-4">
          <QuickActions
            asset={isScenarioAnalysis(analysis) ? analysis.instrument.final : analysis.detectedAsset}
            takeProfit={isLegacyAnalysis(analysis) ? analysis.takeProfit : undefined}
            stopLoss={isLegacyAnalysis(analysis) ? analysis.stopLoss : undefined}
            currentPrice={analysis.currentPrice}
          />
        </div>

        {onStrategyChange && (
          <div className="glass-trading p-4">
            <TradingStrategySelector
              selectedStrategy={tradingStrategy}
              onStrategyChange={onStrategyChange}
            />
          </div>
        )}
      </div>

      {/* Price Targets & Confidence Intervals */}
      {(analysis.priceTargets || analysis.confidenceIntervals) && (
        <div className="glass-trading p-6">
          <PriceTargets
            currentPrice={analysis.currentPrice}
            priceTargets={analysis.priceTargets}
            confidenceIntervals={analysis.confidenceIntervals}
            signal={isScenarioAnalysis(analysis)
              ? (analysis.trendBias === "BULLISH" ? "BUY" : analysis.trendBias === "BEARISH" ? "SELL" : "HOLD")
              : analysis.signal}
            tradingStrategy={tradingStrategy}
          />
        </div>
      )}

      {/* Dual Scenario Cards - The Main Feature */}
      <div className="text-sm text-muted-foreground text-center mb-2">
        Educational Analysis: Both Scenarios Presented
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bull Scenario Card */}
        {bullScenario && (
          <div className={`glass-trading p-6 border-2 ${
            isBullish ? 'border-bullish/40 bg-bullish/5' : 'border-bullish/20'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-bullish/20">
                <TrendingUp className="w-5 h-5 text-bullish" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-bullish flex items-center gap-2">
                  Bull Scenario
                  {isBullish && (
                    <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-bullish/20 text-bullish">
                      Current Bias
                    </span>
                  )}
                </h3>
                <p className="text-xs text-muted-foreground">Upside potential analysis</p>
              </div>
            </div>

            {/* Thesis */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-bullish" />
                Thesis
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {bullScenario.thesis}
              </p>
            </div>

            {/* Evidence */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-foreground mb-2">Supporting Evidence</h4>
              <ul className="space-y-2">
                {bullScenario.evidence.map((evidence, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                    <span className="text-bullish mt-0.5 font-bold">✓</span>
                    {evidence}
                  </li>
                ))}
              </ul>
            </div>

            {/* Key Levels */}
            {(bullScenario.keyLevels?.support?.length || bullScenario.keyLevels?.resistance?.length) && (
              <div className="mb-4 p-3 rounded-lg bg-muted/30 border border-border/50">
                <h4 className="text-xs font-semibold text-foreground mb-2">Key Levels</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {bullScenario.keyLevels.support && bullScenario.keyLevels.support.length > 0 && (
                    <div>
                      <div className="text-muted-foreground mb-1">Support</div>
                      {bullScenario.keyLevels.support.map((level, i) => (
                        <div key={i} className="font-medium text-bullish">{level}</div>
                      ))}
                    </div>
                  )}
                  {bullScenario.keyLevels.resistance && bullScenario.keyLevels.resistance.length > 0 && (
                    <div>
                      <div className="text-muted-foreground mb-1">Resistance</div>
                      {bullScenario.keyLevels.resistance.map((level, i) => (
                        <div key={i} className="font-medium text-foreground">{level}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Invalidation */}
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-foreground mb-1 flex items-center gap-1">
                <XCircle className="w-3 h-3 text-bearish" />
                Invalidation
              </h4>
              <p className="text-xs text-muted-foreground">{bullScenario.invalidation}</p>
            </div>

            {/* Risks */}
            <div>
              <h4 className="text-xs font-semibold text-foreground mb-2">Risk Factors</h4>
              <ul className="space-y-1">
                {bullScenario.riskNotes.map((risk, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">⚠</span>
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Bear Scenario Card */}
        {bearScenario && (
          <div className={`glass-trading p-6 border-2 ${
            isBearish ? 'border-bearish/40 bg-bearish/5' : 'border-bearish/20'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-bearish/20">
                <TrendingDown className="w-5 h-5 text-bearish" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-bearish flex items-center gap-2">
                  Bear Scenario
                  {isBearish && (
                    <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-bearish/20 text-bearish">
                      Current Bias
                    </span>
                  )}
                </h3>
                <p className="text-xs text-muted-foreground">Downside risk analysis</p>
              </div>
            </div>

            {/* Thesis */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-bearish" />
                Thesis
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {bearScenario.thesis}
              </p>
            </div>

            {/* Evidence */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-foreground mb-2">Supporting Evidence</h4>
              <ul className="space-y-2">
                {bearScenario.evidence.map((evidence, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                    <span className="text-bearish mt-0.5 font-bold">▼</span>
                    {evidence}
                  </li>
                ))}
              </ul>
            </div>

            {/* Key Levels */}
            {(bearScenario.keyLevels?.support?.length || bearScenario.keyLevels?.resistance?.length) && (
              <div className="mb-4 p-3 rounded-lg bg-muted/30 border border-border/50">
                <h4 className="text-xs font-semibold text-foreground mb-2">Key Levels</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {bearScenario.keyLevels.support && bearScenario.keyLevels.support.length > 0 && (
                    <div>
                      <div className="text-muted-foreground mb-1">Support</div>
                      {bearScenario.keyLevels.support.map((level, i) => (
                        <div key={i} className="font-medium text-foreground">{level}</div>
                      ))}
                    </div>
                  )}
                  {bearScenario.keyLevels.resistance && bearScenario.keyLevels.resistance.length > 0 && (
                    <div>
                      <div className="text-muted-foreground mb-1">Resistance</div>
                      {bearScenario.keyLevels.resistance.map((level, i) => (
                        <div key={i} className="font-medium text-bearish">{level}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Invalidation */}
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-foreground mb-1 flex items-center gap-1">
                <XCircle className="w-3 h-3 text-bullish" />
                Invalidation
              </h4>
              <p className="text-xs text-muted-foreground">{bearScenario.invalidation}</p>
            </div>

            {/* Risks */}
            <div>
              <h4 className="text-xs font-semibold text-foreground mb-2">Risk Factors</h4>
              <ul className="space-y-1">
                {bearScenario.riskNotes.map((risk, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">⚠</span>
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Footer Disclaimer */}
      <div className="glass-trading p-4">
        <DisclaimerBanner variant="persistent" position="footer" compact />
      </div>
    </div>
  );
};

export default AnalysisResults;

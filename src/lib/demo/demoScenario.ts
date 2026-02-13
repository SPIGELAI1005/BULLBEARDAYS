import type { ScenarioAnalysis, TradingStrategy } from "@/lib/types";

export function createDemoScenario(args?: {
  strategy?: TradingStrategy;
  timeframe?: string;
  instrument?: string;
  aiModel?: string;
}): ScenarioAnalysis {
  const instrument = args?.instrument ?? "BTC/USD";
  const timeframe = args?.timeframe ?? "1D";
  const strategy = args?.strategy ?? "swingTrader";

  return {
    trendBias: "NEUTRAL",
    confidenceScore: 55,
    instrument: {
      detected: instrument,
      selected: instrument,
      final: instrument,
      confidence: 90,
    },
    timeframe: {
      detected: timeframe,
      selected: timeframe,
      final: timeframe,
    },
    strategy,
    bullScenario: {
      thesis: "Demo mode: A bullish continuation is possible if price holds above the nearest support and momentum improves.",
      evidence: [
        "Higher lows forming near support",
        "Consolidation after an impulse move",
        "Potential breakout structure developing",
      ],
      keyLevels: {
        support: ["S1 (local)", "S2 (major)"],
        resistance: ["R1 (local)", "R2 (major)"],
      },
      invalidation: "Breakdown below S2 on strong volume",
      riskNotes: ["False breakout risk", "Low liquidity / news shock"],
    },
    bearScenario: {
      thesis: "Demo mode: A bearish reversal remains possible if price rejects at resistance and breaks the range low.",
      evidence: [
        "Weak follow-through on recent pushes up",
        "Range-bound price action",
        "Potential distribution near resistance",
      ],
      keyLevels: {
        support: ["S1 (local)", "S2 (major)"],
        resistance: ["R1 (local)", "R2 (major)"],
      },
      invalidation: "Breakout above R2 with sustained momentum",
      riskNotes: ["Short squeeze risk", "Trend resumption higher"],
    },
    aiModel: args?.aiModel ?? "Demo Mode",
    modelsUsed: ["demo"],
    currentPrice: null,
    takeProfit: "N/A",
    stopLoss: "N/A",
    riskReward: "N/A",
    promptVersion: "demo",
    apiVersion: "demo",
  };
}

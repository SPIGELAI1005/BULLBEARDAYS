import { supabase } from "@/integrations/supabase/client";
import {
  UnifiedAnalysis,
  ScenarioAnalysis,
  LegacyAnalysis,
  PriceTarget,
  ConfidenceInterval,
  MarketCategory,
  MarketDataItem,
  TradingStrategy,
  isScenarioAnalysis,
  isLegacyAnalysis,
} from "@/lib/types";
import {
  safeValidateScenarioAnalysis,
  createFallbackScenario,
  validatePartialScenario,
} from "@/lib/schemas";
import { createUsageLimitReachedError } from "@/lib/billing/usageLimit";

// Legacy AnalysisResult type - kept for backward compatibility
// New code should use UnifiedAnalysis from types.ts
export interface AnalysisResult {
  signal: "BUY" | "SELL" | "HOLD";
  probability: number;
  takeProfit: string;
  stopLoss: string;
  riskReward: string;
  detectedAsset: string;
  timeframe: string;
  chartAnalysis: string;
  marketSentiment: string;
  bullishReasons: string[];
  bearishReasons: string[];
  aiModel: string;
  modelsUsed?: string[];
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

interface UsageLimitPayload {
  code?: string;
  message?: string;
  current_usage?: number;
  limit_value?: number;
}

function analysisResultToLegacyAnalysis(result: AnalysisResult): LegacyAnalysis {
  return {
    signal: result.signal,
    probability: result.probability,
    takeProfit: result.takeProfit,
    stopLoss: result.stopLoss,
    riskReward: result.riskReward,
    reasoning: {
      bullish: Array.isArray(result.bullishReasons) ? result.bullishReasons : [],
      bearish: Array.isArray(result.bearishReasons) ? result.bearishReasons : [],
    },
    chartAnalysis: result.chartAnalysis,
    marketSentiment: result.marketSentiment,
    aiModel: result.aiModel,
    detectedAsset: result.detectedAsset,
    currentPrice: result.currentPrice,
    priceTargets: result.priceTargets,
    confidenceIntervals: result.confidenceIntervals,
    // Keep timeframe for storage (legacy helper reads it via `as any`)
    ...(result.timeframe ? { timeframe: result.timeframe } : {}),
  } as LegacyAnalysis;
}

function isAnalysisResult(value: unknown): value is AnalysisResult {
  if (!value || typeof value !== "object") return false;
  const maybe = value as Partial<AnalysisResult>;
  return (
    typeof maybe.signal === "string" &&
    typeof maybe.probability === "number" &&
    Array.isArray(maybe.bullishReasons) &&
    Array.isArray(maybe.bearishReasons)
  );
}

function isResponseLike(value: unknown): value is { clone: () => unknown; json: () => Promise<unknown> } {
  return (
    !!value &&
    typeof value === "object" &&
    "json" in value &&
    typeof (value as { json?: unknown }).json === "function"
  );
}

function isFunctionsHttpError(value: unknown): value is { context: unknown } {
  return !!value && typeof value === "object" && "context" in value;
}

async function throwUsageLimitIfPresent(error: unknown): Promise<void> {
  if (!isFunctionsHttpError(error)) return;
  const context = (error as { context?: unknown }).context;
  if (!isResponseLike(context)) return;

  try {
    const raw = await (context as { clone?: () => unknown; json: () => Promise<unknown> }).json();
    if (!raw || typeof raw !== "object") return;
    const payload = raw as UsageLimitPayload;
    if (payload.code !== "USAGE_LIMIT_REACHED") return;

    throw createUsageLimitReachedError({
      message:
        payload.message ||
        "Monthly analysis limit reached. Please upgrade to continue.",
      currentUsage: payload.current_usage,
      limitValue: payload.limit_value,
    });
  } catch {
    // If we can't parse structured payload, fall back to generic handling upstream.
  }
}

export async function analyzeChart(
  imageBase64: string,
  selectedModels: string[],
  referenceModel: string,
  options?: {
    strategy?: TradingStrategy;
    timeframe?: string;
    instrument?: string;
  }
): Promise<UnifiedAnalysis> {
  const { data, error } = await supabase.functions.invoke('analyze-chart', {
    body: {
      imageBase64,
      selectedModels,
      referenceModel,
      strategy: options?.strategy,
      timeframe: options?.timeframe,
      instrument: options?.instrument,
    },
  });

  if (error) {
    console.error("Analysis error:", error);
    await throwUsageLimitIfPresent(error);
    throw new Error(error.message || "Failed to analyze chart");
  }

  if (data.error) {
    throw new Error(data.error);
  }

  // Validate response with Zod
  const validationResult = safeValidateScenarioAnalysis(data);

  if (!validationResult.success) {
    console.warn("⚠️ API response validation failed:", validationResult.error.errors);

    // Check if this is a partial valid response
    const partialValidation = validatePartialScenario(data);

    if (!partialValidation.valid) {
      console.error("Validation errors:", partialValidation.errors);
    }

    // Return fallback scenario if validation fails
    const fallback = createFallbackScenario("Client-side validation failed", {
      aiModel: data?.aiModel || "AI Assistant",
      strategy: options?.strategy,
      timeframe: options?.timeframe
        ? {
            selected: options.timeframe,
            final: options.timeframe,
          }
        : undefined,
      instrument: options?.instrument
        ? {
            selected: options.instrument,
            final: options.instrument,
          }
        : undefined,
    });

    return fallback;
  }

  console.log("✅ Client-side validation successful");

  // Return validated data
  return validationResult.data as UnifiedAnalysis;
}

export async function fetchMarketData(): Promise<MarketDataItem[]> {
  const { data, error } = await supabase.functions.invoke('market-data');

  if (error) {
    console.error("Market data error:", error);
    throw new Error(error.message || "Failed to fetch market data");
  }

  return data.data as MarketDataItem[];
}

export async function analyzeMarketData(marketData: MarketDataItem): Promise<UnifiedAnalysis> {
  const { data, error } = await supabase.functions.invoke('analyze-market', {
    body: marketData,
  });

  if (error) {
    console.error("Market analysis error:", error);
    await throwUsageLimitIfPresent(error);
    throw new Error(error.message || "Failed to analyze market data");
  }

  if (data.error) {
    throw new Error(data.error);
  }

  if (!isAnalysisResult(data)) {
    throw new Error("Unexpected market analysis response shape");
  }

  return analysisResultToLegacyAnalysis(data);
}

export interface AnalysisRecord {
  id: string;
  created_at: string;
  chart_image_url: string | null;

  // Legacy format fields
  detected_asset: string | null;
  timeframe: string | null;
  signal: string;
  probability: number;
  take_profit: string | null;
  stop_loss: string | null;
  risk_reward: string | null;
  chart_analysis: string | null;
  market_sentiment: string | null;
  bullish_reasons: string[] | null;
  bearish_reasons: string[] | null;

  // New scenario format fields (Phase 1)
  trend_bias?: string | null;
  confidence_score?: number | null;
  bull_scenario?: unknown | null;  // JSONB
  bear_scenario?: unknown | null;  // JSONB
  strategy?: string | null;
  detected_timeframe?: string | null;
  selected_timeframe?: string | null;
  final_timeframe?: string | null;
  detected_instrument?: string | null;
  selected_instrument?: string | null;
  final_instrument?: string | null;
  instrument_confidence?: number | null;
  current_price?: number | null;
  prompt_version?: string | null;
  api_version?: string | null;
  models_used?: string[] | null;

  // Metadata
  ai_model: string;
  outcome: string | null;
  outcome_notes: string | null;
  session_id: string | null;
  user_id: string | null;
  notes: string | null;
}

export async function saveAnalysis(
  analysis: UnifiedAnalysis | AnalysisResult,
  chartImageUrl?: string,
  sessionId?: string,
  userId?: string
): Promise<AnalysisRecord> {
  let insertData: Record<string, unknown> = {
    chart_image_url: chartImageUrl || null,
    session_id: sessionId || null,
    user_id: userId || null,
  };

  if (isScenarioAnalysis(analysis)) {
    // Save ScenarioAnalysis in new format
    insertData = {
      ...insertData,
      // New scenario fields
      trend_bias: analysis.trendBias,
      confidence_score: analysis.confidenceScore,
      bull_scenario: analysis.bullScenario,
      bear_scenario: analysis.bearScenario,
      strategy: analysis.strategy,
      detected_timeframe: analysis.timeframe.detected || null,
      selected_timeframe: analysis.timeframe.selected || null,
      final_timeframe: analysis.timeframe.final,
      detected_instrument: analysis.instrument.detected || null,
      selected_instrument: analysis.instrument.selected || null,
      final_instrument: analysis.instrument.final,
      instrument_confidence: analysis.instrument.confidence || null,
      current_price: analysis.currentPrice || null,
      prompt_version: analysis.promptVersion || null,
      api_version: analysis.apiVersion || null,
      models_used: analysis.modelsUsed || null,
      ai_model: analysis.aiModel,

      // Also populate legacy fields for backward compatibility
      signal: analysis.trendBias === 'BULLISH' ? 'BUY' :
              analysis.trendBias === 'BEARISH' ? 'SELL' : 'HOLD',
      probability: analysis.confidenceScore,
      detected_asset: analysis.instrument.final,
      timeframe: analysis.timeframe.final,
      take_profit: analysis.takeProfit || null,
      stop_loss: analysis.stopLoss || null,
      risk_reward: analysis.riskReward || null,
      chart_analysis: analysis.bullScenario.thesis,
      market_sentiment: analysis.bearScenario.thesis,
      bullish_reasons: analysis.bullScenario.evidence,
      bearish_reasons: analysis.bearScenario.evidence,
    };
  } else if (isLegacyAnalysis(analysis)) {
    // Save LegacyAnalysis in legacy format only
    const timeframe = (analysis as unknown as { timeframe?: unknown }).timeframe;
    insertData = {
      ...insertData,
      detected_asset: analysis.detectedAsset || 'Unknown',
      timeframe: typeof timeframe === "string" ? timeframe : '1D',
      signal: analysis.signal,
      probability: analysis.probability,
      take_profit: analysis.takeProfit,
      stop_loss: analysis.stopLoss,
      risk_reward: analysis.riskReward,
      chart_analysis: analysis.chartAnalysis,
      market_sentiment: analysis.marketSentiment,
      bullish_reasons: analysis.reasoning.bullish,
      bearish_reasons: analysis.reasoning.bearish,
      ai_model: analysis.aiModel,
    };
  } else if (isAnalysisResult(analysis)) {
    // Save AnalysisResult in legacy format only
    insertData = {
      ...insertData,
      detected_asset: analysis.detectedAsset,
      timeframe: analysis.timeframe,
      signal: analysis.signal,
      probability: analysis.probability,
      take_profit: analysis.takeProfit,
      stop_loss: analysis.stopLoss,
      risk_reward: analysis.riskReward,
      chart_analysis: analysis.chartAnalysis,
      market_sentiment: analysis.marketSentiment,
      bullish_reasons: analysis.bullishReasons,
      bearish_reasons: analysis.bearishReasons,
      ai_model: analysis.aiModel,
    };
  } else {
    const legacyAnalysis = analysis as LegacyAnalysis;
    const timeframe = (legacyAnalysis as unknown as { timeframe?: unknown }).timeframe;
    insertData = {
      ...insertData,
      detected_asset: legacyAnalysis.detectedAsset || 'Unknown',
      timeframe: typeof timeframe === "string" ? timeframe : '1D',
      signal: legacyAnalysis.signal,
      probability: legacyAnalysis.probability,
      take_profit: legacyAnalysis.takeProfit,
      stop_loss: legacyAnalysis.stopLoss,
      risk_reward: legacyAnalysis.riskReward,
      chart_analysis: legacyAnalysis.chartAnalysis,
      market_sentiment: legacyAnalysis.marketSentiment,
      bullish_reasons: legacyAnalysis.reasoning.bullish,
      bearish_reasons: legacyAnalysis.reasoning.bearish,
      ai_model: legacyAnalysis.aiModel,
    };
  }

  const { data, error } = await supabase
    .from('analyses')
    .insert(insertData as never)
    .select()
    .single();

  if (error) {
    console.error("Save analysis error:", error);
    throw new Error(error.message || "Failed to save analysis");
  }

  return data;
}

export async function getAnalysisHistory(limit = 20, userId?: string): Promise<AnalysisRecord[]> {
  let query = supabase
    .from('analyses')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Fetch history error:", error);
    throw new Error(error.message || "Failed to fetch history");
  }

  return data || [];
}

export async function updateAnalysisOutcome(
  id: string,
  outcome: 'WIN' | 'LOSS' | 'PENDING',
  notes?: string
): Promise<void> {
  const { error } = await supabase
    .from('analyses')
    .update({ outcome, outcome_notes: notes || null })
    .eq('id', id);

  if (error) {
    console.error("Update outcome error:", error);
    throw new Error(error.message || "Failed to update outcome");
  }
}
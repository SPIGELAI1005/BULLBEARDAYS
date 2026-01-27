/**
 * Unified type definitions for BullBearDays scenario analysis
 *
 * This file consolidates all analysis-related types to prevent duplication
 * across components and maintain consistency.
 */

// ============================================================================
// Trading Strategy Types
// ============================================================================

export type TradingStrategy =
  | 'scalper'
  | 'dayTrader'
  | 'swingTrader'
  | 'positionTrader'
  | 'investor';

export interface TradingStrategyConfig {
  id: TradingStrategy;
  name: string;
  description: string;
  timeframes: {
    short: string;
    medium: string;
    long: string;
  };
  risk: 'High' | 'Med-High' | 'Medium' | 'Med-Low' | 'Low';
}

// ============================================================================
// Market Data Types
// ============================================================================

export type MarketCategory = 'crypto' | 'forex' | 'indices' | 'stocks';

export interface MarketDataItem {
  symbol: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  category: MarketCategory;
}

// ============================================================================
// Scenario Analysis Types (NEW - Phase 1)
// ============================================================================

export type TrendBias = 'BULLISH' | 'BEARISH' | 'NEUTRAL';

export interface Scenario {
  thesis: string;
  evidence: string[];
  keyLevels?: {
    support?: string[];
    resistance?: string[];
  };
  invalidation: string;
  riskNotes: string[];
}

export interface InstrumentInfo {
  detected?: string;    // AI-detected instrument
  selected?: string;    // User-selected instrument
  final: string;        // Final instrument used (selected || detected)
  confidence?: number;  // AI confidence in detection (0-100)
}

export interface TimeframeInfo {
  detected?: string;    // AI-detected timeframe
  selected: string;     // User-selected timeframe
  final: string;        // Final timeframe used
}

export interface PriceTarget {
  price: number;
  confidence: number;
}

export interface ConfidenceInterval {
  low: number;
  high: number;
  timeframe: string;
}

// ============================================================================
// Main Analysis Types
// ============================================================================

/**
 * ScenarioAnalysis - New unified format (Phase 1+)
 * This is the target format all components should use
 */
export interface ScenarioAnalysis {
  // Core scenario data
  trendBias: TrendBias;
  confidenceScore: number; // 0-100 - confidence in chart read quality
  bullScenario: Scenario;
  bearScenario: Scenario;

  // Context
  instrument: InstrumentInfo;
  timeframe: TimeframeInfo;
  strategy: TradingStrategy;

  // AI metadata
  aiModel: string;
  modelsUsed?: string[];
  promptVersion?: string;
  apiVersion?: string;

  // Price targets (optional, for market data analysis)
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

  // Database fields (when retrieved from storage)
  id?: string;
  userId?: string;
  createdAt?: string;
  chartImageUrl?: string;
  outcome?: 'WIN' | 'LOSS' | 'PENDING';
  outcomeNotes?: string;
  notes?: string;
}

/**
 * LegacyAnalysis - Old format (backward compatibility)
 * Support during transition period
 */
export interface LegacyAnalysis {
  signal: 'BUY' | 'SELL' | 'HOLD';
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

/**
 * UnifiedAnalysis - Supports both formats during transition
 * Components can check which format they received
 */
export type UnifiedAnalysis = ScenarioAnalysis | LegacyAnalysis;

/**
 * Type guard to check if analysis is new format
 */
export function isScenarioAnalysis(analysis: UnifiedAnalysis): analysis is ScenarioAnalysis {
  return 'trendBias' in analysis && 'bullScenario' in analysis && 'bearScenario' in analysis;
}

/**
 * Type guard to check if analysis is legacy format
 */
export function isLegacyAnalysis(analysis: UnifiedAnalysis): analysis is LegacyAnalysis {
  return 'signal' in analysis && 'probability' in analysis && !('trendBias' in analysis);
}

/**
 * Convert legacy analysis to scenario format
 */
export function convertLegacyToScenario(legacy: LegacyAnalysis): ScenarioAnalysis {
  const trendBias: TrendBias =
    legacy.signal === 'BUY' ? 'BULLISH' :
    legacy.signal === 'SELL' ? 'BEARISH' : 'NEUTRAL';

  return {
    trendBias,
    confidenceScore: legacy.probability,
    bullScenario: {
      thesis: legacy.signal === 'BUY' ? legacy.chartAnalysis : 'Alternative scenario',
      evidence: legacy.reasoning.bullish,
      keyLevels: {
        support: [],
        resistance: [legacy.takeProfit],
      },
      invalidation: legacy.stopLoss,
      riskNotes: legacy.reasoning.bearish,
    },
    bearScenario: {
      thesis: legacy.signal === 'SELL' ? legacy.chartAnalysis : 'Alternative scenario',
      evidence: legacy.reasoning.bearish,
      keyLevels: {
        support: [legacy.stopLoss],
        resistance: [],
      },
      invalidation: legacy.takeProfit,
      riskNotes: legacy.reasoning.bullish,
    },
    instrument: {
      final: legacy.detectedAsset || 'Unknown',
      detected: legacy.detectedAsset,
    },
    timeframe: {
      selected: '1D', // Default fallback
      final: '1D',
    },
    strategy: 'swingTrader', // Default fallback
    aiModel: legacy.aiModel,
    currentPrice: legacy.currentPrice,
    priceTargets: legacy.priceTargets,
    confidenceIntervals: legacy.confidenceIntervals,
  };
}

// ============================================================================
// Database Record Types
// ============================================================================

/**
 * AnalysisRecord - Database representation
 */
export interface AnalysisRecord {
  // Primary keys
  id: string;
  user_id: string;
  created_at: string;

  // Chart
  chart_image_url?: string;

  // Legacy fields (backward compatibility)
  signal?: string;
  probability?: number;
  take_profit?: string;
  stop_loss?: string;
  risk_reward?: string;
  detected_asset?: string;
  timeframe?: string;
  chart_analysis?: string;
  market_sentiment?: string;
  bullish_reasons?: string[];
  bearish_reasons?: string[];

  // New scenario fields (Phase 1+)
  trend_bias?: string;
  confidence_score?: number;
  bull_scenario?: Record<string, any>; // JSON
  bear_scenario?: Record<string, any>; // JSON
  strategy?: string;

  // Timeframe tracking
  detected_timeframe?: string;
  selected_timeframe?: string;
  final_timeframe?: string;

  // Instrument tracking
  detected_instrument?: string;
  selected_instrument?: string;
  final_instrument?: string;
  instrument_confidence?: number;

  // Price data
  current_price?: number;

  // Metadata
  ai_model: string;
  prompt_version?: string;
  api_version?: string;
  models_used?: string[];

  // Outcome tracking
  outcome?: 'WIN' | 'LOSS' | 'PENDING';
  outcome_notes?: string;
  notes?: string;
  session_id?: string;
}

/**
 * Convert database record to unified analysis format
 */
export function recordToAnalysis(record: AnalysisRecord): UnifiedAnalysis {
  // Check if it's a new format record
  if (record.trend_bias && record.bull_scenario && record.bear_scenario) {
    return {
      id: record.id,
      userId: record.user_id,
      createdAt: record.created_at,
      trendBias: record.trend_bias as TrendBias,
      confidenceScore: record.confidence_score || 50,
      bullScenario: record.bull_scenario as Scenario,
      bearScenario: record.bear_scenario as Scenario,
      instrument: {
        detected: record.detected_instrument,
        selected: record.selected_instrument,
        final: record.final_instrument || record.detected_instrument || 'Unknown',
        confidence: record.instrument_confidence,
      },
      timeframe: {
        detected: record.detected_timeframe || record.timeframe,
        selected: record.selected_timeframe || record.timeframe || '1D',
        final: record.final_timeframe || record.timeframe || '1D',
      },
      currentPrice: record.current_price,
      strategy: (record.strategy as TradingStrategy) || 'swingTrader',
      aiModel: record.ai_model,
      promptVersion: record.prompt_version,
      apiVersion: record.api_version,
      chartImageUrl: record.chart_image_url,
      outcome: record.outcome,
      outcomeNotes: record.outcome_notes,
      notes: record.notes,
    };
  }

  // Legacy format
  return {
    signal: (record.signal as 'BUY' | 'SELL' | 'HOLD') || 'HOLD',
    probability: record.probability || 50,
    takeProfit: record.take_profit || '',
    stopLoss: record.stop_loss || '',
    riskReward: record.risk_reward || '',
    reasoning: {
      bullish: record.bullish_reasons || [],
      bearish: record.bearish_reasons || [],
    },
    chartAnalysis: record.chart_analysis || '',
    marketSentiment: record.market_sentiment || '',
    aiModel: record.ai_model,
    detectedAsset: record.detected_asset,
  };
}

// ============================================================================
// All types are already exported above
// ============================================================================

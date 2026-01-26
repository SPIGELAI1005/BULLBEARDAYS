import { supabase } from "@/integrations/supabase/client";

export interface PriceTarget {
  price: number;
  confidence: number;
}

export interface ConfidenceInterval {
  low: number;
  high: number;
  timeframe: string;
}

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

export async function analyzeChart(
  imageBase64: string,
  selectedModels: string[],
  referenceModel: string
): Promise<AnalysisResult> {
  const { data, error } = await supabase.functions.invoke('analyze-chart', {
    body: { imageBase64, selectedModels, referenceModel },
  });

  if (error) {
    console.error("Analysis error:", error);
    throw new Error(error.message || "Failed to analyze chart");
  }

  if (data.error) {
    throw new Error(data.error);
  }

  return data as AnalysisResult;
}

export async function fetchMarketData(): Promise<MarketDataItem[]> {
  const { data, error } = await supabase.functions.invoke('market-data');

  if (error) {
    console.error("Market data error:", error);
    throw new Error(error.message || "Failed to fetch market data");
  }

  return data.data as MarketDataItem[];
}

export async function analyzeMarketData(marketData: MarketDataItem): Promise<AnalysisResult> {
  const { data, error } = await supabase.functions.invoke('analyze-market', {
    body: marketData,
  });

  if (error) {
    console.error("Market analysis error:", error);
    throw new Error(error.message || "Failed to analyze market data");
  }

  if (data.error) {
    throw new Error(data.error);
  }

  return data as AnalysisResult;
}

export interface AnalysisRecord {
  id: string;
  created_at: string;
  chart_image_url: string | null;
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
  ai_model: string;
  outcome: string | null;
  outcome_notes: string | null;
  session_id: string | null;
  user_id: string | null;
  notes: string | null;
}

export async function saveAnalysis(
  analysis: AnalysisResult,
  chartImageUrl?: string,
  sessionId?: string,
  userId?: string
): Promise<AnalysisRecord> {
  const { data, error } = await supabase
    .from('analyses')
    .insert({
      chart_image_url: chartImageUrl || null,
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
      session_id: sessionId || null,
      user_id: userId || null,
    })
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
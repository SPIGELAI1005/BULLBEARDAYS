import { supabase } from "@/integrations/supabase/client";

// This is an enhanced version of api.ts that includes rate limit header parsing
// To use: Replace or merge with existing src/lib/api.ts

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

export interface AnalysisRecord {
  id: string;
  user_id: string;
  created_at: string;
  chart_image_url?: string;
  detected_asset?: string;
  timeframe?: string;
  signal: string;
  probability: number;
  take_profit?: string;
  stop_loss?: string;
  risk_reward?: string;
  chart_analysis?: string;
  market_sentiment?: string;
  bullish_reasons?: string[];
  bearish_reasons?: string[];
  ai_model: string;
  outcome?: string;
  outcome_notes?: string;
  notes?: string;
}

// Rate limit callback type
export type RateLimitCallback = (headers: Headers) => void;

// Enhanced analyze chart with rate limit tracking
export async function analyzeChart(
  imageBase64: string,
  selectedModels: string[],
  referenceModel: string,
  onRateLimitUpdate?: RateLimitCallback
): Promise<AnalysisResult> {
  const response = await fetch(
    `${supabase.functions.getUrl()}/analyze-chart`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
      },
      body: JSON.stringify({ imageBase64, selectedModels, referenceModel }),
    }
  );

  // Parse rate limit headers
  if (onRateLimitUpdate) {
    onRateLimitUpdate(response.headers);
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to analyze chart");
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return data as AnalysisResult;
}

// Enhanced fetch market data with rate limit tracking
export async function fetchMarketData(
  onRateLimitUpdate?: RateLimitCallback
): Promise<MarketDataItem[]> {
  const response = await fetch(
    `${supabase.functions.getUrl()}/market-data`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  // Parse rate limit headers
  if (onRateLimitUpdate) {
    onRateLimitUpdate(response.headers);
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch market data");
  }

  const data = await response.json();
  return data.data as MarketDataItem[];
}

// Enhanced analyze market data with rate limit tracking
export async function analyzeMarketData(
  marketData: MarketDataItem,
  onRateLimitUpdate?: RateLimitCallback
): Promise<AnalysisResult> {
  const response = await fetch(
    `${supabase.functions.getUrl()}/analyze-market`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
      },
      body: JSON.stringify(marketData),
    }
  );

  // Parse rate limit headers
  if (onRateLimitUpdate) {
    onRateLimitUpdate(response.headers);
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to analyze market data");
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return data as AnalysisResult;
}

// Save analysis (unchanged)
export async function saveAnalysis(analysis: Partial<AnalysisRecord>): Promise<string> {
  const { data, error } = await supabase
    .from("analyses")
    .insert([analysis])
    .select()
    .single();

  if (error) {
    console.error("Failed to save analysis:", error);
    throw new Error(error.message);
  }

  return data.id;
}

// Get analysis history (unchanged)
export async function getAnalysisHistory(): Promise<AnalysisRecord[]> {
  const { data, error } = await supabase
    .from("analyses")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch analysis history:", error);
    throw new Error(error.message);
  }

  return data as AnalysisRecord[];
}

// Update analysis outcome (unchanged)
export async function updateAnalysisOutcome(
  analysisId: string,
  outcome: "WIN" | "LOSS" | "PENDING",
  notes?: string
): Promise<void> {
  const { error } = await supabase
    .from("analyses")
    .update({ outcome, outcome_notes: notes })
    .eq("id", analysisId);

  if (error) {
    console.error("Failed to update analysis outcome:", error);
    throw new Error(error.message);
  }
}

// Delete analysis (unchanged)
export async function deleteAnalysis(analysisId: string): Promise<void> {
  const { error } = await supabase
    .from("analyses")
    .delete()
    .eq("id", analysisId);

  if (error) {
    console.error("Failed to delete analysis:", error);
    throw new Error(error.message);
  }
}

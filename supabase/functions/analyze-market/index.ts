import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { handleCors, corsResponse } from "../_shared/cors.ts";
import { checkRateLimit, rateLimitExceededResponse } from "../_shared/rateLimiter.ts";

interface MarketAnalysisRequest {
  symbol: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  volume24h: number;
  high24h: number;
  low24h: number;
}

interface UsageLimitRow {
  allowed: boolean;
  current_usage: number;
  limit_value: number;
  message: string;
}

const modelMapping: Record<string, string> = {
  gemini: "google/gemini-2.5-pro",
  gpt: "openai/gpt-5",
  claude: "google/gemini-2.5-flash",
};

serve(async (req) => {
  // Handle CORS
  const cors = handleCors(req);
  if (cors.response) {
    return cors.response;
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return corsResponse(
        { error: 'Unauthorized - Please sign in to analyze markets' },
        { status: 401, origin: cors.origin }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      return corsResponse(
        { error: 'Unauthorized - Invalid session' },
        { status: 401, origin: cors.origin }
      );
    }

    const userId = claimsData.claims.sub;
    console.log('Authenticated user:', userId);

    // Rate limiting check (20 market analyses per minute)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const rateLimitResult = await checkRateLimit(supabaseAdmin, userId, 'analyze-market');

    if (!rateLimitResult.allowed) {
      return corsResponse(
        rateLimitExceededResponse(rateLimitResult, cors.origin),
        {
          status: 429,
          origin: cors.origin,
          headers: rateLimitResult.headers
        }
      );
    }

    const marketData = await req.json() as MarketAnalysisRequest;

    // Usage limit enforcement (calendar month)
    const { data: usageData, error: usageError } = await supabase.rpc(
      "check_usage_limit",
      {
        target_user_id: userId,
        resource_type_param: "analysis",
        increment_by: 1,
      }
    );

    if (usageError) {
      console.error("Usage limit check failed:", usageError);
      return corsResponse(
        { error: "Unable to verify usage limits. Please try again." },
        { status: 500, origin: cors.origin }
      );
    }

    const usageRow = Array.isArray(usageData) ? (usageData[0] as UsageLimitRow | undefined) : (usageData as UsageLimitRow | null);

    if (!usageRow?.allowed) {
      return corsResponse(
        {
          code: "USAGE_LIMIT_REACHED",
          message:
            usageRow?.message ||
            "Monthly analysis limit reached. Please upgrade to continue.",
          current_usage: usageRow?.current_usage ?? 0,
          limit_value: usageRow?.limit_value ?? 0,
        },
        { status: 402, origin: cors.origin }
      );
    }
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are an expert trading analyst with deep knowledge of technical analysis, market microstructure, and risk management. You analyze market data to provide actionable trading insights.

Based on the provided market data, return a JSON response with the following structure:
{
  "signal": "BUY" | "SELL" | "HOLD",
  "probability": number (0-100, your confidence in the signal),
  "takeProfit": string (e.g., "+2.5%" or specific price level),
  "stopLoss": string (e.g., "-1.2%" or specific price level),
  "riskReward": string (e.g., "1:2.1"),
  "detectedAsset": string (the trading pair),
  "timeframe": string (suggested timeframe for this trade, e.g., "4H", "Daily"),
  "chartAnalysis": string (2-3 sentences about the technical setup based on price action and volume),
  "marketSentiment": string (1-2 sentences about current market momentum),
  "bullishReasons": string[] (3-4 reasons why this trade could succeed),
  "bearishReasons": string[] (2-3 risk factors or reasons it might fail),
  "priceTargets": {
    "conservative": { "price": number, "confidence": number (0-100) },
    "moderate": { "price": number, "confidence": number (0-100) },
    "aggressive": { "price": number, "confidence": number (0-100) }
  },
  "confidenceIntervals": {
    "short": { "low": number, "high": number, "timeframe": "24H" },
    "medium": { "low": number, "high": number, "timeframe": "7D" },
    "long": { "low": number, "high": number, "timeframe": "30D" }
  }
}

Guidelines:
- Analyze the 24h price change, volume, and price range to determine market momentum
- Consider volatility (difference between high and low relative to price)
- Look at the change percentage to gauge short-term trend strength
- Volume is a key indicator of conviction behind price moves
- Be specific about price levels for TP/SL based on the current price and range
- For priceTargets: conservative has highest confidence, aggressive has lowest
- For confidenceIntervals: provide realistic price ranges for each timeframe
- Return ONLY valid JSON, no markdown or extra text`;

    const userPrompt = `Analyze this market data and provide your trading recommendation:

Asset: ${marketData.symbol}
Current Price: $${marketData.price.toLocaleString()}
24h Change: ${marketData.changePercent24h >= 0 ? '+' : ''}${marketData.changePercent24h.toFixed(2)}% ($${marketData.change24h.toFixed(2)})
24h High: $${marketData.high24h.toLocaleString()}
24h Low: $${marketData.low24h.toLocaleString()}
24h Volume: $${marketData.volume24h.toLocaleString()}

Provide your analysis in JSON format.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash", // Using fast model for quick market analysis
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 2000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return corsResponse(
          { error: "Rate limit exceeded. Please try again in a moment." },
          { status: 429, origin: cors.origin }
        );
      }
      if (response.status === 402) {
        return corsResponse(
          { error: "AI credits depleted. Please add credits to continue." },
          { status: 402, origin: cors.origin }
        );
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI analysis failed: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse the JSON response
    let analysis;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      analysis = {
        signal: "HOLD",
        probability: 50,
        takeProfit: "N/A",
        stopLoss: "N/A",
        riskReward: "N/A",
        detectedAsset: marketData.symbol,
        timeframe: "4H",
        chartAnalysis: "Unable to fully analyze the market data. Please try again.",
        marketSentiment: "Analysis inconclusive.",
        bullishReasons: ["Market data needs further analysis"],
        bearishReasons: ["Insufficient data for confident assessment"],
      };
    }

    // Ensure detected asset matches
    analysis.detectedAsset = marketData.symbol;
    analysis.aiModel = "AI Quick Analysis";
    analysis.modelsUsed = ["Google Gemini Flash"];

    return corsResponse(
      analysis,
      {
        status: 200,
        origin: cors.origin,
        headers: rateLimitResult.headers
      }
    );
  } catch (error) {
    console.error("Error in analyze-market:", error);
    return corsResponse(
      { error: "An error occurred during market analysis. Please try again later." },
      { status: 500, origin: cors.origin }
    );
  }
});

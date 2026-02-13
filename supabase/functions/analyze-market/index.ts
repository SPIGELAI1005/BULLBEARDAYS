import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { handleCors, corsResponse } from "../_shared/cors.ts";
import { checkRateLimit, rateLimitExceededResponse } from "../_shared/rateLimiter.ts";
import { callAi } from "../_shared/aiProviders.ts";

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

serve(async (req) => {
  // Handle CORS
  const cors = handleCors(req);
  if (cors.response) {
    return cors.response;
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return corsResponse(
        { error: "Unauthorized - Please sign in to analyze markets" },
        { status: 401, origin: cors.origin },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);

    if (claimsError || !claimsData?.claims) {
      return corsResponse(
        { error: "Unauthorized - Invalid session" },
        { status: 401, origin: cors.origin },
      );
    }

    const userId = claimsData.claims.sub;
    console.log("Authenticated user:", userId);

    // Rate limiting check (20 market analyses per minute)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const rateLimitResult = await checkRateLimit(supabaseAdmin, userId, "analyze-market");

    if (!rateLimitResult.allowed) {
      return corsResponse(rateLimitExceededResponse(rateLimitResult, cors.origin), {
        status: 429,
        origin: cors.origin,
        headers: rateLimitResult.headers,
      });
    }

    const marketData = (await req.json()) as MarketAnalysisRequest;

    // Usage limit enforcement (calendar month)
    const { data: usageData, error: usageError } = await supabase.rpc(
      "check_usage_limit",
      {
        target_user_id: userId,
        resource_type_param: "analysis",
        increment_by: 1,
      },
    );

    if (usageError) {
      console.error("Usage limit check failed:", usageError);
      return corsResponse(
        { error: "Unable to verify usage limits. Please try again." },
        { status: 500, origin: cors.origin },
      );
    }

    const usageRow = Array.isArray(usageData)
      ? (usageData[0] as UsageLimitRow | undefined)
      : (usageData as UsageLimitRow | null);

    if (!usageRow?.allowed) {
      return corsResponse(
        {
          code: "USAGE_LIMIT_REACHED",
          message: usageRow?.message ||
            "Monthly analysis limit reached. Please upgrade to continue.",
          current_usage: usageRow?.current_usage ?? 0,
          limit_value: usageRow?.limit_value ?? 0,
        },
        { status: 402, origin: cors.origin },
      );
    }

    // NOTE: Market analysis is currently legacy (BUY/SELL/HOLD). We keep it for now.
    // If you want full scenario-analysis posture here too, we can refactor in the next step.
    const systemPrompt =
      `You are an expert trading analyst with deep knowledge of technical analysis, market microstructure, and risk management.\n\nBased on the provided market data, return ONLY valid JSON with:\n{\n  \"signal\": \"BUY\"|\"SELL\"|\"HOLD\",\n  \"probability\": number(0-100),\n  \"takeProfit\": string,\n  \"stopLoss\": string,\n  \"riskReward\": string,\n  \"detectedAsset\": string,\n  \"timeframe\": string,\n  \"chartAnalysis\": string,\n  \"marketSentiment\": string,\n  \"bullishReasons\": string[],\n  \"bearishReasons\": string[]\n}`;

    const userPrompt = `Analyze this market data and provide your output in JSON format:\n\nAsset: ${marketData.symbol}\nCurrent Price: $${marketData.price.toLocaleString()}\n24h Change: ${marketData.changePercent24h >= 0 ? "+" : ""}${marketData.changePercent24h.toFixed(2)}% ($${marketData.change24h.toFixed(2)})\n24h High: $${marketData.high24h.toLocaleString()}\n24h Low: $${marketData.low24h.toLocaleString()}\n24h Volume: $${marketData.volume24h.toLocaleString()}`;

    let content: string;

    try {
      // Default fast provider for this endpoint
      const ai = await callAi({
        provider: "gemini",
        model: "gemini-1.5-flash",
        systemPrompt,
        userText: userPrompt,
        maxTokens: 1200,
        temperature: 0.3,
      });
      content = ai.content;
    } catch (providerError) {
      const kind = (providerError as any)?.kind;
      const status = (providerError as any)?.status;
      const body = (providerError as any)?.body;

      console.error("AI provider error:", { kind, status, body });

      if (kind === "rate_limit" || status === 429) {
        return corsResponse(
          { error: "Rate limit exceeded. Please try again in a moment." },
          { status: 429, origin: cors.origin },
        );
      }

      if (kind === "billing" || status === 402) {
        return corsResponse(
          {
            error: "AI_PROVIDER_BILLING_ERROR",
            message:
              "API provider returned a billing error — your API key has run out of credits or has an insufficient balance. Check your provider's billing dashboard and top up or switch to a different API key.",
          },
          { status: 402, origin: cors.origin },
        );
      }

      throw providerError;
    }

    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse JSON
    let analysis: any;
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
    analysis.aiModel = "Google Gemini";
    analysis.modelsUsed = ["gemini-1.5-flash"];

    return corsResponse(analysis, {
      status: 200,
      origin: cors.origin,
      headers: rateLimitResult.headers,
    });
  } catch (error) {
    console.error("Error in analyze-market:", error);
    return corsResponse(
      { error: "An error occurred during market analysis. Please try again later." },
      { status: 500, origin: cors.origin },
    );
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisRequest {
  imageBase64: string;
  selectedModels: string[];
  referenceModel: string;
}

const modelMapping: Record<string, string> = {
  gemini: "google/gemini-2.5-pro",
  gpt: "openai/gpt-5",
  claude: "google/gemini-2.5-flash", // Using Gemini Flash as Claude equivalent
};

const modelDisplayNames: Record<string, string> = {
  gemini: "Google Gemini Pro",
  gpt: "OpenAI GPT-5",
  claude: "AI Assistant", 
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Please sign in to analyze charts' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid session' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;
    console.log('Authenticated user:', userId);

    // Rate limiting check (10 chart analyses per minute)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { data: rateLimitOk } = await supabaseAdmin.rpc('check_rate_limit', {
      p_user_id: userId,
      p_endpoint: 'analyze-chart',
      p_max_requests: 10,
      p_window_minutes: 1
    });

    if (!rateLimitOk) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please wait a moment before trying again.' }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { imageBase64, selectedModels, referenceModel } = await req.json() as AnalysisRequest;
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const model = modelMapping[referenceModel] || "google/gemini-2.5-pro";
    const displayName = modelDisplayNames[referenceModel] || "AI";

    const systemPrompt = `You are an expert trading analyst with deep knowledge of technical analysis, chart patterns, market microstructure, and risk management. You analyze chart screenshots to provide actionable trading insights.

Your task is to analyze the provided chart image and return a JSON response with the following structure:
{
  "signal": "BUY" | "SELL" | "HOLD",
  "probability": number (0-100, your confidence in the signal),
  "takeProfit": string (e.g., "+2.5%" or "+$150"),
  "stopLoss": string (e.g., "-1.2%" or "-$75"),
  "riskReward": string (e.g., "1:2.1"),
  "detectedAsset": string (the trading pair or asset you identify, e.g., "BTC/USDT", "EUR/USD", "AAPL"),
  "timeframe": string (the chart timeframe you detect, e.g., "15m", "1H", "4H", "Daily"),
  "chartAnalysis": string (2-3 sentences about the technical setup, patterns, indicators),
  "marketSentiment": string (1-2 sentences about broader market context),
  "bullishReasons": string[] (3-4 reasons why this trade could succeed),
  "bearishReasons": string[] (2-3 risk factors or reasons it might fail)
}

Guidelines:
- Look for candlestick patterns, support/resistance levels, trend lines, and common indicators
- Be specific about price levels when possible
- Consider risk/reward ratio in your analysis
- Be honest about uncertainty - if the chart is unclear, reflect that in lower probability
- Always provide balanced analysis with both bullish and bearish considerations
- Return ONLY valid JSON, no markdown or extra text`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { 
            role: "user", 
            content: [
              {
                type: "text",
                text: "Analyze this trading chart and provide your trading recommendation in JSON format."
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64
                }
              }
            ]
          }
        ],
        max_tokens: 2000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
      // Try to extract JSON from the response (handle potential markdown wrapping)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      // Return a structured fallback
      analysis = {
        signal: "HOLD",
        probability: 50,
        takeProfit: "N/A",
        stopLoss: "N/A",
        riskReward: "N/A",
        detectedAsset: "Unknown",
        timeframe: "Unknown",
        chartAnalysis: "Unable to fully analyze the chart. Please ensure the image is clear and shows a trading chart.",
        marketSentiment: "Analysis inconclusive.",
        bullishReasons: ["Chart needs clearer view for detailed analysis"],
        bearishReasons: ["Insufficient data for confident assessment"],
      };
    }

    // Add the AI model info
    analysis.aiModel = displayName;
    analysis.modelsUsed = selectedModels.map(m => modelDisplayNames[m] || m);

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in analyze-chart:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred during chart analysis. Please try again later." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

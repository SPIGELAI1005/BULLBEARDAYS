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
  // First-class inputs (Phase 1)
  strategy?: string;        // User-selected trading strategy
  timeframe?: string;       // User-selected timeframe
  instrument?: string;      // User-selected instrument
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

    const { imageBase64, selectedModels, referenceModel, strategy, timeframe, instrument } = await req.json() as AnalysisRequest;
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const model = modelMapping[referenceModel] || "google/gemini-2.5-pro";
    const displayName = modelDisplayNames[referenceModel] || "AI";

    // Build context from user inputs
    const userContext = [];
    if (strategy) userContext.push(`Trading Strategy: ${strategy}`);
    if (timeframe) userContext.push(`Timeframe: ${timeframe}`);
    if (instrument) userContext.push(`Instrument: ${instrument}`);
    const contextString = userContext.length > 0
      ? `\n\nUser Context:\n${userContext.join('\n')}\n(Use this context to inform your analysis, but you may detect different values from the chart if needed)`
      : '';

    const systemPrompt = `You are an expert trading analyst with deep knowledge of technical analysis, chart patterns, market microstructure, and risk management. You analyze chart screenshots to provide educational scenario analysis.
${contextString}
Your task is to analyze the provided chart image and return a JSON response with the following structure:
{
  "trendBias": "BULLISH" | "BEARISH" | "NEUTRAL",
  "confidenceScore": number (0-100, your confidence in the chart read quality),
  "bullScenario": {
    "thesis": string (1-2 sentences explaining the bull case),
    "evidence": string[] (3-5 technical observations supporting the bull scenario),
    "keyLevels": {
      "support": string[] (key support levels, e.g., ["$42,000", "$40,500"]),
      "resistance": string[] (key resistance levels, e.g., ["$45,000", "$47,200"])
    },
    "invalidation": string (price level or condition that would invalidate this scenario),
    "riskNotes": string[] (2-3 risks to this scenario)
  },
  "bearScenario": {
    "thesis": string (1-2 sentences explaining the bear case),
    "evidence": string[] (3-5 technical observations supporting the bear scenario),
    "keyLevels": {
      "support": string[] (key support levels),
      "resistance": string[] (key resistance levels)
    },
    "invalidation": string (price level or condition that would invalidate this scenario),
    "riskNotes": string[] (2-3 risks to this scenario)
  },
  "instrument": {
    "detected": string (the trading pair or asset you identify, e.g., "BTC/USDT", "EUR/USD", "AAPL"),
    "confidence": number (0-100, confidence in instrument detection)
  },
  "timeframe": {
    "detected": string (the chart timeframe you detect, e.g., "15m", "1H", "4H", "Daily")
  },
  "currentPrice": number | null (current price if visible on chart),
  "takeProfit": string (suggested target for the trend bias direction, e.g., "+2.5%" or "$45,000"),
  "stopLoss": string (suggested invalidation level, e.g., "-1.2%" or "$40,000"),
  "riskReward": string (risk/reward ratio, e.g., "1:2.1")
}

Guidelines:
- IMPORTANT: Your role is educational scenario analysis, NOT trading recommendations
- Present BOTH bull and bear scenarios objectively, regardless of your trend bias
- trendBias reflects which scenario currently has more technical evidence, but both scenarios should be thorough
- Look for candlestick patterns, support/resistance levels, trend lines, and common indicators
- Be specific about price levels when identifying key levels
- Include both sides of the market story - what bulls see vs what bears see
- Be honest about uncertainty - if the chart is unclear, reflect that in lower confidenceScore
- If user provided context (strategy/timeframe/instrument), use it but you may detect different values
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
                text: "Analyze this trading chart and provide educational scenario analysis in JSON format. Present both bull and bear scenarios objectively."
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
    
    console.log("AI Response received, length:", content?.length || 0);
    
    if (!content) {
      console.error("No content in AI response:", JSON.stringify(aiResponse));
      throw new Error("No response from AI");
    }

    // Parse the JSON response
    let analysis;
    try {
      // Try to extract JSON from the response (handle potential markdown wrapping)
      // First try to find JSON in code blocks
      const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      let jsonString = codeBlockMatch ? codeBlockMatch[1].trim() : content;
      
      // Then try to extract the JSON object
      const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
        console.log("Successfully parsed analysis, trendBias:", analysis.trendBias);
      } else {
        console.error("No JSON object found in response:", content.substring(0, 500));
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      // Return a structured fallback in ScenarioAnalysis format
      analysis = {
        trendBias: "NEUTRAL",
        confidenceScore: 30,
        bullScenario: {
          thesis: "Unable to fully analyze the chart due to image quality or clarity issues.",
          evidence: [
            "Chart requires clearer view for detailed technical analysis",
            "Price action and indicators need better visibility"
          ],
          keyLevels: {
            support: [],
            resistance: []
          },
          invalidation: "N/A - Analysis inconclusive",
          riskNotes: [
            "Insufficient data for confident scenario assessment",
            "Image quality prevents accurate technical reading"
          ]
        },
        bearScenario: {
          thesis: "Unable to fully analyze the chart due to image quality or clarity issues.",
          evidence: [
            "Chart requires clearer view for detailed technical analysis",
            "Price action and indicators need better visibility"
          ],
          keyLevels: {
            support: [],
            resistance: []
          },
          invalidation: "N/A - Analysis inconclusive",
          riskNotes: [
            "Insufficient data for confident scenario assessment",
            "Image quality prevents accurate technical reading"
          ]
        },
        instrument: {
          detected: instrument || "Unknown",
          confidence: 0
        },
        timeframe: {
          detected: timeframe || "Unknown"
        },
        currentPrice: null,
        takeProfit: "N/A",
        stopLoss: "N/A",
        riskReward: "N/A"
      };
    }

    // Add the AI model info and user context
    analysis.aiModel = displayName;
    analysis.modelsUsed = selectedModels.map(m => modelDisplayNames[m] || m);

    // Merge user-provided context with detected values
    if (instrument || timeframe || strategy) {
      // Update instrument info to include user selection
      if (instrument) {
        analysis.instrument = {
          detected: analysis.instrument?.detected,
          selected: instrument,
          final: instrument, // User selection takes precedence
          confidence: analysis.instrument?.confidence
        };
      }

      // Update timeframe info to include user selection
      if (timeframe) {
        analysis.timeframe = {
          detected: analysis.timeframe?.detected,
          selected: timeframe,
          final: timeframe // User selection takes precedence
        };
      }

      // Add strategy
      if (strategy) {
        analysis.strategy = strategy;
      }
    } else {
      // No user context - use detected values as final
      if (analysis.instrument) {
        analysis.instrument.final = analysis.instrument.detected || "Unknown";
      }
      if (analysis.timeframe) {
        analysis.timeframe.final = analysis.timeframe.detected || "1D";
        analysis.timeframe.selected = analysis.timeframe.detected || "1D";
      }
      analysis.strategy = analysis.strategy || "swingTrader";
    }

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

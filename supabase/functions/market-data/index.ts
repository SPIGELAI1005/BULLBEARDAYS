import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  volume24h: number;
  high24h: number;
  low24h: number;
}

// Popular trading pairs to show
const CRYPTO_PAIRS = ['bitcoin', 'ethereum', 'solana'];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const marketData: MarketData[] = [];
    
    // Try to fetch crypto data from CoinGecko
    try {
      const cryptoResponse = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${CRYPTO_PAIRS.join(',')}&order=market_cap_desc&sparkline=false&price_change_percentage=24h`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );
      
      // Check if response is OK before parsing
      if (cryptoResponse.ok) {
        const contentType = cryptoResponse.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          const cryptoData = await cryptoResponse.json();
          
          if (Array.isArray(cryptoData)) {
            for (const coin of cryptoData) {
              marketData.push({
                symbol: coin.symbol?.toUpperCase() + '/USD' || 'UNKNOWN',
                price: coin.current_price || 0,
                change24h: coin.price_change_24h || 0,
                changePercent24h: coin.price_change_percentage_24h || 0,
                volume24h: coin.total_volume || 0,
                high24h: coin.high_24h || 0,
                low24h: coin.low_24h || 0,
              });
            }
          }
        } else {
          // Log non-JSON response for debugging
          const textResponse = await cryptoResponse.text();
          console.warn("CoinGecko returned non-JSON response:", textResponse.substring(0, 100));
        }
      } else {
        // Handle rate limiting or other errors
        const errorText = await cryptoResponse.text();
        console.warn(`CoinGecko API error (${cryptoResponse.status}):`, errorText.substring(0, 100));
      }
    } catch (cryptoError) {
      console.warn("Failed to fetch from CoinGecko, using fallback data:", cryptoError);
    }

    // If CoinGecko failed, add simulated crypto data as fallback
    if (marketData.length === 0) {
      const cryptoFallback = [
        { symbol: 'BTC/USD', basePrice: 95000, volatility: 0.02 },
        { symbol: 'ETH/USD', basePrice: 3200, volatility: 0.025 },
        { symbol: 'SOL/USD', basePrice: 180, volatility: 0.03 },
      ];

      for (const crypto of cryptoFallback) {
        const variance = (Math.random() - 0.5) * crypto.volatility;
        const change = crypto.basePrice * variance;
        marketData.push({
          symbol: crypto.symbol,
          price: crypto.basePrice + change,
          change24h: change,
          changePercent24h: variance * 100,
          volume24h: Math.floor(Math.random() * 50000000000) + 10000000000,
          high24h: crypto.basePrice * (1 + crypto.volatility / 2),
          low24h: crypto.basePrice * (1 - crypto.volatility / 2),
        });
      }
    }

    // Add simulated forex data (since free forex APIs are limited)
    const forexPairs = [
      { symbol: 'EUR/USD', basePrice: 1.0850 },
      { symbol: 'GBP/USD', basePrice: 1.2650 },
      { symbol: 'USD/JPY', basePrice: 148.50 },
    ];

    for (const pair of forexPairs) {
      const variance = (Math.random() - 0.5) * 0.01;
      const change = pair.basePrice * variance;
      marketData.push({
        symbol: pair.symbol,
        price: pair.basePrice + change,
        change24h: change,
        changePercent24h: variance * 100,
        volume24h: Math.floor(Math.random() * 1000000000) + 500000000,
        high24h: pair.basePrice * 1.005,
        low24h: pair.basePrice * 0.995,
      });
    }

    return new Response(
      JSON.stringify({ data: marketData, timestamp: new Date().toISOString() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in market-data function:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch market data", details: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

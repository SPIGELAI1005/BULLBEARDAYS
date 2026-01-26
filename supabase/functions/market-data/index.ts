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
const FOREX_SYMBOLS = ['EURUSD', 'GBPUSD', 'USDJPY'];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Fetch crypto data from CoinGecko (free, no API key needed)
    const cryptoResponse = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${CRYPTO_PAIRS.join(',')}&order=market_cap_desc&sparkline=false&price_change_percentage=24h`
    );
    
    const cryptoData = await cryptoResponse.json();
    
    const marketData: MarketData[] = [];
    
    // Process crypto data
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
    console.error("Error fetching market data:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch market data" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { handleCors, corsResponse } from "../_shared/cors.ts";
import { checkRateLimit, rateLimitExceededResponse } from "../_shared/rateLimiter.ts";

interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  category: 'crypto' | 'forex' | 'indices' | 'stocks';
}

// Popular trading pairs to show
const CRYPTO_PAIRS = ['bitcoin', 'ethereum', 'solana'];
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes cache

serve(async (req) => {
  // Handle CORS
  const cors = handleCors(req);
  if (cors.response) {
    return cors.response;
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Use service role for cache operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Optional authentication - rate limit authenticated users
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;
    let rateLimitHeaders: Record<string, string> = {};

    if (authHeader?.startsWith('Bearer ')) {
      const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } }
      });

      const token = authHeader.replace('Bearer ', '');
      const { data: claimsData } = await supabaseAuth.auth.getClaims(token);

      if (claimsData?.claims?.sub) {
        userId = claimsData.claims.sub as string;
        console.log('Authenticated user:', userId);

        // Rate limiting for authenticated users (60 market data requests per minute)
        const rateLimitResult = await checkRateLimit(supabase, userId, 'market-data');

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

        // Store rate limit headers for successful response
        rateLimitHeaders = rateLimitResult.headers;
      }
    }
    
    console.log('Fetching market data for', userId ? 'authenticated user' : 'anonymous user');

    // Check cache first
    const { data: cachedData } = await supabase
      .from('market_data_cache')
      .select('symbol, data, expires_at')
      .gt('expires_at', new Date().toISOString());

    if (cachedData && cachedData.length >= 6) {
      console.log('Cache hit - returning cached market data');
      const marketData = cachedData.map((item: { data: MarketData }) => item.data);
      return corsResponse(
        { data: marketData, timestamp: new Date().toISOString(), cached: true },
        {
          status: 200,
          origin: cors.origin,
          headers: rateLimitHeaders
        }
      );
    }

    console.log('Cache miss - fetching fresh market data');
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
                category: 'crypto',
              });
            }
          }
        } else {
          const textResponse = await cryptoResponse.text();
          console.warn("CoinGecko returned non-JSON response:", textResponse.substring(0, 100));
        }
      } else {
        const errorText = await cryptoResponse.text();
        console.warn(`CoinGecko API error (${cryptoResponse.status}):`, errorText.substring(0, 100));
      }
    } catch (cryptoError) {
      console.warn("Failed to fetch from CoinGecko, using fallback data:", cryptoError);
    }

    // If CoinGecko failed, add simulated crypto data as fallback
    if (marketData.filter(m => m.category === 'crypto').length === 0) {
      const cryptoFallback = [
        { symbol: 'BTC/USD', basePrice: 95000, volatility: 0.02 },
        { symbol: 'ETH/USD', basePrice: 3200, volatility: 0.025 },
        { symbol: 'SOL/USD', basePrice: 180, volatility: 0.03 },
        { symbol: 'XRP/USD', basePrice: 2.15, volatility: 0.035 },
        { symbol: 'ADA/USD', basePrice: 0.95, volatility: 0.04 },
        { symbol: 'DOGE/USD', basePrice: 0.32, volatility: 0.05 },
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
          category: 'crypto',
        });
      }
    }

    // Add simulated forex data
    const forexPairs = [
      { symbol: 'EUR/USD', basePrice: 1.0850 },
      { symbol: 'GBP/USD', basePrice: 1.2650 },
      { symbol: 'USD/JPY', basePrice: 148.50 },
      { symbol: 'AUD/USD', basePrice: 0.6520 },
      { symbol: 'USD/CAD', basePrice: 1.3680 },
      { symbol: 'USD/CHF', basePrice: 0.8850 },
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
        category: 'forex',
      });
    }

    // Add simulated indices data
    const indices = [
      { symbol: 'SPX500', basePrice: 5950, volatility: 0.012 },
      { symbol: 'NAS100', basePrice: 21200, volatility: 0.015 },
      { symbol: 'DJI30', basePrice: 43500, volatility: 0.01 },
      { symbol: 'DAX40', basePrice: 21800, volatility: 0.013 },
      { symbol: 'FTSE100', basePrice: 8450, volatility: 0.011 },
      { symbol: 'NIK225', basePrice: 39800, volatility: 0.014 },
    ];

    for (const index of indices) {
      const variance = (Math.random() - 0.5) * index.volatility;
      const change = index.basePrice * variance;
      marketData.push({
        symbol: index.symbol,
        price: index.basePrice + change,
        change24h: change,
        changePercent24h: variance * 100,
        volume24h: Math.floor(Math.random() * 5000000000) + 1000000000,
        high24h: index.basePrice * (1 + index.volatility / 2),
        low24h: index.basePrice * (1 - index.volatility / 2),
        category: 'indices',
      });
    }

    // Add simulated stocks data
    const stocks = [
      { symbol: 'AAPL', basePrice: 242, volatility: 0.02 },
      { symbol: 'MSFT', basePrice: 448, volatility: 0.018 },
      { symbol: 'GOOGL', basePrice: 198, volatility: 0.022 },
      { symbol: 'AMZN', basePrice: 225, volatility: 0.025 },
      { symbol: 'NVDA', basePrice: 138, volatility: 0.035 },
      { symbol: 'TSLA', basePrice: 425, volatility: 0.04 },
    ];

    for (const stock of stocks) {
      const variance = (Math.random() - 0.5) * stock.volatility;
      const change = stock.basePrice * variance;
      marketData.push({
        symbol: stock.symbol,
        price: stock.basePrice + change,
        change24h: change,
        changePercent24h: variance * 100,
        volume24h: Math.floor(Math.random() * 100000000) + 50000000,
        high24h: stock.basePrice * (1 + stock.volatility / 2),
        low24h: stock.basePrice * (1 - stock.volatility / 2),
        category: 'stocks',
      });
    }

    // Store in cache
    const expiresAt = new Date(Date.now() + CACHE_DURATION_MS).toISOString();
    const cachePromises = marketData.map((item) =>
      supabase.from('market_data_cache').upsert({
        symbol: item.symbol,
        data: item,
        expires_at: expiresAt,
      })
    );
    
    await Promise.all(cachePromises);
    console.log('Cached market data for', marketData.length, 'symbols');

    return corsResponse(
      { data: marketData, timestamp: new Date().toISOString(), cached: false },
      {
        status: 200,
        origin: cors.origin,
        headers: rateLimitHeaders
      }
    );
  } catch (error) {
    console.error("Error in market-data function:", error);
    return corsResponse(
      { error: "An error occurred while fetching market data. Please try again later." },
      { status: 500, origin: cors.origin }
    );
  }
});

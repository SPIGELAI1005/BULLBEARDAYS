import type { MarketDataItem, MarketCategory } from "@/lib/types";

export const DEMO_MARKET_DATA: MarketDataItem[] = [
  {
    symbol: "BTC/USD",
    price: 95000,
    change24h: 1200,
    changePercent24h: 1.28,
    volume24h: 34000000000,
    high24h: 96250,
    low24h: 93300,
    category: "crypto" as MarketCategory,
  },
  {
    symbol: "ETH/USD",
    price: 3200,
    change24h: -35,
    changePercent24h: -1.08,
    volume24h: 12000000000,
    high24h: 3290,
    low24h: 3155,
    category: "crypto" as MarketCategory,
  },
  {
    symbol: "EUR/USD",
    price: 1.085,
    change24h: 0.002,
    changePercent24h: 0.18,
    volume24h: 820000000,
    high24h: 1.089,
    low24h: 1.081,
    category: "forex" as MarketCategory,
  },
];

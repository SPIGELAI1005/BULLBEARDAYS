import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Activity, RefreshCw, Zap } from "lucide-react";
import { fetchMarketData, MarketDataItem } from "@/lib/api";

interface MarketTickerProps {
  onSelectAsset?: (asset: MarketDataItem) => void;
}

const MarketTicker = ({ onSelectAsset }: MarketTickerProps) => {
  const [marketData, setMarketData] = useState<MarketDataItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);

  const loadMarketData = async () => {
    try {
      setIsLoading(true);
      const data = await fetchMarketData();
      setMarketData(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Failed to load market data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMarketData();
    // Refresh every 30 seconds
    const interval = setInterval(loadMarketData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number, symbol: string) => {
    if (symbol.includes('JPY')) {
      return price.toFixed(2);
    }
    if (price >= 1000) {
      return price.toLocaleString('en-US', { maximumFractionDigits: 2 });
    }
    return price.toFixed(4);
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return (volume / 1e9).toFixed(1) + 'B';
    if (volume >= 1e6) return (volume / 1e6).toFixed(1) + 'M';
    if (volume >= 1e3) return (volume / 1e3).toFixed(1) + 'K';
    return volume.toString();
  };

  const handleAssetClick = (item: MarketDataItem) => {
    setSelectedSymbol(item.symbol);
    onSelectAsset?.(item);
  };

  return (
    <div className="glass-panel-subtle p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Live Markets</span>
          {onSelectAsset && (
            <span className="text-xs text-muted-foreground ml-2">
              Click for instant analysis
            </span>
          )}
        </div>
        <button
          onClick={loadMarketData}
          disabled={isLoading}
          className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 text-muted-foreground ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {isLoading && marketData.length === 0 ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-3 rounded-xl bg-muted/30 animate-pulse">
              <div className="h-4 bg-muted rounded w-16 mb-2" />
              <div className="h-5 bg-muted rounded w-20 mb-1" />
              <div className="h-3 bg-muted rounded w-12" />
            </div>
          ))
        ) : (
          marketData.map((item) => {
            const isPositive = item.changePercent24h >= 0;
            const isSelected = selectedSymbol === item.symbol;
            return (
              <button
                key={item.symbol}
                onClick={() => handleAssetClick(item)}
                className={`p-3 rounded-xl border transition-all text-left group ${
                  isSelected
                    ? "bg-primary/10 border-primary/50 ring-2 ring-primary/30"
                    : "bg-muted/30 border-border/50 hover:bg-muted/50 hover:border-primary/30"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground font-medium">
                    {item.symbol}
                  </span>
                  <Zap className={`w-3 h-3 transition-opacity ${
                    isSelected ? "text-primary opacity-100" : "text-primary opacity-0 group-hover:opacity-100"
                  }`} />
                </div>
                <div className="font-semibold text-foreground mb-1">
                  ${formatPrice(item.price, item.symbol)}
                </div>
                <div className={`flex items-center gap-1 text-xs ${isPositive ? 'text-bullish' : 'text-bearish'}`}>
                  {isPositive ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>{isPositive ? '+' : ''}{item.changePercent24h.toFixed(2)}%</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Vol: ${formatVolume(item.volume24h)}
                </div>
              </button>
            );
          })
        )}
      </div>

      {lastUpdate && (
        <div className="mt-3 text-xs text-muted-foreground text-center">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default MarketTicker;

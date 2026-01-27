import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Activity, RefreshCw, Zap, Bitcoin, DollarSign, BarChart3, Building2 } from "lucide-react";
import { fetchMarketData, MarketDataItem, MarketCategory } from "@/lib/api";
import { useCurrency } from "@/hooks/useCurrency";

interface MarketTickerProps {
  onSelectAsset?: (asset: MarketDataItem) => void;
  onCompareClick?: () => void;
}

const CATEGORIES: { id: MarketCategory; label: string; icon: React.ReactNode }[] = [
  { id: 'crypto', label: 'Crypto', icon: <Bitcoin className="w-4 h-4" /> },
  { id: 'forex', label: 'Forex', icon: <DollarSign className="w-4 h-4" /> },
  { id: 'indices', label: 'Indices', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'stocks', label: 'Stocks', icon: <Building2 className="w-4 h-4" /> },
];

const MarketTicker = ({ onSelectAsset, onCompareClick }: MarketTickerProps) => {
  const { formatConverted, symbol, convert } = useCurrency();
  const [marketData, setMarketData] = useState<MarketDataItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<MarketCategory>('crypto');

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

  const formatPrice = (price: number, sym: string): string => {
    // For forex pairs, don't convert (they're already in their native quote currency)
    if (activeCategory === 'forex') {
      if (sym.includes('JPY')) return price.toFixed(2);
      if (price >= 1000) return price.toLocaleString('en-US', { maximumFractionDigits: 2 });
      if (price < 1) return price.toFixed(4);
      return price.toFixed(2);
    }
    // For crypto, stocks, indices: convert from USD; formatted string includes €/$/£ per selected currency
    return formatConverted(price, "USD");
  };

  const formatVolume = (volume: number, inUSD = true) => {
    const amount = inUSD ? convert(volume, "USD") : volume;
    if (amount >= 1e9) return (amount / 1e9).toFixed(1) + 'B';
    if (amount >= 1e6) return (amount / 1e6).toFixed(1) + 'M';
    if (amount >= 1e3) return (amount / 1e3).toFixed(1) + 'K';
    return amount.toFixed(0);
  };

  const handleAssetClick = (item: MarketDataItem) => {
    setSelectedSymbol(item.symbol);
    onSelectAsset?.(item);
  };

  const filteredData = marketData.filter(item => item.category === activeCategory);

  return (
    <div className="glass-panel-subtle p-3 md:p-4 mb-4 md:mb-6">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 md:mb-4">
        <div className="flex items-center gap-2 min-w-0">
          <Activity className="w-4 h-4 text-primary shrink-0" />
          <span className="text-sm font-medium text-foreground">Live Markets</span>
          {onSelectAsset && (
            <span className="hidden sm:inline text-xs text-muted-foreground ml-1">
              Click for instant analysis
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {/* Category Icons */}
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              title={cat.label}
              className={`p-1.5 rounded-lg transition-colors ${
                activeCategory === cat.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {cat.icon}
            </button>
          ))}
          <div className="w-px h-4 bg-border/50 mx-1" />
          {onCompareClick && (
            <button
              onClick={onCompareClick}
              title="Compare Markets"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={loadMarketData}
            disabled={isLoading}
            title="Refresh"
            className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 text-muted-foreground ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        {isLoading && filteredData.length === 0 ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-3 rounded-xl bg-muted/30 animate-pulse">
              <div className="h-4 bg-muted rounded w-16 mb-2" />
              <div className="h-5 bg-muted rounded w-20 mb-1" />
              <div className="h-3 bg-muted rounded w-12" />
            </div>
          ))
        ) : (
          filteredData.map((item) => {
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
                  {formatPrice(item.price, item.symbol)}
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
                  Vol: {symbol}{formatVolume(item.volume24h)}
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

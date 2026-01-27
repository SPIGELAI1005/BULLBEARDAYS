import { useState, useCallback } from "react";
import { BarChart3, X, Plus, TrendingUp, TrendingDown, Loader2, ArrowRight } from "lucide-react";
import { analyzeMarketData, MarketDataItem } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/hooks/useCurrency";

interface ComparisonItem {
  asset: MarketDataItem;
  analysis?: {
    signal: "BUY" | "SELL" | "HOLD";
    probability: number;
    takeProfit: string;
    stopLoss: string;
    riskReward: string;
    chartAnalysis: string;
  };
  isLoading: boolean;
}

interface MarketComparisonProps {
  availableAssets: MarketDataItem[];
  isOpen: boolean;
  onClose: () => void;
}

const MarketComparison = ({ availableAssets, isOpen, onClose }: MarketComparisonProps) => {
  const { toast } = useToast();
  const { formatConverted } = useCurrency();
  const [comparisonItems, setComparisonItems] = useState<ComparisonItem[]>([]);
  const [showAssetPicker, setShowAssetPicker] = useState(false);

  const addAsset = useCallback(async (asset: MarketDataItem) => {
    if (comparisonItems.some(item => item.asset.symbol === asset.symbol)) {
      toast({
        title: "Already Added",
        description: `${asset.symbol} is already in comparison`,
      });
      return;
    }

    if (comparisonItems.length >= 4) {
      toast({
        title: "Maximum Reached",
        description: "You can compare up to 4 assets at once",
        variant: "destructive",
      });
      return;
    }

    // Add asset with loading state
    setComparisonItems(prev => [...prev, { asset, isLoading: true }]);
    setShowAssetPicker(false);

    try {
      const result = await analyzeMarketData(asset);
      setComparisonItems(prev => 
        prev.map(item => 
          item.asset.symbol === asset.symbol 
            ? { 
                ...item, 
                isLoading: false, 
                analysis: {
                  signal: result.signal,
                  probability: result.probability,
                  takeProfit: result.takeProfit,
                  stopLoss: result.stopLoss,
                  riskReward: result.riskReward,
                  chartAnalysis: result.chartAnalysis,
                }
              }
            : item
        )
      );
    } catch (error) {
      console.error("Failed to analyze:", error);
      setComparisonItems(prev => prev.filter(item => item.asset.symbol !== asset.symbol));
      toast({
        title: "Analysis Failed",
        description: `Failed to analyze ${asset.symbol}`,
        variant: "destructive",
      });
    }
  }, [comparisonItems, toast]);

  const removeAsset = (symbol: string) => {
    setComparisonItems(prev => prev.filter(item => item.asset.symbol !== symbol));
  };

  const formatPrice = (price: number, symbol: string, category?: string) => {
    // For forex, don't convert
    if (category === 'forex') {
      if (symbol.includes('JPY')) return price.toFixed(2);
      if (price >= 1000) return price.toLocaleString('en-US', { maximumFractionDigits: 2 });
      return price.toFixed(4);
    }
    // For other assets, convert from USD
    return formatConverted(price, "USD");
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case "BUY": return "text-bullish bg-bullish/10 border-bullish/30";
      case "SELL": return "text-bearish bg-bearish/10 border-bearish/30";
      default: return "text-accent bg-accent/10 border-accent/30";
    }
  };

  const getBestSignal = () => {
    const analyzed = comparisonItems.filter(item => item.analysis);
    if (analyzed.length === 0) return null;

    const buys = analyzed.filter(item => item.analysis?.signal === "BUY");
    const sells = analyzed.filter(item => item.analysis?.signal === "SELL");

    if (buys.length > 0) {
      const best = buys.reduce((a, b) => 
        (a.analysis?.probability || 0) > (b.analysis?.probability || 0) ? a : b
      );
      return { type: "BUY", item: best };
    }
    if (sells.length > 0) {
      const best = sells.reduce((a, b) => 
        (a.analysis?.probability || 0) > (b.analysis?.probability || 0) ? a : b
      );
      return { type: "SELL", item: best };
    }
    return null;
  };

  if (!isOpen) return null;

  const bestSignal = getBestSignal();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-5xl max-h-[90vh] overflow-auto glass-panel p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Market Comparison</h2>
              <p className="text-sm text-muted-foreground">Compare up to 4 assets side by side</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Best Pick Banner */}
        {bestSignal && (
          <div className={`p-4 rounded-xl mb-6 border ${
            bestSignal.type === "BUY" 
              ? "bg-bullish/10 border-bullish/30" 
              : "bg-bearish/10 border-bearish/30"
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {bestSignal.type === "BUY" ? (
                  <TrendingUp className="w-5 h-5 text-bullish" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-bearish" />
                )}
                <div>
                  <span className="text-sm text-muted-foreground">Recommended:</span>
                  <span className={`ml-2 font-bold ${bestSignal.type === "BUY" ? "text-bullish" : "text-bearish"}`}>
                    {bestSignal.type} {bestSignal.item.asset.symbol}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Confidence:</span>
                <span className={`font-bold ${bestSignal.type === "BUY" ? "text-bullish" : "text-bearish"}`}>
                  {bestSignal.item.analysis?.probability}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {comparisonItems.map((item) => (
            <div 
              key={item.asset.symbol}
              className="relative p-4 rounded-xl bg-muted/20 border border-border/50"
            >
              <button
                onClick={() => removeAsset(item.asset.symbol)}
                className="absolute top-2 right-2 p-1 rounded-lg hover:bg-muted/50 text-muted-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Asset Info */}
              <div className="mb-4">
                <h3 className="font-bold text-foreground">{item.asset.symbol}</h3>
                <div className="text-lg font-semibold text-foreground">
                  {formatPrice(item.asset.price, item.asset.symbol, item.asset.category)}
                </div>
                <div className={`flex items-center gap-1 text-sm ${
                  item.asset.changePercent24h >= 0 ? 'text-bullish' : 'text-bearish'
                }`}>
                  {item.asset.changePercent24h >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>{item.asset.changePercent24h >= 0 ? '+' : ''}{item.asset.changePercent24h.toFixed(2)}%</span>
                </div>
              </div>

              {/* Analysis */}
              {item.isLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
              ) : item.analysis ? (
                <div className="space-y-3">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${getSignalColor(item.analysis.signal)}`}>
                    {item.analysis.signal === "BUY" ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : item.analysis.signal === "SELL" ? (
                      <TrendingDown className="w-4 h-4" />
                    ) : null}
                    <span className="font-bold">{item.analysis.signal}</span>
                    <span className="text-sm">({item.analysis.probability}%)</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-bullish/5 border border-bullish/20">
                      <span className="text-muted-foreground">TP:</span>
                      <span className="ml-1 text-bullish font-medium">{item.analysis.takeProfit}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-bearish/5 border border-bearish/20">
                      <span className="text-muted-foreground">SL:</span>
                      <span className="ml-1 text-bearish font-medium">{item.analysis.stopLoss}</span>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    R:R {item.analysis.riskReward}
                  </div>
                </div>
              ) : null}
            </div>
          ))}

          {/* Add Asset Button */}
          {comparisonItems.length < 4 && (
            <button
              onClick={() => setShowAssetPicker(true)}
              className="p-4 rounded-xl border-2 border-dashed border-border/50 hover:border-primary/50 flex flex-col items-center justify-center gap-2 min-h-[200px] transition-colors group"
            >
              <Plus className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                Add Asset
              </span>
            </button>
          )}
        </div>

        {/* Asset Picker */}
        {showAssetPicker && (
          <div className="p-4 rounded-xl bg-muted/20 border border-border/50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-foreground">Select an Asset</h3>
              <button
                onClick={() => setShowAssetPicker(false)}
                className="p-1 rounded hover:bg-muted/50 text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
              {availableAssets.map((asset) => {
                const isSelected = comparisonItems.some(item => item.asset.symbol === asset.symbol);
                return (
                  <button
                    key={asset.symbol}
                    onClick={() => !isSelected && addAsset(asset)}
                    disabled={isSelected}
                    className={`p-3 rounded-lg text-left transition-all ${
                      isSelected
                        ? "bg-muted/50 opacity-50 cursor-not-allowed"
                        : "bg-muted/30 hover:bg-muted/50 border border-transparent hover:border-primary/30"
                    }`}
                  >
                    <div className="text-sm font-medium text-foreground">{asset.symbol}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatPrice(asset.price, asset.symbol, asset.category)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {comparisonItems.length === 0 && !showAssetPicker && (
          <div className="text-center py-12">
            <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Assets to Compare</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add assets to compare their AI trading analysis side by side
            </p>
            <button
              onClick={() => setShowAssetPicker(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add First Asset
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketComparison;
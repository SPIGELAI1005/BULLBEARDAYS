import { Star, Bell, TrendingUp, TrendingDown } from "lucide-react";
import { useWatchlist } from "@/hooks/useWatchlist";
import { usePriceAlerts } from "@/hooks/usePriceAlerts";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface QuickActionsProps {
  asset?: string;
  takeProfit?: string;
  stopLoss?: string;
  currentPrice?: number;
}

const QuickActions = ({ asset, takeProfit, stopLoss, currentPrice }: QuickActionsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { addToWatchlist, isWatching } = useWatchlist();
  const { createAlert } = usePriceAlerts();

  const handleAddToWatchlist = async () => {
    if (!user) {
      toast({
        title: "Sign in Required",
        description: "Please sign in to add to watchlist",
        variant: "destructive",
      });
      return;
    }
    if (asset) {
      await addToWatchlist(asset);
    }
  };

  const parsePrice = (priceStr: string | undefined): number | null => {
    if (!priceStr || !currentPrice) return null;
    
    // Handle percentage format like "+2.5%" or "-1.2%"
    const percentMatch = priceStr.match(/^([+-]?)(\d+\.?\d*)%$/);
    if (percentMatch) {
      const sign = percentMatch[1] === '-' ? -1 : 1;
      const percent = parseFloat(percentMatch[2]);
      return currentPrice * (1 + (sign * percent / 100));
    }
    
    // Handle direct price values
    const numMatch = priceStr.replace(/[$,]/g, '').match(/(\d+\.?\d*)/);
    if (numMatch) {
      return parseFloat(numMatch[1]);
    }
    
    return null;
  };

  const handleSetTPAlert = async () => {
    if (!user) {
      toast({
        title: "Sign in Required",
        description: "Please sign in to set price alerts",
        variant: "destructive",
      });
      return;
    }
    
    const targetPrice = parsePrice(takeProfit);
    if (asset && targetPrice) {
      await createAlert(asset, targetPrice, "TP");
    } else {
      toast({
        title: "Unable to Set Alert",
        description: "Could not parse take profit price",
        variant: "destructive",
      });
    }
  };

  const handleSetSLAlert = async () => {
    if (!user) {
      toast({
        title: "Sign in Required",
        description: "Please sign in to set price alerts",
        variant: "destructive",
      });
      return;
    }
    
    const targetPrice = parsePrice(stopLoss);
    if (asset && targetPrice) {
      await createAlert(asset, targetPrice, "SL");
    } else {
      toast({
        title: "Unable to Set Alert",
        description: "Could not parse stop loss price",
        variant: "destructive",
      });
    }
  };

  if (!asset) return null;

  const watching = isWatching(asset);

  return (
    <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
      <h4 className="text-sm font-medium text-foreground mb-3">Quick Actions</h4>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleAddToWatchlist}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
            watching
              ? "bg-accent/20 text-accent border border-accent/30"
              : "bg-muted/50 hover:bg-muted text-foreground border border-border/50 hover:border-primary/50"
          }`}
        >
          <Star className={`w-4 h-4 ${watching ? "fill-current" : ""}`} />
          {watching ? "Watching" : "Add to Watchlist"}
        </button>
        
        {takeProfit && (
          <button
            onClick={handleSetTPAlert}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-bullish/10 hover:bg-bullish/20 text-bullish border border-bullish/30 transition-all"
          >
            <TrendingUp className="w-4 h-4" />
            Alert at TP
          </button>
        )}
        
        {stopLoss && (
          <button
            onClick={handleSetSLAlert}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-bearish/10 hover:bg-bearish/20 text-bearish border border-bearish/30 transition-all"
          >
            <TrendingDown className="w-4 h-4" />
            Alert at SL
          </button>
        )}
      </div>
    </div>
  );
};

export default QuickActions;
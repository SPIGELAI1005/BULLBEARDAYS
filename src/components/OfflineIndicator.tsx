import { Wifi, WifiOff, RefreshCw, Database } from "lucide-react";
import { useOfflineMode } from "@/hooks/useOfflineMode";

const OfflineIndicator = () => {
  const { isOnline, cachedAnalyses, getCacheAge, clearCache } = useOfflineMode();

  if (isOnline && cachedAnalyses.length === 0) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-2.5 rounded-xl shadow-lg ${
      isOnline 
        ? "bg-card border border-border" 
        : "bg-amber-500/10 border border-amber-500/30"
    }`}>
      {isOnline ? (
        <>
          <Wifi className="w-4 h-4 text-bullish" />
          <div className="text-sm">
            <span className="text-foreground font-medium">Online</span>
            {cachedAnalyses.length > 0 && (
              <span className="text-muted-foreground ml-2">
                • {cachedAnalyses.length} cached
              </span>
            )}
          </div>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4 text-amber-500" />
          <div className="text-sm">
            <span className="text-amber-500 font-medium">Offline Mode</span>
            {cachedAnalyses.length > 0 && (
              <span className="text-muted-foreground ml-2">
                • Viewing cached data ({getCacheAge()})
              </span>
            )}
          </div>
        </>
      )}

      {cachedAnalyses.length > 0 && isOnline && (
        <button
          onClick={clearCache}
          className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground transition-colors"
          title="Clear cache"
        >
          <Database className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};

export default OfflineIndicator;
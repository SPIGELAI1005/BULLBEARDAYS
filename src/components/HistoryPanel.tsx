import { useState, useEffect } from "react";
import { Clock, TrendingUp, TrendingDown, Minus, CheckCircle, XCircle, MoreVertical } from "lucide-react";
import { getAnalysisHistory, updateAnalysisOutcome, AnalysisRecord } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface HistoryPanelProps {
  onSelectAnalysis?: (analysis: AnalysisRecord) => void;
  analyses?: AnalysisRecord[];
  onRefresh?: () => void;
}

const HistoryPanel = ({ onSelectAnalysis, analyses: externalAnalyses, onRefresh }: HistoryPanelProps) => {
  const { user } = useAuth();
  const [history, setHistory] = useState<AnalysisRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const data = await getAnalysisHistory(20, user?.id);
      setHistory(data);
    } catch (error) {
      console.error("Failed to load history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (externalAnalyses) {
      setHistory(externalAnalyses);
      setIsLoading(false);
      return;
    }

    loadHistory();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('analyses-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'analyses' },
        () => {
          loadHistory();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, externalAnalyses]);

  const handleOutcomeUpdate = async (id: string, outcome: 'WIN' | 'LOSS' | 'PENDING') => {
    try {
      await updateAnalysisOutcome(id, outcome);
      setActiveMenu(null);
      loadHistory();
      onRefresh?.();
    } catch (error) {
      console.error("Failed to update outcome:", error);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'BUY':
        return <TrendingUp className="w-4 h-4 text-bullish" />;
      case 'SELL':
        return <TrendingDown className="w-4 h-4 text-bearish" />;
      default:
        return <Minus className="w-4 h-4 text-neutral" />;
    }
  };

  const getOutcomeStyle = (outcome: string | null) => {
    switch (outcome) {
      case 'WIN':
        return 'bg-bullish/20 text-bullish border-bullish/30';
      case 'LOSS':
        return 'bg-bearish/20 text-bearish border-bearish/30';
      case 'PENDING':
        return 'bg-neutral/20 text-neutral border-neutral/30';
      default:
        return 'bg-muted/30 text-muted-foreground border-border/50';
    }
  };

  return (
    <div className="glass-panel p-4 max-h-[500px] overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Analysis History</span>
        </div>
        <span className="text-xs text-muted-foreground">{history.length} total</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-3 rounded-xl bg-muted/30 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted" />
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-24 mb-2" />
                  <div className="h-3 bg-muted rounded w-16" />
                </div>
              </div>
            </div>
          ))
        ) : history.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            {user ? "No analyses yet. Upload a chart to get started!" : "Sign in to save your analysis history"}
          </div>
        ) : (
          history.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-xl bg-muted/20 border border-border/30 hover:bg-muted/30 transition-colors cursor-pointer relative group"
              onClick={() => onSelectAnalysis?.(item)}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  item.signal === 'BUY' ? 'bg-bullish/20' : 
                  item.signal === 'SELL' ? 'bg-bearish/20' : 'bg-neutral/20'
                }`}>
                  {getSignalIcon(item.signal)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground text-sm truncate">
                      {item.detected_asset || 'Unknown Asset'}
                    </span>
                    <span className={`text-xs font-bold ${
                      item.signal === 'BUY' ? 'text-bullish' : 
                      item.signal === 'SELL' ? 'text-bearish' : 'text-neutral'
                    }`}>
                      {item.signal}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{item.timeframe || '-'}</span>
                    <span>•</span>
                    <span>{item.probability}%</span>
                    <span>•</span>
                    <span>{formatDate(item.created_at)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Outcome Badge */}
                  <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getOutcomeStyle(item.outcome)}`}>
                    {item.outcome || 'Track'}
                  </span>

                  {/* Menu */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenu(activeMenu === item.id ? null : item.id);
                      }}
                      className="p-1 rounded-lg hover:bg-muted/50 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="w-4 h-4 text-muted-foreground" />
                    </button>

                    {activeMenu === item.id && (
                      <div className="absolute right-0 top-8 z-20 w-32 rounded-xl bg-card border border-border shadow-xl py-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOutcomeUpdate(item.id, 'WIN');
                          }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-muted/50 flex items-center gap-2 text-bullish"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Mark Win
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOutcomeUpdate(item.id, 'LOSS');
                          }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-muted/50 flex items-center gap-2 text-bearish"
                        >
                          <XCircle className="w-4 h-4" />
                          Mark Loss
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOutcomeUpdate(item.id, 'PENDING');
                          }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-muted/50 flex items-center gap-2 text-neutral"
                        >
                          <Minus className="w-4 h-4" />
                          Pending
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="mt-2 flex items-center gap-4 text-xs">
                <span className="text-bullish">TP: {item.take_profit || '-'}</span>
                <span className="text-bearish">SL: {item.stop_loss || '-'}</span>
                <span className="text-muted-foreground">R:R {item.risk_reward || '-'}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Stats Summary */}
      {history.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-lg font-bold text-bullish">
              {history.filter(h => h.outcome === 'WIN').length}
            </div>
            <div className="text-xs text-muted-foreground">Wins</div>
          </div>
          <div>
            <div className="text-lg font-bold text-bearish">
              {history.filter(h => h.outcome === 'LOSS').length}
            </div>
            <div className="text-xs text-muted-foreground">Losses</div>
          </div>
          <div>
            <div className="text-lg font-bold text-foreground">
              {(() => {
                const wins = history.filter(h => h.outcome === 'WIN').length;
                const total = history.filter(h => h.outcome === 'WIN' || h.outcome === 'LOSS').length;
                return total > 0 ? Math.round((wins / total) * 100) : 0;
              })()}%
            </div>
            <div className="text-xs text-muted-foreground">Win Rate</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPanel;
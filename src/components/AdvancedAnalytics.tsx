import { useMemo } from "react";
import { Clock, Flame, TrendingUp, Calendar, Zap } from "lucide-react";
import { AnalysisRecord } from "@/lib/api";

interface AdvancedAnalyticsProps {
  analyses: AnalysisRecord[];
}

const AdvancedAnalytics = ({ analyses }: AdvancedAnalyticsProps) => {
  const analytics = useMemo(() => {
    const completedTrades = analyses.filter(a => a.outcome === "WIN" || a.outcome === "LOSS");
    
    // Streak tracking
    let currentStreak = 0;
    let longestWinStreak = 0;
    let longestLossStreak = 0;
    let tempWinStreak = 0;
    let tempLossStreak = 0;
    
    const sorted = [...completedTrades].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    sorted.forEach((trade, i) => {
      if (trade.outcome === "WIN") {
        tempWinStreak++;
        tempLossStreak = 0;
        if (i === 0) currentStreak = tempWinStreak;
      } else {
        tempLossStreak++;
        tempWinStreak = 0;
        if (i === 0) currentStreak = -tempLossStreak;
      }
      longestWinStreak = Math.max(longestWinStreak, tempWinStreak);
      longestLossStreak = Math.max(longestLossStreak, tempLossStreak);
    });

    // Time-based analysis
    const hourStats: Record<number, { wins: number; total: number }> = {};
    const dayStats: Record<number, { wins: number; total: number }> = {};

    completedTrades.forEach(trade => {
      const date = new Date(trade.created_at);
      const hour = date.getHours();
      const day = date.getDay();

      if (!hourStats[hour]) hourStats[hour] = { wins: 0, total: 0 };
      if (!dayStats[day]) dayStats[day] = { wins: 0, total: 0 };

      hourStats[hour].total++;
      dayStats[day].total++;
      
      if (trade.outcome === "WIN") {
        hourStats[hour].wins++;
        dayStats[day].wins++;
      }
    });

    // Find best trading times
    const hourEntries = Object.entries(hourStats)
      .map(([hour, stats]) => ({
        hour: parseInt(hour),
        winRate: stats.total > 0 ? (stats.wins / stats.total) * 100 : 0,
        total: stats.total
      }))
      .filter(h => h.total >= 2)
      .sort((a, b) => b.winRate - a.winRate);

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayEntries = Object.entries(dayStats)
      .map(([day, stats]) => ({
        day: parseInt(day),
        dayName: dayNames[parseInt(day)],
        winRate: stats.total > 0 ? (stats.wins / stats.total) * 100 : 0,
        total: stats.total
      }))
      .filter(d => d.total >= 2)
      .sort((a, b) => b.winRate - a.winRate);

    // AI Model accuracy by asset type
    const modelAssetStats: Record<string, Record<string, { wins: number; total: number }>> = {};
    completedTrades.forEach(trade => {
      const model = trade.ai_model || "Unknown";
      const asset = trade.detected_asset || "Unknown";
      
      if (!modelAssetStats[model]) modelAssetStats[model] = {};
      if (!modelAssetStats[model][asset]) modelAssetStats[model][asset] = { wins: 0, total: 0 };
      
      modelAssetStats[model][asset].total++;
      if (trade.outcome === "WIN") modelAssetStats[model][asset].wins++;
    });

    // Get best model-asset combinations
    const modelAssetCombos: Array<{ model: string; asset: string; winRate: number; total: number }> = [];
    Object.entries(modelAssetStats).forEach(([model, assets]) => {
      Object.entries(assets).forEach(([asset, stats]) => {
        if (stats.total >= 3) {
          modelAssetCombos.push({
            model: model.replace("Google ", "").replace("OpenAI ", ""),
            asset,
            winRate: (stats.wins / stats.total) * 100,
            total: stats.total
          });
        }
      });
    });
    modelAssetCombos.sort((a, b) => b.winRate - a.winRate);

    return {
      currentStreak,
      longestWinStreak,
      longestLossStreak,
      bestHours: hourEntries.slice(0, 3),
      bestDays: dayEntries.slice(0, 3),
      bestCombos: modelAssetCombos.slice(0, 5),
    };
  }, [analyses]);

  if (analyses.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Streak Tracking */}
      <div className="glass-panel p-4">
        <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <Flame className="w-4 h-4 text-accent" />
          Streak Tracking
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Current Streak</span>
            <span className={`text-lg font-bold ${
              analytics.currentStreak > 0 ? "text-bullish" : 
              analytics.currentStreak < 0 ? "text-bearish" : "text-muted-foreground"
            }`}>
              {analytics.currentStreak > 0 ? `🔥 ${analytics.currentStreak}W` :
               analytics.currentStreak < 0 ? `${Math.abs(analytics.currentStreak)}L` : "—"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Best Win Streak</span>
            <span className="text-lg font-bold text-bullish">
              {analytics.longestWinStreak > 0 ? `${analytics.longestWinStreak}W` : "—"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Worst Loss Streak</span>
            <span className="text-lg font-bold text-bearish">
              {analytics.longestLossStreak > 0 ? `${analytics.longestLossStreak}L` : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Best Trading Times */}
      <div className="glass-panel p-4">
        <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          Best Trading Times
        </h3>
        
        {analytics.bestHours.length > 0 || analytics.bestDays.length > 0 ? (
          <div className="space-y-3">
            {analytics.bestDays.slice(0, 2).map((day, i) => (
              <div key={day.day} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{day.dayName}</span>
                </div>
                <span className={`text-sm font-medium ${
                  day.winRate >= 60 ? "text-bullish" : "text-foreground"
                }`}>
                  {day.winRate.toFixed(0)}% ({day.total} trades)
                </span>
              </div>
            ))}
            {analytics.bestHours.slice(0, 2).map((hour, i) => (
              <div key={hour.hour} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {hour.hour.toString().padStart(2, "0")}:00
                  </span>
                </div>
                <span className={`text-sm font-medium ${
                  hour.winRate >= 60 ? "text-bullish" : "text-foreground"
                }`}>
                  {hour.winRate.toFixed(0)}% ({hour.total} trades)
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Complete more trades to see patterns
          </p>
        )}
      </div>

      {/* Best AI + Asset Combos */}
      <div className="glass-panel p-4">
        <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-accent" />
          Best AI + Asset Combos
        </h3>
        
        {analytics.bestCombos.length > 0 ? (
          <div className="space-y-2">
            {analytics.bestCombos.slice(0, 4).map((combo, i) => (
              <div key={`${combo.model}-${combo.asset}`} className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-muted-foreground">{combo.model}</span>
                  <span className="text-muted-foreground">+</span>
                  <span className="text-foreground font-medium">{combo.asset}</span>
                </div>
                <span className={`text-xs font-medium ${
                  combo.winRate >= 70 ? "text-bullish" : 
                  combo.winRate >= 50 ? "text-foreground" : "text-bearish"
                }`}>
                  {combo.winRate.toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Need more trades to find patterns
          </p>
        )}
      </div>
    </div>
  );
};

export default AdvancedAnalytics;
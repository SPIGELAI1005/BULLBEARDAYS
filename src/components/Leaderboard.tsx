import { useState, useEffect } from "react";
import { Trophy, Medal, TrendingUp, Users, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  win_count: number;
  loss_count: number;
  win_rate: number;
  total_trades: number;
}

interface LeaderboardProfileShape {
  leaderboard_opt_in?: boolean;
}

interface LeaderboardStatsRow {
  user_id?: unknown;
  display_name?: unknown;
  win_count?: unknown;
  loss_count?: unknown;
}

const Leaderboard = () => {
  const { user, profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOptedIn, setIsOptedIn] = useState(false);

  useEffect(() => {
    if (profile) {
      const p = profile as unknown as LeaderboardProfileShape;
      setIsOptedIn(p.leaderboard_opt_in === true);
    }
  }, [profile]);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      // Use secure database function that aggregates stats server-side
      // Only returns data for users who have opted in to the leaderboard
      const { data, error } = await supabase.rpc("get_leaderboard_stats");

      if (error) throw error;

      // Convert to leaderboard entries with calculated fields
      const leaderboard: LeaderboardEntry[] = (Array.isArray(data) ? data : []).map((row) => {
        const entry = row as LeaderboardStatsRow;
        const userId = typeof entry.user_id === "string" ? entry.user_id : "";
        const displayName =
          typeof entry.display_name === "string" && entry.display_name.trim()
            ? entry.display_name
            : "Anonymous Trader";
        const winCount = typeof entry.win_count === "number" ? entry.win_count : Number(entry.win_count) || 0;
        const lossCount = typeof entry.loss_count === "number" ? entry.loss_count : Number(entry.loss_count) || 0;
        const total = winCount + lossCount;
        const winRate = total > 0 ? (winCount / total) * 100 : 0;

        return {
          user_id: userId,
          display_name: displayName,
          win_count: winCount,
          loss_count: lossCount,
          total_trades: total,
          win_rate: winRate,
        };
      });

      setEntries(leaderboard);
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleOptIn = async () => {
    if (!user) return;

    try {
      const newValue = !isOptedIn;
      await updateProfile({ leaderboard_opt_in: newValue } as Record<string, unknown>);
      setIsOptedIn(newValue);
      toast({
        title: newValue ? "Joined Leaderboard" : "Left Leaderboard",
        description: newValue 
          ? "Your performance is now visible to others" 
          : "Your performance is now private"
      });
      fetchLeaderboard();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update preference",
        variant: "destructive"
      });
    }
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (index === 1) return <Medal className="w-5 h-5 text-gray-400" />;
    if (index === 2) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="w-5 h-5 flex items-center justify-center text-sm font-medium text-muted-foreground">{index + 1}</span>;
  };

  return (
    <div className="glass-panel p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium text-foreground">Leaderboard</span>
        </div>
        {user && (
          <button
            onClick={toggleOptIn}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs transition-colors ${
              isOptedIn 
                ? "bg-bullish/10 text-bullish hover:bg-bullish/20" 
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            }`}
          >
            {isOptedIn ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            {isOptedIn ? "Public" : "Private"}
          </button>
        )}
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {isLoading ? (
          <div className="animate-pulse space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-muted/30 rounded-lg" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No traders on leaderboard yet
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Complete 5+ trades and opt-in to appear
            </p>
          </div>
        ) : (
          entries.map((entry, index) => (
            <div
              key={entry.user_id}
              className={`flex items-center gap-3 p-3 rounded-lg ${
                index === 0 ? "bg-accent/10 border border-accent/30" : "bg-muted/20"
              } ${entry.user_id === user?.id ? "ring-2 ring-primary/50" : ""}`}
            >
              {getRankIcon(index)}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground truncate">
                    {entry.display_name}
                  </span>
                  {entry.user_id === user?.id && (
                    <span className="text-xs text-primary">(You)</span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {entry.win_count}W / {entry.loss_count}L • {entry.total_trades} trades
                </div>
              </div>

              <div className={`text-lg font-bold ${
                entry.win_rate >= 60 ? "text-bullish" : 
                entry.win_rate >= 40 ? "text-neutral" : "text-bearish"
              }`}>
                {entry.win_rate.toFixed(0)}%
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
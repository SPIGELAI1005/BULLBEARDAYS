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

const Leaderboard = () => {
  const { user, profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOptedIn, setIsOptedIn] = useState(false);

  useEffect(() => {
    if (profile) {
      setIsOptedIn((profile as any).leaderboard_opt_in || false);
    }
  }, [profile]);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      // Get all analyses with outcomes, grouped by user
      const { data: analyses, error } = await supabase
        .from("analyses")
        .select("user_id, outcome")
        .in("outcome", ["WIN", "LOSS"])
        .not("user_id", "is", null);

      if (error) throw error;

      // Get profiles of users who opted in
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("user_id, display_name, leaderboard_opt_in")
        .eq("leaderboard_opt_in", true);

      if (profileError) throw profileError;

      const optedInUserIds = new Set(profiles?.map(p => p.user_id) || []);
      
      // Calculate stats for opted-in users
      const userStats: Record<string, { wins: number; losses: number; display_name: string }> = {};
      
      analyses?.forEach(a => {
        if (!a.user_id || !optedInUserIds.has(a.user_id)) return;
        
        if (!userStats[a.user_id]) {
          const profile = profiles?.find(p => p.user_id === a.user_id);
          userStats[a.user_id] = {
            wins: 0,
            losses: 0,
            display_name: profile?.display_name || "Anonymous Trader"
          };
        }
        
        if (a.outcome === "WIN") userStats[a.user_id].wins++;
        if (a.outcome === "LOSS") userStats[a.user_id].losses++;
      });

      // Convert to leaderboard entries
      const leaderboard: LeaderboardEntry[] = Object.entries(userStats)
        .map(([user_id, stats]) => ({
          user_id,
          display_name: stats.display_name,
          win_count: stats.wins,
          loss_count: stats.losses,
          total_trades: stats.wins + stats.losses,
          win_rate: stats.wins + stats.losses > 0 
            ? (stats.wins / (stats.wins + stats.losses)) * 100 
            : 0
        }))
        .filter(e => e.total_trades >= 5) // Min 5 trades to appear
        .sort((a, b) => b.win_rate - a.win_rate)
        .slice(0, 10);

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
      await updateProfile({ leaderboard_opt_in: newValue } as any);
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
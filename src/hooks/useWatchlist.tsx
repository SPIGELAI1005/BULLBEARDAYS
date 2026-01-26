import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface WatchlistItem {
  id: string;
  user_id: string;
  asset: string;
  notes: string | null;
  last_analysis_id: string | null;
  created_at: string;
}

export const useWatchlist = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWatchlist = useCallback(async () => {
    if (!user) {
      setWatchlist([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("watchlist")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWatchlist(data || []);
    } catch (error) {
      console.error("Failed to fetch watchlist:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  const addToWatchlist = async (asset: string, notes?: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.from("watchlist").insert({
        user_id: user.id,
        asset,
        notes: notes || null,
      });

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Already Watching",
            description: `${asset} is already in your watchlist`,
          });
          return;
        }
        throw error;
      }
      
      await fetchWatchlist();
      toast({
        title: "Added to Watchlist",
        description: `${asset} added to your watchlist`,
      });
    } catch (error) {
      console.error("Failed to add to watchlist:", error);
      toast({
        title: "Error",
        description: "Failed to add to watchlist",
        variant: "destructive",
      });
    }
  };

  const removeFromWatchlist = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("watchlist")
        .delete()
        .eq("id", id);

      if (error) throw error;
      await fetchWatchlist();
      
      toast({
        title: "Removed",
        description: "Asset removed from watchlist",
      });
    } catch (error) {
      console.error("Failed to remove from watchlist:", error);
    }
  };

  const updateNotes = async (id: string, notes: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("watchlist")
        .update({ notes })
        .eq("id", id);

      if (error) throw error;
      await fetchWatchlist();
    } catch (error) {
      console.error("Failed to update notes:", error);
    }
  };

  const isWatching = (asset: string) => {
    return watchlist.some(w => w.asset.toLowerCase() === asset.toLowerCase());
  };

  return {
    watchlist,
    isLoading,
    addToWatchlist,
    removeFromWatchlist,
    updateNotes,
    isWatching,
    refetch: fetchWatchlist,
  };
};
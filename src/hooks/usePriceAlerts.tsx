import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface PriceAlert {
  id: string;
  user_id: string;
  analysis_id: string | null;
  asset: string;
  alert_type: "TP" | "SL" | "CUSTOM";
  target_price: number;
  current_price: number | null;
  is_triggered: boolean;
  triggered_at: string | null;
  created_at: string;
}

export const usePriceAlerts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAlerts = useCallback(async () => {
    if (!user) {
      setAlerts([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("price_alerts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAlerts((data || []) as PriceAlert[]);
    } catch (error) {
      console.error("Failed to fetch alerts:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const createAlert = async (
    asset: string,
    targetPrice: number,
    alertType: "TP" | "SL" | "CUSTOM",
    analysisId?: string
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase.from("price_alerts").insert({
        user_id: user.id,
        analysis_id: analysisId || null,
        asset,
        alert_type: alertType,
        target_price: targetPrice,
      });

      if (error) throw error;
      await fetchAlerts();
      
      // Request notification permission
      if ("Notification" in window && Notification.permission === "default") {
        await Notification.requestPermission();
      }

      toast({
        title: "Alert Created",
        description: `Price alert set for ${asset} at ${targetPrice}`,
      });
    } catch (error) {
      console.error("Failed to create alert:", error);
      toast({
        title: "Error",
        description: "Failed to create price alert",
        variant: "destructive",
      });
    }
  };

  const deleteAlert = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("price_alerts")
        .delete()
        .eq("id", id);

      if (error) throw error;
      await fetchAlerts();
      
      toast({
        title: "Alert Deleted",
        description: "Price alert has been removed",
      });
    } catch (error) {
      console.error("Failed to delete alert:", error);
    }
  };

  const triggerNotification = (alert: PriceAlert) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(`Price Alert: ${alert.asset}`, {
        body: `Target price ${alert.target_price} reached!`,
        icon: "/favicon.ico",
      });
    }
  };

  return {
    alerts,
    isLoading,
    createAlert,
    deleteAlert,
    triggerNotification,
    refetch: fetchAlerts,
  };
};
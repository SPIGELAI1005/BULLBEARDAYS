import { Bell, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { usePriceAlerts, PriceAlert } from "@/hooks/usePriceAlerts";
import { useAuth } from "@/hooks/useAuth";

interface PriceAlertsProps {
  onCreateAlert?: (asset: string, price: number, type: "TP" | "SL" | "CUSTOM") => void;
}

const PriceAlerts = ({ onCreateAlert }: PriceAlertsProps) => {
  const { user } = useAuth();
  const { alerts, isLoading, deleteAlert } = usePriceAlerts();

  if (!user) {
    return (
      <div className="glass-panel p-4">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Price Alerts</span>
        </div>
        <p className="text-sm text-muted-foreground text-center py-4">
          Sign in to set price alerts
        </p>
      </div>
    );
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "TP":
        return <TrendingUp className="w-4 h-4 text-bullish" />;
      case "SL":
        return <TrendingDown className="w-4 h-4 text-bearish" />;
      default:
        return <Bell className="w-4 h-4 text-accent" />;
    }
  };

  return (
    <div className="glass-panel p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Price Alerts</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {alerts.filter(a => !a.is_triggered).length} active
        </span>
      </div>

      <div className="space-y-2 max-h-[200px] overflow-y-auto">
        {isLoading ? (
          <div className="animate-pulse space-y-2">
            {[1, 2].map(i => (
              <div key={i} className="h-12 bg-muted/30 rounded-lg" />
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No price alerts set
          </p>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3 rounded-lg border ${
                alert.is_triggered
                  ? "bg-accent/10 border-accent/30"
                  : "bg-muted/20 border-border/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getAlertIcon(alert.alert_type)}
                  <div>
                    <span className="text-sm font-medium text-foreground">
                      {alert.asset}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      @ {alert.target_price}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {alert.is_triggered && (
                    <span className="text-xs text-accent font-medium">Triggered</span>
                  )}
                  <button
                    onClick={() => deleteAlert(alert.id)}
                    className="p-1 rounded hover:bg-muted/50 text-muted-foreground hover:text-bearish transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PriceAlerts;
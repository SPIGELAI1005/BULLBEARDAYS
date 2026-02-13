import { useMemo } from "react";
import { Sparkles } from "lucide-react";
import type { TradingStrategy } from "@/lib/types";

export interface DemoPreset {
  id: string;
  label: string;
  instrument: string;
  timeframe: string;
  strategy: TradingStrategy;
}

const PRESETS: DemoPreset[] = [
  { id: "btc-1d", label: "BTC/USD • 1D • Swing", instrument: "BTC/USD", timeframe: "1D", strategy: "swingTrader" },
  { id: "aapl-4h", label: "AAPL • 4H • Day", instrument: "AAPL", timeframe: "4H", strategy: "dayTrader" },
  { id: "eurusd-1h", label: "EUR/USD • 1H • Day", instrument: "EUR/USD", timeframe: "1H", strategy: "dayTrader" },
  { id: "spx-1d", label: "SPX500 • 1D • Position", instrument: "SPX500", timeframe: "1D", strategy: "positionTrader" },
];

export default function DemoPresets(props: {
  onApply: (p: DemoPreset) => void;
}) {
  const presets = useMemo(() => PRESETS, []);

  return (
    <div className="glass-panel p-5 mb-6">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary" />
        <div className="text-sm font-semibold text-foreground">Try demo presets</div>
      </div>
      <div className="text-xs text-muted-foreground mt-1">
        One-click sample runs (works best with Demo mode enabled).
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {presets.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => props.onApply(p)}
            className="px-3 py-2 rounded-xl text-xs font-medium bg-muted/40 hover:bg-muted/60 border border-border/40 transition-colors"
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}

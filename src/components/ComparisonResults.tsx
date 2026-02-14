import AnalysisResults from "@/components/AnalysisResults";
import type { UnifiedAnalysis, TradingStrategy } from "@/lib/types";

export default function ComparisonResults(props: {
  primary: UnifiedAnalysis | null;
  compare: UnifiedAnalysis | null;
  isLoadingPrimary: boolean;
  isLoadingCompare?: boolean;
  tradingStrategy: TradingStrategy;
}) {
  if (!props.compare) return null;

  return (
    <div className="space-y-4">
      <div className="text-xs text-muted-foreground text-center">
        Comparison: reference provider vs selected provider
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-muted-foreground mb-2">Reference run</div>
          <AnalysisResults
            analysis={props.primary}
            isLoading={props.isLoadingPrimary}
            tradingStrategy={props.tradingStrategy}
          />
        </div>

        <div>
          <div className="text-xs text-muted-foreground mb-2">Comparison run</div>
          <AnalysisResults
            analysis={props.compare}
            isLoading={Boolean(props.isLoadingCompare)}
            tradingStrategy={props.tradingStrategy}
          />
        </div>
      </div>
    </div>
  );
}

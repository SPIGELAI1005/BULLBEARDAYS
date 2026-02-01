/**
 * ResultsSection Component
 * Right sidebar with history, watchlist, price alerts, and leaderboard
 */
import HistoryPanel from "@/components/HistoryPanel";
import WatchlistPanel from "@/components/WatchlistPanel";
import PriceAlerts from "@/components/PriceAlerts";
import Leaderboard from "@/components/Leaderboard";
import { AnalysisRecord } from "@/lib/api";

interface ResultsSectionProps {
  analyses: AnalysisRecord[];
  onSelectAnalysis: (record: AnalysisRecord) => void;
  onRefreshHistory: () => Promise<void>;
}

const ResultsSection = ({
  analyses,
  onSelectAnalysis,
  onRefreshHistory,
}: ResultsSectionProps) => {
  return (
    <div className="space-y-6">
      <div className="history-panel">
        <HistoryPanel
          onSelectAnalysis={onSelectAnalysis}
          analyses={analyses.slice(0, 20)}
          onRefresh={onRefreshHistory}
        />
      </div>

      {/* Watchlist */}
      <WatchlistPanel />

      {/* Price Alerts */}
      <PriceAlerts />

      {/* Leaderboard */}
      <Leaderboard />
    </div>
  );
};

export default ResultsSection;

import { useState, useEffect, useRef, useCallback, lazy, Suspense } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useOfflineMode } from "@/hooks/useOfflineMode";

// Eagerly loaded components (critical for initial render)
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ChartUpload from "@/components/ChartUpload";
import ChatInput from "@/components/ChatInput";
import AIModelSelector from "@/components/AIModelSelector";
import AnalyzeButton from "@/components/AnalyzeButton";
import AnalysisResults from "@/components/AnalysisResults";
import MarketTicker from "@/components/MarketTicker";
import CandlestickBackground from "@/components/CandlestickBackground";
import OfflineIndicator from "@/components/OfflineIndicator";
import TradingStrategySelector, { TradingStrategy } from "@/components/TradingStrategySelector";

// Lazy loaded components (rendered conditionally or below fold)
const MultiChartUpload = lazy(() => import("@/components/MultiChartUpload"));
const HistoryPanel = lazy(() => import("@/components/HistoryPanel"));
const PerformanceDashboard = lazy(() => import("@/components/PerformanceDashboard"));
const AnalysisDetailModal = lazy(() => import("@/components/AnalysisDetailModal"));
const PriceAlerts = lazy(() => import("@/components/PriceAlerts"));
const WatchlistPanel = lazy(() => import("@/components/WatchlistPanel"));
const OnboardingTour = lazy(() => import("@/components/OnboardingTour"));
const Leaderboard = lazy(() => import("@/components/Leaderboard"));
const AdvancedAnalytics = lazy(() => import("@/components/AdvancedAnalytics"));
const ShortcutsHelp = lazy(() => import("@/components/ShortcutsHelp"));
const MarketComparison = lazy(() => import("@/components/MarketComparison"));

import { analyzeChart, analyzeMarketData, saveAnalysis, getAnalysisHistory, AnalysisResult, AnalysisRecord, MarketDataItem, fetchMarketData } from "@/lib/api";
import { uploadChartImage } from "@/lib/chartStorage";
import { Layers, Grid2X2, MessageSquare, BarChart3, Loader2 } from "lucide-react";

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="h-6 w-6 animate-spin text-primary" />
  </div>
);

interface PriceTarget {
  price: number;
  confidence: number;
}

interface ConfidenceInterval {
  low: number;
  high: number;
  timeframe: string;
}

interface AnalysisData {
  signal: "BUY" | "SELL" | "HOLD";
  probability: number;
  takeProfit: string;
  stopLoss: string;
  riskReward: string;
  reasoning: {
    bullish: string[];
    bearish: string[];
  };
  chartAnalysis: string;
  marketSentiment: string;
  aiModel: string;
  detectedAsset?: string;
  currentPrice?: number;
  priceTargets?: {
    conservative?: PriceTarget;
    moderate?: PriceTarget;
    aggressive?: PriceTarget;
  };
  confidenceIntervals?: {
    short?: ConfidenceInterval;
    medium?: ConfidenceInterval;
    long?: ConfidenceInterval;
  };
}

const Index = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { toggleTheme } = useTheme();
  const { saveToCache, cachedAnalyses, isOnline } = useOfflineMode();

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isMultiChartMode, setIsMultiChartMode] = useState(false);
  const [isChatMode, setIsChatMode] = useState(true);
  const [chatContext, setChatContext] = useState<string>("");
  const [selectedModels, setSelectedModels] = useState<string[]>(["gemini"]);
  const [referenceModel, setReferenceModel] = useState("gemini");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [allAnalyses, setAllAnalyses] = useState<AnalysisRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<AnalysisRecord | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [marketAssets, setMarketAssets] = useState<MarketDataItem[]>([]);
  const [tradingStrategy, setTradingStrategy] = useState<TradingStrategy>('swingTrader');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ... rest of the component logic remains the same ...

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-x-hidden">
      <CandlestickBackground />
      <OfflineIndicator />

      <div className="relative z-10">
        <Header />

        <main className="container mx-auto px-4 py-8 space-y-8">
          <Hero />

          <MarketTicker />

          {/* Critical components loaded immediately */}
          <div className="glass-panel p-6 rounded-lg space-y-6">
            {/* Your main upload and analysis UI */}
          </div>

          {/* Lazy loaded components wrapped in Suspense */}
          <Suspense fallback={<LoadingFallback />}>
            {showDetailModal && selectedRecord && (
              <AnalysisDetailModal
                analysis={selectedRecord}
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
              />
            )}
          </Suspense>

          <Suspense fallback={<LoadingFallback />}>
            {showShortcutsHelp && (
              <ShortcutsHelp
                isOpen={showShortcutsHelp}
                onClose={() => setShowShortcutsHelp(false)}
              />
            )}
          </Suspense>

          <Suspense fallback={<LoadingFallback />}>
            {user && <HistoryPanel analyses={allAnalyses} onSelectAnalysis={handleSelectAnalysis} />}
          </Suspense>

          <Suspense fallback={<LoadingFallback />}>
            {user && <PerformanceDashboard analyses={allAnalyses} />}
          </Suspense>

          <Suspense fallback={<LoadingFallback />}>
            <OnboardingTour />
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default Index;

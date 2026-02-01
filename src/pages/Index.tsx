/**
 * Main Index Page
 * Refactored to use custom hooks and extracted components
 */
import { useState, useRef, useEffect } from "react";
import { useTheme } from "@/hooks/useTheme";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import OnboardingTour from "@/components/OnboardingTour";
import OfflineIndicator from "@/components/OfflineIndicator";
import ShortcutsHelp from "@/components/ShortcutsHelp";
import CandlestickBackground from "@/components/CandlestickBackground";
import Footer from "@/components/Footer";
import AnalysisDetailModal from "@/components/AnalysisDetailModal";
import MarketComparison from "@/components/MarketComparison";
import AnalysisContainer from "@/components/analysis/AnalysisContainer";
import { useAnalysisHistory } from "@/hooks/useAnalysisHistory";
import { useAnalysisFlow } from "@/hooks/useAnalysisFlow";
import { useChartUpload } from "@/hooks/useChartUpload";
import { fetchMarketData, MarketDataItem } from "@/lib/api";

const Index = () => {
  const { toggleTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // UI state
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [marketAssets, setMarketAssets] = useState<MarketDataItem[]>([]);

  // Use custom hooks
  const { uploadedImage, handleImageUpload, isMultiChartMode, uploadedImages } =
    useChartUpload();

  const {
    selectedRecord,
    showDetailModal,
    loadAllAnalyses,
    handleDetailModalClose,
  } = useAnalysisHistory();

  const { canAnalyze } = useAnalysisFlow({
    onHistoryUpdate: loadAllAnalyses,
  });

  // Load market assets
  useEffect(() => {
    fetchMarketData().then(setMarketAssets).catch(console.error);
  }, []);

  // Check if can analyze for keyboard shortcut
  const hasImage = isMultiChartMode
    ? uploadedImages.length > 0
    : !!uploadedImage;
  const canAnalyzeNow = canAnalyze(hasImage);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onUpload: () => fileInputRef.current?.click(),
    onAnalyze: () => {
      // Keyboard shortcut handled in AnalysisContainer
    },
    onToggleTheme: toggleTheme,
  });

  return (
    <div className="min-h-screen bg-background relative">
      {/* Animated candlestick chart background */}
      <CandlestickBackground />

      <div className="relative z-10">
        <Header />
        <Hero />

        {/* Hidden file input for keyboard shortcut */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (ev) => {
                if (ev.target?.result) {
                  handleImageUpload(ev.target.result as string);
                }
              };
              reader.readAsDataURL(file);
            }
          }}
        />

        <main
          id="analyze"
          className="max-w-7xl mx-auto px-4 pt-6 pb-16 md:px-6 md:pt-8 md:pb-20"
        >
          {/* Main Analysis Container */}
          <AnalysisContainer />
        </main>

        {/* Footer */}
        <Footer onShortcutsClick={() => setShowShortcutsHelp(true)} />

        {/* Modals & Overlays */}
        <AnalysisDetailModal
          analysis={selectedRecord}
          isOpen={showDetailModal}
          onClose={handleDetailModalClose}
          onUpdate={loadAllAnalyses}
        />

        <OnboardingTour />
        <OfflineIndicator />
        <ShortcutsHelp
          isOpen={showShortcutsHelp}
          onClose={() => setShowShortcutsHelp(false)}
        />
        <MarketComparison
          availableAssets={marketAssets}
          isOpen={showComparison}
          onClose={() => setShowComparison(false)}
        />
      </div>
    </div>
  );
};

export default Index;

/**
 * AnalysisContainer Component
 * Main container for the analysis interface
 * Orchestrates input section, results section, and additional features
 */
import { useState, useEffect, useCallback } from "react";
import MarketTicker from "@/components/MarketTicker";
import AdvancedAnalytics from "@/components/AdvancedAnalytics";
import PerformanceDashboard from "@/components/PerformanceDashboard";
import InputSection from "./InputSection";
import ResultsSection from "./ResultsSection";
import { useAnalysisFlow } from "@/hooks/useAnalysisFlow";
import { useChartUpload } from "@/hooks/useChartUpload";
import { useAnalysisHistory } from "@/hooks/useAnalysisHistory";
import { fetchMarketData, MarketDataItem } from "@/lib/api";

const AnalysisContainer = () => {
  const [marketAssets, setMarketAssets] = useState<MarketDataItem[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  // Use custom hooks
  const {
    uploadedImage,
    handleImageUpload,
    handleClearImage,
    uploadedImages,
    handleMultiImagesUpload,
    handleClearAllImages,
    handleClearOneImage,
    isMultiChartMode,
    setIsMultiChartMode,
    isChatMode,
    setIsChatMode,
    chatContext,
    setChatContext,
  } = useChartUpload();

  const {
    allAnalyses,
    loadAllAnalyses,
    handleSelectFromHistory,
  } = useAnalysisHistory();

  const {
    analysis,
    isAnalyzing,
    cancelCurrentAnalysis,
    selectedModels,
    referenceModel,
    tradingStrategy,
    selectedInstrument,
    selectedTimeframe,
    setAnalysis,
    setTradingStrategy,
    setSelectedInstrument,
    setSelectedTimeframe,
    handleToggleModel,
    handleSetReference,
    handleAnalyze: baseHandleAnalyze,
    handleChatSubmit: baseHandleChatSubmit,
    handleMarketAssetClick,
    canAnalyze,
  } = useAnalysisFlow({
    onHistoryUpdate: loadAllAnalyses,
  });

  // Load market assets on mount
  useEffect(() => {
    fetchMarketData().then(setMarketAssets).catch(console.error);
  }, []);

  // Wrapper for handleAnalyze that clears analysis state
  const handleAnalyze = useCallback(() => {
    const imageToAnalyze = isMultiChartMode ? uploadedImages[0] : uploadedImage;
    if (!imageToAnalyze) return;

    setAnalysis(null);
    baseHandleAnalyze(imageToAnalyze);
  }, [isMultiChartMode, uploadedImages, uploadedImage, setAnalysis, baseHandleAnalyze]);

  // Wrapper for handleChatSubmit that updates chat context
  const handleChatSubmit = useCallback(
    async (message: string, images: string[]) => {
      setChatContext(message);

      // Update uploaded image state
      if (images.length > 0) {
        handleImageUpload(images[0]);
        if (images.length > 1) {
          handleMultiImagesUpload(images);
        }
      }

      await baseHandleChatSubmit(message, images);
    },
    [setChatContext, handleImageUpload, handleMultiImagesUpload, baseHandleChatSubmit]
  );

  // Mode change handler
  const handleModeChange = useCallback(
    (chatMode: boolean, multiMode: boolean) => {
      setIsChatMode(chatMode);
      setIsMultiChartMode(multiMode);
    },
    [setIsChatMode, setIsMultiChartMode]
  );

  const canAnalyzeImage = canAnalyze(
    isMultiChartMode ? uploadedImages.length > 0 : !!uploadedImage
  );

  return (
    <>
      {/* Market Ticker with Comparison Button */}
      <MarketTicker
        onSelectAsset={handleMarketAssetClick}
        onCompareClick={() => setShowComparison(true)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
        {/* Left Column - Input & Analysis (spans 2 columns) */}
        <InputSection
          isChatMode={isChatMode}
          isMultiChartMode={isMultiChartMode}
          onModeChange={handleModeChange}
          uploadedImage={uploadedImage}
          uploadedImages={uploadedImages}
          onImageUpload={handleImageUpload}
          onClearImage={handleClearImage}
          onMultiImagesUpload={handleMultiImagesUpload}
          onClearAllImages={handleClearAllImages}
          onClearOneImage={handleClearOneImage}
          selectedModels={selectedModels}
          referenceModel={referenceModel}
          onToggleModel={handleToggleModel}
          onSetReference={handleSetReference}
          canAnalyze={canAnalyzeImage}
          isAnalyzing={isAnalyzing}
          onAnalyze={handleAnalyze}
          onChatSubmit={handleChatSubmit}
          onCancel={cancelCurrentAnalysis}
          tradingStrategy={tradingStrategy}
          onStrategyChange={setTradingStrategy}
          selectedTimeframe={selectedTimeframe}
          onTimeframeChange={setSelectedTimeframe}
          selectedInstrument={selectedInstrument}
          onInstrumentChange={setSelectedInstrument}
          marketAssets={marketAssets}
          analysis={analysis}
        />

        {/* Right Column - History, Watchlist, Alerts, Leaderboard */}
        <ResultsSection
          analyses={allAnalyses}
          onSelectAnalysis={handleSelectFromHistory}
          onRefreshHistory={loadAllAnalyses}
        />
      </div>

      {/* Advanced Analytics */}
      <section className="mb-8">
        <AdvancedAnalytics analyses={allAnalyses} />
      </section>

      {/* Performance Dashboard */}
      <section id="performance" className="pt-8">
        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
          <span className="text-gradient-gold">Performance</span>
          <span className="text-foreground">Dashboard</span>
        </h2>
        <PerformanceDashboard analyses={allAnalyses} />
      </section>
    </>
  );
};

export default AnalysisContainer;

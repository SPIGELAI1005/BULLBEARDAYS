import { useState, useEffect, useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useOfflineMode } from "@/hooks/useOfflineMode";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ChartUpload from "@/components/ChartUpload";
import MultiChartUpload from "@/components/MultiChartUpload";
import ChatInput from "@/components/ChatInput";
import AIModelSelector from "@/components/AIModelSelector";
import AnalyzeButton from "@/components/AnalyzeButton";
import AnalysisResults from "@/components/AnalysisResults";
import MarketTicker from "@/components/MarketTicker";
import HistoryPanel from "@/components/HistoryPanel";
import PerformanceDashboard from "@/components/PerformanceDashboard";
import AnalysisDetailModal from "@/components/AnalysisDetailModal";
import PriceAlerts from "@/components/PriceAlerts";
import WatchlistPanel from "@/components/WatchlistPanel";
import OnboardingTour from "@/components/OnboardingTour";
import OfflineIndicator from "@/components/OfflineIndicator";
import Leaderboard from "@/components/Leaderboard";
import AdvancedAnalytics from "@/components/AdvancedAnalytics";
import ShortcutsHelp from "@/components/ShortcutsHelp";
import CandlestickBackground from "@/components/CandlestickBackground";
import TradingStrategySelector from "@/components/TradingStrategySelector";
import InstrumentSelector from "@/components/InstrumentSelector";
import TimeframeSelector from "@/components/TimeframeSelector";
import Footer from "@/components/Footer";
import { analyzeChart, analyzeMarketData, saveAnalysis, getAnalysisHistory, AnalysisResult, AnalysisRecord, MarketDataItem, fetchMarketData } from "@/lib/api";
import { UnifiedAnalysis, TradingStrategy, isScenarioAnalysis, isLegacyAnalysis } from "@/lib/types";
import { uploadChartImage } from "@/lib/chartStorage";
import MarketComparison from "@/components/MarketComparison";
import { Layers, Grid2X2, MessageSquare, BarChart3 } from "lucide-react";

// Types now imported from @/lib/types for consistency

const Index = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { toggleTheme } = useTheme();
  const { saveToCache, cachedAnalyses, isOnline } = useOfflineMode();
  
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isMultiChartMode, setIsMultiChartMode] = useState(false);
  const [isChatMode, setIsChatMode] = useState(true); // Default to chat mode
  const [chatContext, setChatContext] = useState<string>(""); // User's text context
  const [selectedModels, setSelectedModels] = useState<string[]>(["gemini"]);
  const [referenceModel, setReferenceModel] = useState("gemini");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<UnifiedAnalysis | null>(null);
  const [allAnalyses, setAllAnalyses] = useState<AnalysisRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<AnalysisRecord | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [marketAssets, setMarketAssets] = useState<MarketDataItem[]>([]);
  const [tradingStrategy, setTradingStrategy] = useState<TradingStrategy>('swingTrader');
  const [selectedInstrument, setSelectedInstrument] = useState<string | undefined>(undefined);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('1D');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onUpload: () => fileInputRef.current?.click(),
    onAnalyze: () => canAnalyze && handleAnalyze(),
    onToggleTheme: toggleTheme,
  });

  const loadAllAnalyses = async () => {
    if (!isOnline && cachedAnalyses.length > 0) {
      setAllAnalyses(cachedAnalyses);
      return;
    }
    
    try {
      const data = await getAnalysisHistory(100, user?.id);
      setAllAnalyses(data);
      saveToCache(data);
    } catch (error) {
      console.error("Failed to load analyses:", error);
      if (cachedAnalyses.length > 0) {
        setAllAnalyses(cachedAnalyses);
      }
    }
  };

  useEffect(() => {
    loadAllAnalyses();
    // Load market assets for comparison
    fetchMarketData().then(setMarketAssets).catch(console.error);
  }, [user?.id]);

  const handleImageUpload = (image: string) => {
    setUploadedImage(image);
    setAnalysis(null);
  };

  const handleClearImage = () => {
    setUploadedImage(null);
    setAnalysis(null);
  };

  const handleMultiImagesUpload = (images: string[]) => {
    setUploadedImages(images);
    setAnalysis(null);
  };

  const handleClearAllImages = () => {
    setUploadedImages([]);
    setAnalysis(null);
  };

  const handleClearOneImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Chat mode submit handler - analyze images with optional text context
  const handleChatSubmit = useCallback(async (message: string, images: string[]) => {
    if (images.length === 0) {
      toast({
        title: "No Image",
        description: "Please paste or upload a chart image to analyze",
        variant: "destructive",
      });
      return;
    }

    // Store context and use first image for analysis
    setChatContext(message);
    setUploadedImage(images[0]);
    if (images.length > 1) {
      setUploadedImages(images);
    }

    // Auto-trigger analysis
    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      // Pass user selections to API (Phase 1 first-class inputs)
      const result = await analyzeChart(images[0], selectedModels, referenceModel, {
        strategy: tradingStrategy,
        timeframe: selectedTimeframe,
        instrument: selectedInstrument,
      });

      // Result is UnifiedAnalysis
      setAnalysis(result);

      if (user) {
        try {
          let chartImageUrl: string | undefined;
          const url = await uploadChartImage(images[0], user.id);
          if (url) chartImageUrl = url;

          await saveAnalysis(result, chartImageUrl, message || undefined, user.id);
          await loadAllAnalyses();

          const displayMessage = isScenarioAnalysis(result)
            ? `${result.trendBias} bias with ${result.confidenceScore}% confidence`
            : `${result.signal} signal with ${result.probability}% confidence`;

          toast({
            title: "Analysis Complete",
            description: displayMessage,
          });
        } catch (saveError) {
          console.error("Failed to save analysis:", saveError);
          toast({
            title: "Analysis Complete",
            description: "Analysis complete (not saved - sign in to save)",
          });
        }
      } else {
        const displayMessage = isScenarioAnalysis(result)
          ? `${result.trendBias} bias - Sign in to save your history`
          : `${result.signal} signal - Sign in to save your history`;

        toast({
          title: "Analysis Complete",
          description: displayMessage,
        });
      }
    } catch (error) {
      console.error("Analysis failed:", error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze chart",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [selectedModels, referenceModel, user, toast]);

  const handleToggleModel = (modelId: string) => {
    setSelectedModels((prev) => {
      if (prev.includes(modelId)) {
        if (prev.length === 1) return prev;
        const newSelection = prev.filter((id) => id !== modelId);
        if (referenceModel === modelId) {
          setReferenceModel(newSelection[0]);
        }
        return newSelection;
      }
      return [...prev, modelId];
    });
  };

  const handleSetReference = (modelId: string) => {
    setReferenceModel(modelId);
  };

  const handleAnalyze = async () => {
    const imageToAnalyze = isMultiChartMode ? uploadedImages[0] : uploadedImage;
    if (!imageToAnalyze || selectedModels.length === 0) return;

    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      // Pass user selections to API (Phase 1 first-class inputs)
      const result = await analyzeChart(imageToAnalyze, selectedModels, referenceModel, {
        strategy: tradingStrategy,
        timeframe: selectedTimeframe,
        instrument: selectedInstrument,
      });

      // Result is UnifiedAnalysis - can be ScenarioAnalysis or LegacyAnalysis
      setAnalysis(result);

      if (user) {
        try {
          // Upload chart image to storage
          let chartImageUrl: string | undefined;
          if (imageToAnalyze) {
            const url = await uploadChartImage(imageToAnalyze, user.id);
            if (url) chartImageUrl = url;
          }

          await saveAnalysis(result, chartImageUrl, undefined, user.id);
          await loadAllAnalyses();

          // Display appropriate toast based on format
          const displayMessage = isScenarioAnalysis(result)
            ? `${result.trendBias} bias with ${result.confidenceScore}% confidence`
            : `${result.signal} signal with ${result.probability}% confidence`;

          toast({
            title: "Analysis Complete",
            description: displayMessage,
          });
        } catch (saveError) {
          console.error("Failed to save analysis:", saveError);
          toast({
            title: "Analysis Complete",
            description: "Analysis complete (not saved - please sign in to save)",
          });
        }
      } else {
        const displayMessage = isScenarioAnalysis(result)
          ? `${result.trendBias} bias - Sign in to save your history`
          : `${result.signal} signal - Sign in to save your history`;

        toast({
          title: "Analysis Complete",
          description: displayMessage,
        });
      }
    } catch (error) {
      console.error("Analysis failed:", error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze chart",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectFromHistory = (record: AnalysisRecord) => {
    setSelectedRecord(record);
    setShowDetailModal(true);
  };

  const handleDetailModalClose = () => {
    setShowDetailModal(false);
    setSelectedRecord(null);
  };

  // Handle clicking on a market asset for instant analysis
  const handleMarketAssetClick = useCallback(async (asset: MarketDataItem) => {
    setIsAnalyzing(true);
    setAnalysis(null);

    toast({
      title: `Analyzing ${asset.symbol}...`,
      description: "Getting AI trading recommendation",
    });

    try {
      const result = await analyzeMarketData(asset);

      // Result is UnifiedAnalysis
      setAnalysis(result);

      const displayMessage = isScenarioAnalysis(result)
        ? `${result.trendBias} bias with ${result.confidenceScore}% confidence`
        : `${result.signal} signal with ${result.probability}% confidence`;

      toast({
        title: `${asset.symbol} Analysis Complete`,
        description: displayMessage,
      });

      // Optionally save to history if user is logged in
      if (user) {
        try {
          await saveAnalysis(result, undefined, `Market analysis for ${asset.symbol}`, user.id);
          await loadAllAnalyses();
        } catch (saveError) {
          console.error("Failed to save market analysis:", saveError);
        }
      }
    } catch (error) {
      console.error("Market analysis failed:", error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze market",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [user, toast]);

  const canAnalyze = isMultiChartMode 
    ? uploadedImages.length > 0 && selectedModels.length > 0
    : uploadedImage && selectedModels.length > 0;

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

      <main id="analyze" className="max-w-7xl mx-auto px-6 pt-8 pb-20">
        {/* Market Ticker with Comparison Button */}
        <MarketTicker 
          onSelectAsset={handleMarketAssetClick} 
          onCompareClick={() => setShowComparison(true)}
        />


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Left Column - Upload & Models + Results (spans 2 columns) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Mode Toggle - Chat / Single / Multi */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/30 border border-border/30">
              <button
                onClick={() => { setIsChatMode(true); setIsMultiChartMode(false); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  isChatMode 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                Chat
              </button>
              <button
                onClick={() => { setIsChatMode(false); setIsMultiChartMode(false); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  !isChatMode && !isMultiChartMode 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Grid2X2 className="w-4 h-4" />
                Upload
              </button>
              <button
                onClick={() => { setIsChatMode(false); setIsMultiChartMode(true); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  !isChatMode && isMultiChartMode 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Layers className="w-4 h-4" />
                Multi
              </button>
            </div>

            {/* Chat Mode Input */}
            {isChatMode && (
              <>
                <div className="glass-panel p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-semibold text-foreground">AI Chart Analysis</h2>
                  </div>
                  <ChatInput
                    onSubmit={handleChatSubmit}
                    isLoading={isAnalyzing}
                    placeholder="Paste a chart image (Ctrl+V) or describe your setup..."
                  />
                </div>

                {/* Phase 1: Optional Context Inputs for Chat Mode */}
                <div className="glass-panel p-4 space-y-4">
                  <div className="text-sm text-muted-foreground mb-3">
                    Optional: Provide context for better analysis
                  </div>
                  <TimeframeSelector
                    selectedTimeframe={selectedTimeframe}
                    onTimeframeChange={setSelectedTimeframe}
                    strategy={tradingStrategy}
                    compact={true}
                  />
                  <div className="text-xs text-muted-foreground mb-2">Instrument (AI will also detect)</div>
                  <InstrumentSelector
                    selectedInstrument={selectedInstrument}
                    onInstrumentChange={setSelectedInstrument}
                    marketData={marketAssets}
                  />
                </div>
              </>
            )}

            {/* Non-chat upload modes */}
            {!isChatMode && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  {isMultiChartMode ? (
                    <MultiChartUpload
                      onImagesUpload={handleMultiImagesUpload}
                      uploadedImages={uploadedImages}
                      onClearAll={handleClearAllImages}
                      onClearOne={handleClearOneImage}
                    />
                  ) : (
                    <ChartUpload
                      onImageUpload={handleImageUpload}
                      uploadedImage={uploadedImage}
                      onClear={handleClearImage}
                    />
                  )}
                  
                  <div className="ai-model-selector">
                    <AIModelSelector
                      selectedModels={selectedModels}
                      referenceModel={referenceModel}
                      onToggleModel={handleToggleModel}
                      onSetReference={handleSetReference}
                    />
                  </div>

                  {/* Phase 1: First-Class Inputs */}
                  <div className="glass-panel p-4 space-y-4">
                    <InstrumentSelector
                      selectedInstrument={selectedInstrument}
                      onInstrumentChange={setSelectedInstrument}
                      marketData={marketAssets}
                    />
                  </div>

                  <div className="glass-panel p-4">
                    <TimeframeSelector
                      selectedTimeframe={selectedTimeframe}
                      onTimeframeChange={setSelectedTimeframe}
                      strategy={tradingStrategy}
                      compact={false}
                    />
                  </div>

                  <div className="analyze-button">
                    <AnalyzeButton
                      onClick={handleAnalyze}
                      disabled={!canAnalyze}
                      isLoading={isAnalyzing}
                    />
                  </div>
                </div>

                {/* Analysis Results - side by side on larger screens */}
                <div>
                  <AnalysisResults 
                    analysis={analysis} 
                    isLoading={isAnalyzing}
                    tradingStrategy={tradingStrategy}
                    onStrategyChange={setTradingStrategy}
                  />
                </div>
              </div>
            )}

            {/* Analysis Results for Chat Mode */}
            {isChatMode && (
              <AnalysisResults 
                analysis={analysis} 
                isLoading={isAnalyzing}
                tradingStrategy={tradingStrategy}
                onStrategyChange={setTradingStrategy}
              />
            )}
          </div>

          {/* Right Column - History, Watchlist, Price Alerts, Leaderboard */}
          <div className="space-y-6">
            <div className="history-panel">
              <HistoryPanel 
                onSelectAnalysis={handleSelectFromHistory}
                analyses={allAnalyses.slice(0, 20)}
                onRefresh={loadAllAnalyses}
              />
            </div>
            
            {/* Watchlist */}
            <WatchlistPanel />
            
            {/* Price Alerts */}
            <PriceAlerts />
            
            {/* Leaderboard */}
            <Leaderboard />
          </div>
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
      <ShortcutsHelp isOpen={showShortcutsHelp} onClose={() => setShowShortcutsHelp(false)} />
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
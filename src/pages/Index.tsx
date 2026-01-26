import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useOfflineMode } from "@/hooks/useOfflineMode";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ChartUpload from "@/components/ChartUpload";
import MultiChartUpload from "@/components/MultiChartUpload";
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
import { analyzeChart, saveAnalysis, getAnalysisHistory, AnalysisResult, AnalysisRecord } from "@/lib/api";
import { uploadChartImage } from "@/lib/chartStorage";
import { Layers, Grid2X2 } from "lucide-react";

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
}

const Index = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { toggleTheme } = useTheme();
  const { saveToCache, cachedAnalyses, isOnline } = useOfflineMode();
  
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isMultiChartMode, setIsMultiChartMode] = useState(false);
  const [selectedModels, setSelectedModels] = useState<string[]>(["gemini"]);
  const [referenceModel, setReferenceModel] = useState("gemini");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [allAnalyses, setAllAnalyses] = useState<AnalysisRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<AnalysisRecord | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  
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
      const result = await analyzeChart(imageToAnalyze, selectedModels, referenceModel);
      
      const analysisData: AnalysisData = {
        signal: result.signal,
        probability: result.probability,
        takeProfit: result.takeProfit,
        stopLoss: result.stopLoss,
        riskReward: result.riskReward,
        reasoning: {
          bullish: result.bullishReasons || [],
          bearish: result.bearishReasons || [],
        },
        chartAnalysis: result.chartAnalysis,
        marketSentiment: result.marketSentiment,
        aiModel: result.aiModel,
      };

      setAnalysis(analysisData);

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
          toast({
            title: "Analysis Complete",
            description: `${result.signal} signal with ${result.probability}% confidence`,
          });
        } catch (saveError) {
          console.error("Failed to save analysis:", saveError);
          toast({
            title: "Analysis Complete",
            description: `${result.signal} signal (not saved - sign in to save)`,
          });
        }
      } else {
        toast({
          title: "Analysis Complete",
          description: `${result.signal} signal - Sign in to save your history`,
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

  const canAnalyze = isMultiChartMode 
    ? uploadedImages.length > 0 && selectedModels.length > 0
    : uploadedImage && selectedModels.length > 0;

  return (
    <div className="min-h-screen bg-background">
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

      <main id="analyze" className="max-w-7xl mx-auto px-6 pb-20">
        <MarketTicker />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Left Column - Upload & Models */}
          <div className="space-y-6">
            {/* Mode Toggle */}
            <div className="flex items-center gap-2 p-1 rounded-xl bg-muted/30 border border-border/30">
              <button
                onClick={() => setIsMultiChartMode(false)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  !isMultiChartMode 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Grid2X2 className="w-4 h-4" />
                Single
              </button>
              <button
                onClick={() => setIsMultiChartMode(true)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  isMultiChartMode 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Layers className="w-4 h-4" />
                Multi-Chart
              </button>
            </div>

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
            
            <div className="analyze-button">
              <AnalyzeButton
                onClick={handleAnalyze}
                disabled={!canAnalyze}
                isLoading={isAnalyzing}
              />
            </div>

            {/* Watchlist */}
            <WatchlistPanel />
          </div>

          {/* Middle Column - Results */}
          <div className="space-y-6">
            <AnalysisResults analysis={analysis} isLoading={isAnalyzing} />
            
            {/* Price Alerts */}
            <PriceAlerts />
          </div>

          {/* Right Column - History & Leaderboard */}
          <div className="space-y-6">
            <div className="history-panel">
              <HistoryPanel 
                onSelectAnalysis={handleSelectFromHistory}
                analyses={allAnalyses.slice(0, 20)}
                onRefresh={loadAllAnalyses}
              />
            </div>
            
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
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div>© 2026 BullBearDays. AI-powered trading analysis.</div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => setShowShortcutsHelp(true)}
              className="text-xs hover:text-foreground transition-colors"
            >
              Keyboard Shortcuts (?)
            </button>
            <span className="text-xs">
              Not financial advice. Trade responsibly.
            </span>
          </div>
        </div>
      </footer>

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
    </div>
  );
};

export default Index;
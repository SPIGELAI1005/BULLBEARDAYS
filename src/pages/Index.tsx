import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ChartUpload from "@/components/ChartUpload";
import AIModelSelector from "@/components/AIModelSelector";
import AnalyzeButton from "@/components/AnalyzeButton";
import AnalysisResults from "@/components/AnalysisResults";
import MarketTicker from "@/components/MarketTicker";
import HistoryPanel from "@/components/HistoryPanel";
import { analyzeChart, saveAnalysis, AnalysisResult, AnalysisRecord } from "@/lib/api";

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
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedModels, setSelectedModels] = useState<string[]>(["gemini"]);
  const [referenceModel, setReferenceModel] = useState("gemini");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);

  const handleImageUpload = (image: string) => {
    setUploadedImage(image);
    setAnalysis(null);
  };

  const handleClearImage = () => {
    setUploadedImage(null);
    setAnalysis(null);
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
    if (!uploadedImage || selectedModels.length === 0) return;

    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const result = await analyzeChart(uploadedImage, selectedModels, referenceModel);
      
      // Convert API response to component format
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

      // Save to history
      try {
        await saveAnalysis(result);
        toast({
          title: "Analysis Complete",
          description: `${result.signal} signal with ${result.probability}% confidence`,
        });
      } catch (saveError) {
        console.error("Failed to save analysis:", saveError);
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
    const analysisData: AnalysisData = {
      signal: record.signal as "BUY" | "SELL" | "HOLD",
      probability: record.probability,
      takeProfit: record.take_profit || "N/A",
      stopLoss: record.stop_loss || "N/A",
      riskReward: record.risk_reward || "N/A",
      reasoning: {
        bullish: record.bullish_reasons || [],
        bearish: record.bearish_reasons || [],
      },
      chartAnalysis: record.chart_analysis || "",
      marketSentiment: record.market_sentiment || "",
      aiModel: record.ai_model,
    };
    setAnalysis(analysisData);
    
    toast({
      title: "Loaded from History",
      description: `${record.detected_asset || 'Analysis'} - ${record.signal}`,
    });
  };

  const canAnalyze = uploadedImage && selectedModels.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />

      <main id="analyze" className="max-w-7xl mx-auto px-6 pb-20">
        {/* Market Ticker */}
        <MarketTicker />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Upload & Models */}
          <div className="space-y-6">
            <ChartUpload
              onImageUpload={handleImageUpload}
              uploadedImage={uploadedImage}
              onClear={handleClearImage}
            />
            
            <AIModelSelector
              selectedModels={selectedModels}
              referenceModel={referenceModel}
              onToggleModel={handleToggleModel}
              onSetReference={handleSetReference}
            />
            
            <AnalyzeButton
              onClick={handleAnalyze}
              disabled={!canAnalyze}
              isLoading={isAnalyzing}
            />
          </div>

          {/* Middle Column - Results */}
          <div>
            <AnalysisResults analysis={analysis} isLoading={isAnalyzing} />
          </div>

          {/* Right Column - History */}
          <div>
            <HistoryPanel onSelectAnalysis={handleSelectFromHistory} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div>© 2026 BullBearDays. AI-powered trading analysis.</div>
          <div className="flex items-center gap-6">
            <span className="text-xs">
              Not financial advice. Trade responsibly.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
import { useState } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ChartUpload from "@/components/ChartUpload";
import AIModelSelector from "@/components/AIModelSelector";
import AnalyzeButton from "@/components/AnalyzeButton";
import AnalysisResults from "@/components/AnalysisResults";

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

  const modelNames: Record<string, string> = {
    gemini: "Google Gemini",
    gpt: "OpenAI GPT",
    claude: "Anthropic Claude",
  };

  const handleAnalyze = async () => {
    if (!uploadedImage || selectedModels.length === 0) return;

    setIsAnalyzing(true);
    setAnalysis(null);

    // Simulate AI analysis with realistic delay
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Mock analysis result - will be replaced with real AI integration
    const mockAnalysis: AnalysisData = {
      signal: Math.random() > 0.5 ? "BUY" : "SELL",
      probability: Math.floor(65 + Math.random() * 25),
      takeProfit: `+${(1.5 + Math.random() * 2).toFixed(1)}%`,
      stopLoss: `-${(0.8 + Math.random() * 0.7).toFixed(1)}%`,
      riskReward: `1:${(2 + Math.random()).toFixed(1)}`,
      reasoning: {
        bullish: [
          "Strong support level identified at current price zone",
          "RSI showing bullish divergence on the 15m timeframe",
          "Volume profile indicates accumulation phase",
          "Moving averages alignment suggests upward momentum",
        ],
        bearish: [
          "Major resistance zone overhead within 2% range",
          "Broader market showing weakness in recent sessions",
          "Potential head and shoulders pattern forming on higher timeframe",
        ],
      },
      chartAnalysis:
        "The chart shows a consolidation pattern near a key support level. Price action indicates buyers are defending this zone with increasing volume. The structure suggests a potential breakout to the upside if current support holds. Key indicators (RSI, MACD) are showing early signs of momentum shift.",
      marketSentiment:
        "Current market sentiment is cautiously optimistic. Social media analysis shows mixed signals with slightly bullish bias. Institutional flow data suggests accumulation at current levels. News sentiment remains neutral with no major catalysts expected in the near term.",
      aiModel: modelNames[referenceModel],
    };

    setAnalysis(mockAnalysis);
    setIsAnalyzing(false);
  };

  const canAnalyze = uploadedImage && selectedModels.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />

      <main id="analyze" className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

          {/* Right Column - Results */}
          <div>
            <AnalysisResults analysis={analysis} isLoading={isAnalyzing} />
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
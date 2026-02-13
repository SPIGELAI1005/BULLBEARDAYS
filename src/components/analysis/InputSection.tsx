/**
 * InputSection Component
 * Handles mode toggle, image upload, chat input, and analysis controls
 */
import { MessageSquare, Grid2X2, Layers } from "lucide-react";
import ChartUpload from "@/components/ChartUpload";
import MultiChartUpload from "@/components/MultiChartUpload";
import ChatInput from "@/components/ChatInput";
import AIModelSelector from "@/components/AIModelSelector";
import ProviderHealthPanel from "@/components/ProviderHealthPanel";
import AnalyzeButton from "@/components/AnalyzeButton";
import { useDemoMode } from "@/hooks/useDemoMode";
import TimeframeSelector from "@/components/TimeframeSelector";
import InstrumentSelector from "@/components/InstrumentSelector";
import AnalysisResults from "@/components/AnalysisResults";
import { TradingStrategy, UnifiedAnalysis } from "@/lib/types";
import { MarketDataItem } from "@/lib/api";

interface InputSectionProps {
  // Mode state
  isChatMode: boolean;
  isMultiChartMode: boolean;
  onModeChange: (chatMode: boolean, multiMode: boolean) => void;

  // Upload state
  uploadedImage: string | null;
  uploadedImages: string[];
  onImageUpload: (image: string) => void;
  onClearImage: () => void;
  onMultiImagesUpload: (images: string[]) => void;
  onClearAllImages: () => void;
  onClearOneImage: (index: number) => void;

  // Model selection
  selectedModels: string[];
  referenceModel: string;
  onToggleModel: (modelId: string) => void;
  onSetReference: (modelId: string) => void;

  // Analysis controls
  canAnalyze: boolean;
  isAnalyzing: boolean;
  onAnalyze: () => void;
  onChatSubmit: (message: string, images: string[]) => Promise<void>;

  // Context inputs
  tradingStrategy: TradingStrategy;
  onStrategyChange: (strategy: TradingStrategy) => void;
  selectedTimeframe: string;
  onTimeframeChange: (timeframe: string) => void;
  selectedInstrument: string | undefined;
  onInstrumentChange: (instrument: string | undefined) => void;
  marketAssets: MarketDataItem[];

  // Analysis results (for chat mode)
  analysis: UnifiedAnalysis | null;
}

const InputSection = ({
  isChatMode,
  isMultiChartMode,
  onModeChange,
  uploadedImage,
  uploadedImages,
  onImageUpload,
  onClearImage,
  onMultiImagesUpload,
  onClearAllImages,
  onClearOneImage,
  selectedModels,
  referenceModel,
  onToggleModel,
  onSetReference,
  canAnalyze,
  isAnalyzing,
  onAnalyze,
  onChatSubmit,
  tradingStrategy,
  onStrategyChange,
  selectedTimeframe,
  onTimeframeChange,
  selectedInstrument,
  onInstrumentChange,
  marketAssets,
  analysis,
}: InputSectionProps) => {
  const { enabled: isDemoMode } = useDemoMode();

  return (
    <div className="lg:col-span-2 space-y-6">
      {/* Mode Toggle - Chat / Single / Multi */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/30 border border-border/30">
        <button
          onClick={() => onModeChange(true, false)}
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
          onClick={() => onModeChange(false, false)}
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
          onClick={() => onModeChange(false, true)}
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
              <h2 className="text-lg font-semibold text-foreground">
                AI Chart Analysis
              </h2>
            </div>
            <ChatInput
              onSubmit={onChatSubmit}
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
              onTimeframeChange={onTimeframeChange}
              strategy={tradingStrategy}
              compact={true}
            />
            <div className="text-xs text-muted-foreground mb-2">
              Instrument (AI will also detect)
            </div>
            <InstrumentSelector
              selectedInstrument={selectedInstrument}
              onInstrumentChange={onInstrumentChange}
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
                onImagesUpload={onMultiImagesUpload}
                uploadedImages={uploadedImages}
                onClearAll={onClearAllImages}
                onClearOne={onClearOneImage}
              />
            ) : (
              <ChartUpload
                onImageUpload={onImageUpload}
                uploadedImage={uploadedImage}
                onClear={onClearImage}
              />
            )}

            <div className="ai-model-selector space-y-4">
              <AIModelSelector
                selectedModels={selectedModels}
                referenceModel={referenceModel}
                onToggleModel={onToggleModel}
                onSetReference={onSetReference}
              />
              <ProviderHealthPanel selectedModels={selectedModels} />
            </div>

            {/* Phase 1: First-Class Inputs */}
            <div className="glass-panel p-4 space-y-4">
              <InstrumentSelector
                selectedInstrument={selectedInstrument}
                onInstrumentChange={onInstrumentChange}
                marketData={marketAssets}
              />
            </div>

            <div className="glass-panel p-4">
              <TimeframeSelector
                selectedTimeframe={selectedTimeframe}
                onTimeframeChange={onTimeframeChange}
                strategy={tradingStrategy}
                compact={false}
              />
            </div>

            <div className="analyze-button">
              <AnalyzeButton
                onClick={onAnalyze}
                disabled={!canAnalyze}
                isLoading={isAnalyzing}
                helperText={isDemoMode ? "Demo mode: analysis uses local sample output" : undefined}
              />
            </div>
          </div>

          {/* Analysis Results - side by side on larger screens */}
          <div>
            <AnalysisResults
              analysis={analysis}
              isLoading={isAnalyzing}
              tradingStrategy={tradingStrategy}
              onStrategyChange={onStrategyChange}
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
          onStrategyChange={onStrategyChange}
        />
      )}
    </div>
  );
};

export default InputSection;

/**
 * Custom hook for managing analysis flow, API calls, and state
 */
import { useState, useCallback, createElement } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { ToastAction } from "@/components/ui/toast";
import {
  analyzeChart,
  analyzeMarketData,
  saveAnalysis,
  MarketDataItem,
} from "@/lib/api";
import {
  UnifiedAnalysis,
  TradingStrategy,
  isScenarioAnalysis,
} from "@/lib/types";
import { uploadChartImage } from "@/lib/chartStorage";
import { isUsageLimitReachedError } from "@/lib/billing/usageLimit";

export interface UseAnalysisFlowReturn {
  cancelCurrentAnalysis?: () => void;
  // State
  analysis: UnifiedAnalysis | null;
  isAnalyzing: boolean;
  selectedModels: string[];
  referenceModel: string;
  tradingStrategy: TradingStrategy;
  selectedInstrument: string | undefined;
  selectedTimeframe: string;

  // Setters
  setAnalysis: (analysis: UnifiedAnalysis | null) => void;
  setTradingStrategy: (strategy: TradingStrategy) => void;
  setSelectedInstrument: (instrument: string | undefined) => void;
  setSelectedTimeframe: (timeframe: string) => void;

  // Model selection
  handleToggleModel: (modelId: string) => void;
  handleSetReference: (modelId: string) => void;
  setSelectedModels: (models: string[]) => void;
  setReferenceModel: (model: string) => void;

  // Analysis actions
  handleAnalyze: (imageToAnalyze: string) => Promise<void>;
  handleChatSubmit: (
    message: string,
    images: string[],
    onSuccess?: () => void
  ) => Promise<void>;
  handleMarketAssetClick: (asset: MarketDataItem) => Promise<void>;

  // Utils
  canAnalyze: (hasImage: boolean) => boolean;
  refreshHistory: () => Promise<void>;
}

interface UseAnalysisFlowOptions {
  onHistoryUpdate?: () => Promise<void>;
}

export function useAnalysisFlow(
  options: UseAnalysisFlowOptions = {}
): UseAnalysisFlowReturn {
  const { toast } = useToast();
  const { user } = useAuth();

  const [analysis, setAnalysis] = useState<UnifiedAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedModels, setSelectedModels] = useState<string[]>(["gemini"]);
  const [referenceModel, setReferenceModel] = useState("gemini");
  const [tradingStrategy, setTradingStrategy] =
    useState<TradingStrategy>("swingTrader");
  const [selectedInstrument, setSelectedInstrument] = useState<
    string | undefined
  >(undefined);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("1D");
  const [runToken, setRunToken] = useState(0);

  const cancelCurrentAnalysis = useCallback(() => {
    setRunToken((t) => t + 1);
    setIsAnalyzing(false);
    toast({
      title: "Stopped",
      description: "Analysis was stopped locally (the request may still finish on the server).",
    });
  }, [toast]);

  const refreshHistory = useCallback(async () => {
    if (options.onHistoryUpdate) {
      await options.onHistoryUpdate();
    }
  }, [options]);

  const handleToggleModel = useCallback(
    (modelId: string) => {
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
    },
    [referenceModel]
  );

  const handleSetReference = useCallback((modelId: string) => {
    setReferenceModel(modelId);
  }, []);

  const saveAnalysisToHistory = useCallback(
    async (
      result: UnifiedAnalysis,
      chartImageUrl?: string,
      contextMessage?: string
    ) => {
      if (user) {
        try {
          await saveAnalysis(result, chartImageUrl, contextMessage, user.id);
          await refreshHistory();

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
    },
    [user, toast, refreshHistory]
  );

  const handleAnalyze = useCallback(
    async (imageToAnalyze: string) => {
      if (!imageToAnalyze || selectedModels.length === 0) return;

      setIsAnalyzing(true);
      setAnalysis(null);

      const myToken = runToken + 1;
      setRunToken(myToken);

      try {
        const result = await analyzeChart(
          imageToAnalyze,
          selectedModels,
          referenceModel,
          {
            strategy: tradingStrategy,
            timeframe: selectedTimeframe,
            instrument: selectedInstrument,
          }
        );

        setAnalysis(result);

        let chartImageUrl: string | undefined;
        if (user && imageToAnalyze) {
          const url = await uploadChartImage(imageToAnalyze, user.id);
          if (url) chartImageUrl = url;
        }

        await saveAnalysisToHistory(result, chartImageUrl, undefined);
      } catch (error) {
        console.error("Analysis failed:", error);
        if (isUsageLimitReachedError(error)) {
          toast({
            title: "Usage limit reached",
            description: error.message,
            variant: "destructive",
            action: createElement(
              ToastAction,
              { altText: "Upgrade", onClick: () => (window.location.href = "/pricing") },
              "Upgrade"
            ),
          });
          return;
        }

        const message = error instanceof Error ? error.message : "Failed to analyze chart";
        const code = (error as any)?.code as string | undefined;
        const isBilling = code === "AI_PROVIDER_BILLING_ERROR";
        const isRateLimit = code === "AI_PROVIDER_RATE_LIMIT";

        toast({
          title: isBilling ? "Provider billing issue" : isRateLimit ? "Rate limit" : "Analysis Failed",
          description: message,
          variant: "destructive",
          action: isBilling
            ? createElement(
                ToastAction,
                {
                  altText: "Switch model",
                  onClick: () =>
                    document.getElementById("ai-models")?.scrollIntoView({ behavior: "smooth" }),
                },
                "Switch model"
              )
            : undefined,
        });
      } finally {
        setIsAnalyzing(false);
      }
    },
    [
      selectedModels,
      referenceModel,
      tradingStrategy,
      selectedTimeframe,
      selectedInstrument,
      user,
      toast,
      saveAnalysisToHistory,
    ]
  );

  const handleChatSubmit = useCallback(
    async (message: string, images: string[], onSuccess?: () => void) => {
      if (images.length === 0) {
        toast({
          title: "No Image",
          description: "Please paste or upload a chart image to analyze",
          variant: "destructive",
        });
        return;
      }

      setIsAnalyzing(true);
      setAnalysis(null);

      const myToken = runToken + 1;
      setRunToken(myToken);

      try {
        const result = await analyzeChart(images[0], selectedModels, referenceModel, {
          strategy: tradingStrategy,
          timeframe: selectedTimeframe,
          instrument: selectedInstrument,
        });

        setAnalysis(result);

        let chartImageUrl: string | undefined;
        if (user) {
          const url = await uploadChartImage(images[0], user.id);
          if (url) chartImageUrl = url;
        }

        await saveAnalysisToHistory(
          result,
          chartImageUrl,
          message || undefined
        );

        if (onSuccess) onSuccess();
      } catch (error) {
        console.error("Analysis failed:", error);
        if (isUsageLimitReachedError(error)) {
          toast({
            title: "Usage limit reached",
            description: error.message,
            variant: "destructive",
            action: createElement(
              ToastAction,
              { altText: "Upgrade", onClick: () => (window.location.href = "/pricing") },
              "Upgrade"
            ),
          });
          return;
        }
        const message = error instanceof Error ? error.message : "Failed to analyze chart";
        const code = (error as any)?.code as string | undefined;
        const isBilling = code === "AI_PROVIDER_BILLING_ERROR";
        const isRateLimit = code === "AI_PROVIDER_RATE_LIMIT";

        toast({
          title: isBilling ? "Provider billing issue" : isRateLimit ? "Rate limit" : "Analysis Failed",
          description: message,
          variant: "destructive",
          action: isBilling
            ? createElement(
                ToastAction,
                {
                  altText: "Switch model",
                  onClick: () =>
                    document.getElementById("ai-models")?.scrollIntoView({ behavior: "smooth" }),
                },
                "Switch model"
              )
            : undefined,
        });
      } finally {
        setIsAnalyzing(false);
      }
    },
    [
      selectedModels,
      referenceModel,
      tradingStrategy,
      selectedTimeframe,
      selectedInstrument,
      user,
      toast,
      saveAnalysisToHistory,
    ]
  );

  const handleMarketAssetClick = useCallback(
    async (asset: MarketDataItem) => {
      setIsAnalyzing(true);
      setAnalysis(null);

      toast({
        title: `Analyzing ${asset.symbol}...`,
        description: "Getting AI market scenario analysis",
      });

      try {
        const result = await analyzeMarketData(asset);
        setAnalysis(result);

        const displayMessage = isScenarioAnalysis(result)
          ? `${result.trendBias} bias with ${result.confidenceScore}% confidence`
          : `${result.signal} signal with ${result.probability}% confidence`;

        toast({
          title: `${asset.symbol} Analysis Complete`,
          description: displayMessage,
        });

        if (user) {
          try {
            await saveAnalysis(
              result,
              undefined,
              `Market analysis for ${asset.symbol}`,
              user.id
            );
            await refreshHistory();
          } catch (saveError) {
            console.error("Failed to save market analysis:", saveError);
          }
        }
      } catch (error) {
        console.error("Market analysis failed:", error);
        if (isUsageLimitReachedError(error)) {
          toast({
            title: "Usage limit reached",
            description: error.message,
            variant: "destructive",
            action: createElement(
              ToastAction,
              { altText: "Upgrade", onClick: () => (window.location.href = "/pricing") },
              "Upgrade"
            ),
          });
          return;
        }
        const message = error instanceof Error ? error.message : "Failed to analyze market";
        const code = (error as any)?.code as string | undefined;
        const isBilling = code === "AI_PROVIDER_BILLING_ERROR";
        const isRateLimit = code === "AI_PROVIDER_RATE_LIMIT";

        toast({
          title: isBilling ? "Provider billing issue" : isRateLimit ? "Rate limit" : "Analysis Failed",
          description: message,
          variant: "destructive",
          action: isBilling
            ? createElement(
                ToastAction,
                {
                  altText: "Switch model",
                  onClick: () =>
                    document.getElementById("ai-models")?.scrollIntoView({ behavior: "smooth" }),
                },
                "Switch model"
              )
            : undefined,
        });
      } finally {
        setIsAnalyzing(false);
      }
    },
    [user, toast, refreshHistory]
  );

  const canAnalyze = useCallback((hasImage: boolean) => {
    // Demo mode can run without an uploaded chart
    try {
      if (localStorage.getItem("bbd:demo-mode:v1") === "true") return selectedModels.length > 0;
    } catch {
      // ignore
    }
    return hasImage && selectedModels.length > 0;
  }, [selectedModels]);

  return {
    cancelCurrentAnalysis,
    analysis,
    isAnalyzing,
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
    setSelectedModels,
    setReferenceModel,
    handleAnalyze,
    handleChatSubmit,
    handleMarketAssetClick,
    canAnalyze,
    refreshHistory,
  };
}

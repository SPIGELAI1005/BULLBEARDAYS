import React from "react";
import { Clock, Info } from "lucide-react";
import { TradingStrategy } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TimeframeSelectorProps {
  selectedTimeframe: string;
  onTimeframeChange: (timeframe: string) => void;
  strategy?: TradingStrategy;
  compact?: boolean;
}

export const TIMEFRAMES = [
  { value: '1M', label: '1 Min', category: 'ultra-short' },
  { value: '5M', label: '5 Min', category: 'ultra-short' },
  { value: '15M', label: '15 Min', category: 'short' },
  { value: '30M', label: '30 Min', category: 'short' },
  { value: '1H', label: '1 Hour', category: 'short' },
  { value: '4H', label: '4 Hour', category: 'medium' },
  { value: '1D', label: 'Daily', category: 'medium' },
  { value: '1W', label: 'Weekly', category: 'long' },
  { value: '1M', label: 'Monthly', category: 'long' },
] as const;

// Strategy-based recommended timeframes
export const STRATEGY_TIMEFRAMES: Record<TradingStrategy, { short: string; medium: string; long: string }> = {
  scalper: { short: '1M', medium: '5M', long: '15M' },
  dayTrader: { short: '15M', medium: '1H', long: '4H' },
  swingTrader: { short: '4H', medium: '1D', long: '1W' },
  positionTrader: { short: '1D', medium: '1W', long: '1M' },
  investor: { short: '1W', medium: '1M', long: '3M' },
};

const TimeframeSelector: React.FC<TimeframeSelectorProps> = ({
  selectedTimeframe,
  onTimeframeChange,
  strategy,
  compact = false,
}) => {
  // Get recommended timeframes based on strategy
  const recommendedTimeframes = strategy ? STRATEGY_TIMEFRAMES[strategy] : null;

  const isRecommended = (timeframe: string): boolean => {
    if (!recommendedTimeframes) return false;
    return Object.values(recommendedTimeframes).includes(timeframe);
  };

  const getRecommendationLevel = (timeframe: string): string | null => {
    if (!recommendedTimeframes) return null;
    if (recommendedTimeframes.short === timeframe) return 'Short';
    if (recommendedTimeframes.medium === timeframe) return 'Medium';
    if (recommendedTimeframes.long === timeframe) return 'Long';
    return null;
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        {TIMEFRAMES.map((tf) => {
          const isSelected = selectedTimeframe === tf.value;
          const recommended = isRecommended(tf.value);
          const level = getRecommendationLevel(tf.value);

          return (
            <button
              key={tf.value}
              onClick={() => onTimeframeChange(tf.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors relative ${
                isSelected
                  ? 'bg-primary text-primary-foreground'
                  : recommended
                  ? 'bg-primary/10 text-primary border border-primary/30'
                  : 'bg-muted hover:bg-muted/80 text-foreground'
              }`}
            >
              {tf.label}
              {level && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Timeframe
          </label>
          <p className="text-xs text-muted-foreground">
            Select the chart timeframe for analysis
          </p>
        </div>
        {strategy && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 text-xs text-primary cursor-help">
                  <Info className="h-3 w-3" />
                  <span>Strategy Tips</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">
                  Highlighted timeframes are recommended for{' '}
                  <strong>{strategy}</strong> strategy
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* Strategy Recommendations */}
      {strategy && recommendedTimeframes && (
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
          <div className="text-xs font-medium text-primary mb-2">
            Recommended for {strategy}:
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs">
              Short: {recommendedTimeframes.short}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Medium: {recommendedTimeframes.medium}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Long: {recommendedTimeframes.long}
            </Badge>
          </div>
        </div>
      )}

      {/* Timeframe Grid */}
      <div className="space-y-3">
        {/* Ultra-Short (Scalping) */}
        <div>
          <h4 className="text-xs font-medium text-muted-foreground uppercase mb-2">
            Ultra-Short (Scalping)
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {TIMEFRAMES.filter(tf => tf.category === 'ultra-short').map((tf) => {
              const isSelected = selectedTimeframe === tf.value;
              const recommended = isRecommended(tf.value);
              const level = getRecommendationLevel(tf.value);

              return (
                <button
                  key={tf.value}
                  onClick={() => onTimeframeChange(tf.value)}
                  className={`relative px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                      : recommended
                      ? 'bg-primary/10 text-primary border-2 border-primary/30 hover:border-primary/50'
                      : 'bg-muted hover:bg-muted/80 text-foreground'
                  }`}
                >
                  {tf.label}
                  {level && (
                    <span className="absolute top-1 right-1 text-[10px] font-bold text-primary">
                      {level}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Short (Intraday) */}
        <div>
          <h4 className="text-xs font-medium text-muted-foreground uppercase mb-2">
            Short (Intraday)
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {TIMEFRAMES.filter(tf => tf.category === 'short').map((tf) => {
              const isSelected = selectedTimeframe === tf.value;
              const recommended = isRecommended(tf.value);
              const level = getRecommendationLevel(tf.value);

              return (
                <button
                  key={tf.value}
                  onClick={() => onTimeframeChange(tf.value)}
                  className={`relative px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                      : recommended
                      ? 'bg-primary/10 text-primary border-2 border-primary/30 hover:border-primary/50'
                      : 'bg-muted hover:bg-muted/80 text-foreground'
                  }`}
                >
                  {tf.label}
                  {level && (
                    <span className="absolute top-1 right-1 text-[10px] font-bold text-primary">
                      {level}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Medium (Swing) */}
        <div>
          <h4 className="text-xs font-medium text-muted-foreground uppercase mb-2">
            Medium (Swing)
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {TIMEFRAMES.filter(tf => tf.category === 'medium').map((tf) => {
              const isSelected = selectedTimeframe === tf.value;
              const recommended = isRecommended(tf.value);
              const level = getRecommendationLevel(tf.value);

              return (
                <button
                  key={tf.value}
                  onClick={() => onTimeframeChange(tf.value)}
                  className={`relative px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                      : recommended
                      ? 'bg-primary/10 text-primary border-2 border-primary/30 hover:border-primary/50'
                      : 'bg-muted hover:bg-muted/80 text-foreground'
                  }`}
                >
                  {tf.label}
                  {level && (
                    <span className="absolute top-1 right-1 text-[10px] font-bold text-primary">
                      {level}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Long (Position) */}
        <div>
          <h4 className="text-xs font-medium text-muted-foreground uppercase mb-2">
            Long (Position)
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {TIMEFRAMES.filter(tf => tf.category === 'long').map((tf) => {
              const isSelected = selectedTimeframe === tf.value;
              const recommended = isRecommended(tf.value);
              const level = getRecommendationLevel(tf.value);

              return (
                <button
                  key={tf.value}
                  onClick={() => onTimeframeChange(tf.value)}
                  className={`relative px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                      : recommended
                      ? 'bg-primary/10 text-primary border-2 border-primary/30 hover:border-primary/50'
                      : 'bg-muted hover:bg-muted/80 text-foreground'
                  }`}
                >
                  {tf.label}
                  {level && (
                    <span className="absolute top-1 right-1 text-[10px] font-bold text-primary">
                      {level}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Display */}
      {selectedTimeframe && (
        <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
          <div className="text-xs text-muted-foreground mb-1">Selected Timeframe</div>
          <div className="font-semibold text-foreground flex items-center justify-between">
            <span>{TIMEFRAMES.find(tf => tf.value === selectedTimeframe)?.label || selectedTimeframe}</span>
            {isRecommended(selectedTimeframe) && (
              <Badge variant="default" className="text-xs">
                Recommended
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeframeSelector;

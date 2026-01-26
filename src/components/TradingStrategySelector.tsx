import { useState } from "react";
import { Zap, Clock, TrendingUp, Calendar, Landmark, ChevronDown } from "lucide-react";

export type TradingStrategy = 'scalper' | 'dayTrader' | 'swingTrader' | 'positionTrader' | 'investor';

interface StrategyConfig {
  id: TradingStrategy;
  name: string;
  description: string;
  icon: React.ReactNode;
  timeframes: {
    short: { label: string; duration: string };
    medium: { label: string; duration: string };
    long: { label: string; duration: string };
  };
  riskLevel: 'High' | 'Medium-High' | 'Medium' | 'Medium-Low' | 'Low';
  holdingPeriod: string;
}

export const TRADING_STRATEGIES: StrategyConfig[] = [
  {
    id: 'scalper',
    name: 'Scalper',
    description: 'Quick profits from small price movements',
    icon: <Zap className="w-4 h-4" />,
    timeframes: {
      short: { label: '5M', duration: '5 minutes' },
      medium: { label: '15M', duration: '15 minutes' },
      long: { label: '1H', duration: '1 hour' },
    },
    riskLevel: 'High',
    holdingPeriod: 'Seconds to minutes',
  },
  {
    id: 'dayTrader',
    name: 'Day Trader',
    description: 'Intraday positions, no overnight holds',
    icon: <Clock className="w-4 h-4" />,
    timeframes: {
      short: { label: '1H', duration: '1 hour' },
      medium: { label: '4H', duration: '4 hours' },
      long: { label: '1D', duration: '1 day' },
    },
    riskLevel: 'Medium-High',
    holdingPeriod: 'Hours',
  },
  {
    id: 'swingTrader',
    name: 'Swing Trader',
    description: 'Capture price swings over days',
    icon: <TrendingUp className="w-4 h-4" />,
    timeframes: {
      short: { label: '1D', duration: '1 day' },
      medium: { label: '1W', duration: '1 week' },
      long: { label: '2W', duration: '2 weeks' },
    },
    riskLevel: 'Medium',
    holdingPeriod: 'Days to weeks',
  },
  {
    id: 'positionTrader',
    name: 'Position Trader',
    description: 'Ride major trends for weeks',
    icon: <Calendar className="w-4 h-4" />,
    timeframes: {
      short: { label: '1W', duration: '1 week' },
      medium: { label: '1M', duration: '1 month' },
      long: { label: '3M', duration: '3 months' },
    },
    riskLevel: 'Medium-Low',
    holdingPeriod: 'Weeks to months',
  },
  {
    id: 'investor',
    name: 'Long-Term Investor',
    description: 'Buy & hold for maximum growth',
    icon: <Landmark className="w-4 h-4" />,
    timeframes: {
      short: { label: '1M', duration: '1 month' },
      medium: { label: '6M', duration: '6 months' },
      long: { label: '1Y', duration: '1 year' },
    },
    riskLevel: 'Low',
    holdingPeriod: 'Months to years',
  },
];

interface TradingStrategySelectorProps {
  selectedStrategy: TradingStrategy;
  onStrategyChange: (strategy: TradingStrategy) => void;
}

const TradingStrategySelector = ({ selectedStrategy, onStrategyChange }: TradingStrategySelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const currentStrategy = TRADING_STRATEGIES.find(s => s.id === selectedStrategy) || TRADING_STRATEGIES[2];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High': return 'text-bearish';
      case 'Medium-High': return 'text-orange-400';
      case 'Medium': return 'text-accent';
      case 'Medium-Low': return 'text-lime-400';
      case 'Low': return 'text-bullish';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 p-3 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            {currentStrategy.icon}
          </div>
          <div className="text-left">
            <div className="text-sm font-medium text-foreground">{currentStrategy.name}</div>
            <div className="text-xs text-muted-foreground">{currentStrategy.description}</div>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-2 z-20 p-2 rounded-xl bg-card border border-border shadow-xl max-h-[400px] overflow-auto">
            {TRADING_STRATEGIES.map((strategy) => (
              <button
                key={strategy.id}
                onClick={() => {
                  onStrategyChange(strategy.id);
                  setIsOpen(false);
                }}
                className={`w-full p-3 rounded-lg text-left transition-colors mb-1 last:mb-0 ${
                  selectedStrategy === strategy.id
                    ? 'bg-primary/10 border border-primary/30'
                    : 'hover:bg-muted/50 border border-transparent'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    selectedStrategy === strategy.id ? 'bg-primary/20 text-primary' : 'bg-muted/50 text-muted-foreground'
                  }`}>
                    {strategy.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-foreground">{strategy.name}</span>
                      <span className={`text-xs font-medium ${getRiskColor(strategy.riskLevel)}`}>
                        {strategy.riskLevel} Risk
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{strategy.description}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground">
                        {strategy.timeframes.short.label}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground">
                        {strategy.timeframes.medium.label}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground">
                        {strategy.timeframes.long.label}
                      </span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        Hold: {strategy.holdingPeriod}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Current Strategy Info Bar */}
      <div className="flex items-center justify-between mt-2 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Timeframes:</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
            {currentStrategy.timeframes.short.label}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium">
            {currentStrategy.timeframes.medium.label}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-bullish/10 text-bullish font-medium">
            {currentStrategy.timeframes.long.label}
          </span>
        </div>
        <span className={`text-xs font-medium ${getRiskColor(currentStrategy.riskLevel)}`}>
          {currentStrategy.riskLevel} Risk
        </span>
      </div>
    </div>
  );
};

export default TradingStrategySelector;

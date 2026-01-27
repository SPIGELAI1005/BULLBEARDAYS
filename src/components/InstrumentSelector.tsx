import React, { useState, useMemo } from "react";
import { Search, TrendingUp, DollarSign, BarChart3, Building2, Check } from "lucide-react";
import { MarketCategory, MarketDataItem } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface InstrumentSelectorProps {
  selectedInstrument?: string;
  onInstrumentChange: (instrument: string) => void;
  marketData?: MarketDataItem[];
  recentInstruments?: string[];
}

const POPULAR_INSTRUMENTS: Record<MarketCategory, string[]> = {
  crypto: ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'XRP/USDT', 'ADA/USDT'],
  forex: ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD', 'USD/CHF'],
  indices: ['SPX', 'NDX', 'DJI', 'FTSE', 'DAX', 'N225'],
  stocks: ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'NVDA'],
};

const CATEGORY_ICONS: Record<MarketCategory, React.ReactNode> = {
  crypto: <TrendingUp className="h-4 w-4" />,
  forex: <DollarSign className="h-4 w-4" />,
  indices: <BarChart3 className="h-4 w-4" />,
  stocks: <Building2 className="h-4 w-4" />,
};

const CATEGORY_LABELS: Record<MarketCategory, string> = {
  crypto: 'Cryptocurrency',
  forex: 'Forex',
  indices: 'Indices',
  stocks: 'Stocks',
};

const InstrumentSelector: React.FC<InstrumentSelectorProps> = ({
  selectedInstrument,
  onInstrumentChange,
  marketData = [],
  recentInstruments = [],
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MarketCategory | 'all'>('all');

  // Get all available instruments
  const allInstruments = useMemo(() => {
    const instrumentSet = new Set<string>();

    // Add from market data
    marketData.forEach(item => instrumentSet.add(item.symbol));

    // Add popular instruments
    Object.values(POPULAR_INSTRUMENTS).flat().forEach(instrument =>
      instrumentSet.add(instrument)
    );

    // Add recent instruments
    recentInstruments.forEach(instrument => instrumentSet.add(instrument));

    return Array.from(instrumentSet);
  }, [marketData, recentInstruments]);

  // Filter instruments
  const filteredInstruments = useMemo(() => {
    let filtered = allInstruments;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(instrument =>
        instrument.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      const categoryInstruments = POPULAR_INSTRUMENTS[selectedCategory];
      filtered = filtered.filter(instrument =>
        categoryInstruments.includes(instrument) ||
        marketData.find(item => item.symbol === instrument && item.category === selectedCategory)
      );
    }

    return filtered;
  }, [allInstruments, searchQuery, selectedCategory, marketData]);

  // Group recent instruments
  const displayRecentInstruments = useMemo(() => {
    return recentInstruments
      .filter(instrument =>
        !searchQuery || instrument.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 5);
  }, [recentInstruments, searchQuery]);

  const handleSelectInstrument = (instrument: string) => {
    onInstrumentChange(instrument);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <label className="text-sm font-medium text-foreground mb-1 block">
          Instrument
        </label>
        <p className="text-xs text-muted-foreground">
          Select or search for a trading instrument
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search instruments (e.g., BTC/USDT, EUR/USD, AAPL)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Category Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setSelectedCategory('all')}
        >
          All
        </Badge>
        {(Object.keys(CATEGORY_LABELS) as MarketCategory[]).map((category) => (
          <Badge
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            className="cursor-pointer flex items-center gap-1"
            onClick={() => setSelectedCategory(category)}
          >
            {CATEGORY_ICONS[category]}
            {CATEGORY_LABELS[category]}
          </Badge>
        ))}
      </div>

      {/* Recent Instruments */}
      {!searchQuery && displayRecentInstruments.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase">
            Recent
          </h4>
          <div className="flex flex-wrap gap-2">
            {displayRecentInstruments.map((instrument) => (
              <button
                key={instrument}
                onClick={() => handleSelectInstrument(instrument)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedInstrument === instrument
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80 text-foreground'
                }`}
              >
                {selectedInstrument === instrument && (
                  <Check className="inline h-3 w-3 mr-1" />
                )}
                {instrument}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Instrument List */}
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-muted-foreground uppercase">
          {searchQuery ? 'Search Results' : selectedCategory === 'all' ? 'All Instruments' : CATEGORY_LABELS[selectedCategory as MarketCategory]}
        </h4>
        <ScrollArea className="h-[200px] rounded-lg border border-border">
          <div className="p-2 space-y-1">
            {filteredInstruments.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No instruments found
              </div>
            ) : (
              filteredInstruments.map((instrument) => {
                const marketItem = marketData.find(item => item.symbol === instrument);
                const isSelected = selectedInstrument === instrument;

                return (
                  <button
                    key={instrument}
                    onClick={() => handleSelectInstrument(instrument)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                      isSelected
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'hover:bg-muted text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isSelected && <Check className="h-4 w-4" />}
                      <span>{instrument}</span>
                      {marketItem && (
                        <Badge variant="outline" className="text-xs">
                          {CATEGORY_LABELS[marketItem.category]}
                        </Badge>
                      )}
                    </div>
                    {marketItem && (
                      <span
                        className={`text-xs font-medium ${
                          marketItem.changePercent24h >= 0
                            ? 'text-bullish'
                            : 'text-bearish'
                        }`}
                      >
                        {marketItem.changePercent24h >= 0 ? '+' : ''}
                        {marketItem.changePercent24h.toFixed(2)}%
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Selected Instrument Display */}
      {selectedInstrument && (
        <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
          <div className="text-xs text-muted-foreground mb-1">Selected Instrument</div>
          <div className="font-semibold text-foreground">{selectedInstrument}</div>
        </div>
      )}
    </div>
  );
};

export default InstrumentSelector;

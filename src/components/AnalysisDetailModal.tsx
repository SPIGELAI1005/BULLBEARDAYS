import { useState } from "react";
import { X, TrendingUp, TrendingDown, Target, Shield, Percent, CheckCircle2, AlertTriangle, Save, MessageSquare, Share2, Star } from "lucide-react";
import { AnalysisRecord, updateAnalysisOutcome } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useWatchlist } from "@/hooks/useWatchlist";
import ShareCard from "./ShareCard";

interface AnalysisDetailModalProps {
  analysis: AnalysisRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

const AnalysisDetailModal = ({ analysis, isOpen, onClose, onUpdate }: AnalysisDetailModalProps) => {
  const { toast } = useToast();
  const { addToWatchlist, isWatching } = useWatchlist();
  const [notes, setNotes] = useState(analysis?.notes || "");
  const [isSaving, setIsSaving] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);

  if (!isOpen || !analysis) return null;

  const isBullish = analysis.signal === "BUY";
  const isBearish = analysis.signal === "SELL";

  const handleSaveNotes = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("analyses")
        .update({ notes })
        .eq("id", analysis.id);

      if (error) throw error;
      toast({ title: "Notes saved", description: "Your trade notes have been updated" });
      onUpdate?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save notes",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleOutcome = async (outcome: 'WIN' | 'LOSS' | 'PENDING') => {
    try {
      await updateAnalysisOutcome(analysis.id, outcome, notes);
      toast({ title: "Outcome updated", description: `Trade marked as ${outcome}` });
      onUpdate?.();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update outcome",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto py-8">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative glass-panel w-full max-w-2xl mx-4 p-6 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Header actions */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          {analysis.detected_asset && (
            <button
              onClick={() => addToWatchlist(analysis.detected_asset!)}
              className={`p-2 rounded-lg transition-colors ${
                isWatching(analysis.detected_asset) 
                  ? "bg-accent/20 text-accent" 
                  : "hover:bg-muted/50 text-muted-foreground"
              }`}
              title="Add to watchlist"
            >
              <Star className={`w-5 h-5 ${isWatching(analysis.detected_asset) ? "fill-current" : ""}`} />
            </button>
          )}
          <button
            onClick={() => setShowShareCard(true)}
            className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground transition-colors"
            title="Share"
          >
            <Share2 className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className={`p-3 rounded-xl ${
            isBullish ? 'bg-bullish/20' : isBearish ? 'bg-bearish/20' : 'bg-neutral/20'
          }`}>
            {isBullish ? (
              <TrendingUp className="w-6 h-6 text-bullish" />
            ) : (
              <TrendingDown className="w-6 h-6 text-bearish" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-foreground">
                {analysis.detected_asset || "Unknown Asset"}
              </h2>
              <span className={`text-lg font-bold ${
                isBullish ? 'text-bullish' : isBearish ? 'text-bearish' : 'text-neutral'
              }`}>
                {analysis.signal}
              </span>
              <span className={`px-2 py-1 rounded-md text-xs font-medium border ${
                analysis.outcome === 'WIN' ? 'bg-bullish/20 text-bullish border-bullish/30' :
                analysis.outcome === 'LOSS' ? 'bg-bearish/20 text-bearish border-bearish/30' :
                'bg-muted/30 text-muted-foreground border-border/50'
              }`}>
                {analysis.outcome || 'Pending'}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {analysis.timeframe} • {analysis.ai_model} • {formatDate(analysis.created_at)}
            </p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="p-3 rounded-xl bg-muted/30 border border-border/50 text-center">
            <div className="text-2xl font-bold text-foreground">{analysis.probability}%</div>
            <div className="text-xs text-muted-foreground">Confidence</div>
          </div>
          <div className="p-3 rounded-xl bg-muted/30 border border-border/50 text-center">
            <div className="flex items-center justify-center gap-1 text-bullish font-semibold">
              <Target className="w-4 h-4" />
              {analysis.take_profit || 'N/A'}
            </div>
            <div className="text-xs text-muted-foreground">Take Profit</div>
          </div>
          <div className="p-3 rounded-xl bg-muted/30 border border-border/50 text-center">
            <div className="flex items-center justify-center gap-1 text-bearish font-semibold">
              <Shield className="w-4 h-4" />
              {analysis.stop_loss || 'N/A'}
            </div>
            <div className="text-xs text-muted-foreground">Stop Loss</div>
          </div>
          <div className="p-3 rounded-xl bg-muted/30 border border-border/50 text-center">
            <div className="flex items-center justify-center gap-1 text-accent font-semibold">
              <Percent className="w-4 h-4" />
              {analysis.risk_reward || 'N/A'}
            </div>
            <div className="text-xs text-muted-foreground">R:R Ratio</div>
          </div>
        </div>

        {/* Analysis Sections */}
        <div className="space-y-4 mb-6">
          {analysis.chart_analysis && (
            <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
              <h4 className="text-sm font-medium text-foreground mb-2">Chart Analysis</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {analysis.chart_analysis}
              </p>
            </div>
          )}

          {analysis.market_sentiment && (
            <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
              <h4 className="text-sm font-medium text-foreground mb-2">Market Sentiment</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {analysis.market_sentiment}
              </p>
            </div>
          )}

          {/* Reasoning */}
          <div className="grid grid-cols-2 gap-3">
            {analysis.bullish_reasons && analysis.bullish_reasons.length > 0 && (
              <div className="p-4 rounded-xl bg-bullish/5 border border-bullish/20">
                <h4 className="text-sm font-medium text-bullish mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Success Factors
                </h4>
                <ul className="space-y-2">
                  {analysis.bullish_reasons.map((reason, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="text-bullish mt-0.5">•</span>
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.bearish_reasons && analysis.bearish_reasons.length > 0 && (
              <div className="p-4 rounded-xl bg-bearish/5 border border-bearish/20">
                <h4 className="text-sm font-medium text-bearish mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Risk Factors
                </h4>
                <ul className="space-y-2">
                  {analysis.bearish_reasons.map((reason, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="text-bearish mt-0.5">•</span>
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Notes Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Trade Notes
            </label>
            <button
              onClick={handleSaveNotes}
              disabled={isSaving}
              className="text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-3 h-3" />
              {isSaving ? 'Saving...' : 'Save Notes'}
            </button>
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add your thoughts, observations, or lessons learned from this trade..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-foreground placeholder:text-muted-foreground text-sm resize-none"
          />
        </div>

        {/* Outcome Buttons */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Mark outcome:</span>
          <button
            onClick={() => handleOutcome('WIN')}
            className={`flex-1 py-2.5 px-4 rounded-xl font-medium text-sm transition-colors ${
              analysis.outcome === 'WIN'
                ? 'bg-bullish text-bullish-foreground'
                : 'bg-bullish/10 text-bullish hover:bg-bullish/20 border border-bullish/30'
            }`}
          >
            Win
          </button>
          <button
            onClick={() => handleOutcome('LOSS')}
            className={`flex-1 py-2.5 px-4 rounded-xl font-medium text-sm transition-colors ${
              analysis.outcome === 'LOSS'
                ? 'bg-bearish text-bearish-foreground'
                : 'bg-bearish/10 text-bearish hover:bg-bearish/20 border border-bearish/30'
            }`}
          >
            Loss
          </button>
          <button
            onClick={() => handleOutcome('PENDING')}
            className={`flex-1 py-2.5 px-4 rounded-xl font-medium text-sm transition-colors ${
              analysis.outcome === 'PENDING'
                ? 'bg-neutral text-neutral-foreground'
                : 'bg-neutral/10 text-neutral hover:bg-neutral/20 border border-neutral/30'
            }`}
          >
            Pending
          </button>
        </div>
      </div>

      {/* Share Card Modal */}
      {showShareCard && (
        <ShareCard analysis={analysis} onClose={() => setShowShareCard(false)} />
      )}
    </div>
  );
};

export default AnalysisDetailModal;
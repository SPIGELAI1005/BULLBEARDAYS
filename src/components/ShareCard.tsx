import { Share2, Twitter, Copy, Check } from "lucide-react";
import { useState } from "react";
import { AnalysisRecord } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface ShareCardProps {
  analysis: AnalysisRecord;
  onClose: () => void;
}

const ShareCard = ({ analysis, onClose }: ShareCardProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const generateShareText = () => {
    const emoji = analysis.signal === "BUY" ? "🟢" : analysis.signal === "SELL" ? "🔴" : "🟡";
    const outcomeEmoji = analysis.outcome === "WIN" ? "✅" : analysis.outcome === "LOSS" ? "❌" : "⏳";
    
    return `${emoji} ${analysis.signal} Signal on ${analysis.detected_asset || "Unknown"}
📊 Confidence: ${analysis.probability}%
🎯 TP: ${analysis.take_profit || "N/A"} | SL: ${analysis.stop_loss || "N/A"}
${analysis.outcome ? `${outcomeEmoji} Outcome: ${analysis.outcome}` : ""}

Analyzed with bullbeardays AI 🤖`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateShareText());
      setCopied(true);
      toast({ title: "Copied!", description: "Share text copied to clipboard" });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({ title: "Error", description: "Failed to copy", variant: "destructive" });
    }
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(generateShareText());
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative glass-panel w-full max-w-sm mx-4 p-6 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Share Trade</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-muted/50 text-muted-foreground"
          >
            ×
          </button>
        </div>

        {/* Preview Card */}
        <div className={`p-4 rounded-xl border mb-4 ${
          analysis.signal === "BUY" ? "bg-bullish/10 border-bullish/30" :
          analysis.signal === "SELL" ? "bg-bearish/10 border-bearish/30" :
          "bg-neutral/10 border-neutral/30"
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-bold text-foreground">
              {analysis.detected_asset || "Unknown"}
            </span>
            <span className={`px-2 py-1 rounded-md text-sm font-bold ${
              analysis.signal === "BUY" ? "bg-bullish/20 text-bullish" :
              analysis.signal === "SELL" ? "bg-bearish/20 text-bearish" :
              "bg-neutral/20 text-neutral"
            }`}>
              {analysis.signal}
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded-lg bg-background/50">
              <div className="text-foreground font-semibold">{analysis.probability}%</div>
              <div className="text-muted-foreground">Confidence</div>
            </div>
            <div className="p-2 rounded-lg bg-background/50">
              <div className="text-bullish font-semibold">{analysis.take_profit || "N/A"}</div>
              <div className="text-muted-foreground">TP</div>
            </div>
            <div className="p-2 rounded-lg bg-background/50">
              <div className="text-bearish font-semibold">{analysis.stop_loss || "N/A"}</div>
              <div className="text-muted-foreground">SL</div>
            </div>
          </div>

          {analysis.outcome && (
            <div className={`mt-3 text-center py-2 rounded-lg ${
              analysis.outcome === "WIN" ? "bg-bullish/20 text-bullish" :
              analysis.outcome === "LOSS" ? "bg-bearish/20 text-bearish" :
              "bg-neutral/20 text-neutral"
            }`}>
              {analysis.outcome === "WIN" ? "✅ " : analysis.outcome === "LOSS" ? "❌ " : "⏳ "}
              {analysis.outcome}
            </div>
          )}
        </div>

        {/* Share buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-muted/50 hover:bg-muted text-sm font-medium transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-bullish" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            onClick={handleTwitterShare}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white text-sm font-medium transition-colors"
          >
            <Twitter className="w-4 h-4" />
            Twitter
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareCard;
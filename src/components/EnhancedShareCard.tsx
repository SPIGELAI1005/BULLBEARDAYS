import React, { useState } from "react";
import {
  Share2,
  Twitter,
  Copy,
  Check,
  Linkedin,
  MessageCircle,
  Mail,
  Download,
  Image as ImageIcon,
  FileJson,
  X,
} from "lucide-react";
import { AnalysisRecord } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  shareToTwitter,
  shareToLinkedIn,
  shareToReddit,
  shareToTelegram,
  shareToWhatsApp,
  shareViaEmail,
  copyToClipboard,
  nativeShare,
  exportAsJSON,
  downloadShareImage,
  generateShareText,
  generateShareUrl,
  isWebShareSupported,
} from "@/lib/shareUtils";

interface EnhancedShareCardProps {
  analysis: AnalysisRecord;
  isOpen: boolean;
  onClose: () => void;
}

const EnhancedShareCard: React.FC<EnhancedShareCardProps> = ({
  analysis,
  isOpen,
  onClose,
}) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  const shareUrl = generateShareUrl(analysis.id);
  const shareText = generateShareText(analysis);

  const handleCopy = async () => {
    const success = await copyToClipboard(shareText + `\n\n${shareUrl}`);
    if (success) {
      setCopied(true);
      toast({ title: "Copied!", description: "Share text copied to clipboard" });
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleNativeShare = async () => {
    const success = await nativeShare({
      title: `${analysis.signal} Signal on ${analysis.detected_asset}`,
      text: shareText,
      url: shareUrl,
    });

    if (!success) {
      toast({
        title: "Not supported",
        description: "Web Share API not available",
        variant: "destructive",
      });
    }
  };

  const handleDownloadImage = async () => {
    try {
      setGenerating(true);
      await downloadShareImage(analysis);
      toast({ title: "Success", description: "Share image downloaded" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate image",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleExportJSON = () => {
    try {
      exportAsJSON(analysis);
      toast({ title: "Success", description: "Analysis exported as JSON" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export JSON",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            Share Analysis
          </DialogTitle>
          <DialogDescription>
            Share your trading analysis with the community
          </DialogDescription>
        </DialogHeader>

        {/* Preview Card */}
        <div
          className={`p-4 rounded-xl border mb-4 ${
            analysis.signal === "BUY"
              ? "bg-bullish/10 border-bullish/30"
              : analysis.signal === "SELL"
              ? "bg-bearish/10 border-bearish/30"
              : "bg-neutral/10 border-neutral/30"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-bold">
              {analysis.detected_asset || "Unknown"}
            </span>
            <span
              className={`px-2 py-1 rounded-md text-sm font-bold ${
                analysis.signal === "BUY"
                  ? "bg-bullish/20 text-bullish"
                  : analysis.signal === "SELL"
                  ? "bg-bearish/20 text-bearish"
                  : "bg-neutral/20 text-neutral"
              }`}
            >
              {analysis.signal}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded-lg bg-background/50">
              <div className="font-semibold">{analysis.probability}%</div>
              <div className="text-muted-foreground">Confidence</div>
            </div>
            <div className="p-2 rounded-lg bg-background/50">
              <div className="text-bullish font-semibold">
                {analysis.take_profit || "N/A"}
              </div>
              <div className="text-muted-foreground">TP</div>
            </div>
            <div className="p-2 rounded-lg bg-background/50">
              <div className="text-bearish font-semibold">
                {analysis.stop_loss || "N/A"}
              </div>
              <div className="text-muted-foreground">SL</div>
            </div>
          </div>

          {analysis.outcome && (
            <div
              className={`mt-3 text-center py-2 rounded-lg text-sm font-semibold ${
                analysis.outcome === "WIN"
                  ? "bg-bullish/20 text-bullish"
                  : analysis.outcome === "LOSS"
                  ? "bg-bearish/20 text-bearish"
                  : "bg-neutral/20 text-neutral"
              }`}
            >
              {analysis.outcome === "WIN"
                ? "✅ "
                : analysis.outcome === "LOSS"
                ? "❌ "
                : "⏳ "}
              {analysis.outcome}
            </div>
          )}
        </div>

        {/* Social Share Buttons */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Share on social media
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => shareToTwitter(analysis, shareUrl)}
              className="flex items-center gap-2"
            >
              <Twitter className="h-4 w-4" />
              Twitter
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => shareToLinkedIn(shareUrl, `${analysis.signal} Signal`)}
              className="flex items-center gap-2"
            >
              <Linkedin className="h-4 w-4" />
              LinkedIn
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => shareToTelegram(analysis, shareUrl)}
              className="flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Telegram
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => shareToWhatsApp(analysis, shareUrl)}
              className="flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Quick actions
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="flex items-center gap-2"
            >
              {copied ? (
                <Check className="h-4 w-4 text-bullish" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? "Copied!" : "Copy Text"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => shareViaEmail(analysis, shareUrl)}
              className="flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Email
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadImage}
              disabled={generating}
              className="flex items-center gap-2"
            >
              <ImageIcon className="h-4 w-4" />
              {generating ? "Generating..." : "Image"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportJSON}
              className="flex items-center gap-2"
            >
              <FileJson className="h-4 w-4" />
              JSON
            </Button>
          </div>
        </div>

        {/* Native Share (mobile) */}
        {isWebShareSupported() && (
          <Button onClick={handleNativeShare} className="w-full">
            <Share2 className="h-4 w-4 mr-2" />
            Share via...
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedShareCard;

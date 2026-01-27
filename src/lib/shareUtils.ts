import { AnalysisRecord } from "./api";

export interface ShareOptions {
  title?: string;
  text?: string;
  url?: string;
}

// Generate shareable URL with analysis ID
export const generateShareUrl = (analysisId: string): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/?analysis=${analysisId}`;
};

// Generate share text for social media
export const generateShareText = (analysis: AnalysisRecord): string => {
  const emoji = analysis.signal === "BUY" ? "🟢" : analysis.signal === "SELL" ? "🔴" : "🟡";
  const outcomeEmoji = analysis.outcome === "WIN" ? "✅" : analysis.outcome === "LOSS" ? "❌" : "⏳";

  return `${emoji} ${analysis.signal} Signal on ${analysis.detected_asset || "Unknown"}
📊 Confidence: ${analysis.probability}%
🎯 TP: ${analysis.take_profit || "N/A"} | SL: ${analysis.stop_loss || "N/A"}
${analysis.outcome ? `${outcomeEmoji} Outcome: ${analysis.outcome}` : ""}

Analyzed with bullbeardays AI 🤖
#Trading #AI #TechnicalAnalysis`;
};

// Share to Twitter
export const shareToTwitter = (analysis: AnalysisRecord, shareUrl?: string) => {
  const text = encodeURIComponent(generateShareText(analysis));
  const url = shareUrl ? `&url=${encodeURIComponent(shareUrl)}` : "";
  window.open(`https://twitter.com/intent/tweet?text=${text}${url}`, "_blank");
};

// Share to LinkedIn
export const shareToLinkedIn = (shareUrl: string, title?: string) => {
  const url = encodeURIComponent(shareUrl);
  const titleParam = title ? `&title=${encodeURIComponent(title)}` : "";
  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}${titleParam}`, "_blank");
};

// Share to Reddit
export const shareToReddit = (analysis: AnalysisRecord, shareUrl?: string) => {
  const title = encodeURIComponent(`${analysis.signal} Signal on ${analysis.detected_asset || "Unknown"} - ${analysis.probability}% Confidence`);
  const text = encodeURIComponent(generateShareText(analysis));
  const url = shareUrl ? `&url=${encodeURIComponent(shareUrl)}` : "";
  window.open(`https://reddit.com/submit?title=${title}&text=${text}${url}`, "_blank");
};

// Share to Telegram
export const shareToTelegram = (analysis: AnalysisRecord, shareUrl?: string) => {
  const text = encodeURIComponent(generateShareText(analysis) + (shareUrl ? `\n\n${shareUrl}` : ""));
  window.open(`https://t.me/share/url?text=${text}`, "_blank");
};

// Share to WhatsApp
export const shareToWhatsApp = (analysis: AnalysisRecord, shareUrl?: string) => {
  const text = encodeURIComponent(generateShareText(analysis) + (shareUrl ? `\n\n${shareUrl}` : ""));
  window.open(`https://wa.me/?text=${text}`, "_blank");
};

// Share via Email
export const shareViaEmail = (analysis: AnalysisRecord, shareUrl?: string) => {
  const subject = encodeURIComponent(`Trading Signal: ${analysis.signal} on ${analysis.detected_asset || "Unknown"}`);
  const body = encodeURIComponent(generateShareText(analysis) + (shareUrl ? `\n\nView full analysis: ${shareUrl}` : ""));
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
};

// Copy to clipboard
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
      document.body.removeChild(textArea);
      return true;
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  }
};

// Native Web Share API (mobile support)
export const nativeShare = async (options: ShareOptions): Promise<boolean> => {
  if (!navigator.share) {
    return false;
  }

  try {
    await navigator.share(options);
    return true;
  } catch (error) {
    if ((error as Error).name !== "AbortError") {
      console.error("Error sharing:", error);
    }
    return false;
  }
};

// Export analysis as JSON
export const exportAsJSON = (analysis: AnalysisRecord, filename?: string) => {
  const jsonString = JSON.stringify(analysis, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename || `analysis-${analysis.id || Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Generate shareable image (canvas-based)
export const generateShareImage = async (analysis: AnalysisRecord): Promise<string> => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("Canvas not supported");

  // Set canvas size (optimized for social media)
  canvas.width = 1200;
  canvas.height = 630;

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#0f172a");
  gradient.addColorStop(1, "#1e293b");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Signal color
  const signalColor = analysis.signal === "BUY" ? "#22c55e" :
                      analysis.signal === "SELL" ? "#ef4444" : "#f59e0b";

  // Draw accent border
  ctx.strokeStyle = signalColor;
  ctx.lineWidth = 8;
  ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

  // Draw content
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 80px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(analysis.detected_asset || "Unknown", canvas.width / 2, 150);

  // Signal badge
  ctx.fillStyle = signalColor;
  ctx.font = "bold 60px system-ui";
  ctx.fillText(analysis.signal, canvas.width / 2, 250);

  // Stats
  ctx.fillStyle = "#e2e8f0";
  ctx.font = "32px system-ui";
  const stats = [
    `Confidence: ${analysis.probability}%`,
    `TP: ${analysis.take_profit || "N/A"}  |  SL: ${analysis.stop_loss || "N/A"}`,
  ];

  let y = 350;
  stats.forEach(stat => {
    ctx.fillText(stat, canvas.width / 2, y);
    y += 60;
  });

  // Outcome badge (if available)
  if (analysis.outcome) {
    const outcomeColor = analysis.outcome === "WIN" ? "#22c55e" :
                         analysis.outcome === "LOSS" ? "#ef4444" : "#f59e0b";
    ctx.fillStyle = outcomeColor;
    ctx.fillRect(canvas.width / 2 - 150, 480, 300, 60);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 36px system-ui";
    ctx.fillText(analysis.outcome, canvas.width / 2, 520);
  }

  // Footer
  ctx.fillStyle = "#94a3b8";
  ctx.font = "24px system-ui";
  ctx.fillText("bullbeardays AI Trading Analysis", canvas.width / 2, 590);

  // Convert to data URL
  return canvas.toDataURL("image/png");
};

// Download share image
export const downloadShareImage = async (analysis: AnalysisRecord, filename?: string) => {
  const dataUrl = await generateShareImage(analysis);

  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename || `analysis-${analysis.id || Date.now()}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Check if Web Share API is available
export const isWebShareSupported = (): boolean => {
  return typeof navigator.share !== "undefined";
};

// Check if clipboard API is available
export const isClipboardSupported = (): boolean => {
  return typeof navigator.clipboard !== "undefined";
};

import { AnalysisRecord } from "./api";

export const exportToCSV = (analyses: AnalysisRecord[], filename: string = "trading-history") => {
  if (analyses.length === 0) {
    throw new Error("No data to export");
  }

  const headers = [
    "Date",
    "Asset",
    "Signal",
    "Probability (%)",
    "Take Profit",
    "Stop Loss",
    "Risk/Reward",
    "AI Model",
    "Outcome",
    "Market Sentiment",
    "Notes",
    "Outcome Notes",
  ];

  const rows = analyses.map((analysis) => [
    new Date(analysis.created_at).toLocaleString(),
    analysis.detected_asset || "Unknown",
    analysis.signal,
    analysis.probability.toString(),
    analysis.take_profit || "",
    analysis.stop_loss || "",
    analysis.risk_reward || "",
    analysis.ai_model,
    analysis.outcome || "PENDING",
    analysis.market_sentiment || "",
    (analysis.notes || "").replace(/"/g, '""'),
    (analysis.outcome_notes || "").replace(/"/g, '""'),
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${cell}"`).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}-${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const generatePerformanceReport = (analyses: AnalysisRecord[]) => {
  const completedTrades = analyses.filter((a) => a.outcome && a.outcome !== "PENDING");
  const wins = completedTrades.filter((a) => a.outcome === "WIN").length;
  const losses = completedTrades.filter((a) => a.outcome === "LOSS").length;
  const winRate = completedTrades.length > 0 ? (wins / completedTrades.length) * 100 : 0;

  // Signal distribution
  const signalCounts = analyses.reduce((acc, a) => {
    acc[a.signal] = (acc[a.signal] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Asset performance
  const assetStats = analyses.reduce((acc, a) => {
    const asset = a.detected_asset || "Unknown";
    if (!acc[asset]) {
      acc[asset] = { total: 0, wins: 0 };
    }
    acc[asset].total++;
    if (a.outcome === "WIN") acc[asset].wins++;
    return acc;
  }, {} as Record<string, { total: number; wins: number }>);

  // AI model performance
  const modelStats = analyses.reduce((acc, a) => {
    if (!acc[a.ai_model]) {
      acc[a.ai_model] = { total: 0, wins: 0 };
    }
    acc[a.ai_model].total++;
    if (a.outcome === "WIN") acc[a.ai_model].wins++;
    return acc;
  }, {} as Record<string, { total: number; wins: number }>);

  const reportLines = [
    "=== TRADING PERFORMANCE REPORT ===",
    `Generated: ${new Date().toLocaleString()}`,
    "",
    "--- OVERALL STATISTICS ---",
    `Total Trades: ${analyses.length}`,
    `Completed Trades: ${completedTrades.length}`,
    `Wins: ${wins}`,
    `Losses: ${losses}`,
    `Win Rate: ${winRate.toFixed(1)}%`,
    "",
    "--- SIGNAL DISTRIBUTION ---",
    ...Object.entries(signalCounts).map(([signal, count]) => 
      `${signal}: ${count} (${((count / analyses.length) * 100).toFixed(1)}%)`
    ),
    "",
    "--- ASSET PERFORMANCE ---",
    ...Object.entries(assetStats)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 10)
      .map(([asset, stats]) => 
        `${asset}: ${stats.total} trades, ${stats.total > 0 ? ((stats.wins / stats.total) * 100).toFixed(1) : 0}% win rate`
      ),
    "",
    "--- AI MODEL ACCURACY ---",
    ...Object.entries(modelStats).map(([model, stats]) => 
      `${model}: ${stats.total} analyses, ${stats.total > 0 ? ((stats.wins / stats.total) * 100).toFixed(1) : 0}% accuracy`
    ),
  ];

  const reportContent = reportLines.join("\n");
  const blob = new Blob([reportContent], { type: "text/plain;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `performance-report-${new Date().toISOString().split("T")[0]}.txt`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

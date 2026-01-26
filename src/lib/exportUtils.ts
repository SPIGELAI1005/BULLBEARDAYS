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

export const generatePDFReport = (analyses: AnalysisRecord[]) => {
  const completedTrades = analyses.filter((a) => a.outcome && a.outcome !== "PENDING");
  const wins = completedTrades.filter((a) => a.outcome === "WIN").length;
  const losses = completedTrades.filter((a) => a.outcome === "LOSS").length;
  const winRate = completedTrades.length > 0 ? (wins / completedTrades.length) * 100 : 0;

  // Calculate streaks
  let currentStreak = 0;
  let longestWinStreak = 0;
  let tempWinStreak = 0;
  const sorted = [...completedTrades].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  sorted.forEach((trade, i) => {
    if (trade.outcome === "WIN") {
      tempWinStreak++;
      if (i === 0) currentStreak = tempWinStreak;
    } else {
      tempWinStreak = 0;
      if (i === 0) currentStreak = -1;
    }
    longestWinStreak = Math.max(longestWinStreak, tempWinStreak);
  });

  // Asset performance
  const assetStats = analyses.reduce((acc, a) => {
    const asset = a.detected_asset || "Unknown";
    if (!acc[asset]) acc[asset] = { total: 0, wins: 0, losses: 0 };
    acc[asset].total++;
    if (a.outcome === "WIN") acc[asset].wins++;
    if (a.outcome === "LOSS") acc[asset].losses++;
    return acc;
  }, {} as Record<string, { total: number; wins: number; losses: number }>);

  const topAssets = Object.entries(assetStats)
    .map(([asset, stats]) => ({
      asset,
      ...stats,
      winRate: (stats.wins + stats.losses) > 0 ? (stats.wins / (stats.wins + stats.losses)) * 100 : 0
    }))
    .filter(a => a.wins + a.losses > 0)
    .sort((a, b) => b.winRate - a.winRate)
    .slice(0, 5);

  // Recent trades
  const recentTrades = analyses.slice(0, 10);

  // Build HTML for PDF
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Trading Performance Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #1a1a1a; }
    .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #e5e5e5; padding-bottom: 20px; }
    .header h1 { font-size: 28px; color: #0f172a; margin-bottom: 8px; }
    .header p { color: #64748b; font-size: 14px; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 40px; }
    .stat-card { background: #f8fafc; border-radius: 12px; padding: 20px; text-align: center; }
    .stat-value { font-size: 32px; font-weight: bold; color: #0f172a; }
    .stat-value.green { color: #22c55e; }
    .stat-value.red { color: #ef4444; }
    .stat-label { font-size: 12px; color: #64748b; margin-top: 4px; text-transform: uppercase; }
    .section { margin-bottom: 32px; }
    .section h2 { font-size: 18px; color: #0f172a; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
    .section h2::before { content: ''; width: 4px; height: 20px; background: #6366f1; border-radius: 2px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e5e5; }
    th { background: #f8fafc; font-size: 12px; text-transform: uppercase; color: #64748b; }
    td { font-size: 14px; }
    .signal { padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; }
    .signal.buy { background: #dcfce7; color: #16a34a; }
    .signal.sell { background: #fee2e2; color: #dc2626; }
    .signal.hold { background: #fef3c7; color: #d97706; }
    .outcome { padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; }
    .outcome.win { background: #dcfce7; color: #16a34a; }
    .outcome.loss { background: #fee2e2; color: #dc2626; }
    .outcome.pending { background: #f3f4f6; color: #6b7280; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e5e5; color: #64748b; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 Trading Performance Report</h1>
    <p>Generated on ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
  </div>

  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-value">${analyses.length}</div>
      <div class="stat-label">Total Trades</div>
    </div>
    <div class="stat-card">
      <div class="stat-value green">${wins}</div>
      <div class="stat-label">Wins</div>
    </div>
    <div class="stat-card">
      <div class="stat-value red">${losses}</div>
      <div class="stat-label">Losses</div>
    </div>
    <div class="stat-card">
      <div class="stat-value ${winRate >= 50 ? 'green' : 'red'}">${winRate.toFixed(1)}%</div>
      <div class="stat-label">Win Rate</div>
    </div>
  </div>

  <div class="section">
    <h2>Top Performing Assets</h2>
    <table>
      <thead>
        <tr>
          <th>Asset</th>
          <th>Wins</th>
          <th>Losses</th>
          <th>Win Rate</th>
        </tr>
      </thead>
      <tbody>
        ${topAssets.map(a => `
          <tr>
            <td><strong>${a.asset}</strong></td>
            <td>${a.wins}</td>
            <td>${a.losses}</td>
            <td style="color: ${a.winRate >= 50 ? '#22c55e' : '#ef4444'}; font-weight: 600;">${a.winRate.toFixed(1)}%</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>Recent Trades</h2>
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Asset</th>
          <th>Signal</th>
          <th>Probability</th>
          <th>TP / SL</th>
          <th>Outcome</th>
        </tr>
      </thead>
      <tbody>
        ${recentTrades.map(t => `
          <tr>
            <td>${new Date(t.created_at).toLocaleDateString()}</td>
            <td><strong>${t.detected_asset || 'Unknown'}</strong></td>
            <td><span class="signal ${t.signal.toLowerCase()}">${t.signal}</span></td>
            <td>${t.probability}%</td>
            <td>${t.take_profit || '-'} / ${t.stop_loss || '-'}</td>
            <td><span class="outcome ${(t.outcome || 'pending').toLowerCase()}">${t.outcome || 'PENDING'}</span></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="footer">
    <p>BullBearDays AI Trading Analysis • Generated ${new Date().toISOString()}</p>
  </div>
</body>
</html>`;

  // Open in new window for printing/saving as PDF
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 250);
  }
};

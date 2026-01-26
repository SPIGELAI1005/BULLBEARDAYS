import { useMemo } from "react";
import { BarChart3, TrendingUp, TrendingDown, Target, Award, Zap } from "lucide-react";
import { AnalysisRecord } from "@/lib/api";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid } from "recharts";

interface PerformanceDashboardProps {
  analyses: AnalysisRecord[];
}

const PerformanceDashboard = ({ analyses }: PerformanceDashboardProps) => {
  const stats = useMemo(() => {
    const completedTrades = analyses.filter(a => a.outcome === 'WIN' || a.outcome === 'LOSS');
    const wins = analyses.filter(a => a.outcome === 'WIN').length;
    const losses = analyses.filter(a => a.outcome === 'LOSS').length;
    const pending = analyses.filter(a => !a.outcome || a.outcome === 'PENDING').length;
    const winRate = completedTrades.length > 0 ? (wins / completedTrades.length) * 100 : 0;

    // Best performing assets
    const assetStats: Record<string, { wins: number; losses: number; total: number }> = {};
    analyses.forEach(a => {
      const asset = a.detected_asset || 'Unknown';
      if (!assetStats[asset]) {
        assetStats[asset] = { wins: 0, losses: 0, total: 0 };
      }
      assetStats[asset].total++;
      if (a.outcome === 'WIN') assetStats[asset].wins++;
      if (a.outcome === 'LOSS') assetStats[asset].losses++;
    });

    const topAssets = Object.entries(assetStats)
      .map(([asset, s]) => ({
        asset,
        ...s,
        winRate: s.wins + s.losses > 0 ? (s.wins / (s.wins + s.losses)) * 100 : 0
      }))
      .filter(a => a.wins + a.losses > 0)
      .sort((a, b) => b.winRate - a.winRate)
      .slice(0, 5);

    // AI model accuracy
    const modelStats: Record<string, { wins: number; losses: number; total: number }> = {};
    analyses.forEach(a => {
      const model = a.ai_model || 'Unknown';
      if (!modelStats[model]) {
        modelStats[model] = { wins: 0, losses: 0, total: 0 };
      }
      modelStats[model].total++;
      if (a.outcome === 'WIN') modelStats[model].wins++;
      if (a.outcome === 'LOSS') modelStats[model].losses++;
    });

    const modelAccuracy = Object.entries(modelStats)
      .map(([model, s]) => ({
        model: model.replace('Google ', '').replace('OpenAI ', ''),
        ...s,
        accuracy: s.wins + s.losses > 0 ? (s.wins / (s.wins + s.losses)) * 100 : 0
      }))
      .filter(m => m.wins + m.losses > 0);

    // Win rate over time (last 7 days)
    const now = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    const dailyStats = last7Days.map(date => {
      const dayAnalyses = analyses.filter(a => {
        const aDate = new Date(a.created_at).toISOString().split('T')[0];
        return aDate === date && (a.outcome === 'WIN' || a.outcome === 'LOSS');
      });
      const dayWins = dayAnalyses.filter(a => a.outcome === 'WIN').length;
      const dayTotal = dayAnalyses.length;
      return {
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        winRate: dayTotal > 0 ? (dayWins / dayTotal) * 100 : 0,
        trades: dayTotal
      };
    });

    // Signal distribution
    const buyCount = analyses.filter(a => a.signal === 'BUY').length;
    const sellCount = analyses.filter(a => a.signal === 'SELL').length;
    const holdCount = analyses.filter(a => a.signal === 'HOLD').length;

    return {
      total: analyses.length,
      wins,
      losses,
      pending,
      winRate,
      topAssets,
      modelAccuracy,
      dailyStats,
      signalDistribution: [
        { name: 'BUY', value: buyCount, color: 'hsl(142, 71%, 45%)' },
        { name: 'SELL', value: sellCount, color: 'hsl(0, 72%, 51%)' },
        { name: 'HOLD', value: holdCount, color: 'hsl(38, 92%, 50%)' },
      ].filter(s => s.value > 0)
    };
  }, [analyses]);

  if (analyses.length === 0) {
    return (
      <div className="glass-panel p-8 text-center">
        <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No Data Yet</h3>
        <p className="text-sm text-muted-foreground">
          Start analyzing charts to see your performance statistics
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel-subtle p-4 text-center">
          <div className="text-3xl font-bold text-foreground">{stats.total}</div>
          <div className="text-xs text-muted-foreground">Total Analyses</div>
        </div>
        <div className="glass-panel-subtle p-4 text-center">
          <div className="text-3xl font-bold text-bullish">{stats.wins}</div>
          <div className="text-xs text-muted-foreground">Wins</div>
        </div>
        <div className="glass-panel-subtle p-4 text-center">
          <div className="text-3xl font-bold text-bearish">{stats.losses}</div>
          <div className="text-xs text-muted-foreground">Losses</div>
        </div>
        <div className="glass-panel-subtle p-4 text-center">
          <div className={`text-3xl font-bold ${stats.winRate >= 50 ? 'text-bullish' : 'text-bearish'}`}>
            {stats.winRate.toFixed(1)}%
          </div>
          <div className="text-xs text-muted-foreground">Win Rate</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Win Rate Trend */}
        <div className="glass-panel p-4">
          <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Win Rate (Last 7 Days)
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={stats.dailyStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Line
                type="monotone"
                dataKey="winRate"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Signal Distribution */}
        <div className="glass-panel p-4">
          <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            Signal Distribution
          </h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={stats.signalDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  dataKey="value"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {stats.signalDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Model Accuracy */}
        <div className="glass-panel p-4">
          <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            AI Model Accuracy
          </h3>
          {stats.modelAccuracy.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={stats.modelAccuracy} layout="vertical">
                <XAxis 
                  type="number" 
                  domain={[0, 100]}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis 
                  type="category" 
                  dataKey="model"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'Accuracy']}
                />
                <Bar 
                  dataKey="accuracy" 
                  fill="hsl(var(--primary))"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-sm text-muted-foreground">
              Complete some trades to see model accuracy
            </div>
          )}
        </div>

        {/* Top Performing Assets */}
        <div className="glass-panel p-4">
          <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
            <Award className="w-4 h-4 text-primary" />
            Top Performing Assets
          </h3>
          {stats.topAssets.length > 0 ? (
            <div className="space-y-3">
              {stats.topAssets.map((asset, i) => (
                <div key={asset.asset} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0 ? 'bg-accent/20 text-accent' : 'bg-muted text-muted-foreground'
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">{asset.asset}</div>
                    <div className="text-xs text-muted-foreground">
                      {asset.wins}W / {asset.losses}L
                    </div>
                  </div>
                  <div className={`text-sm font-bold ${asset.winRate >= 50 ? 'text-bullish' : 'text-bearish'}`}>
                    {asset.winRate.toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[140px] flex items-center justify-center text-sm text-muted-foreground">
              Complete some trades to see top assets
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;
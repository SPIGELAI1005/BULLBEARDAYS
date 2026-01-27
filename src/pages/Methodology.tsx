import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Brain, TrendingUp, TrendingDown } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Methodology = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-4xl mx-auto px-4 pt-44 pb-16 md:px-6 md:pt-52 md:pb-20">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-muted/50 hover:bg-muted border border-border hover:border-primary/50 text-base font-medium text-foreground mb-8 transition-all cursor-pointer shadow-sm hover:shadow-md"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </Link>

        <div className="glass-panel p-8">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Methodology</h1>
          </div>
          
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Overview</h2>
              <p>
                bullbeardays.com uses advanced AI models to analyze chart screenshots and provide educational scenario analysis. Our methodology focuses on presenting both bullish and bearish perspectives to help you understand possible market outcomes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                AI Analysis Process
              </h2>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li><strong>Chart Upload:</strong> You upload a screenshot of a trading chart</li>
                <li><strong>Context Input:</strong> You select the trading strategy (Scalper, Day Trader, etc.), timeframe, and instrument</li>
                <li><strong>AI Processing:</strong> Multiple AI models analyze the chart for technical patterns, indicators, and market structure</li>
                <li><strong>Scenario Generation:</strong> The AI generates both Bull and Bear scenarios with supporting evidence</li>
                <li><strong>Confidence Scoring:</strong> The system provides a confidence score based on image quality and pattern clarity</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-bullish" />
                Bull Scenario Analysis
              </h2>
              <p>
                The Bull scenario presents potential upside opportunities based on:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Technical patterns suggesting upward momentum</li>
                <li>Support levels and potential resistance breakouts</li>
                <li>Positive indicator alignments</li>
                <li>Market structure favoring buyers</li>
              </ul>
              <p className="mt-3">
                Each Bull scenario includes a thesis, supporting evidence, key levels, invalidation points, and risk factors.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-bearish" />
                Bear Scenario Analysis
              </h2>
              <p>
                The Bear scenario presents potential downside risks based on:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Technical patterns suggesting downward pressure</li>
                <li>Resistance levels and potential support breaks</li>
                <li>Negative indicator alignments</li>
                <li>Market structure favoring sellers</li>
              </ul>
              <p className="mt-3">
                Each Bear scenario includes a thesis, supporting evidence, key levels, invalidation points, and risk factors.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Confidence Score</h2>
              <p>
                The confidence score (0-100) reflects the AI's assessment of:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Image Quality:</strong> Chart clarity and readability</li>
                <li><strong>Pattern Clarity:</strong> How clearly identifiable the technical patterns are</li>
                <li><strong>Data Availability:</strong> Presence of indicators, price action, and context</li>
              </ul>
              <p className="mt-3">
                <strong>Important:</strong> The confidence score indicates the quality of the analysis input, not a probability of profit or future price movement.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Trend Bias</h2>
              <p>
                The trend bias (Bullish, Bearish, or Neutral) represents the AI's assessment of the current technical setup for the selected timeframe and strategy. This is an educational assessment, not a trading recommendation.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Multi-Model Analysis</h2>
              <p>
                We use multiple AI models to provide diverse perspectives. When models disagree, this is presented as increased uncertainty, helping you understand the range of possible interpretations.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Limitations</h2>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Analysis is based solely on the chart screenshot provided</li>
                <li>AI models may misinterpret unclear or low-quality images</li>
                <li>Analysis does not include real-time market data or news events</li>
                <li>Past pattern recognition does not guarantee future outcomes</li>
                <li>Scenarios are educational tools, not trading recommendations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Educational Purpose</h2>
              <p>
                All analysis provided by bullbeardays.com is for educational and informational purposes only. It helps you understand possible market scenarios but does not constitute financial advice. Always verify levels with your broker and conduct your own research.
              </p>
            </section>

            <div className="mt-8 p-4 rounded-lg bg-primary/10 border border-primary/30">
              <p className="text-sm text-foreground">
                <strong>Methodology Version:</strong> 1.0
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                This methodology may be updated as we improve our analysis capabilities. Check this page periodically for updates.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Methodology;

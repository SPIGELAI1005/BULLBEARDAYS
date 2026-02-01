import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const RiskDisclosure = () => {
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
            <AlertTriangle className="w-8 h-8 text-amber-500" />
            <h1 className="text-3xl font-bold text-foreground">Risk Disclosure</h1>
          </div>
          
          <div className="prose dark:prose-invert max-w-none space-y-6 text-muted-foreground">
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 mb-6">
              <p className="text-sm text-foreground font-medium">
                <strong>Important:</strong> Trading and investing involve substantial risk of loss. You should carefully consider whether trading is suitable for you in light of your circumstances, knowledge, and financial resources.
              </p>
            </div>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">General Risk Warning</h2>
              <p>
                All trading and investment activities carry a high level of risk. You may lose some or all of your invested capital. Only trade with funds you can afford to lose.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Market Risk</h2>
              <p>
                Financial markets are volatile and unpredictable. Prices can move rapidly and may be affected by factors beyond your control, including economic, political, and social events.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Leverage Risk</h2>
              <p>
                If you use leverage or margin, your potential losses can exceed your initial investment. Leverage amplifies both gains and losses.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Liquidity Risk</h2>
              <p>
                Some markets may have limited liquidity, making it difficult to enter or exit positions at desired prices, especially during volatile periods.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Technology Risk</h2>
              <p>
                Technical failures, internet connectivity issues, or system errors may prevent you from executing trades or accessing the Service when needed.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">No Guarantees</h2>
              <p>
                Past performance is not indicative of future results. No representation is being made that any account will or is likely to achieve profits or losses similar to those shown or discussed.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Educational Analysis Only</h2>
              <p>
                The scenario analysis provided by bullbeardays.com is for educational purposes only. It is not a recommendation to buy or sell any security. Always verify information with your broker and conduct your own research.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Seek Professional Advice</h2>
              <p>
                Before making any trading or investment decisions, you should consult with a qualified financial advisor who understands your financial situation and risk tolerance.
              </p>
            </section>

            <div className="mt-8 p-4 rounded-lg bg-bearish/10 border border-bearish/30">
              <p className="text-sm text-foreground">
                <strong>By using this Service, you acknowledge that you have read, understood, and agree to this Risk Disclosure.</strong>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RiskDisclosure;

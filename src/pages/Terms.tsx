import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Terms = () => {
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
          <h1 className="text-3xl font-bold text-foreground mb-6">Terms of Service</h1>
          
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing and using bullbeardays.com ("the Service"), you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">2. Educational Purpose</h2>
              <p>
                The Service provides scenario analysis for educational and informational purposes only. It does not constitute financial advice, investment advice, trading advice, or a recommendation to buy or sell any securities.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">3. No Investment Advice</h2>
              <p>
                All trading and investment decisions carry risk. You should conduct your own research and consult with a licensed financial advisor before making any investment decisions. Past performance does not guarantee future results.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">4. User Responsibilities</h2>
              <p>
                You are solely responsible for your trading and investment decisions. The Service provides educational scenario analysis to help you understand possible market outcomes, but you must make your own informed decisions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">5. Limitation of Liability</h2>
              <p>
                bullbeardays.com and its operators shall not be liable for any losses or damages arising from your use of the Service or any decisions made based on the information provided.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">6. Data and Privacy</h2>
              <p>
                Your use of the Service is also governed by our Privacy Policy. Please review our Privacy Policy to understand our practices.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">7. Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. Your continued use of the Service after any changes constitutes acceptance of the new terms.
              </p>
            </section>

            <div className="mt-8 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <p className="text-sm text-foreground">
                <strong>Last Updated:</strong> January 2026
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;

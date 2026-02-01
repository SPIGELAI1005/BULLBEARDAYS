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
          
          <div className="prose dark:prose-invert max-w-none space-y-6 text-muted-foreground">
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
              <p className="mb-2">
                You are solely responsible for your trading and investment decisions. The Service provides educational scenario analysis to help you understand possible market outcomes, but you must make your own informed decisions.
              </p>
              <p className="mb-2">You agree to:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Use the Service for lawful purposes only</li>
                <li>Not abuse, reverse-engineer, or attempt to circumvent the Service</li>
                <li>Keep your account credentials secure and confidential</li>
                <li>Not share your account with others</li>
                <li>Comply with all applicable laws and regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">5. Subscription & Billing</h2>
              <p className="mb-2">
                Subscriptions are billed monthly or annually based on your selected plan. By subscribing, you authorize us to charge the payment method on file at the start of each billing period.
              </p>
              <p className="mb-2"><strong>Auto-Renewal:</strong> Subscriptions automatically renew unless you cancel before the next billing date.</p>
              <p className="mb-2"><strong>Price Changes:</strong> We reserve the right to modify subscription prices with 30 days' notice.</p>
              <p className="mb-2"><strong>Cancellation:</strong> You may cancel your subscription at any time. Cancellations take effect at the end of the current billing period.</p>
              <p><strong>Refunds:</strong> See our <Link to="/refund-policy" className="text-primary hover:underline">Refund Policy</Link> for details on refund eligibility.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">6. Usage Limits</h2>
              <p className="mb-2">
                Each subscription plan has monthly usage limits for chart analyses and market data requests. Exceeding these limits will require upgrading to a higher plan or waiting for the monthly reset.
              </p>
              <p>
                We reserve the right to enforce rate limits to prevent abuse and ensure service quality for all users.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">7. Intellectual Property</h2>
              <p className="mb-2">
                The Service, including all content, features, and functionality, is owned by bullbeardays.com and is protected by copyright, trademark, and other intellectual property laws.
              </p>
              <p>
                You retain ownership of the chart images you upload. By uploading charts, you grant us a limited license to process and analyze them to provide the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">8. Account Termination</h2>
              <p className="mb-2">
                We reserve the right to suspend or terminate your account if you:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Violate these Terms of Service</li>
                <li>Engage in fraudulent or abusive behavior</li>
                <li>Fail to pay subscription fees</li>
                <li>Use the Service in a manner that harms our systems or other users</li>
              </ul>
              <p className="mt-2">
                Upon termination, your access to the Service will cease, and we may delete your account data in accordance with our Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">9. Limitation of Liability</h2>
              <p className="mb-2">
                <strong>TO THE MAXIMUM EXTENT PERMITTED BY LAW:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>The Service is provided "AS IS" without warranties of any kind</li>
                <li>We are not liable for any trading losses, investment losses, or financial damages</li>
                <li>We are not liable for data loss, service interruptions, or technical issues</li>
                <li>Our total liability shall not exceed the amount you paid in the last 12 months</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">10. Disclaimers</h2>
              <div className="p-4 rounded-lg bg-amber-500/20 border border-amber-500/40 mb-4">
                <p className="font-semibold text-amber-700 dark:text-amber-400 mb-2">
                  ⚠️ NOT FINANCIAL ADVICE
                </p>
                <p className="text-sm">
                  All scenario analyses, predictions, and insights are for educational purposes only. They do not constitute financial, investment, or trading advice. Trading involves substantial risk of loss. You should consult a licensed financial advisor before making any investment decisions.
                </p>
              </div>
              <p className="mb-2">
                <strong>No Guarantees:</strong> Past performance does not guarantee future results. Market conditions change, and our analyses may be incorrect.
              </p>
              <p>
                <strong>AI Limitations:</strong> Our AI models may produce inaccurate or incomplete analyses. Always verify information independently.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">11. Data and Privacy</h2>
              <p>
                Your use of the Service is governed by our <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>. By using the Service, you consent to the collection and use of information as described in the Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">12. Dispute Resolution</h2>
              <p className="mb-2">
                Any disputes arising from these Terms or your use of the Service shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.
              </p>
              <p>
                You waive any right to participate in class-action lawsuits or class-wide arbitration.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">13. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the United States and the State of [Your State], without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">14. Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. Material changes will be notified via email or prominent notice on the Service. Your continued use after changes constitutes acceptance of the new Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">15. Contact</h2>
              <p>
                Questions about these Terms? Contact us at: <a href="mailto:legal@bullbeardays.com" className="text-primary hover:underline">legal@bullbeardays.com</a>
              </p>
            </section>

            <div className="mt-8 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <p className="text-sm text-foreground">
                <strong>Last Updated:</strong> January 29, 2026
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                By using bullbeardays.com, you agree to these Terms of Service.
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

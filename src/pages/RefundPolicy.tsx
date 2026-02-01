import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const RefundPolicy = () => {
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
            <RefreshCw className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Refund Policy</h1>
          </div>

          <div className="prose dark:prose-invert max-w-none space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">1. Refund Eligibility</h2>
              <p className="mb-2">
                We want you to be satisfied with our Service. If you are not satisfied, you may request a refund under the following conditions:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>First-Time Subscribers:</strong> Full refund within 7 days of your initial subscription</li>
                <li><strong>Technical Issues:</strong> Refund if the Service is unavailable for more than 48 consecutive hours</li>
                <li><strong>Billing Errors:</strong> Full refund if you were charged incorrectly</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">2. Non-Refundable Items</h2>
              <p className="mb-2">
                The following are not eligible for refunds:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Renewals after the first subscription period</li>
                <li>Subscriptions canceled after the 7-day refund window</li>
                <li>Partial months of service</li>
                <li>Unused analysis credits or features</li>
                <li>Accounts terminated for Terms of Service violations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">3. Prorated Refunds</h2>
              <p className="mb-2">
                Annual subscriptions canceled within 30 days may receive a prorated refund for the unused portion of the subscription period, minus the first month, at our discretion.
              </p>
              <p>
                Monthly subscriptions are not eligible for prorated refunds.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">4. Refund Process</h2>
              <p className="mb-2">
                To request a refund:
              </p>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>Email us at <a href="mailto:support@bullbeardays.com" className="text-primary hover:underline">support@bullbeardays.com</a> with "Refund Request" in the subject line</li>
                <li>Include your account email and reason for the refund request</li>
                <li>We will review your request within 2-3 business days</li>
                <li>If approved, refunds are processed to your original payment method within 5-10 business days</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">5. Cancellation vs. Refund</h2>
              <p className="mb-2">
                <strong>Canceling Your Subscription:</strong> You can cancel at any time from your account settings. Cancellation stops future billing but does not automatically trigger a refund.
              </p>
              <p>
                <strong>Requesting a Refund:</strong> Requires submitting a refund request per the process above and meeting eligibility criteria.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">6. Chargebacks</h2>
              <p>
                If you dispute a charge with your bank or credit card company instead of contacting us first, your account will be suspended until the matter is resolved. Please contact us directly to resolve any billing issues before initiating a chargeback.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">7. Fair Use</h2>
              <p>
                We reserve the right to deny refund requests that we determine to be abusive or fraudulent, such as requesting refunds after extensive use of the Service or repeated refund requests across multiple accounts.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">8. Dispute Resolution</h2>
              <p className="mb-2">
                If you are not satisfied with our refund decision, you may:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Request escalation to management by emailing <a href="mailto:legal@bullbeardays.com" className="text-primary hover:underline">legal@bullbeardays.com</a></li>
                <li>Submit a complaint to your local consumer protection authority</li>
              </ul>
              <p className="mt-2">
                We are committed to resolving disputes fairly and in good faith.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">9. Changes to This Policy</h2>
              <p>
                We may update this Refund Policy from time to time. Material changes will be communicated via email or prominent notice on the Service. Continued use of the Service after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">10. Contact</h2>
              <p>
                Questions about refunds? Contact us at: <a href="mailto:support@bullbeardays.com" className="text-primary hover:underline">support@bullbeardays.com</a>
              </p>
            </section>

            <div className="mt-8 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <p className="text-sm text-foreground">
                <strong>Last Updated:</strong> January 29, 2026
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                This Refund Policy applies to all subscriptions purchased through bullbeardays.com.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RefundPolicy;

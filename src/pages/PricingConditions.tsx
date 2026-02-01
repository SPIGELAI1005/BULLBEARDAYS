import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PricingConditions() {
  const { hash } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!hash) return;
    const id = hash.replace(/^#/, "");
    if (!id) return;

    // Allow layout to paint before scrolling to anchors
    const raf = requestAnimationFrame(() => {
      const el = document.getElementById(id);
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    return () => cancelAnimationFrame(raf);
  }, [hash]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="max-w-4xl mx-auto px-4 pt-44 pb-16 md:px-6 md:pt-52 md:pb-20">
        <Link
          to="/pricing"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-muted/50 hover:bg-muted border border-border hover:border-primary/50 text-base font-medium text-foreground mb-8 transition-all cursor-pointer shadow-sm hover:shadow-md"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Pricing
        </Link>

        <div className="glass-panel p-8">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Pricing Conditions</h1>
          </div>

          <div className="prose dark:prose-invert max-w-none space-y-6 text-muted-foreground">
            <section>
              <p className="text-sm">
                This page describes the key pricing and service conditions for transparency. It is provided for convenience
                and does not replace our <Link to="/terms">Terms of Service</Link>, <Link to="/privacy">Privacy Policy</Link>,{" "}
                <Link to="/risk-disclosure">Risk Disclosure</Link>, or <Link to="/refund-policy">Refund Policy</Link>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">1. General Conditions</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Educational use:</strong> BullBearDays provides educational scenario analysis only. Outputs are not
                  financial advice and should not be treated as investment recommendations.
                </li>
                <li>
                  <strong>Availability:</strong> We aim for reliable service, but the Service may be unavailable due to
                  maintenance, incidents, third-party outages (e.g., AI providers), or network issues.
                </li>
                <li>
                  <strong>AI limitations:</strong> AI outputs can be inaccurate, incomplete, or inconsistent. You are
                  responsible for verifying information and making your own decisions.
                </li>
                <li>
                  <strong>Abuse prevention:</strong> We may enforce rate limits, throttling, or other controls to prevent abuse
                  and protect service quality.
                </li>
                <li>
                  <strong>Changes:</strong> We may update features, limits, interfaces, and workflows. Material changes will be
                  communicated via email and/or in-app notices where reasonably possible.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">2. Billing, Taxes, and Pricing</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Displayed prices:</strong> Prices shown on the Pricing page are intended to be inclusive of applicable
                  VAT where stated. Your final checkout amount is shown in Stripe before purchase.
                </li>
                <li>
                  <strong>Price changes:</strong> We may change prices for future purchases/renewals. If your plan renews, any
                  price changes will be communicated in advance where required by applicable law and payment rules.
                </li>
                <li>
                  <strong>Refunds:</strong> Refund eligibility is governed by our <Link to="/refund-policy">Refund Policy</Link>.
                </li>
              </ul>
            </section>

            <section id="free">
              <h2 className="text-xl font-semibold text-foreground mb-3">3. Free Plan</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Usage limits apply (analyses and context pulls) and may reset on the schedule shown in-app.</li>
                <li>Free share-cards may include watermarking and/or disclaimers.</li>
                <li>We may change or discontinue the Free plan at any time; we will provide notice where reasonably possible.</li>
              </ul>
            </section>

            <section id="week_pass">
              <h2 className="text-xl font-semibold text-foreground mb-3">4. Week Pass</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Week Pass is a short-term access plan with limits shown on the Pricing page.</li>
                <li>Week Pass is non-renewing unless explicitly stated during checkout.</li>
                <li>Share-card watermarking rules may differ from the Free plan.</li>
              </ul>
            </section>

            <section id="starter">
              <h2 className="text-xl font-semibold text-foreground mb-3">5. Starter</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Starter is billed monthly or yearly (where offered) and renews automatically unless canceled.</li>
                <li>Limits and included features are described on the Pricing page and may be refined over time.</li>
              </ul>
            </section>

            <section id="pro">
              <h2 className="text-xl font-semibold text-foreground mb-3">6. Pro</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Pro includes higher limits and may include multi-provider/ensemble functionality where offered.</li>
                <li>Fair-use controls may apply to protect service quality for all users.</li>
              </ul>
            </section>

            <section id="elite">
              <h2 className="text-xl font-semibold text-foreground mb-3">7. Elite</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Elite includes higher limits and priority processing where offered.</li>
                <li>Performance is not guaranteed; AI/provider outages can affect response times.</li>
              </ul>
            </section>

            <section id="founder">
              <h2 className="text-xl font-semibold text-foreground mb-3">8. Founder Lifetime (Limited)</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Limited availability:</strong> Founder access is limited to a fixed number of seats. The remaining seat
                  counter is provided for transparency and may update with delay.
                </li>
                <li>
                  <strong>Lifetime access:</strong> “Lifetime” refers to access for as long as we operate and offer the Service.
                  The Service may evolve; specific features may be added, replaced, or discontinued over time.
                </li>
                <li>
                  <strong>Feature changes:</strong> We may change the set of included features. Where reasonably possible, we
                  will provide advance notice of material changes and maintain a comparable overall value proposition.
                </li>
                <li>
                  <strong>Support and issues:</strong> If you encounter issues, please contact support so we can investigate.
                  Refunds (including in cases of extended downtime) are governed by the <Link to="/refund-policy">Refund Policy</Link>.
                </li>
              </ul>
            </section>

            <div className="mt-8 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <p className="text-sm text-foreground">
                <strong>Last Updated:</strong> January 31, 2026
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                If you believe any of the above is unclear or inaccurate, contact{" "}
                <a href="mailto:support@bullbeardays.com">support@bullbeardays.com</a>.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}


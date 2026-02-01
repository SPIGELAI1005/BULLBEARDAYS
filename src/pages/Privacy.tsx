import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Lock } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Privacy = () => {
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
            <Lock className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
          </div>
          
          <div className="prose dark:prose-invert max-w-none space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">1. Information We Collect</h2>
              <p className="mb-2">
                We collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mb-3">
                <li><strong>Account Information:</strong> Email address, username, password (hashed)</li>
                <li><strong>Chart Data:</strong> Trading chart screenshots you upload for analysis</li>
                <li><strong>Analysis Preferences:</strong> Selected models, timeframes, instruments, and strategies</li>
                <li><strong>Payment Information:</strong> Processed securely by Stripe (we do not store full credit card numbers)</li>
                <li><strong>Usage Data:</strong> IP address, browser type, pages visited, analysis history</li>
              </ul>
              <p>
                We also collect anonymous analytics data to improve our Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">2. How We Use Your Information</h2>
              <p>
                We use your information to provide, maintain, and improve our Service, process your analyses, and communicate with you. We do not sell your personal information to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">3. Payment Data</h2>
              <p className="mb-2">
                Payment processing is handled by Stripe, a PCI-DSS compliant payment processor. We do not store your full credit card numbers on our servers.
              </p>
              <p>
                Stripe collects and processes your payment information according to their <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Privacy Policy</a>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">4. Data Storage and Security</h2>
              <p>
                Your data is stored securely using industry-standard encryption on Supabase infrastructure. Chart screenshots are stored in private storage with signed URLs and are only accessible to you. We implement appropriate technical and organizational measures to protect your data including JWT authentication, CORS restrictions, and rate limiting.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">5. Data Retention</h2>
              <p>
                We retain your analysis data as long as your account is active. You can request deletion of your data at any time. Chart screenshots are not stored by default unless you explicitly choose to save them.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">6. Your Rights (GDPR)</h2>
              <p className="mb-2">
                If you are located in the European Union, you have the following rights under GDPR:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Access:</strong> Request copies of your personal data</li>
                <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
                <li><strong>Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
                <li><strong>Restrict Processing:</strong> Limit how we use your data</li>
                <li><strong>Data Portability:</strong> Receive your data in a machine-readable format</li>
                <li><strong>Object:</strong> Object to processing of your data</li>
              </ul>
              <p className="mt-2">
                To exercise these rights, contact us at <a href="mailto:privacy@bullbeardays.com" className="text-primary hover:underline">privacy@bullbeardays.com</a>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">7. California Privacy Rights (CCPA)</h2>
              <p className="mb-2">
                If you are a California resident, you have the following rights under the California Consumer Privacy Act:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Know:</strong> Request disclosure of data we collect about you</li>
                <li><strong>Delete:</strong> Request deletion of your personal information</li>
                <li><strong>Opt-Out:</strong> Opt-out of the sale of personal information (we do not sell your data)</li>
                <li><strong>Non-Discrimination:</strong> We will not discriminate against you for exercising your rights</li>
              </ul>
              <p className="mt-2">
                To submit a request, email us at <a href="mailto:privacy@bullbeardays.com" className="text-primary hover:underline">privacy@bullbeardays.com</a> with "CCPA Request" in the subject line.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">8. Cookies and Tracking</h2>
              <p>
                We use cookies and similar technologies to maintain your session, remember your preferences, and analyze Service usage. You can control cookies through your browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">9. Third-Party Services</h2>
              <p className="mb-2">
                We use the following third-party services that may process your data:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Supabase:</strong> Authentication, database, and storage (<a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Privacy Policy</a>)</li>
                <li><strong>Stripe:</strong> Payment processing (<a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Privacy Policy</a>)</li>
                <li><strong>AI Providers:</strong> Chart analysis via Lovable AI Gateway (Google Gemini, OpenAI)</li>
                <li><strong>Vercel:</strong> Hosting and CDN (<a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Privacy Policy</a>)</li>
              </ul>
              <p className="mt-2">
                These services are bound by their own privacy policies and data processing agreements.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">10. Children's Privacy</h2>
              <p>
                Our Service is not intended for users under the age of 18. We do not knowingly collect personal information from children. If you believe we have inadvertently collected data from a minor, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">11. International Data Transfers</h2>
              <p>
                Your data may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers in compliance with GDPR and other applicable regulations.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">12. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of material changes via email or prominent notice on the Service at least 30 days before changes take effect.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">13. Contact Us</h2>
              <p className="mb-2">
                If you have questions about this Privacy Policy or wish to exercise your rights, contact us:
              </p>
              <ul className="list-none space-y-1 ml-4">
                <li><strong>Email:</strong> <a href="mailto:privacy@bullbeardays.com" className="text-primary hover:underline">privacy@bullbeardays.com</a></li>
                <li><strong>General Inquiries:</strong> <a href="mailto:support@bullbeardays.com" className="text-primary hover:underline">support@bullbeardays.com</a></li>
              </ul>
            </section>

            <div className="mt-8 p-4 rounded-lg bg-primary/10 border border-primary/30">
              <p className="text-sm text-foreground">
                <strong>Last Updated:</strong> January 29, 2026
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                This Privacy Policy complies with GDPR (EU), CCPA (California), and other applicable data protection regulations.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;

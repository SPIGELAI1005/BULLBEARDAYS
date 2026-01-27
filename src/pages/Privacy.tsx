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
          
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">1. Information We Collect</h2>
              <p>
                We collect information that you provide directly to us, including account information, chart screenshots you upload, and analysis preferences. We also collect usage data to improve our Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">2. How We Use Your Information</h2>
              <p>
                We use your information to provide, maintain, and improve our Service, process your analyses, and communicate with you. We do not sell your personal information to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">3. Data Storage and Security</h2>
              <p>
                Your data is stored securely using industry-standard encryption. Chart screenshots are stored off by default and only processed when you explicitly choose to save them. We implement appropriate technical and organizational measures to protect your data.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">4. Data Retention</h2>
              <p>
                We retain your analysis data as long as your account is active. You can request deletion of your data at any time. Chart screenshots are not stored by default unless you explicitly choose to save them.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">5. Your Rights (GDPR)</h2>
              <p>
                If you are located in the EU, you have the right to access, rectify, erase, restrict processing, data portability, and object to processing of your personal data. You can exercise these rights by contacting us.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">6. Cookies and Tracking</h2>
              <p>
                We use cookies and similar technologies to maintain your session, remember your preferences, and analyze Service usage. You can control cookies through your browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">7. Third-Party Services</h2>
              <p>
                We use third-party services (such as Supabase for data storage and AI providers for analysis) that may process your data. These services are bound by their own privacy policies and data processing agreements.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">8. Children's Privacy</h2>
              <p>
                Our Service is not intended for users under the age of 18. We do not knowingly collect personal information from children.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">9. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last Updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">10. Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy or wish to exercise your rights, please contact us through the Service.
              </p>
            </section>

            <div className="mt-8 p-4 rounded-lg bg-primary/10 border border-primary/30">
              <p className="text-sm text-foreground">
                <strong>Last Updated:</strong> January 2026
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                This Privacy Policy complies with GDPR requirements for EU users.
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

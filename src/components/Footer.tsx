import { Link } from "react-router-dom";
import { FileText, Shield, Lock, BookOpen, Keyboard, RefreshCw } from "lucide-react";

interface FooterProps {
  onShortcutsClick?: () => void;
}

const Footer = ({ onShortcutsClick }: FooterProps) => {
  const footerLinks = [
    {
      title: "Terms of Service",
      href: "/terms",
      icon: FileText,
      description: "Terms and conditions"
    },
    {
      title: "Privacy Policy",
      href: "/privacy",
      icon: Lock,
      description: "Privacy and data protection"
    },
    {
      title: "Refund Policy",
      href: "/refund-policy",
      icon: RefreshCw,
      description: "Refunds and cancellations"
    },
    {
      title: "Risk Disclosure",
      href: "/risk-disclosure",
      icon: Shield,
      description: "Risk information"
    },
    {
      title: "Methodology",
      href: "/methodology",
      icon: BookOpen,
      description: "How we analyze charts"
    }
  ];

  return (
    <footer className="border-t border-border bg-background/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-6 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8 mb-6 md:mb-8">
          {footerLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                to={link.href}
                className="group flex flex-col gap-2 p-4 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {link.title}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {link.description}
                </p>
              </Link>
            );
          })}
        </div>

        <div className="border-t border-border pt-6 md:pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="text-center md:text-left">
              © 2026 bullbeardays.com // AI-powered trading scenario analysis.
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4 text-xs">
              <span className="text-center">
                Not financial advice. Trade responsibly.
              </span>
              <span className="text-center">
                Educational scenario analysis only.
              </span>
              {onShortcutsClick && (
                <button
                  onClick={onShortcutsClick}
                  className="inline-flex items-center gap-1 text-xs hover:text-foreground transition-colors"
                >
                  <Keyboard className="w-3 h-3" />
                  Keyboard Shortcuts (?)
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

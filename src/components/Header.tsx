import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { User, LogOut, Menu } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMarketSession } from "@/hooks/useMarketSession";
import AuthModal from "@/components/AuthModal";
import ThemeToggle from "@/components/ThemeToggle";
import CurrencyToggle from "@/components/CurrencyToggle";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import { Sheet, SheetContent } from "@/components/ui/sheet";

const NAV_LINKS = [
  { label: "Analyze", href: "/#analyze" },
  { label: "Performance", href: "/#performance" },
  { label: "About", href: "/#about" },
  { label: "Pricing", href: "/pricing" },
] as const;

const Header = () => {
  const { user, profile, isLoading, signOut } = useAuth();
  const { session } = useMarketSession();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number } | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const userButtonRef = useRef<HTMLButtonElement>(null);

  const closeMobileMenu = useCallback(() => setShowMobileMenu(false), []);

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
    setMenuPosition(null);
  };

  const closeUserMenu = useCallback(() => {
    setShowUserMenu(false);
    setMenuPosition(null);
  }, []);

  // Close user menu when auth switches away (avoids portal + stale refs)
  useEffect(() => {
    if (!user || isLoading) {
      closeUserMenu();
    }
  }, [user, isLoading, closeUserMenu]);

  // Close user menu on click outside or Escape
  useEffect(() => {
    if (!showUserMenu) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node) &&
        userButtonRef.current &&
        !userButtonRef.current.contains(e.target as Node)
      ) {
        closeUserMenu();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeUserMenu();
    };

    const timer = setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showUserMenu, closeUserMenu]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[100]">
        <div className="px-4 pt-4 md:px-6 md:pt-6">
          <div className="glass-panel-subtle !overflow-visible max-w-7xl mx-auto px-4 py-2.5 md:px-6 md:py-3 flex items-center justify-between gap-3">
            <Link to="/" className="flex flex-col cursor-pointer hover:opacity-80 transition-opacity min-w-0 shrink">
              <span className="font-bold text-foreground text-base md:text-lg">b u l l b e a r d a y s . c o m</span>
              <span className="text-[8px] md:text-[9px] tracking-[0.15em]">
                <span className="text-foreground">un</span><span className="text-bullish font-semibold">BULL</span><span className="text-foreground">ivable.</span>
                <span className="text-foreground ml-0.5 md:ml-1">un</span><span className="text-bearish font-semibold">BEAR</span><span className="text-foreground">able.</span>
                <span className="text-foreground ml-0.5 md:ml-1"></span><span className="text-accent font-semibold">PROFIT</span><span className="text-foreground">able?</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-8 shrink-0">
              <a href="/#analyze" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Analyze</a>
              <a href="/#performance" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Performance</a>
              <a href="/#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</a>
              <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
            </nav>

            <div className="hidden md:flex items-center gap-3 shrink-0">
              <CurrencyToggle />
              <ThemeToggle />
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-bullish/10 border border-bullish/20">
                <span aria-hidden>{session.icon}</span>
                <span className="text-xs font-medium text-bullish">{session.text}</span>
              </div>
              {isLoading ? (
                <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
              ) : user ? (
                <div className="relative">
                  <button
                    ref={userButtonRef}
                    onClick={() => {
                      if (showUserMenu) {
                        closeUserMenu();
                        return;
                      }
                      const el = userButtonRef.current;
                      if (el) {
                        const rect = el.getBoundingClientRect();
                        setMenuPosition({
                          top: rect.bottom + 4,
                          right: window.innerWidth - rect.right,
                        });
                        setShowUserMenu(true);
                      }
                    }}
                    className="flex items-center gap-2 p-2 rounded-xl hover:bg-muted/50 transition-colors"
                    aria-expanded={showUserMenu}
                    aria-haspopup="true"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-foreground">
                      {profile?.display_name || user.email?.split("@")[0]}
                    </span>
                  </button>
                  {showUserMenu &&
                    menuPosition &&
                    createPortal(
                      <div
                        ref={userMenuRef}
                        className="fixed z-[200] w-48 rounded-xl bg-card border border-border shadow-xl py-2"
                        style={{
                          top: menuPosition.top,
                          right: menuPosition.right,
                          left: "auto",
                        }}
                        role="menu"
                      >
                        <div className="px-4 py-2 border-b border-border">
                          <div className="text-sm font-medium text-foreground">{profile?.display_name || "Trader"}</div>
                          <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                        </div>
                        <button
                          onClick={handleSignOut}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-muted/50 flex items-center gap-2 text-bearish"
                          role="menuitem"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>,
                      document.body
                    )}
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Sign In
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowMobileMenu(true)}
              className="md:hidden p-2.5 rounded-xl hover:bg-muted/50 transition-colors shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Open menu"
              aria-expanded={showMobileMenu}
            >
              <Menu className="w-6 h-6 text-foreground" />
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 mt-4 md:mt-6 pb-4 md:pb-6">
          <DisclaimerBanner variant="dismissible" position="header" />
        </div>
      </header>

      <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
        <SheetContent
          side="right"
          overlayClassName="z-[110]"
          className="z-[110] w-[min(100vw-2rem,320px)] sm:max-w-sm flex flex-col gap-6 bg-card border-border overflow-y-auto"
        >
          <nav className="flex flex-col gap-1 pt-8" aria-label="Mobile navigation">
            {NAV_LINKS.map(({ label, href }) =>
              href.startsWith("/#") ? (
                <a
                  key={href}
                  href={href}
                  onClick={closeMobileMenu}
                  className="px-4 py-3 rounded-xl text-base font-medium text-foreground hover:bg-muted/50 transition-colors"
                >
                  {label}
                </a>
              ) : (
                <Link
                  key={href}
                  to={href}
                  onClick={closeMobileMenu}
                  className="px-4 py-3 rounded-xl text-base font-medium text-foreground hover:bg-muted/50 transition-colors"
                >
                  {label}
                </Link>
              )
            )}
          </nav>
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-bullish/10 border border-bullish/20 w-fit">
            <span aria-hidden>{session.icon}</span>
            <span className="text-sm font-medium text-bullish">{session.text}</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Currency</span>
            <CurrencyToggle />
          </div>
          <div className="flex flex-col gap-2">
            <span className="px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Theme</span>
            <ThemeToggle />
          </div>
          <div className="mt-auto pt-4 border-t border-border">
            {isLoading ? (
              <div className="h-12 rounded-xl bg-muted animate-pulse" />
            ) : user ? (
              <div className="flex flex-col gap-1">
                <div className="px-4 py-2">
                  <div className="text-sm font-medium text-foreground">{profile?.display_name || "Trader"}</div>
                  <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                </div>
                <button
                  onClick={() => {
                    closeMobileMenu();
                    handleSignOut();
                  }}
                  className="mx-2 px-4 py-3 rounded-xl text-left text-sm hover:bg-muted/50 flex items-center gap-2 text-bearish font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  closeMobileMenu();
                  setShowAuthModal(true);
                }}
                className="w-full mx-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
};

export default Header;
import { useState } from "react";
import { User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "@/components/AuthModal";
import ThemeToggle from "@/components/ThemeToggle";

const Header = () => {
  const { user, profile, isLoading, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="glass-panel-subtle max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-bold text-foreground text-lg">b u l l b e a r d a y s . c o m</span>
            <span className="text-[9px] tracking-[0.15em]">
              <span className="text-foreground">un</span><span className="text-bullish font-semibold">BULL</span><span className="text-foreground">ivable.</span>
              <span className="text-foreground ml-1">un</span><span className="text-bearish font-semibold">BEAR</span><span className="text-foreground">able.</span>
              <span className="text-foreground ml-1"></span><span className="text-accent font-semibold">PROFIT</span><span className="text-foreground">able.</span>
            </span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#analyze" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Analyze
            </a>
            <a href="#performance" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Performance
            </a>
            <a href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              About
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-bullish/10 border border-bullish/20">
              <div className="w-2 h-2 rounded-full bg-bullish animate-pulse" />
              <span className="text-xs font-medium text-bullish">Markets Open</span>
            </div>

            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-2 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-foreground">
                    {profile?.display_name || user.email?.split('@')[0]}
                  </span>
                </button>

                {showUserMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowUserMenu(false)} 
                    />
                    <div className="absolute right-0 top-12 z-20 w-48 rounded-xl bg-card border border-border shadow-xl py-2">
                      <div className="px-4 py-2 border-b border-border">
                        <div className="text-sm font-medium text-foreground">
                          {profile?.display_name || 'Trader'}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </div>
                      </div>
                      <button
                        onClick={handleSignOut}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-muted/50 flex items-center gap-2 text-bearish"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </>
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
        </div>
      </header>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
};

export default Header;
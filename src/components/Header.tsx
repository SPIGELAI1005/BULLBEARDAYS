import logo from "@/assets/logo.jpeg";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="glass-panel-subtle max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src={logo} 
            alt="BullBearDays" 
            className="h-10 w-10 rounded-lg object-cover"
          />
          <div className="flex flex-col">
            <span className="font-semibold text-foreground tracking-tight">BullBearDays</span>
            <span className="text-xs text-muted-foreground">AI Trading Analysis</span>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center gap-8">
          <a href="#analyze" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Analyze
          </a>
          <a href="#models" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            AI Models
          </a>
          <a href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            About
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-bullish/10 border border-bullish/20">
            <div className="w-2 h-2 rounded-full bg-bullish animate-pulse" />
            <span className="text-xs font-medium text-bullish">Markets Open</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
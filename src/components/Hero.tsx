import logo from "@/assets/logo.jpeg";

const Hero = () => {
  return (
    <section className="relative pt-32 pb-16 px-6 overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-bullish/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-bearish/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="relative animate-float">
            <div className="absolute inset-0 bg-gradient-to-r from-bullish via-accent to-bearish rounded-3xl blur-2xl opacity-30" />
            <img
              src={logo}
              alt="BullBearDays"
              className="relative w-32 h-32 rounded-3xl object-cover shadow-2xl"
            />
          </div>
        </div>

        {/* Tagline */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50 mb-6">
          <span className="text-xs font-medium text-muted-foreground">
            Some days are un<span className="text-bullish font-bold">BULL</span>ivable
          </span>
          <span className="text-muted-foreground">//</span>
          <span className="text-xs font-medium text-muted-foreground">
            Other days are un<span className="text-bearish font-bold">BEAR</span>able
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight">
          AI-Powered{" "}
          <span className="text-gradient-gold">Trading Decisions</span>
          <br />
          in Seconds
        </h1>

        {/* Description */}
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
          Upload any chart screenshot and let multiple AI models analyze technicals, 
          market sentiment, and risk — delivering actionable trade setups with 
          take-profit, stop-loss, and probability scores.
        </p>

        {/* Stats */}
        <div className="flex items-center justify-center gap-8 md:gap-12">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">3</div>
            <div className="text-xs text-muted-foreground">AI Models</div>
          </div>
          <div className="w-px h-10 bg-border" />
          <div className="text-center">
            <div className="text-2xl font-bold text-bullish">&lt;30s</div>
            <div className="text-xs text-muted-foreground">Analysis Time</div>
          </div>
          <div className="w-px h-10 bg-border" />
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">24/7</div>
            <div className="text-xs text-muted-foreground">Available</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
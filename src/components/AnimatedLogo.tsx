import bullbearLogo from "@/assets/bullbear-logo.png";

const AnimatedLogo = () => {
  return (
    <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center">
      {/* Outer glow rings */}
      <div className="absolute inset-0 animate-ping-slow opacity-20">
        <div className="w-full h-full rounded-full bg-gradient-to-r from-bullish via-accent to-bearish blur-2xl" />
      </div>
      
      {/* Mid pulse ring */}
      <div className="absolute inset-4 animate-pulse-glow">
        <div className="w-full h-full rounded-full bg-gradient-to-r from-bearish/30 via-accent/50 to-bullish/30 blur-xl" />
      </div>
      
      {/* Cinema light center - bright pulsating core */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 md:w-20 md:h-20">
        <div className="absolute inset-0 animate-cinema-pulse rounded-full bg-gradient-radial from-white via-amber-200 to-transparent blur-md" />
        <div className="absolute inset-2 animate-cinema-pulse-delay rounded-full bg-gradient-radial from-white via-amber-100 to-transparent blur-sm" />
        <div className="absolute inset-4 rounded-full bg-white/90 blur-[2px] animate-twinkle" />
      </div>
      
      {/* Light rays emanating from center */}
      <div className="absolute inset-0 animate-spin-slow opacity-30">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-32 bg-gradient-to-t from-transparent via-white/60 to-transparent blur-sm" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-2 bg-gradient-to-r from-transparent via-white/60 to-transparent blur-sm" />
      </div>
      
      {/* Logo image with mix-blend for visibility */}
      <div className="relative z-10 w-40 h-40 md:w-52 md:h-52 drop-shadow-2xl">
        <img
          src={bullbearLogo}
          alt="BullBearDays - Bull vs Bear"
          className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] animate-float-subtle"
          style={{
            filter: "drop-shadow(0 0 30px rgba(255,200,50,0.4)) drop-shadow(0 0 60px rgba(255,255,255,0.2))"
          }}
        />
      </div>
      
      {/* Sparkle effects */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-sparkle opacity-80" />
      <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-amber-200 rounded-full animate-sparkle-delay opacity-70" />
      <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-white rounded-full animate-sparkle-slow opacity-60" />
      <div className="absolute bottom-1/4 right-1/3 w-2 h-2 bg-amber-100 rounded-full animate-sparkle-delay opacity-75" />
    </div>
  );
};

export default AnimatedLogo;

import { useEffect, useState } from "react";
import bullbearLogo from "@/assets/bullbear-logo.png";

const AnimatedLogo = () => {
  const [timeOfDay, setTimeOfDay] = useState<"sunrise" | "day" | "sunset" | "night">("day");

  useEffect(() => {
    const updateTimeOfDay = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 8) {
        setTimeOfDay("sunrise");
      } else if (hour >= 8 && hour < 17) {
        setTimeOfDay("day");
      } else if (hour >= 17 && hour < 20) {
        setTimeOfDay("sunset");
      } else {
        setTimeOfDay("night");
      }
    };

    updateTimeOfDay();
    const interval = setInterval(updateTimeOfDay, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  // Dynamic colors based on time of day
  const getGlowColors = () => {
    switch (timeOfDay) {
      case "sunrise":
        return {
          outer: "from-amber-400 via-orange-400 to-rose-400",
          mid: "from-amber-300/40 via-orange-300/60 to-rose-300/40",
          core: "from-amber-100 via-yellow-100 to-white",
          sparkle: "bg-amber-200",
          ambient: "rgba(251, 191, 36, 0.15)",
        };
      case "day":
        return {
          outer: "from-bullish via-accent to-primary",
          mid: "from-emerald-300/30 via-accent/50 to-green-300/30",
          core: "from-white via-amber-100 to-white",
          sparkle: "bg-white",
          ambient: "rgba(34, 197, 94, 0.1)",
        };
      case "sunset":
        return {
          outer: "from-orange-500 via-rose-500 to-purple-500",
          mid: "from-orange-300/40 via-rose-400/60 to-purple-300/40",
          core: "from-orange-100 via-rose-100 to-white",
          sparkle: "bg-orange-200",
          ambient: "rgba(249, 115, 22, 0.15)",
        };
      case "night":
        return {
          outer: "from-indigo-500 via-purple-500 to-blue-600",
          mid: "from-indigo-300/30 via-purple-400/50 to-blue-400/30",
          core: "from-indigo-100 via-blue-100 to-white",
          sparkle: "bg-indigo-200",
          ambient: "rgba(99, 102, 241, 0.12)",
        };
    }
  };

  const colors = getGlowColors();

  return (
    <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center">
      {/* Ambient background glow */}
      <div 
        className="absolute -inset-8 rounded-full blur-3xl animate-pulse-slow"
        style={{ backgroundColor: colors.ambient }}
      />

      {/* Outer glow rings - time-based gradient */}
      <div className="absolute inset-0 animate-ping-slow opacity-25">
        <div className={`w-full h-full rounded-full bg-gradient-to-r ${colors.outer} blur-2xl`} />
      </div>
      
      {/* Mid pulse ring - time-based gradient */}
      <div className="absolute inset-4 animate-pulse-glow">
        <div className={`w-full h-full rounded-full bg-gradient-to-r ${colors.mid} blur-xl`} />
      </div>
      
      {/* Cinema light center - bright pulsating core */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 md:w-20 md:h-20">
        <div className={`absolute inset-0 animate-cinema-pulse rounded-full bg-gradient-radial ${colors.core} blur-md`} />
        <div className={`absolute inset-2 animate-cinema-pulse-delay rounded-full bg-gradient-radial ${colors.core} blur-sm`} />
        <div className="absolute inset-4 rounded-full bg-white/90 blur-[2px] animate-twinkle" />
      </div>
      
      {/* Light rays emanating from center */}
      <div className="absolute inset-0 animate-spin-slow opacity-30">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-32 bg-gradient-to-t from-transparent via-white/60 to-transparent blur-sm" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-2 bg-gradient-to-r from-transparent via-white/60 to-transparent blur-sm" />
      </div>

      {/* Horizon line for sunrise/sunset */}
      {(timeOfDay === "sunrise" || timeOfDay === "sunset") && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-40 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      )}
      
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
      
      {/* Sparkle effects - time-based colors */}
      <div className={`absolute top-1/4 left-1/4 w-2 h-2 ${colors.sparkle} rounded-full animate-sparkle opacity-80`} />
      <div className={`absolute top-1/3 right-1/4 w-1.5 h-1.5 ${colors.sparkle} rounded-full animate-sparkle-delay opacity-70`} />
      <div className={`absolute bottom-1/3 left-1/3 w-1 h-1 ${colors.sparkle} rounded-full animate-sparkle-slow opacity-60`} />
      <div className={`absolute bottom-1/4 right-1/3 w-2 h-2 ${colors.sparkle} rounded-full animate-sparkle-delay opacity-75`} />

      {/* Time indicator */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-muted-foreground/60 capitalize font-medium tracking-wide">
        {timeOfDay === "sunrise" && "🌅"}
        {timeOfDay === "day" && "☀️"}
        {timeOfDay === "sunset" && "🌇"}
        {timeOfDay === "night" && "🌙"}
      </div>
    </div>
  );
};

export default AnimatedLogo;

import { useEffect, useState } from "react";
import bullbearLogo from "@/assets/bullbeardays-logo.png";
import { useMarketSession } from "@/hooks/useMarketSession";

const AnimatedLogo = () => {
  const { timeOfDay, session } = useMarketSession();
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse((prev) => (prev + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Time-based color schemes for trading sessions
  const getThemeColors = () => {
    switch (timeOfDay) {
      case "sunrise": // Asian session opening
        return {
          primary: "251, 191, 36", // Amber
          secondary: "249, 115, 22", // Orange
          accent: "244, 63, 94", // Rose
          glow: "rgba(251, 191, 36, 0.2)",
          trendStart: "rgb(251, 191, 36)",
          trendEnd: "rgb(34, 197, 94)",
          bgGradient: "from-amber-500/20 via-orange-500/10 to-rose-500/5",
          ringColor: "border-amber-400/30",
          particleColor: "bg-amber-400",
        };
      case "day": // Active trading hours
        return {
          primary: "34, 197, 94", // Green (bullish)
          secondary: "245, 158, 11", // Amber
          accent: "16, 185, 129", // Emerald
          glow: "rgba(34, 197, 94, 0.15)",
          trendStart: "rgb(245, 158, 11)",
          trendEnd: "rgb(34, 197, 94)",
          bgGradient: "from-emerald-500/15 via-green-500/10 to-teal-500/5",
          ringColor: "border-emerald-400/30",
          particleColor: "bg-emerald-400",
        };
      case "sunset": // US session closing
        return {
          primary: "249, 115, 22", // Orange
          secondary: "239, 68, 68", // Red
          accent: "168, 85, 247", // Purple
          glow: "rgba(249, 115, 22, 0.2)",
          trendStart: "rgb(239, 68, 68)",
          trendEnd: "rgb(249, 115, 22)",
          bgGradient: "from-orange-500/20 via-rose-500/10 to-purple-500/10",
          ringColor: "border-orange-400/30",
          particleColor: "bg-orange-400",
        };
      case "night": // After hours / Crypto 24/7
        return {
          primary: "99, 102, 241", // Indigo
          secondary: "139, 92, 246", // Violet
          accent: "59, 130, 246", // Blue
          glow: "rgba(99, 102, 241, 0.15)",
          trendStart: "rgb(139, 92, 246)",
          trendEnd: "rgb(99, 102, 241)",
          bgGradient: "from-indigo-500/15 via-purple-500/10 to-blue-500/10",
          ringColor: "border-indigo-400/30",
          particleColor: "bg-indigo-400",
        };
    }
  };

  const colors = getThemeColors();

  return (
    <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center">
      {/* Ambient background glow - time aware */}
      <div 
        className={`absolute -inset-8 rounded-full blur-3xl animate-pulse-slow bg-gradient-radial ${colors.bgGradient}`}
      />

      {/* Outer rotating gradient ring */}
      <div className="absolute inset-0 rounded-full opacity-25">
        <div 
          className="w-full h-full rounded-full"
          style={{
            background: `conic-gradient(from ${pulse}deg, rgb(${colors.primary}), rgb(${colors.secondary}), rgb(${colors.accent}), rgb(${colors.primary}))`,
            filter: 'blur(16px)',
          }}
        />
      </div>

      {/* Time-based sky gradient overlay */}
      <div 
        className="absolute inset-2 rounded-full opacity-30"
        style={{
          background: timeOfDay === "night" 
            ? 'radial-gradient(circle at 30% 30%, rgba(99, 102, 241, 0.3) 0%, transparent 50%)'
            : timeOfDay === "sunrise"
            ? 'radial-gradient(circle at 50% 80%, rgba(251, 191, 36, 0.4) 0%, transparent 60%)'
            : timeOfDay === "sunset"
            ? 'radial-gradient(circle at 50% 70%, rgba(249, 115, 22, 0.4) 0%, rgba(168, 85, 247, 0.1) 70%)'
            : 'radial-gradient(circle at 50% 20%, rgba(255, 255, 255, 0.2) 0%, transparent 50%)',
        }}
      />


      {/* Sun/Moon element */}
      {(timeOfDay === "sunrise" || timeOfDay === "sunset") && (
        <div 
          className="absolute w-8 h-8 rounded-full animate-pulse-slow"
          style={{
            bottom: timeOfDay === "sunrise" ? "20%" : "25%",
            left: "50%",
            transform: "translateX(-50%)",
            background: timeOfDay === "sunrise" 
              ? "radial-gradient(circle, rgb(251, 191, 36) 0%, rgb(249, 115, 22) 100%)"
              : "radial-gradient(circle, rgb(249, 115, 22) 0%, rgb(239, 68, 68) 100%)",
            boxShadow: timeOfDay === "sunrise"
              ? "0 0 30px rgba(251, 191, 36, 0.6)"
              : "0 0 30px rgba(249, 115, 22, 0.6)",
          }}
        />
      )}

      {timeOfDay === "night" && (
        <div 
          className="absolute w-6 h-6 rounded-full animate-pulse-slow"
          style={{
            top: "18%",
            right: "22%",
            background: "radial-gradient(circle at 30% 30%, rgb(226, 232, 240) 0%, rgb(148, 163, 184) 100%)",
            boxShadow: "0 0 20px rgba(148, 163, 184, 0.5)",
          }}
        />
      )}

      {/* Circular market pulse rings */}
      <div className="absolute inset-4">
        <svg className="w-full h-full opacity-20" viewBox="0 0 100 100">
          <circle 
            cx="50" 
            cy="50" 
            r="45" 
            fill="none" 
            stroke={`rgb(${colors.primary})`}
            strokeWidth="0.5"
            strokeDasharray="8 4"
            className="animate-spin-slow"
          />
          <circle 
            cx="50" 
            cy="50" 
            r="38" 
            fill="none" 
            stroke={`rgb(${colors.secondary})`}
            strokeWidth="0.3"
            strokeDasharray="4 8"
            style={{ animation: 'spin 30s linear infinite reverse' }}
          />
        </svg>
      </div>

      {/* Trading trend line - ascending for motivation */}
      <svg className="absolute inset-0 w-full h-full opacity-35" viewBox="0 0 100 100">
        <defs>
          <linearGradient id={`trendGradient-${timeOfDay}`} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.trendStart} stopOpacity="0.4" />
            <stop offset="100%" stopColor={colors.trendEnd} stopOpacity="1" />
          </linearGradient>
          <filter id="trendGlow">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Main ascending trend */}
        <path 
          d="M 18 72 Q 28 68, 38 58 T 52 42 T 68 32 T 82 22" 
          fill="none" 
          stroke={`url(#trendGradient-${timeOfDay})`}
          strokeWidth="2"
          strokeLinecap="round"
          filter="url(#trendGlow)"
          className="animate-pulse-slow"
        />
        
        {/* Support/resistance lines */}
        <path d="M 18 80 L 82 52" fill="none" stroke={`rgb(${colors.primary})`} strokeWidth="0.4" strokeDasharray="4 4" opacity="0.3" />
        <path d="M 18 52 L 82 24" fill="none" stroke={`rgb(${colors.secondary})`} strokeWidth="0.4" strokeDasharray="4 4" opacity="0.3" />
      </svg>

      {/* Mini candlesticks */}
      <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100">
        {/* Bullish candles */}
        <g fill={`rgb(${colors.primary})`} stroke={`rgb(${colors.primary})`}>
          <rect x="22" y="48" width="2.5" height="16" rx="0.3" />
          <line x1="23.25" y1="44" x2="23.25" y2="68" strokeWidth="0.4" />
          
          <rect x="38" y="38" width="2.5" height="20" rx="0.3" />
          <line x1="39.25" y1="32" x2="39.25" y2="62" strokeWidth="0.4" />
          
          <rect x="64" y="32" width="2.5" height="18" rx="0.3" />
          <line x1="65.25" y1="26" x2="65.25" y2="54" strokeWidth="0.4" />
        </g>
        
        {/* Bearish candles */}
        <g fill={`rgb(${colors.secondary})`} stroke={`rgb(${colors.secondary})`}>
          <rect x="50" y="42" width="2.5" height="14" rx="0.3" />
          <line x1="51.25" y1="38" x2="51.25" y2="60" strokeWidth="0.4" />
          
          <rect x="76" y="36" width="2.5" height="12" rx="0.3" />
          <line x1="77.25" y1="32" x2="77.25" y2="52" strokeWidth="0.4" />
        </g>
      </svg>

      {/* Central glow */}
      <div 
        className="absolute inset-12 rounded-full animate-pulse-slow"
        style={{ background: colors.glow }}
      />

      {/* Inner ring */}
      <div className={`absolute inset-14 rounded-full ${colors.ringColor} border`} />

      
      {/* Logo */}
      <div className="relative z-10 w-36 h-36 md:w-48 md:h-48">
        <img
          src={bullbearLogo}
          alt="bullbeardays - bull vs bear"
          className="w-full h-full object-contain animate-float-subtle"
          style={{
            filter: `drop-shadow(0 4px 20px rgba(${colors.primary}, 0.3))`,
          }}
        />
      </div>

      {/* Horizon line for sunrise/sunset */}
      {(timeOfDay === "sunrise" || timeOfDay === "sunset") && (
        <div 
          className="absolute bottom-[22%] left-1/2 -translate-x-1/2 w-40 h-px"
          style={{
            background: `linear-gradient(to right, transparent, rgb(${colors.primary}), transparent)`,
            opacity: 0.5,
          }}
        />
      )}

      {/* Corner frame accents */}
      <div className={`absolute top-3 left-3 w-4 h-4 border-l border-t ${colors.ringColor}`} />
      <div className={`absolute top-3 right-3 w-4 h-4 border-r border-t ${colors.ringColor}`} />
      <div className={`absolute bottom-3 left-3 w-4 h-4 border-l border-b ${colors.ringColor}`} />
      <div className={`absolute bottom-3 right-3 w-4 h-4 border-r border-b ${colors.ringColor}`} />

      {/* Session indicator */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-xs text-muted-foreground/70 font-medium tracking-wide">
        <span>{session.icon}</span>
        <span>{session.text}</span>
      </div>
    </div>
  );
};

export default AnimatedLogo;

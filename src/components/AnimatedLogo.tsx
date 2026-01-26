import { useEffect, useState } from "react";
import bullbearLogo from "@/assets/bullbeardays-logo.png";

const AnimatedLogo = () => {
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse((prev) => (prev + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center">
      {/* Outer professional gradient ring */}
      <div className="absolute inset-0 rounded-full opacity-20">
        <div 
          className="w-full h-full rounded-full"
          style={{
            background: `conic-gradient(from ${pulse}deg, hsl(var(--bullish)), hsl(var(--accent)), hsl(var(--bearish)), hsl(var(--bullish)))`,
            filter: 'blur(20px)',
          }}
        />
      </div>

      {/* Inner hexagonal grid pattern - trading aesthetic */}
      <svg className="absolute inset-4 w-[calc(100%-32px)] h-[calc(100%-32px)] opacity-10" viewBox="0 0 100 100">
        {/* Hexagonal grid lines */}
        <defs>
          <pattern id="hexGrid" width="20" height="17.32" patternUnits="userSpaceOnUse">
            <path 
              d="M10 0 L20 5.77 L20 17.32 L10 23.09 L0 17.32 L0 5.77 Z" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="0.5"
              className="text-foreground"
            />
          </pattern>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#hexGrid)" />
      </svg>

      {/* Ascending trend line - bullish motivation */}
      <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="trendGradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--bearish))" stopOpacity="0.3" />
            <stop offset="50%" stopColor="hsl(var(--accent))" stopOpacity="0.6" />
            <stop offset="100%" stopColor="hsl(var(--bullish))" stopOpacity="1" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Main ascending trend line */}
        <path 
          d="M 15 75 Q 30 70, 40 60 T 55 45 T 70 35 T 85 20" 
          fill="none" 
          stroke="url(#trendGradient)" 
          strokeWidth="2"
          strokeLinecap="round"
          filter="url(#glow)"
          className="animate-pulse-slow"
        />
        
        {/* Support line */}
        <path 
          d="M 15 85 L 85 55" 
          fill="none" 
          stroke="hsl(var(--bullish))" 
          strokeWidth="0.5"
          strokeDasharray="4 4"
          opacity="0.4"
        />
        
        {/* Resistance line */}
        <path 
          d="M 15 55 L 85 25" 
          fill="none" 
          stroke="hsl(var(--bearish))" 
          strokeWidth="0.5"
          strokeDasharray="4 4"
          opacity="0.4"
        />
      </svg>

      {/* Circular market pulse - like a heartbeat/trading volume */}
      <div className="absolute inset-6">
        <svg className="w-full h-full opacity-20" viewBox="0 0 100 100">
          <circle 
            cx="50" 
            cy="50" 
            r="45" 
            fill="none" 
            stroke="hsl(var(--primary))" 
            strokeWidth="0.5"
            strokeDasharray="8 4"
            className="animate-spin-slow"
          />
          <circle 
            cx="50" 
            cy="50" 
            r="38" 
            fill="none" 
            stroke="hsl(var(--accent))" 
            strokeWidth="0.3"
            strokeDasharray="4 8"
            style={{ animation: 'spin 30s linear infinite reverse' }}
          />
        </svg>
      </div>

      {/* Candlestick silhouettes */}
      <svg className="absolute inset-0 w-full h-full opacity-15" viewBox="0 0 100 100">
        {/* Green candles (bullish) */}
        <rect x="20" y="45" width="3" height="20" fill="hsl(var(--bullish))" rx="0.5" />
        <line x1="21.5" y1="40" x2="21.5" y2="70" stroke="hsl(var(--bullish))" strokeWidth="0.5" />
        
        <rect x="35" y="35" width="3" height="25" fill="hsl(var(--bullish))" rx="0.5" />
        <line x1="36.5" y1="30" x2="36.5" y2="65" stroke="hsl(var(--bullish))" strokeWidth="0.5" />
        
        <rect x="62" y="30" width="3" height="22" fill="hsl(var(--bullish))" rx="0.5" />
        <line x1="63.5" y1="25" x2="63.5" y2="58" stroke="hsl(var(--bullish))" strokeWidth="0.5" />
        
        {/* Red candles (bearish) */}
        <rect x="48" y="40" width="3" height="18" fill="hsl(var(--bearish))" rx="0.5" />
        <line x1="49.5" y1="35" x2="49.5" y2="63" stroke="hsl(var(--bearish))" strokeWidth="0.5" />
        
        <rect x="76" y="38" width="3" height="15" fill="hsl(var(--bearish))" rx="0.5" />
        <line x1="77.5" y1="33" x2="77.5" y2="58" stroke="hsl(var(--bearish))" strokeWidth="0.5" />
      </svg>

      {/* Subtle radial glow behind logo */}
      <div 
        className="absolute inset-8 rounded-full animate-pulse-slow"
        style={{
          background: 'radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 70%)',
        }}
      />

      {/* Clean inner glow ring */}
      <div 
        className="absolute inset-12 rounded-full border border-primary/20"
        style={{
          boxShadow: 'inset 0 0 30px hsl(var(--primary) / 0.1), 0 0 40px hsl(var(--primary) / 0.1)',
        }}
      />

      {/* Data points flowing along the trend */}
      <div className="absolute inset-0">
        <div 
          className="absolute w-2 h-2 bg-bullish rounded-full shadow-[0_0_8px_hsl(var(--bullish))]"
          style={{
            top: '25%',
            left: '75%',
            animation: 'pulse 2s ease-in-out infinite',
          }}
        />
        <div 
          className="absolute w-1.5 h-1.5 bg-accent rounded-full shadow-[0_0_6px_hsl(var(--accent))]"
          style={{
            top: '45%',
            left: '55%',
            animation: 'pulse 2s ease-in-out infinite 0.5s',
          }}
        />
        <div 
          className="absolute w-1 h-1 bg-bullish/80 rounded-full shadow-[0_0_4px_hsl(var(--bullish))]"
          style={{
            top: '60%',
            left: '40%',
            animation: 'pulse 2s ease-in-out infinite 1s',
          }}
        />
      </div>
      
      {/* Logo image - clean and prominent */}
      <div className="relative z-10 w-36 h-36 md:w-48 md:h-48">
        <img
          src={bullbearLogo}
          alt="BullBearDays - Bull vs Bear"
          className="w-full h-full object-contain animate-float-subtle"
          style={{
            filter: 'drop-shadow(0 4px 20px hsl(var(--primary) / 0.3))',
          }}
        />
      </div>

      {/* Bottom accent line - like a price chart baseline */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-32 h-px">
        <div className="w-full h-full bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      </div>

      {/* Corner accents - professional framing */}
      <div className="absolute top-4 left-4 w-4 h-4 border-l border-t border-primary/20" />
      <div className="absolute top-4 right-4 w-4 h-4 border-r border-t border-primary/20" />
      <div className="absolute bottom-4 left-4 w-4 h-4 border-l border-b border-primary/20" />
      <div className="absolute bottom-4 right-4 w-4 h-4 border-r border-b border-primary/20" />
    </div>
  );
};

export default AnimatedLogo;

# BullBearDays.com - Technical Documentation

> **AI Trading Chart Analyzer** - A React/TypeScript web application that uses AI to analyze trading charts and provide actionable trading signals.

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Design System](#design-system)
5. [Component Structure](#component-structure)
6. [State Management](#state-management)
7. [Backend & Database](#backend--database)
8. [Edge Functions (API)](#edge-functions-api)
9. [Authentication](#authentication)
10. [Feature Documentation](#feature-documentation)
11. [Styling Guidelines](#styling-guidelines)
12. [File Structure](#file-structure)

---

## Overview

**BullBearDays** is an AI-powered trading analysis platform that:
- Analyzes trading chart screenshots using AI (GPT-5, Gemini, Claude alternatives)
- Provides BUY/SELL/HOLD signals with confidence percentages
- Calculates Take Profit (TP) and Stop Loss (SL) levels
- Tracks trading performance and win rates
- Supports multiple trading strategies (Scalper → Long-Term Investor)
- Includes real-time market data, watchlists, and price alerts

### Key Value Proposition
Upload a chart screenshot → Get AI analysis with trading recommendation → Track your trades → Measure performance

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.x | UI Framework |
| TypeScript | Latest | Type Safety |
| Vite | Latest | Build Tool & Dev Server |
| Tailwind CSS | Latest | Utility-first Styling |
| shadcn/ui | Latest | Component Library |
| React Query | 5.x | Server State Management |
| React Router | 6.x | Client-side Routing |
| Recharts | 2.x | Data Visualization |
| Lucide React | Latest | Icon Library |
| Framer Motion | (via tailwindcss-animate) | Animations |

### Backend (Lovable Cloud / Supabase)
| Service | Purpose |
|---------|---------|
| Supabase Database (PostgreSQL) | Data persistence |
| Supabase Auth | User authentication |
| Supabase Edge Functions (Deno) | Serverless API endpoints |
| Supabase Storage | Chart image storage |
| Lovable AI Gateway | AI model access (GPT-5, Gemini) |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React SPA)                      │
├─────────────────────────────────────────────────────────────────┤
│  Pages: Index.tsx (main), NotFound.tsx                          │
│  ├── Components (UI, Features)                                   │
│  ├── Hooks (useAuth, useTheme, useWatchlist, etc.)              │
│  └── Lib (api.ts, utils.ts, chartStorage.ts)                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   SUPABASE CLIENT (supabase-js)                  │
│  - Auth (signIn, signUp, signOut)                                │
│  - Database (CRUD operations)                                    │
│  - Functions (invoke edge functions)                             │
│  - Storage (upload/download files)                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     SUPABASE BACKEND                             │
├─────────────────────────────────────────────────────────────────┤
│  Edge Functions (Deno):                                          │
│  ├── analyze-chart    → AI chart analysis                        │
│  ├── analyze-market   → AI market data analysis                  │
│  └── market-data      → Real-time price data (CoinGecko + cache) │
├─────────────────────────────────────────────────────────────────┤
│  Database Tables:                                                │
│  ├── analyses         → Trading analysis records                 │
│  ├── profiles         → User profiles & preferences              │
│  ├── watchlist        → User watchlist items                     │
│  ├── price_alerts     → Price alert configurations               │
│  ├── user_preferences → UI/feature preferences                   │
│  ├── market_data_cache→ Cached market data (5 min TTL)          │
│  └── rate_limits      → API rate limiting tracker                │
├─────────────────────────────────────────────────────────────────┤
│  Storage Buckets:                                                │
│  └── charts           → User uploaded chart images               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                             │
├─────────────────────────────────────────────────────────────────┤
│  Lovable AI Gateway (ai.gateway.lovable.dev)                     │
│  ├── google/gemini-2.5-pro     → Primary chart analysis          │
│  ├── openai/gpt-5              → Alternative AI model            │
│  └── google/gemini-2.5-flash   → Fast/budget analysis            │
├─────────────────────────────────────────────────────────────────┤
│  CoinGecko API                                                   │
│  └── Market data (crypto prices, 24h changes)                    │
└─────────────────────────────────────────────────────────────────┘
```

### Billing & Stripe (2026-01-30+)

This project uses **Stripe** for checkout/subscriptions and **Supabase** as the cached billing/usage store. Webhooks are handled by **Vercel Functions** (not Supabase).

**Vercel Functions (Node):**
- `POST /api/stripe/checkout` — create Checkout session and return `{ url }`
- `POST /api/stripe/webhook` — verify signature, store event for idempotency, upsert cached billing state
- `POST /api/stripe/portal` — create Billing Portal session and return `{ url }`

**Supabase tables (billing):**
- `stripe_customers` — map `auth.users.id` → `stripe_customer_id`
- `subscriptions` — cached subscription status + period bounds + `plan_id`
- `plan_entitlements` — plan limits (public readable)
- `usage_tracking` — calendar-month usage counters
- `stripe_events` — webhook idempotency + audit log

**Usage enforcement:**
- Supabase Edge Functions `analyze-chart` and `analyze-market` call RPC `check_usage_limit(user_id, 'analysis', 1)` before expensive AI operations.
- When blocked, functions respond with `code: "USAGE_LIMIT_REACHED"` (client shows an Upgrade CTA).

---

## Design System

### Theme Architecture

The app uses a **CSS Custom Properties** based theming system with:

1. **Light/Dark Mode** - Full theme inversion
2. **Accent Themes** - Neutral, Bull (green), Bear (red)
3. **Semantic Color Tokens** - All colors reference CSS variables

#### Color Token Structure (src/index.css)

```css
:root, .dark {
  /* Core */
  --background: 220 20% 7%;        /* Deep navy-black */
  --foreground: 0 0% 95%;          /* Near-white text */
  
  /* Primary (Main action color) */
  --primary: 142 71% 45%;          /* Bullish green */
  --primary-foreground: 0 0% 100%;
  
  /* Signal Colors */
  --bullish: 142 71% 45%;          /* Green - BUY signals */
  --bearish: 0 72% 51%;            /* Red - SELL signals */
  --neutral: 38 92% 50%;           /* Amber - HOLD signals */
  
  /* Glass Effects */
  --glass: 220 20% 12%;
  --glass-border: 220 15% 25%;
  --glass-highlight: 0 0% 100%;
}

.light {
  --background: 0 0% 98%;          /* Near-white */
  --foreground: 220 20% 10%;       /* Dark text */
  /* ... inverted values */
}

/* Accent Modifiers */
.accent-bull { --primary: 142 76% 50%; }
.accent-bear { --primary: 0 80% 58%; }
```

### Glass Morphism Effects

Three glass panel variants are defined:

1. **`.glass-panel`** - Primary containers with full effects
   - High blur (20px), gradient background
   - Animated shimmer on top edge
   - Radial glow from primary color

2. **`.glass-panel-subtle`** - Secondary containers
   - Medium blur (16px), simpler gradient
   - Subtle wave animation

3. **`.glass-trading`** - Trading-specific panels
   - Maximum blur (24px)
   - Bull/bear gradient accents
   - Ticker-pulse animation on top edge

### Animation System

```css
/* Key animations in use */
.animate-pulse-slow        /* 3s breathing effect */
.animate-float             /* 6s vertical floating */
.animate-liquid-shimmer    /* 4s shimmer sweep */
.animate-border-flow       /* 6s gradient border */
.signal-pulse-bullish      /* 2s pulsing green border */
.signal-pulse-bearish      /* 2s pulsing red border */
```

---

## Component Structure

### Core Layout Components

```
src/components/
├── Header.tsx              # Fixed top navbar with auth, theme toggle
├── Hero.tsx                # Landing section with animated logo
├── CandlestickBackground.tsx # Canvas-rendered animated background
├── AnimatedLogo.tsx        # Time-aware pulsating logo
└── Footer.tsx              # (if exists)
```

### Feature Components

```
├── ChartUpload.tsx         # Single image upload with drag/drop
├── MultiChartUpload.tsx    # Multi-image upload mode
├── ChatInput.tsx           # Chat-style input with paste support
├── AIModelSelector.tsx     # Model selection (Gemini, GPT, Claude)
├── TradingStrategySelector.tsx # Strategy profiles (Scalper → Investor)
├── AnalyzeButton.tsx       # Primary action button
├── AnalysisResults.tsx     # Signal display, reasoning, targets
├── PriceTargets.tsx        # Conservative/Moderate/Aggressive targets
├── MarketTicker.tsx        # Live market data carousel
├── MarketComparison.tsx    # Side-by-side asset comparison
├── HistoryPanel.tsx        # Past analyses list
├── PerformanceDashboard.tsx # Win rate charts & stats
├── AdvancedAnalytics.tsx   # Detailed performance metrics
├── WatchlistPanel.tsx      # User's watched assets
├── PriceAlerts.tsx         # Alert configuration UI
├── Leaderboard.tsx         # Public performance ranking
├── AnalysisDetailModal.tsx # Full analysis view in modal
├── ShareCard.tsx           # Social sharing card generator
├── OnboardingTour.tsx      # First-time user guide
├── ShortcutsHelp.tsx       # Keyboard shortcuts modal
├── OfflineIndicator.tsx    # Offline mode banner
├── ThemeToggle.tsx         # Light/Dark/System + Bull/Bear accent
├── AuthModal.tsx           # Sign in/Sign up modal
└── QuickActions.tsx        # Quick action buttons
```

### UI Components (shadcn/ui)

All base components are in `src/components/ui/` and follow shadcn conventions:
- Button, Card, Dialog, Sheet, Tabs, Toast, etc.
- Customized via `class-variance-authority` (cva)

---

## State Management

### Global State (React Context)

| Context | Provider | Purpose |
|---------|----------|---------|
| `AuthContext` | `AuthProvider` | User session, profile, auth methods |
| `ThemeContext` | `ThemeProvider` | Theme/accent state, persistence |

### Local State Patterns

```typescript
// Index.tsx primary state
const [uploadedImage, setUploadedImage] = useState<string | null>(null);
const [selectedModels, setSelectedModels] = useState<string[]>(["gemini"]);
const [referenceModel, setReferenceModel] = useState("gemini");
const [isAnalyzing, setIsAnalyzing] = useState(false);
const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
const [tradingStrategy, setTradingStrategy] = useState<TradingStrategy>('swingTrader');
```

### Server State (React Query)

- Used for caching and background refetching
- Primary queries in `src/lib/api.ts`

### Custom Hooks

```typescript
src/hooks/
├── useAuth.tsx           # Auth context consumer
├── useTheme.tsx          # Theme context consumer
├── useWatchlist.tsx      # Watchlist CRUD operations
├── usePriceAlerts.tsx    # Price alerts management
├── useKeyboardShortcuts.tsx # Global hotkeys (Ctrl+U, Ctrl+Enter, etc.)
├── useOnboarding.tsx     # First-time user tour state
├── useOfflineMode.tsx    # PWA offline detection & caching
└── use-toast.ts          # Toast notifications
```

---

## Backend & Database

### Database Schema

```sql
-- Core analysis storage
CREATE TABLE analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users,
  created_at TIMESTAMPTZ DEFAULT now(),
  chart_image_url TEXT,
  detected_asset TEXT,
  timeframe TEXT,
  signal TEXT NOT NULL,           -- 'BUY' | 'SELL' | 'HOLD'
  probability INTEGER NOT NULL,   -- 0-100
  take_profit TEXT,
  stop_loss TEXT,
  risk_reward TEXT,
  chart_analysis TEXT,
  market_sentiment TEXT,
  bullish_reasons TEXT[],
  bearish_reasons TEXT[],
  ai_model TEXT NOT NULL,
  outcome TEXT,                   -- 'WIN' | 'LOSS' | 'PENDING'
  outcome_notes TEXT,
  notes TEXT,
  session_id TEXT
);

-- User profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  preferred_model TEXT,           -- 'gemini' | 'gpt' | 'claude'
  theme_preference TEXT,          -- 'light' | 'dark' | 'system'
  accent_preference TEXT,         -- 'neutral' | 'bull' | 'bear'
  leaderboard_opt_in BOOLEAN DEFAULT false
);

-- Watchlist
CREATE TABLE watchlist (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  asset TEXT NOT NULL,
  notes TEXT,
  last_analysis_id UUID REFERENCES analyses(id)
);

-- Price Alerts
CREATE TABLE price_alerts (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  asset TEXT NOT NULL,
  target_price NUMERIC NOT NULL,
  alert_type TEXT NOT NULL,       -- 'above' | 'below'
  current_price NUMERIC,
  is_triggered BOOLEAN DEFAULT false,
  triggered_at TIMESTAMPTZ
);

-- Market data cache (5 min TTL)
CREATE TABLE market_data_cache (
  symbol TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Rate limiting
CREATE TABLE rate_limits (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT now()
);
```

### Row Level Security (RLS)

All tables have RLS enabled with policies ensuring:
- Users can only access their own records (`auth.uid() = user_id`)
- Analyses with NULL user_id are not accessible
- Public tables (like market_data_cache) allow anonymous reads

---

## Edge Functions (API)

### analyze-chart

**Endpoint:** `POST /functions/v1/analyze-chart`

**Auth:** Required (Bearer token)

**Rate Limit:** 10 requests/minute

**Request:**
```typescript
{
  imageBase64: string;      // Base64 encoded chart image
  selectedModels: string[]; // ['gemini', 'gpt', 'claude']
  referenceModel: string;   // Primary model for analysis
}
```

**Response:**
```typescript
{
  signal: 'BUY' | 'SELL' | 'HOLD';
  probability: number;      // 0-100
  takeProfit: string;       // e.g., "+2.5%"
  stopLoss: string;         // e.g., "-1.2%"
  riskReward: string;       // e.g., "1:2.1"
  detectedAsset: string;    // e.g., "BTC/USDT"
  timeframe: string;        // e.g., "4H"
  chartAnalysis: string;
  marketSentiment: string;
  bullishReasons: string[];
  bearishReasons: string[];
  aiModel: string;
}
```

### analyze-market

**Endpoint:** `POST /functions/v1/analyze-market`

**Auth:** Required

**Rate Limit:** 20 requests/minute

**Request:** `MarketDataItem` object (symbol, price, change24h, etc.)

**Response:** Same as analyze-chart, plus:
```typescript
{
  // ... base fields
  priceTargets: {
    conservative: { price: number; confidence: number };
    moderate: { price: number; confidence: number };
    aggressive: { price: number; confidence: number };
  };
  confidenceIntervals: {
    short: { low: number; high: number; timeframe: string };
    medium: { low: number; high: number; timeframe: string };
    long: { low: number; high: number; timeframe: string };
  };
}
```

### market-data

**Endpoint:** `GET /functions/v1/market-data`

**Auth:** Optional (anonymous allowed)

**Rate Limit:** 60 requests/minute (authenticated users)

**Response:**
```typescript
{
  data: MarketDataItem[];
}

interface MarketDataItem {
  symbol: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  category: 'crypto' | 'forex' | 'indices' | 'stocks';
}
```

**Caching:** Results cached in `market_data_cache` table for 5 minutes

**Fallback:** If CoinGecko fails, simulated data is returned for major pairs

---

## Authentication

### Flow

1. User clicks "Sign In" → `AuthModal` opens
2. Enter email/password → `signIn()` or `signUp()`
3. Supabase handles session, stores JWT in localStorage
4. `AuthProvider` listens to `onAuthStateChange`
5. Profile fetched from `profiles` table

### Protected Features

| Feature | Auth Required |
|---------|---------------|
| View market data | No |
| Analyze charts | Yes |
| Save analyses | Yes |
| Watchlist | Yes |
| Price alerts | Yes |
| Performance tracking | Yes |

---

## Feature Documentation

### Trading Strategy Profiles

```typescript
const TRADING_STRATEGIES = [
  {
    id: 'scalper',
    name: 'Scalper',
    description: 'Quick in-and-out trades',
    timeframes: { short: '5M', medium: '15M', long: '1H' },
    risk: 'High'
  },
  {
    id: 'dayTrader',
    name: 'Day Trader',
    timeframes: { short: '1H', medium: '4H', long: '1D' },
    risk: 'Med-High'
  },
  {
    id: 'swingTrader',
    name: 'Swing Trader',
    timeframes: { short: '1D', medium: '1W', long: '1M' },
    risk: 'Medium'
  },
  {
    id: 'positionTrader',
    name: 'Position Trader',
    timeframes: { short: '1W', medium: '1M', long: '3M' },
    risk: 'Med-Low'
  },
  {
    id: 'investor',
    name: 'Long-Term Investor',
    timeframes: { short: '1M', medium: '6M', long: '1Y' },
    risk: 'Low'
  }
];
```

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + U` | Open file upload |
| `Ctrl + Enter` | Trigger analysis |
| `Ctrl + T` | Toggle theme |
| `Ctrl + /` | Show shortcuts help |

### Market Categories

- **Crypto:** BTC, ETH, SOL, etc.
- **Forex:** EUR/USD, GBP/USD, USD/JPY
- **Indices:** SPX, NDX, DJI
- **Stocks:** AAPL, GOOGL, TSLA

---

## Styling Guidelines

### DO ✅

```tsx
// Use semantic tokens
<div className="bg-background text-foreground" />
<button className="bg-primary text-primary-foreground" />
<span className="text-bullish">+5.2%</span>
<span className="text-bearish">-2.1%</span>

// Use glass panels
<div className="glass-panel p-6">...</div>
<div className="glass-panel-subtle">...</div>

// Use animation utilities
<div className="animate-float" />
<div className="signal-pulse-bullish" />
```

### DON'T ❌

```tsx
// Never hardcode colors
<div className="bg-[#1a1b1e]" />       // ❌
<span className="text-green-500" />     // ❌
<div style={{ background: '#fff' }} /> // ❌

// Use tokens instead
<div className="bg-card" />            // ✅
<span className="text-bullish" />      // ✅
```

### Component Variants (CVA Pattern)

```typescript
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "border border-input bg-background",
        ghost: "hover:bg-accent",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

---

## File Structure

```
bullbeardays/
├── public/
│   ├── favicon.ico
│   └── robots.txt
├── src/
│   ├── assets/
│   │   ├── bullbear-logo.png
│   │   └── logo.jpeg
│   ├── components/
│   │   ├── ui/              # shadcn/ui base components
│   │   └── [Feature].tsx    # App-specific components
│   ├── hooks/
│   │   ├── useAuth.tsx
│   │   ├── useTheme.tsx
│   │   └── ...
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts    # Auto-generated
│   │       └── types.ts     # Auto-generated
│   ├── lib/
│   │   ├── api.ts           # Edge function calls
│   │   ├── chartStorage.ts  # Image upload helpers
│   │   ├── exportUtils.ts   # PDF/CSV export
│   │   └── utils.ts         # cn() and helpers
│   ├── pages/
│   │   ├── Index.tsx        # Main app page
│   │   └── NotFound.tsx     # 404 page
│   ├── test/
│   │   ├── setup.ts
│   │   └── example.test.ts
│   ├── App.tsx              # Root component
│   ├── App.css
│   ├── index.css            # Tailwind + theme tokens
│   └── main.tsx             # Entry point
├── supabase/
│   ├── config.toml          # Edge function config
│   ├── migrations/          # Database migrations
│   └── functions/
│       ├── analyze-chart/index.ts
│       ├── analyze-market/index.ts
│       └── market-data/index.ts
├── index.html
├── tailwind.config.ts
├── vite.config.ts
├── vitest.config.ts
├── tsconfig.json
└── package.json
```

---

## Development Notes

### Adding New Features

1. Create component in `src/components/`
2. Add types to `src/lib/api.ts` if API-related
3. Create custom hook in `src/hooks/` if stateful
4. Update Index.tsx to integrate
5. Add database migration if persistence needed

### Adding New AI Models

Update `supabase/functions/analyze-chart/index.ts`:
```typescript
const modelMapping: Record<string, string> = {
  gemini: "google/gemini-2.5-pro",
  gpt: "openai/gpt-5",
  claude: "google/gemini-2.5-flash",
  newModel: "provider/model-name",  // Add here
};
```

### Environment Variables

```env
# Auto-managed by Lovable Cloud
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
VITE_SUPABASE_PROJECT_ID=xxx

# Edge function (auto-injected)
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
LOVABLE_API_KEY  # For AI Gateway
```

---

## Branding

### Logo Text
```
b u l l b e a r d a y s . c o m
```
(Spaced letters, clean typography)

### Tagline
```
unBULLivable. unBEARable. PROFITable?
```
- "BULL" → Green (`text-bullish`)
- "BEAR" → Red (`text-bearish`)
- "PROFIT" → Accent color (`text-accent`)
- Rest → Foreground (`text-foreground`)

---

*Last updated: January 2026*

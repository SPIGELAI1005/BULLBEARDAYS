# Performance Optimization Guide

This guide documents performance optimizations implemented and recommended for BullBearDays.

## ✅ Implemented Optimizations

### 1. Error Boundary
**File:** `src/components/ErrorBoundary.tsx`

- Catches React errors gracefully
- Provides user-friendly error UI
- Includes recovery options (Try Again, Reload, Go Home)
- Shows stack trace in development mode
- Ready for error tracking service integration (Sentry, etc.)

**Integration:** Added to `App.tsx` wrapping the entire application.

### 2. React Query Optimization
**File:** `src/App.tsx`

Enhanced QueryClient configuration:
```typescript
{
  staleTime: 5 * 60 * 1000,      // 5 minutes - reduces refetches
  gcTime: 10 * 60 * 1000,        // 10 minutes - longer cache retention
  retry: 1,                       // Single retry on failure
  refetchOnWindowFocus: false,    // Prevents unnecessary refetches
}
```

Benefits:
- Reduced API calls
- Better caching strategy
- Improved perceived performance

### 3. Code Splitting Template
**File:** `src/pages/Index.optimized.tsx`

Created optimized version with lazy loading for:
- Modal components (AnalysisDetailModal, ShortcutsHelp)
- Heavy analytics components (PerformanceDashboard, AdvancedAnalytics)
- Secondary features (Leaderboard, MarketComparison)
- Multi-chart upload (conditional feature)

**To Apply:** Replace `src/pages/Index.tsx` with the optimized version.

Expected bundle size reduction: **30-40%** initial load.

## 🎯 Recommended Next Steps

### 1. Apply Lazy Loading

Replace imports in `Index.tsx`:

```typescript
// Before
import PerformanceDashboard from "@/components/PerformanceDashboard";

// After
const PerformanceDashboard = lazy(() => import("@/components/PerformanceDashboard"));

// Wrap in Suspense
<Suspense fallback={<LoadingFallback />}>
  <PerformanceDashboard analyses={allAnalyses} />
</Suspense>
```

### 2. Image Optimization

**Current Issues:**
- Large logo files (bullbeardays-logo.png: 1.5MB, bullbear-logo.png: 2.2MB)

**Solutions:**
```bash
# Compress images
npm install -D imagemin imagemin-webp

# Convert to WebP format
# Create optimized versions in public/
```

**Add to vite.config.ts:**
```typescript
import { imagetools } from 'vite-imagetools';

export default defineConfig({
  plugins: [
    react(),
    imagetools()
  ]
});
```

### 3. Component Memoization

Add React.memo to expensive components:

```typescript
// src/components/MarketTicker.tsx
export default memo(MarketTicker);

// src/components/PerformanceDashboard.tsx
export default memo(PerformanceDashboard);

// src/components/AnalysisResults.tsx
export default memo(AnalysisResults, (prev, next) => {
  return prev.analysis === next.analysis; // Custom comparison
});
```

### 4. Virtual Scrolling

For long lists (History, Leaderboard):

```bash
npm install @tanstack/react-virtual
```

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

// In HistoryPanel.tsx
const rowVirtualizer = useVirtualizer({
  count: analyses.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 80,
});
```

### 5. Bundle Analysis

```bash
# Install analyzer
npm install -D rollup-plugin-visualizer

# Add to vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    })
  ]
});

# Run build and analyze
npm run build
```

### 6. Reduce Dependency Size

**Check for alternatives:**

| Package | Size | Alternative | Savings |
|---------|------|-------------|---------|
| recharts | ~600KB | lightweight-charts | ~400KB |
| date-fns | ~200KB | Use native Intl | ~200KB |
| lucide-react | ~500KB | Tree-shake unused icons | ~300KB |

**Tree-shake Lucide icons:**
```typescript
// Instead of:
import * as Icons from "lucide-react";

// Use:
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
```

### 7. Service Worker for PWA

**File:** `public/sw.js`

```javascript
const CACHE_NAME = 'bullbeardays-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
```

Register in `main.tsx`:
```typescript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

### 8. Preconnect to External Domains

Add to `index.html`:
```html
<link rel="preconnect" href="https://supabase.co" />
<link rel="dns-prefetch" href="https://supabase.co" />
```

### 9. Font Optimization

If using custom fonts, add to CSS:
```css
@font-face {
  font-family: 'YourFont';
  src: url('/fonts/font.woff2') format('woff2');
  font-display: swap; /* Prevents FOIT */
}
```

### 10. Debounce Search Inputs

For real-time search/filter:
```typescript
import { useDeferredValue } from 'react';

const deferredSearch = useDeferredValue(searchTerm);
```

## 📊 Performance Targets

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| First Contentful Paint | TBD | < 1.5s | 🔄 |
| Largest Contentful Paint | TBD | < 2.5s | 🔄 |
| Time to Interactive | TBD | < 3.5s | 🔄 |
| Total Bundle Size | TBD | < 300KB | 🔄 |
| Lighthouse Score | TBD | > 90 | 🔄 |

## 🧪 Testing Performance

```bash
# Build for production
npm run build

# Preview build
npm run preview

# Test with Lighthouse
# Open Chrome DevTools > Lighthouse > Generate Report

# Test with WebPageTest
# Visit: https://www.webpagetest.org/
```

## 📝 Monitoring

Consider adding:
- **Sentry** - Error tracking
- **LogRocket** - Session replay
- **PostHog** - Product analytics
- **Google Analytics 4** - User behavior

## 🔧 Vite Config Optimizations

**File:** `vite.config.ts`

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          'chart-vendor': ['recharts'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
      },
    },
  },
});
```

## 🚀 Deployment Optimizations

### Vercel/Netlify
- Enable automatic gzip/brotli compression
- Configure caching headers
- Use CDN for static assets

### Headers Configuration
```
# public/_headers (Netlify)
/*
  Cache-Control: public, max-age=31536000, immutable

/index.html
  Cache-Control: no-cache

/api/*
  Cache-Control: no-store
```

## ✅ Checklist

- [x] Error Boundary implemented
- [x] React Query optimized
- [x] Lazy loading template created
- [ ] Apply lazy loading to Index.tsx
- [ ] Compress and optimize images
- [ ] Add component memoization
- [ ] Implement virtual scrolling
- [ ] Analyze bundle size
- [ ] Add service worker
- [ ] Preconnect to external domains
- [ ] Run Lighthouse audit
- [ ] Monitor with analytics

---

*Last updated: January 26, 2026*

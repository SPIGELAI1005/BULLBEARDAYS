# Vercel Deployment Guide

**Project:** BullBearDays Chart Insights AI
**Platform:** Vercel
**Framework:** Vite + React + TypeScript
**Backend:** Supabase

---

## 📋 Pre-Deployment Checklist

Before deploying to Vercel, ensure:

- [x] `vercel.json` configuration file created
- [ ] Code is pushed to GitHub repository
- [ ] All tests pass locally: `npm test`
- [ ] Production build works: `npm run build`
- [ ] Environment variables documented
- [ ] Supabase project is in production mode
- [ ] Stripe products/prices created (Test mode first), and webhook configured

---

## 🚀 Deployment Methods

### Method 1: Vercel Dashboard (Recommended for First Deployment)

**Step 1: Prepare GitHub Repository**

```bash
# Ensure your code is pushed to GitHub
git add .
git commit -m "Add Vercel deployment configuration"
git push origin main
```

**Step 2: Import Project to Vercel**

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New..." → "Project"**
3. Select **"Import Git Repository"**
4. Choose your `chart-insights-ai` repository
5. Click **"Import"**

**Step 3: Configure Build Settings**

Vercel should auto-detect these from `vercel.json`, but verify:

```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
Node Version: 18.x (or latest LTS)
```

**Step 4: Add Environment Variables**

Click **"Environment Variables"** and add:

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_SUPABASE_PROJECT_ID` | `<your-supabase-project-ref>` | Production, Preview, Development |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `<your-supabase-anon-key>` | Production, Preview, Development |
| `VITE_SUPABASE_URL` | `<your-supabase-url>` | Production, Preview, Development |

⚠️ **Important:** These are the SAME variables from your `.env` file. Copy them exactly.

### Server-side env vars (required for `/api/stripe/*`)

Add these **without** the `VITE_` prefix (Vercel Functions only):

| Name | Value | Notes |
|------|-------|-------|
| `SUPABASE_URL` | `<same as VITE_SUPABASE_URL>` | Server-side Supabase client |
| `SUPABASE_SERVICE_ROLE_KEY` | `<service role key>` | Secret; never expose client-side |
| `STRIPE_SECRET_KEY` | `sk_test_...` / `sk_live_...` | Stripe API secret |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Stripe webhook signing secret |
| `APP_BASE_URL` | `https://your-domain.com` | Used for success/cancel/return URLs |
| `STRIPE_PRICE_WEEK_PASS` | `price_...` | Price ID mapping |
| `STRIPE_PRICE_STARTER_MONTHLY` | `price_...` |  |
| `STRIPE_PRICE_STARTER_YEARLY` | `price_...` |  |
| `STRIPE_PRICE_PRO_MONTHLY` | `price_...` |  |
| `STRIPE_PRICE_PRO_YEARLY` | `price_...` |  |
| `STRIPE_PRICE_ELITE_MONTHLY` | `price_...` |  |
| `STRIPE_PRICE_ELITE_YEARLY` | `price_...` |  |
| `STRIPE_PRICE_FOUNDER` | `price_...` |  |

**Step 5: Deploy**

1. Click **"Deploy"**
2. Wait 1-3 minutes for build to complete
3. You'll get a URL like: `https://chart-insights-ai.vercel.app`

---

### Method 2: Vercel CLI (For Advanced Users)

**Install Vercel CLI:**

```bash
npm i -g vercel
```

**Login:**

```bash
vercel login
```

**Deploy:**

```bash
# First deployment (will ask configuration questions)
vercel

# Production deployment
vercel --prod
```

**Set Environment Variables via CLI:**

```bash
vercel env add VITE_SUPABASE_PROJECT_ID production
vercel env add VITE_SUPABASE_PUBLISHABLE_KEY production
vercel env add VITE_SUPABASE_URL production
```

---

### Method 3: GitHub Integration (Best for CI/CD)

**Setup:**

1. Go to your Vercel project settings
2. Click **Git** tab
3. Connect to GitHub repository
4. Enable **"Automatic Deployments"**

**How it works:**

- Every push to `main` branch → Production deployment
- Every pull request → Preview deployment
- Every commit → Automatic build check

---

## 🔐 Environment Variables Reference

Copy these exactly from your `.env` file:

```env
VITE_SUPABASE_PROJECT_ID=<your-supabase-project-ref>
VITE_SUPABASE_PUBLISHABLE_KEY=<your-supabase-anon-key>
VITE_SUPABASE_URL=<your-supabase-url>
```

⚠️ **Security Note:** These are public keys (client-side), but never commit `.env` file to git!

---

## 🧪 Post-Deployment Verification

After deployment succeeds, test these:

### 1. Basic Functionality
- [ ] Site loads at your Vercel URL
- [ ] Images and assets load correctly
- [ ] Dark/light theme toggle works
- [ ] Navigation works (no 404 errors)

### 2. Core Features
- [ ] Upload a chart image
- [ ] Image validation works
- [ ] AI analysis completes successfully
- [ ] Results display bull/bear scenarios
- [ ] Trading strategy selector works
- [ ] Timeframe selector works
- [ ] Instrument selector works

### 3. Authentication & Backend
- [ ] Sign up/login works
- [ ] Analysis saves to history
- [ ] History panel displays saved analyses
- [ ] Supabase edge functions respond
- [ ] Market ticker data loads

### 4. Performance
- [ ] Lighthouse score > 90 (Performance)
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 3s
- [ ] No console errors in production

### 5. Mobile
- [ ] Responsive design works
- [ ] Touch interactions work
- [ ] Image upload works on mobile
- [ ] All features accessible

---

## 🌐 Custom Domain Setup

### Add Custom Domain (bullbeardays.com)

**Step 1: In Vercel Dashboard**

1. Go to your project
2. Click **Settings → Domains**
3. Click **"Add Domain"**
4. Enter: `bullbeardays.com`
5. Click **"Add"**

**Step 2: Configure DNS**

Vercel will show you DNS records to add. Typically:

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**Step 3: Add DNS Records**

Go to your domain registrar (GoDaddy, Namecheap, etc.) and add these records.

**Step 4: Verify**

- Wait 5-60 minutes for DNS propagation
- Vercel will automatically verify and issue SSL certificate
- Your site will be live at `https://bullbeardays.com`

---

## 🔧 Vercel Configuration Explained

### vercel.json Breakdown

```json
{
  "buildCommand": "npm run build",        // Vite production build
  "outputDirectory": "dist",              // Where Vite outputs files
  "framework": "vite",                    // Tells Vercel it's a Vite app

  "rewrites": [
    // SPA routing - all non-API routes go to index.html
    { "source": "/((?!api(?:/|$)).*)", "destination": "/index.html" }
  ],

  "headers": [
    {
      // PWA manifest (must revalidate)
      "source": "/manifest.json",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=0, must-revalidate" }
      ]
    },
    {
      // Cache static assets aggressively (1 year)
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      // Security headers for all pages
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

### What Each Part Does:

**Rewrites:**
- Ensures React Router works (all non-API URLs serve index.html)
- Prevents 404 errors on page refresh
- Leaves `/api/*` available for Vercel Functions (e.g. Stripe endpoints)

**Headers - Assets:**
- Caches JS/CSS/images for 1 year
- Improves performance with fewer requests
- `immutable` means browser never needs to check for updates

**Headers - Security:**
- `X-Content-Type-Options`: Prevents MIME sniffing attacks
- `X-Frame-Options`: Prevents clickjacking
- `X-XSS-Protection`: Adds XSS protection
- `Referrer-Policy`: Controls referrer information
- `Permissions-Policy`: Disables unnecessary browser APIs

**Manifest caching:**
- Served via `headers` rule on `/manifest.json` (must revalidate)

---

## 📊 Monitoring & Analytics

### Built-in Vercel Analytics

**Enable in Dashboard:**
1. Go to project settings
2. Click **Analytics** tab
3. Enable **Web Analytics**

**What you get:**
- Page views
- Unique visitors
- Performance metrics
- Top pages
- Referrers

### Performance Monitoring

**Vercel Speed Insights:**
1. Go to **Speed Insights** tab
2. Enable real user monitoring
3. See actual user performance data

### Error Tracking (Optional)

Consider adding Sentry for production errors:

```bash
npm install @sentry/react @sentry/vite-plugin
```

---

## 🐛 Troubleshooting

### Build Fails

**Problem:** Build command fails on Vercel

**Solutions:**
```bash
# Test build locally first
npm run build

# Check for TypeScript errors
npm run lint

# Clear node_modules and try again
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Environment Variables Not Working

**Problem:** App says "Supabase not configured"

**Solutions:**
1. Check variable names start with `VITE_` prefix
2. Verify all 3 variables are set in Vercel dashboard
3. Redeploy after adding variables (click "Redeploy" button)

### 404 Errors on Routes

**Problem:** Refreshing page gives 404

**Solutions:**
1. Verify `vercel.json` has rewrites configuration
2. Check `vercel.json` is in repository root
3. Redeploy project

### Stripe checkout/portal doesn’t work

**Problem:** `/api/stripe/*` endpoints return 500 or redirect fails

**Solutions:**
1. Verify server env vars exist in Vercel (Stripe keys + `SUPABASE_SERVICE_ROLE_KEY`)
2. Verify `APP_BASE_URL` matches your deployed domain (no trailing slash)
3. Verify Stripe webhook is configured at `/api/stripe/webhook` and `STRIPE_WEBHOOK_SECRET` matches
4. Ensure Stripe Price IDs in env vars match the intended products/prices

### Supabase Functions Don't Work

**Problem:** AI analysis fails in production

**Solutions:**
1. Verify Supabase edge functions are deployed:
   ```bash
   supabase functions list
   ```
2. Check Supabase logs for errors
3. Verify CORS settings allow your Vercel domain (set `ALLOWED_ORIGINS` for Edge Functions if needed)
4. Check Supabase project is not paused

### Slow Performance

**Problem:** Site loads slowly

**Solutions:**
1. Check bundle size: `npm run build` → look at dist/ size
2. Lazy load heavy components
3. Optimize images (use WebP format)
4. Enable Vercel Speed Insights to identify bottlenecks

---

## 🔄 Continuous Deployment

### Automatic Deployments

Once GitHub integration is set up:

```bash
# Make changes
git add .
git commit -m "Add new feature"
git push origin main

# Vercel automatically:
# 1. Detects push
# 2. Runs build
# 3. Runs tests
# 4. Deploys to production
# 5. Sends notification
```

### Preview Deployments

For pull requests:

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and push
git push origin feature/new-feature

# Create PR on GitHub
# Vercel creates preview deployment
# You get a unique URL to test: https://chart-insights-ai-git-feature-new-feature.vercel.app
```

### Rollback

If deployment breaks:

1. Go to Vercel dashboard
2. Click **Deployments** tab
3. Find previous working deployment
4. Click **"..."** → **"Promote to Production"**

---

## 📝 Post-Deployment Tasks

After first successful deployment:

### 1. Update Package.json Description

```json
{
  "description": "AI-powered trading chart scenario analysis for educational purposes. Not financial advice."
}
```

### 2. Update README.md

Replace Lovable template with:

```markdown
# BullBearDays - AI Trading Scenario Analysis

🚀 **Live:** https://bullbeardays.com (or your Vercel URL)

Educational trading chart scenario analyzer powered by AI.
Upload charts to get bull/bear scenario analysis.

**⚠️ Not financial advice. For educational purposes only.**

## Tech Stack
- React + TypeScript + Vite
- Supabase (backend + auth)
- Vercel (hosting)
- Tailwind CSS + shadcn/ui
```

### 3. Add Status Badge

Add to README.md:

```markdown
[![Deployment](https://img.shields.io/badge/Deployed%20on-Vercel-black)](https://vercel.com)
```

### 4. Set Up Monitoring

- [ ] Enable Vercel Analytics
- [ ] Enable Speed Insights
- [ ] Set up uptime monitoring (optional: UptimeRobot)
- [ ] Configure error tracking (optional: Sentry)

### 5. SEO Configuration

Update in Vercel dashboard:
- [ ] Add Open Graph image
- [ ] Verify robots.txt is accessible
- [ ] Submit sitemap to Google Search Console

---

## 🎯 Success Criteria

Your deployment is successful when:

- ✅ Site loads at your Vercel URL
- ✅ All environment variables work
- ✅ Supabase backend connects
- ✅ AI analysis completes successfully
- ✅ No console errors
- ✅ Lighthouse score > 90
- ✅ Mobile responsive
- ✅ Custom domain connected (if applicable)
- ✅ SSL certificate active (automatic)
- ✅ Analytics enabled

---

## 📞 Support

**Vercel Issues:**
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Support](https://vercel.com/support)

**Supabase Issues:**
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)

**Project Issues:**
- Check GitHub issues
- Review deployment logs in Vercel dashboard

---

## 🚀 Next Steps

After successful deployment:

1. **Test Everything** - Go through entire app in production
2. **Share with Beta Users** - Get initial feedback
3. **Monitor Performance** - Watch Vercel analytics
4. **Iterate** - Fix bugs, improve UX based on feedback
5. **Launch** - Announce to wider audience

---

**Deployment Date:** _[Will be set after first deploy]_
**Vercel Project:** _[Will be set after first deploy]_
**Production URL:** _[Will be set after first deploy]_
**Status:** 🟡 Ready to Deploy

---

**Good luck with your deployment! 🚀**

Once deployed, update Task #11 status to completed.

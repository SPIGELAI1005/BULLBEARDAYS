# Pre-Deployment Checklist

Complete these steps before deploying to Vercel:

## ✅ Configuration Files

- [x] `vercel.json` - Deployment configuration created
- [x] `.gitignore` - Updated to exclude .env and .vercel files
- [ ] `.env` - Verified local environment variables are correct (never commit secrets)
- [x] `package.json` - Build scripts configured

## 🧪 Local Testing

Run these commands to verify everything works:

```bash
# 1. Install dependencies
npm install

# 2. Run tests
npm test

# 3. Build for production
npm run build

# 4. Preview production build
npm run preview
```

**Expected results:**
- [ ] All tests pass
- [ ] Build completes without errors
- [ ] Preview shows working app at http://localhost:4173
- [ ] No console errors in preview

## 📝 Code Review

- [ ] All Phase 0, 1, 2 changes committed
- [ ] No console.log() statements in production code (or wrapped in dev checks)
- [ ] No hardcoded API keys (all in environment variables)
- [ ] Error handling in place for all API calls
- [ ] Loading states implemented for all async operations

## 🔐 Security Check

- [ ] `.env` file is in `.gitignore` (not committed to git)
- [ ] No sensitive data in client-side code
- [ ] Supabase RLS policies enabled
- [ ] Edge function authentication configured
- [ ] CORS settings appropriate
- [ ] Vercel server env vars (Stripe + Supabase service role) configured
- [ ] Stripe webhook signature verification enabled on `/api/stripe/webhook`

## 📊 Performance Check

Run Lighthouse audit locally:

```bash
# Build and preview
npm run build && npm run preview

# Then open Chrome DevTools
# Lighthouse > Generate Report
```

Target scores:
- [ ] Performance: > 90
- [ ] Accessibility: > 95
- [ ] Best Practices: > 90
- [ ] SEO: > 90

## 📦 Dependencies

- [ ] No unused dependencies in `package.json`
- [ ] All dependencies up to date (or documented why not)
- [ ] No security vulnerabilities: `npm audit`

## 📱 Browser Testing

Test in these browsers:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

Key features to test:
- [ ] Image upload
- [ ] AI analysis
- [ ] Chart validation
- [ ] Strategy/timeframe/instrument selectors
- [ ] History panel
- [ ] Dark/light theme toggle
- [ ] Authentication (sign up/login)
- [ ] Pricing → Checkout redirect (signed in)
- [ ] Billing page shows plan + limits (`/billing`)
- [ ] Manage billing opens Stripe portal
- [ ] Usage limit enforcement blocks analysis when exceeded

## 🗄️ Database

- [ ] All Supabase migrations applied
- [ ] Database schema matches application types
- [ ] Sample data available for testing
- [ ] Backup strategy in place
- [ ] Billing tables exist (`stripe_customers`, `subscriptions`, `plan_entitlements`, `usage_tracking`, `stripe_events`)
- [ ] RPCs exist: `get_user_subscription`, `check_usage_limit`

## 🚀 Supabase Edge Functions

Verify all edge functions are deployed:

```bash
supabase functions list
```

Expected functions:
- [ ] `analyze-chart`
- [ ] `analyze-market`
- [ ] `market-data`
- [ ] Usage enforcement active (edge functions call `check_usage_limit` before expensive operations)
- [ ] Supabase Edge Function secrets configured:
  - [ ] `LOVABLE_API_KEY` (required for AI gateway calls)
  - [ ] `ALLOWED_ORIGINS` (optional, comma-separated) includes your Vercel production URL + preview URL(s) (CORS allowlist)

## 💳 Stripe + Vercel API Routes

- [ ] Vercel Functions exist under `api/stripe/*`:
  - [ ] `POST /api/stripe/checkout`
  - [ ] `POST /api/stripe/webhook`
  - [ ] `POST /api/stripe/portal`
- [ ] Vercel SPA rewrite excludes `/api/*` (so functions are not rewritten to `/index.html`)
- [ ] Stripe Products + Prices created (Test mode first)
- [ ] Vercel env vars set (server-side):
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `STRIPE_SECRET_KEY`
  - [ ] `STRIPE_WEBHOOK_SECRET`
  - [ ] `APP_BASE_URL`
  - [ ] `STRIPE_PRICE_WEEK_PASS`
  - [ ] `STRIPE_PRICE_STARTER_MONTHLY`, `STRIPE_PRICE_STARTER_YEARLY`
  - [ ] `STRIPE_PRICE_PRO_MONTHLY`, `STRIPE_PRICE_PRO_YEARLY`
  - [ ] `STRIPE_PRICE_ELITE_MONTHLY`, `STRIPE_PRICE_ELITE_YEARLY`
  - [ ] `STRIPE_PRICE_FOUNDER`

## 📄 Documentation

- [ ] README.md updated (remove Lovable template)
- [ ] USER-GUIDE.md reflects current features
- [ ] ARCHITECTURE.md updated for new structure
- [ ] All Phase 0/1/2 disclaimer language in place

## 🌐 GitHub

- [ ] All changes committed
- [ ] Commit messages are clear
- [ ] No large files (>1MB) committed
- [ ] Repository description updated
- [ ] README badges added (optional)

```bash
# Verify clean working directory
git status

# Verify all changes pushed
git log origin/main..HEAD
```

## 📋 Vercel Account Setup

- [ ] Vercel account created (vercel.com)
- [ ] GitHub connected to Vercel
- [ ] Billing configured (if needed beyond free tier)

## 🎯 Ready to Deploy

Once all items above are checked:

### Option 1: Vercel Dashboard
1. Go to vercel.com
2. Click "New Project"
3. Import your GitHub repository
4. Add environment variables:
   - `VITE_SUPABASE_PROJECT_ID`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_SUPABASE_URL`
5. Click "Deploy"

### Option 2: Vercel CLI
```bash
npm i -g vercel
vercel login
vercel
```

## 🧪 Post-Deployment Testing

After deployment succeeds:

- [ ] Visit deployed URL
- [ ] Test all major features
- [ ] Check browser console for errors
- [ ] Verify Supabase connection works
- [ ] Test on mobile devices
- [ ] Run Lighthouse on production URL

## 🎉 Launch

- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Analytics enabled
- [ ] Share with beta testers
- [ ] Monitor for issues

## 📊 Monitoring Setup

- [ ] Vercel Analytics enabled
- [ ] Speed Insights enabled
- [ ] Error tracking configured (optional: Sentry)
- [ ] Uptime monitoring (optional: UptimeRobot)

---

## ⚠️ Rollback Plan

If deployment fails or has critical issues:

1. **Vercel Dashboard:**
   - Go to Deployments tab
   - Find last working deployment
   - Click "Promote to Production"

2. **Local fix:**
   ```bash
   git revert HEAD
   git push origin main
   # Vercel auto-deploys previous version
   ```

---

## 🆘 Troubleshooting

### Build Fails
```bash
# Test locally first
npm run build

# Check for errors
npm run lint
```

### Environment Variables Not Working
- Verify all 3 Supabase variables are set
- Check variable names start with `VITE_`
- Redeploy after adding variables

### 404 on Routes
- Verify `vercel.json` is in repository root
- Check rewrites configuration
- Redeploy

---

**Status:** 🟡 Ready for deployment checklist

**Last Updated:** January 30, 2026

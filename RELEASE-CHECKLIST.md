# Release checklist (BullBearDays)

## Pre-flight
- [ ] `npm test`
- [ ] `npm run build`
- [ ] Confirm UI posture: scenario analysis language + disclaimers
- [ ] Confirm provider error UX works (402 billing, 429 rate limit)

## Vercel env
- [ ] Preview env points to **staging** Supabase
- [ ] Production env points to **prod** Supabase
- [ ] `VITE_SUPABASE_URL`
- [ ] `VITE_SUPABASE_PUBLISHABLE_KEY`
- [ ] (Optional) `VITE_DEMO_MODE` is **not** enabled in production

## Supabase (staging & prod)
- [ ] Migrations applied (`supabase/migrations/*`)
- [ ] Functions deployed (`supabase/functions/*`)
- [ ] Function secrets set:
  - [ ] `OPENAI_API_KEY`
  - [ ] `GEMINI_API_KEY`
  - [ ] `ANTHROPIC_API_KEY`
  - [ ] `ALLOWED_ORIGINS` includes all relevant domains
- [ ] Storage bucket(s) exist and are private (if used)

## Smoke tests
- [ ] Sign up / sign in
- [ ] Upload chart → analysis returns scenarios
- [ ] Switch provider model and re-run analysis
- [ ] Market data loads
- [ ] History loads (signed in)

## Post-release
- [ ] Watch error logs (functions + frontend)
- [ ] Confirm no unexpected billing errors

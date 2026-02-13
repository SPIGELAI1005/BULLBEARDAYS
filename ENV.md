# Environment setup (staging + prod)

BullBearDays is intended to run with **two Supabase projects**:

- **STAGING** → Vercel Preview deployments
- **PROD** → Vercel Production deployment

This keeps migrations, policies, data and billing tests isolated.

---

## Frontend env vars (Vite)

These are required for the React app:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY` (Supabase anon key)

### Local dev

Create `.env.local`:

```env
VITE_SUPABASE_URL=https://<your-staging-project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<staging-anon-key>
```

### Vercel

Set env vars in **Vercel → Project Settings → Environment Variables**:

- Preview (and optionally Development): use **staging** values
- Production: use **prod** values

---

## Supabase Edge Function secrets (per project)

Set these secrets in **each** Supabase project (staging and prod):

### AI provider keys (Option A)
- `OPENAI_API_KEY`
- `GEMINI_API_KEY`
- `ANTHROPIC_API_KEY`

### CORS
- `ALLOWED_ORIGINS`
  - Include your Vercel URLs and custom domain.
  - Example:

```txt
https://chart-insights-ai-sigma.vercel.app,https://bullbeardays.com
```

Notes:
- Supabase runtime provides `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` to functions.
- `LOVABLE_API_KEY` is no longer used.

---

## Stripe (optional / later)

Stripe keys are used by Vercel API routes under `api/stripe/*`.
Those are configured as **Vercel env vars**, not Supabase secrets.

---

## Quick sanity checks

- If the app can’t sign in: verify Supabase Auth settings (Site URL + Redirect URLs).
- If analysis errors with 402 billing: top up provider credits or rotate key.
- If CORS errors: add the exact origin to `ALLOWED_ORIGINS`.

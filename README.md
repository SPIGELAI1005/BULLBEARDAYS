# BullBearDays.com

AI-assisted **chart screenshot scenario analysis**.

Upload a chart → choose instrument/timeframe/strategy → get **Bull & Bear scenarios** with a **trend bias** and a **confidence score** (confidence in the chart read, not “profit probability”).

Live (current): https://chart-insights-ai-sigma.vercel.app

## Product posture

BullBearDays is an **educational scenario analysis tool**.
- It does **not** provide financial advice.
- It avoids directive “BUY/SELL signals” in the chart screenshot flow.
- Results are framed as **two-sided scenarios** (what bulls see vs what bears see) with invalidation levels + risks.

## Tech stack

- Frontend: Vite, React, TypeScript, Tailwind, shadcn/ui (Radix)
- Backend: Supabase (Auth, Postgres, Storage, Edge Functions)
- AI providers (direct): OpenAI, Google Gemini, Anthropic Claude
- Billing: Stripe (Vercel API routes under `/api/stripe/*`)

## Repository

GitHub: https://github.com/SPIGELAI1005/BULLBEARDAYS

## Local development

### 1) Install

```bash
npm install
```

### 2) Configure env

Create `.env.local`:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

See **ENV.md** for staging vs prod setup.

### 3) Run

```bash
npm run dev
```

### 4) Test

```bash
npm test
```

## Supabase (staging + prod)

This repo is designed for **two Supabase projects**:
- Staging: used by Vercel Preview
- Prod: used by Vercel Production

High-level steps:
1) Create Supabase projects (staging + prod)
2) Apply migrations: `supabase/migrations/*`
3) Deploy edge functions: `supabase/functions/*`
4) Set function secrets (per project):
   - `OPENAI_API_KEY`
   - `GEMINI_API_KEY`
   - `ANTHROPIC_API_KEY`
   - `ALLOWED_ORIGINS`

## AI provider notes

The `analyze-chart` edge function supports the UI provider keys:
- `gpt` → OpenAI
- `gemini` → Google Gemini
- `claude` → Anthropic Claude

If you see “billing error / insufficient credits”, it’s coming from the provider (not the UI). Top up the relevant provider account or switch keys.

## Project planning

See `EPICS.md` for epics → features → tasks.

## License

TBD (private for now).

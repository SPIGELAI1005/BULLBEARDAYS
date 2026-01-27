# Developer Guide - BullBearDays

This guide helps developers understand, set up, and contribute to the BullBearDays codebase.

## 🚀 Quick Start

### Prerequisites

- **Node.js:** 18.x or higher
- **npm:** 9.x or higher
- **Git:** Latest version
- **Supabase Account:** For backend services
- **Code Editor:** VS Code recommended

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/bullbeardays/chart-insights-ai.git
cd chart-insights-ai

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local

# Add your Supabase credentials
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key

# Start development server
npm run dev

# Open browser
# http://localhost:5173
```

### Project Structure

```
bullbeardays/
├── public/               # Static assets
│   ├── manifest.json    # PWA manifest
│   ├── sitemap.xml      # SEO sitemap
│   └── robots.txt       # Search engine directives
├── src/
│   ├── assets/          # Images, logos
│   ├── components/      # React components
│   │   ├── ui/         # shadcn/ui components
│   │   └── *.tsx       # Feature components
│   ├── hooks/          # Custom React hooks
│   ├── integrations/   # Supabase client
│   ├── lib/            # Utility functions
│   ├── pages/          # Route pages
│   ├── test/           # Test files
│   ├── App.tsx         # Root component
│   ├── index.css       # Global styles
│   └── main.tsx        # Entry point
├── supabase/
│   ├── functions/      # Edge functions
│   └── migrations/     # Database migrations
└── Configuration files
```

## 📝 Development Workflow

### Branch Strategy

```bash
# Feature development
git checkout -b feature/your-feature-name

# Bug fixes
git checkout -b fix/bug-description

# Hotfixes
git checkout -b hotfix/critical-issue

# Commit messages format
git commit -m "feat: add new chart analysis feature"
git commit -m "fix: resolve memory leak in ticker"
git commit -m "docs: update README with examples"
```

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

### Code Style

```typescript
// Use TypeScript for type safety
interface AnalysisData {
  signal: "BUY" | "SELL" | "HOLD";
  probability: number;
}

// Use functional components with hooks
const MyComponent: React.FC<Props> = ({ prop1, prop2 }) => {
  const [state, setState] = useState<Type>(initialValue);

  return (
    <div className="container">
      {/* JSX */}
    </div>
  );
};

// Export at bottom
export default MyComponent;
```

### Styling Guidelines

```tsx
// Use Tailwind CSS classes
<div className="flex items-center gap-4 p-6 bg-background">

// Use semantic color tokens
<span className="text-bullish">+5.2%</span>
<span className="text-bearish">-2.1%</span>

// Use glass panel variants
<div className="glass-panel p-6">
<div className="glass-panel-subtle">
<div className="glass-trading">
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm test -- --coverage
```

### Writing Tests

```typescript
// Component test example
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import MyComponent from "./MyComponent";

describe("MyComponent", () => {
  it("should render correctly", () => {
    render(<MyComponent />);
    expect(screen.getByText("Expected Text")).toBeInTheDocument();
  });

  it("should handle click events", () => {
    const mockHandler = vi.fn();
    render(<MyComponent onClick={mockHandler} />);

    fireEvent.click(screen.getByRole("button"));
    expect(mockHandler).toHaveBeenCalledTimes(1);
  });
});
```

### Hook Testing

```typescript
import { renderHook, act } from "@testing-library/react";
import { useMyHook } from "./useMyHook";

describe("useMyHook", () => {
  it("should update state", () => {
    const { result } = renderHook(() => useMyHook());

    act(() => {
      result.current.updateValue("new value");
    });

    expect(result.current.value).toBe("new value");
  });
});
```

## 🗄️ Database

### Supabase Setup

1. Create a Supabase project at https://supabase.com
2. Copy your project URL and anon key
3. Add to `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

### Running Migrations

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push

# Create new migration
supabase migration new your_migration_name
```

### Database Schema

See `ARCHITECTURE.md` for complete schema documentation.

Key tables:
- `analyses` - Trading analysis records
- `profiles` - User profiles
- `watchlist` - User watchlists
- `price_alerts` - Price alert configurations

## 🔧 Edge Functions

### Local Development

```bash
# Start Supabase locally
supabase start

# Serve edge functions
supabase functions serve

# Deploy specific function
supabase functions deploy analyze-chart
```

### Function Structure

```typescript
// supabase/functions/my-function/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    // Parse request
    const { data } = await req.json();

    // Process
    const result = await processData(data);

    // Return response
    return new Response(
      JSON.stringify({ result }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
```

## 🎨 Adding New Components

### shadcn/ui Component

```bash
# Add a new shadcn component
npx shadcn-ui@latest add button
npx shadcn-ui@latest add dialog
```

### Custom Component Template

```typescript
// src/components/MyNewComponent.tsx
import React from "react";
import { Button } from "@/components/ui/button";

interface MyNewComponentProps {
  title: string;
  onAction: () => void;
}

const MyNewComponent: React.FC<MyNewComponentProps> = ({
  title,
  onAction,
}) => {
  return (
    <div className="glass-panel p-6">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <Button onClick={onAction}>Click Me</Button>
    </div>
  );
};

export default MyNewComponent;
```

## 🔌 API Integration

### Calling Edge Functions

```typescript
import { supabase } from "@/integrations/supabase/client";

export async function myApiCall(data: MyData): Promise<Result> {
  const { data: result, error } = await supabase.functions.invoke(
    'my-function',
    { body: data }
  );

  if (error) {
    throw new Error(error.message);
  }

  return result as Result;
}
```

### Using React Query

```typescript
import { useQuery } from "@tanstack/react-query";
import { fetchMarketData } from "@/lib/api";

function MyComponent() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['marketData'],
    queryFn: fetchMarketData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{/* Render data */}</div>;
}
```

## 🚢 Deployment

### Build for Production

```bash
# Create production build
npm run build

# Preview production build locally
npm run preview

# Check bundle size
npm run build -- --report
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

### Deploy to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

### Environment Variables

Production environment variables needed:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_SUPABASE_PROJECT_ID=
```

## 🐛 Debugging

### React DevTools

Install React DevTools browser extension for debugging:
- Component tree inspection
- Props and state viewing
- Performance profiling

### Supabase Logs

```bash
# View edge function logs
supabase functions logs my-function

# Real-time logs
supabase functions logs my-function --tail
```

### Console Logging

```typescript
// Development only logging
if (import.meta.env.DEV) {
  console.log("Debug info:", data);
}

// Production error tracking
try {
  // Code
} catch (error) {
  console.error("Error:", error);
  // Send to error tracking service
}
```

## 📦 Dependencies

### Core Dependencies

- **React 18.3** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **React Query** - Server state
- **React Router** - Routing
- **Supabase** - Backend services

### Adding Dependencies

```bash
# Install production dependency
npm install package-name

# Install dev dependency
npm install -D package-name

# Update dependencies
npm update

# Check for outdated packages
npm outdated
```

## 🔐 Security

### Best Practices

```typescript
// ✅ DO: Use environment variables
const apiKey = import.meta.env.VITE_API_KEY;

// ❌ DON'T: Hardcode secrets
const apiKey = "sk_live_123456";

// ✅ DO: Validate user input
const sanitized = DOMPurify.sanitize(userInput);

// ❌ DON'T: Trust user input
innerHTML = userInput;

// ✅ DO: Use RLS policies
// Database rows automatically filtered by user_id

// ❌ DON'T: Expose sensitive data
// Return only necessary fields
```

### Row Level Security

All Supabase tables use RLS:

```sql
-- Example RLS policy
CREATE POLICY "Users can view own analyses"
ON analyses FOR SELECT
USING (auth.uid() = user_id);
```

## 🤝 Contributing

### Pull Request Process

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Write/update** tests
5. **Run** tests and linting
6. **Commit** with conventional commits
7. **Push** to your fork
8. **Create** a pull request

### Code Review Checklist

- [ ] Code follows style guidelines
- [ ] Tests pass
- [ ] New features have tests
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] Accessibility considered
- [ ] Performance implications reviewed

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)
- [shadcn/ui](https://ui.shadcn.com)

## 💬 Support

- **Issues:** GitHub Issues
- **Discussions:** GitHub Discussions
- **Email:** dev@bullbeardays.com

---

*Last updated: January 26, 2026*

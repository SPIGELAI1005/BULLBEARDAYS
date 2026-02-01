/**
 * CORS helper for Supabase Edge Functions
 * Restricts origins to approved domains only
 */

function parseCsv(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

const envAllowedOrigins = parseCsv(Deno.env.get("ALLOWED_ORIGINS"));

const defaultAllowedOrigins = [
  "https://bullbeardays.com",
  "https://www.bullbeardays.com",
];

const vercelOrigin = Deno.env.get("VERCEL_URL") ? `https://${Deno.env.get("VERCEL_URL")}` : null;

// Local development (Vite defaults to 5173; this project often runs on 8080)
const localAllowedOrigins = ["http://localhost:5173", "http://localhost:8080"];

const ALLOWED_ORIGINS = [...defaultAllowedOrigins, ...envAllowedOrigins, ...(vercelOrigin ? [vercelOrigin] : []), ...localAllowedOrigins];
const ALLOWED_ORIGINS_SET = new Set(ALLOWED_ORIGINS);

export interface CorsHeaders {
  'Access-Control-Allow-Origin': string;
  'Access-Control-Allow-Methods': string;
  'Access-Control-Allow-Headers': string;
}

export function getCorsHeaders(origin: string | null): CorsHeaders | Record<string, never> {
  if (!origin || !ALLOWED_ORIGINS_SET.has(origin)) {
    // Return empty object for disallowed origins
    return {};
  }

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

export function handleCors(req: Request): {
  origin: string | null;
  headers: CorsHeaders | Record<string, never>;
  response?: Response;
} {
  const origin = req.headers.get('origin');
  const headers = getCorsHeaders(origin);

  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return {
      origin,
      headers,
      response: new Response(null, {
        status: 204,
        headers: {
          ...headers,
          'Access-Control-Max-Age': '86400', // Cache preflight for 24 hours
        },
      }),
    };
  }

  return { origin, headers };
}

export function corsResponse(
  body: unknown,
  options: {
    status?: number;
    headers?: HeadersInit;
    origin: string | null;
  }
): Response {
  const corsHeaders = getCorsHeaders(options.origin);

  return new Response(JSON.stringify(body), {
    status: options.status || 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
}

// Shared AI provider helpers for Supabase Edge Functions (Deno)
//
// Providers supported:
// - OpenAI (chat.completions)
// - Google Gemini (generateContent)
// - Anthropic Claude (messages)
//
// Notes:
// - We keep this intentionally small and dependency-free.
// - All functions return the model's text content (expected to be JSON).

export type Provider = "openai" | "gemini" | "anthropic";

export interface AiCallInput {
  provider: Provider;
  model: string;
  systemPrompt: string;
  userText: string;
  // Optional image as data URL (data:image/png;base64,...)
  imageDataUrl?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AiCallResult {
  content: string;
  raw?: unknown;
}

function parseDataUrl(dataUrl: string): { mediaType: string; base64: string } {
  // data:image/png;base64,AAAA
  const match = dataUrl.match(/^data:([^;]+);base64,(.*)$/);
  if (!match) {
    throw new Error("INVALID_IMAGE_DATA_URL");
  }
  return { mediaType: match[1], base64: match[2] };
}

function isRateLimitStatus(status: number): boolean {
  return status === 429;
}

function isBillingStatus(status: number): boolean {
  // Different providers use different codes; 402 is common for “payment required”.
  return status === 402;
}

async function readErrorBody(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch {
    return "";
  }
}

export async function callAi(input: AiCallInput): Promise<AiCallResult> {
  const temperature = input.temperature ?? 0.3;
  const maxTokens = input.maxTokens ?? 2000;

  if (input.provider === "openai") {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured");

    const messages: Array<{ role: "system" | "user"; content: unknown }> = [
      { role: "system", content: input.systemPrompt },
    ];

    if (input.imageDataUrl) {
      messages.push({
        role: "user",
        content: [
          { type: "text", text: input.userText },
          { type: "image_url", image_url: { url: input.imageDataUrl } },
        ],
      });
    } else {
      messages.push({ role: "user", content: input.userText });
    }

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: input.model,
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!res.ok) {
      const body = await readErrorBody(res);
      const err = new Error(`OPENAI_ERROR_${res.status}`);
      (err as any).status = res.status;
      (err as any).body = body;
      (err as any).kind = isRateLimitStatus(res.status)
        ? "rate_limit"
        : isBillingStatus(res.status)
          ? "billing"
          : "provider";
      throw err;
    }

    const json = await res.json();
    const content = json?.choices?.[0]?.message?.content;
    if (!content || typeof content !== "string") {
      throw new Error("OPENAI_EMPTY_RESPONSE");
    }

    return { content, raw: json };
  }

  if (input.provider === "gemini") {
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    const parts: Array<Record<string, unknown>> = [{ text: `${input.systemPrompt}\n\n${input.userText}` }];

    if (input.imageDataUrl) {
      const { mediaType, base64 } = parseDataUrl(input.imageDataUrl);
      parts.push({
        inlineData: {
          mimeType: mediaType,
          data: base64,
        },
      });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(input.model)}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts }],
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
        },
      }),
    });

    if (!res.ok) {
      const body = await readErrorBody(res);
      const err = new Error(`GEMINI_ERROR_${res.status}`);
      (err as any).status = res.status;
      (err as any).body = body;
      (err as any).kind = isRateLimitStatus(res.status)
        ? "rate_limit"
        : isBillingStatus(res.status)
          ? "billing"
          : "provider";
      throw err;
    }

    const json = await res.json();
    const content = json?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text).filter(Boolean).join("\n");
    if (!content || typeof content !== "string") {
      throw new Error("GEMINI_EMPTY_RESPONSE");
    }

    return { content, raw: json };
  }

  // anthropic
  const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
  if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is not configured");

  const contentBlocks: Array<Record<string, unknown>> = [{ type: "text", text: input.userText }];
  if (input.imageDataUrl) {
    const { mediaType, base64 } = parseDataUrl(input.imageDataUrl);
    contentBlocks.push({
      type: "image",
      source: {
        type: "base64",
        media_type: mediaType,
        data: base64,
      },
    });
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: input.model,
      max_tokens: maxTokens,
      temperature,
      system: input.systemPrompt,
      messages: [{ role: "user", content: contentBlocks }],
    }),
  });

  if (!res.ok) {
    const body = await readErrorBody(res);
    const err = new Error(`ANTHROPIC_ERROR_${res.status}`);
    (err as any).status = res.status;
    (err as any).body = body;
    (err as any).kind = isRateLimitStatus(res.status)
      ? "rate_limit"
      : isBillingStatus(res.status)
        ? "billing"
        : "provider";
    throw err;
  }

  const json = await res.json();
  const textBlocks = Array.isArray(json?.content) ? json.content : [];
  const content = textBlocks
    .filter((b: any) => b?.type === "text")
    .map((b: any) => b?.text)
    .filter((t: any) => typeof t === "string")
    .join("\n");

  if (!content) {
    throw new Error("ANTHROPIC_EMPTY_RESPONSE");
  }

  return { content, raw: json };
}

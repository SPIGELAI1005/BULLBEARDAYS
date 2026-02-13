// Shared provider metadata for UI labels and fallback ordering.

export type UiProviderKey = "gemini" | "gpt" | "claude";

export interface ProviderMeta {
  id: UiProviderKey;
  label: string;
  speed: "fast" | "balanced" | "quality";
  notes: string;
}

export const PROVIDERS: ProviderMeta[] = [
  { id: "gemini", label: "Gemini", speed: "fast", notes: "Good speed/cost; strong multimodal." },
  { id: "gpt", label: "OpenAI", speed: "balanced", notes: "Strong general reasoning and vision." },
  { id: "claude", label: "Claude", speed: "quality", notes: "Great writing/nuance; excellent analysis." },
];

export function providerLabel(id: string): string {
  return PROVIDERS.find((p) => p.id === id)?.label ?? id;
}

export function defaultFallbackOrder(selectedModels: string[], referenceModel: string): string[] {
  const unique = Array.from(new Set(selectedModels));
  const rest = unique.filter((m) => m !== referenceModel);
  return [referenceModel, ...rest];
}

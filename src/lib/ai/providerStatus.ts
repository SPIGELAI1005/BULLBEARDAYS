import type { ProviderErrorCode } from "@/lib/ai/providerErrors";

const KEY = "bbd:provider-status:v1";

export interface ProviderStatusItem {
  providerKey: string;
  code: ProviderErrorCode | "OK";
  message?: string;
  at: number;
}

export function setProviderStatus(item: ProviderStatusItem): void {
  try {
    const raw = localStorage.getItem(KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, ProviderStatusItem>) : {};
    map[item.providerKey] = item;
    localStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

export function getProviderStatusMap(): Record<string, ProviderStatusItem> {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Record<string, ProviderStatusItem>) : {};
  } catch {
    return {};
  }
}

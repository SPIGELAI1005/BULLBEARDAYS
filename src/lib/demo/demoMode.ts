const KEY = "bbd:demo-mode:v1";

export function isDemoModeEnabled(): boolean {
  // Build-time flag still supported
  if ((import.meta as any).env?.VITE_DEMO_MODE === "true") return true;

  try {
    return localStorage.getItem(KEY) === "true";
  } catch {
    return false;
  }
}

export function setDemoModeEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(KEY, enabled ? "true" : "false");
  } catch {
    // ignore
  }
}

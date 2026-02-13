import { useCallback, useEffect, useState } from "react";
import { isDemoModeEnabled, setDemoModeEnabled } from "@/lib/demo/demoMode";

export function useDemoMode(): {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  toggle: () => void;
} {
  const [enabled, setEnabledState] = useState(false);

  useEffect(() => {
    setEnabledState(isDemoModeEnabled());
  }, []);

  const setEnabled = useCallback((next: boolean) => {
    setDemoModeEnabled(next);
    setEnabledState(next);
  }, []);

  const toggle = useCallback(() => {
    setEnabled(!enabled);
  }, [enabled, setEnabled]);

  return { enabled, setEnabled, toggle };
}

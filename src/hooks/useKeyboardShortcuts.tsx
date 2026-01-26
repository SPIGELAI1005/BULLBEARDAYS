import { useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface ShortcutActions {
  onUpload?: () => void;
  onAnalyze?: () => void;
  onExport?: () => void;
  onToggleTheme?: () => void;
}

export const useKeyboardShortcuts = (actions: ShortcutActions, enabled: boolean = true) => {
  const { toast } = useToast();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;
    
    // Don't trigger shortcuts when typing in inputs
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    const key = e.key.toLowerCase();
    const ctrl = e.ctrlKey || e.metaKey;

    if (ctrl && key === "u") {
      e.preventDefault();
      actions.onUpload?.();
      toast({ title: "Upload", description: "Opening file picker..." });
    } else if (ctrl && key === "enter") {
      e.preventDefault();
      actions.onAnalyze?.();
    } else if (ctrl && key === "e") {
      e.preventDefault();
      actions.onExport?.();
    } else if (ctrl && key === "d") {
      e.preventDefault();
      actions.onToggleTheme?.();
    } else if (key === "?") {
      e.preventDefault();
      toast({
        title: "Keyboard Shortcuts",
        description: "Ctrl+U: Upload • Ctrl+Enter: Analyze • Ctrl+E: Export • Ctrl+D: Theme",
      });
    }
  }, [enabled, actions, toast]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
};

export const SHORTCUTS = [
  { keys: ["Ctrl", "U"], action: "Upload chart" },
  { keys: ["Ctrl", "Enter"], action: "Analyze chart" },
  { keys: ["Ctrl", "E"], action: "Export data" },
  { keys: ["Ctrl", "D"], action: "Toggle theme" },
  { keys: ["?"], action: "Show shortcuts" },
];
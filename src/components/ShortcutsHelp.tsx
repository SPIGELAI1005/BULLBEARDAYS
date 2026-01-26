import { Keyboard } from "lucide-react";
import { SHORTCUTS } from "@/hooks/useKeyboardShortcuts";

interface ShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShortcutsHelp = ({ isOpen, onClose }: ShortcutsHelpProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative glass-panel w-full max-w-sm mx-4 p-6 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Keyboard Shortcuts</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-muted/50 text-muted-foreground"
          >
            ×
          </button>
        </div>

        <div className="space-y-3">
          {SHORTCUTS.map((shortcut, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{shortcut.action}</span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, j) => (
                  <span key={j}>
                    <kbd className="px-2 py-1 text-xs font-mono rounded bg-muted border border-border">
                      {key}
                    </kbd>
                    {j < shortcut.keys.length - 1 && (
                      <span className="mx-1 text-muted-foreground">+</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 text-xs text-muted-foreground text-center">
          Press <kbd className="px-1.5 py-0.5 text-xs font-mono rounded bg-muted border border-border">?</kbd> anytime to show this help
        </p>
      </div>
    </div>
  );
};

export default ShortcutsHelp;
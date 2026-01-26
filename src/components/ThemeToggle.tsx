import { useState, useRef, useEffect } from "react";
import { Sun, Moon, Monitor, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

const ThemeToggle = () => {
  const { theme, accent, setTheme, setAccent } = useTheme();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close on click outside or Escape key
  useEffect(() => {
    if (!showMenu) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setShowMenu(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowMenu(false);
      }
    };

    // Delay to prevent immediate close on the same click that opens
    const timer = setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showMenu]);

  const themeOptions = [
    { value: "light" as const, icon: Sun, label: "Light" },
    { value: "dark" as const, icon: Moon, label: "Dark" },
    { value: "system" as const, icon: Monitor, label: "System" },
  ];

  const accentOptions = [
    { value: "neutral" as const, icon: Minus, label: "Neutral", color: "text-muted-foreground" },
    { value: "bull" as const, icon: TrendingUp, label: "Bull Mode", color: "text-bullish" },
    { value: "bear" as const, icon: TrendingDown, label: "Bear Mode", color: "text-bearish" },
  ];

  const currentThemeIcon = themeOptions.find(t => t.value === theme)?.icon || Monitor;
  const CurrentIcon = currentThemeIcon;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setShowMenu(!showMenu)}
        className="p-2 rounded-xl hover:bg-muted/50 transition-colors"
        aria-label="Theme settings"
        aria-expanded={showMenu}
        aria-haspopup="true"
      >
        <CurrentIcon className="w-5 h-5 text-muted-foreground" />
      </button>

      {showMenu && (
        <div 
          ref={menuRef}
          className="absolute right-0 top-12 z-50 w-56 rounded-xl bg-card border border-border shadow-xl py-2 glass-panel"
        >
          {/* Theme Section */}
          <div className="px-4 py-2 border-b border-border">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Theme
            </div>
            <div className="flex gap-1">
              {themeOptions.map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                    theme === value
                      ? "bg-primary/20 text-primary"
                      : "hover:bg-muted/50 text-muted-foreground"
                  }`}
                  title={label}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[10px]">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Accent Section */}
          <div className="px-4 py-2">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Market Mode
            </div>
            <div className="space-y-1">
              {accentOptions.map(({ value, icon: Icon, label, color }) => (
                <button
                  key={value}
                  onClick={() => setAccent(value)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    accent === value
                      ? "bg-primary/20"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${color}`} />
                  <span className={`text-sm ${accent === value ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                    {label}
                  </span>
                  {accent === value && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeToggle;

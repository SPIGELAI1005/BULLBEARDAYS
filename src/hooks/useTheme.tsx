import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { useAuth } from "./useAuth";

type Theme = "light" | "dark" | "system";
type Accent = "neutral" | "bull" | "bear";

const THEMES: Theme[] = ["light", "dark", "system"];
const ACCENTS: Accent[] = ["neutral", "bull", "bear"];

function isValidTheme(v: unknown): v is Theme {
  return typeof v === "string" && THEMES.includes(v as Theme);
}

function isValidAccent(v: unknown): v is Accent {
  return typeof v === "string" && ACCENTS.includes(v as Accent);
}

interface ThemeContextType {
  theme: Theme;
  accent: Accent;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  setAccent: (accent: Accent) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function resolveTheme(theme: Theme): "light" | "dark" {
  return theme === "system" ? getSystemTheme() : theme;
}

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const { user, profile, updateProfile } = useAuth();

  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "system";
    const stored = localStorage.getItem("theme");
    return isValidTheme(stored) ? stored : "system";
  });

  const [accent, setAccentState] = useState<Accent>(() => {
    if (typeof window === "undefined") return "neutral";
    const stored = localStorage.getItem("accent");
    return isValidAccent(stored) ? stored : "neutral";
  });

  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(() =>
    resolveTheme(theme)
  );

  // Sync with profile when user logs in (only use valid values)
  useEffect(() => {
    if (!profile) return;
    if (isValidTheme(profile.theme_preference)) {
      setThemeState(profile.theme_preference);
      localStorage.setItem("theme", profile.theme_preference);
    }
    if (isValidAccent(profile.accent_preference)) {
      setAccentState(profile.accent_preference);
      localStorage.setItem("accent", profile.accent_preference);
    }
  }, [profile]);

  // Update resolved theme when theme changes
  useEffect(() => {
    setResolvedTheme(resolveTheme(theme));
  }, [theme]);

  // Listen for system theme changes when using "system"
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => setResolvedTheme(getSystemTheme());
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, [theme]);

  // Apply theme classes and color-scheme to document
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark", "accent-neutral", "accent-bull", "accent-bear");
    root.classList.add(resolvedTheme);
    root.classList.add(`accent-${accent}`);
    root.style.colorScheme = resolvedTheme;
  }, [resolvedTheme, accent]);

  const setTheme = useCallback(
    async (newTheme: Theme) => {
      if (!isValidTheme(newTheme)) return;
      setThemeState(newTheme);
      localStorage.setItem("theme", newTheme);
      if (user && profile) {
        try {
          await updateProfile({ theme_preference: newTheme });
        } catch (e) {
          console.error("Failed to save theme preference:", e);
        }
      }
    },
    [user, profile, updateProfile]
  );

  const setAccent = useCallback(
    async (newAccent: Accent) => {
      if (!isValidAccent(newAccent)) return;
      setAccentState(newAccent);
      localStorage.setItem("accent", newAccent);
      if (user && profile) {
        try {
          await updateProfile({ accent_preference: newAccent });
        } catch (e) {
          console.error("Failed to save accent preference:", e);
        }
      }
    },
    [user, profile, updateProfile]
  );

  const toggleTheme = useCallback(() => {
    const i = THEMES.indexOf(theme);
    setTheme(THEMES[(i + 1) % THEMES.length]);
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, accent, resolvedTheme, setTheme, setAccent, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

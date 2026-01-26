import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "./useAuth";

type Theme = "light" | "dark" | "system";
type Accent = "neutral" | "bull" | "bear";

interface ThemeContextType {
  theme: Theme;
  accent: Accent;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  setAccent: (accent: Accent) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const getSystemTheme = (): "light" | "dark" => {
  if (typeof window !== "undefined") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return "dark";
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const { user, profile, updateProfile } = useAuth();
  
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme") as Theme;
      return stored || "system";
    }
    return "system";
  });

  const [accent, setAccentState] = useState<Accent>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("accent") as Accent;
      return stored || "neutral";
    }
    return "neutral";
  });

  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(
    theme === "system" ? getSystemTheme() : theme
  );

  // Sync with profile when user logs in
  useEffect(() => {
    if (profile) {
      if (profile.theme_preference) {
        setThemeState(profile.theme_preference as Theme);
        localStorage.setItem("theme", profile.theme_preference);
      }
      if (profile.accent_preference) {
        setAccentState(profile.accent_preference as Accent);
        localStorage.setItem("accent", profile.accent_preference);
      }
    }
  }, [profile]);

  // Update resolved theme when theme changes
  useEffect(() => {
    const resolved = theme === "system" ? getSystemTheme() : theme;
    setResolvedTheme(resolved);
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        setResolvedTheme(getSystemTheme());
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  // Apply theme classes to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove all theme classes
    root.classList.remove("light", "dark", "accent-neutral", "accent-bull", "accent-bear");
    
    // Add current theme
    root.classList.add(resolvedTheme);
    root.classList.add(`accent-${accent}`);
  }, [resolvedTheme, accent]);

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);
    
    if (user && profile) {
      try {
        await updateProfile({ theme_preference: newTheme } as any);
      } catch (error) {
        console.error("Failed to save theme preference:", error);
      }
    }
  };

  const setAccent = async (newAccent: Accent) => {
    setAccentState(newAccent);
    localStorage.setItem("accent", newAccent);
    
    if (user && profile) {
      try {
        await updateProfile({ accent_preference: newAccent } as any);
      } catch (error) {
        console.error("Failed to save accent preference:", error);
      }
    }
  };

  const toggleTheme = () => {
    const themes: Theme[] = ["light", "dark", "system"];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);
  };

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

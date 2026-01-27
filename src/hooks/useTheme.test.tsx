import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { ThemeProvider, useTheme } from "./useTheme";

vi.mock("./useAuth", () => ({
  useAuth: () => ({
    user: null,
    profile: null,
    updateProfile: vi.fn().mockResolvedValue(undefined),
  }),
}));

describe("useTheme", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset document classes
    document.documentElement.className = "";
  });

  it("should provide theme context", () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    expect(result.current).toBeDefined();
    expect(result.current.theme).toBeDefined();
    expect(result.current.accent).toBeDefined();
  });

  it("should have default theme values", () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    // Default should be 'dark' based on typical setup
    expect(result.current.theme).toMatch(/light|dark|system/);
    expect(result.current.accent).toMatch(/neutral|bull|bear/);
  });

  it("should toggle theme", () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    const initialTheme = result.current.theme;

    act(() => {
      result.current.toggleTheme();
    });

    // Theme should have changed
    expect(result.current.theme).not.toBe(initialTheme);
  });

  it("should set specific theme", () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    act(() => {
      result.current.setTheme("light");
    });

    expect(result.current.theme).toBe("light");

    act(() => {
      result.current.setTheme("dark");
    });

    expect(result.current.theme).toBe("dark");
  });

  it("should set accent theme", () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    act(() => {
      result.current.setAccent("bull");
    });

    expect(result.current.accent).toBe("bull");

    act(() => {
      result.current.setAccent("bear");
    });

    expect(result.current.accent).toBe("bear");

    act(() => {
      result.current.setAccent("neutral");
    });

    expect(result.current.accent).toBe("neutral");
  });

  it("should persist theme to localStorage", () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    act(() => {
      result.current.setTheme("light");
    });

    // Check if theme is saved to localStorage
    const savedTheme = localStorage.getItem("theme");
    expect(savedTheme).toBe("light");
  });

  it("should persist accent theme to localStorage", () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    act(() => {
      result.current.setAccent("bull");
    });

    // Check if accent theme is saved to localStorage
    const savedAccent = localStorage.getItem("accent");
    expect(savedAccent).toBe("bull");
  });
});

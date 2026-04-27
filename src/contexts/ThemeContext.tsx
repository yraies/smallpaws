"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

export type ThemeId = "spring" | "summer" | "autumn" | "winter";
export type AnswerSemantic =
  | "must"
  | "like"
  | "neutral"
  | "maybe"
  | "dislike"
  | "misc";

type ChipColor = { bg: string; text: string };
type ChipColors = Record<AnswerSemantic | "muted", ChipColor>;

export const THEME_LABELS: Record<ThemeId, string> = {
  spring: "Spring",
  summer: "Summer",
  autumn: "Autumn",
  winter: "Winter",
};

/** Swatch colors representing each season for the selector UI. */
export const THEME_SWATCHES: Record<ThemeId, string> = {
  spring: "#b7d38b",
  summer: "#56b6c2",
  autumn: "#d5a45b",
  winter: "#8faabe",
};

const THEME_CHIPS: Record<ThemeId, ChipColors> = {
  spring: {
    must: { bg: "#7b3da0", text: "#faf5ff" },
    like: { bg: "#9a73bb", text: "#fffdf7" },
    neutral: { bg: "#7da889", text: "#f5fdf8" },
    maybe: { bg: "#ecd06f", text: "#4f430d" },
    dislike: { bg: "#c24040", text: "#fff5f5" },
    misc: { bg: "#73a8b5", text: "#f5fbfd" },
    muted: { bg: "#c9c2ab", text: "#49463b" },
  },
  summer: {
    must: { bg: "#1a5fa0", text: "#f0f8ff" },
    like: { bg: "#2f82c5", text: "#f7fcff" },
    neutral: { bg: "#78b89a", text: "#f5fdf8" },
    maybe: { bg: "#f0c34c", text: "#503b08" },
    dislike: { bg: "#e07d57", text: "#fff8f5" },
    misc: { bg: "#45b9c9", text: "#f4fdff" },
    muted: { bg: "#dfc9a3", text: "#5c492d" },
  },
  autumn: {
    must: { bg: "#6e3350", text: "#fff5fb" },
    like: { bg: "#8a5b78", text: "#fff8fb" },
    neutral: { bg: "#8a9265", text: "#f8f9f5" },
    maybe: { bg: "#d7a456", text: "#4f3407" },
    dislike: { bg: "#b46351", text: "#fff7f4" },
    misc: { bg: "#7d7bb0", text: "#f7f7ff" },
    muted: { bg: "#ccb79b", text: "#564431" },
  },
  winter: {
    must: { bg: "#4a6a96", text: "#f0f5fc" },
    like: { bg: "#7694ba", text: "#f5f8fc" },
    neutral: { bg: "#a8a3c0", text: "#2e2b3d" },
    maybe: { bg: "#c4b88f", text: "#3d3520" },
    dislike: { bg: "#b88595", text: "#fdf6f8" },
    misc: { bg: "#9dc1d5", text: "#f5fafd" },
    muted: { bg: "#d5dce4", text: "#3d4c5a" },
  },
};

interface ThemeContextValue {
  themeId: ThemeId;
  setThemeId: (id: ThemeId) => void;
  chipColors: ChipColors;
  getChipColor: (semantic: AnswerSemantic | undefined) => ChipColor;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isValidThemeId(value: string): value is ThemeId {
  return ["spring", "summer", "autumn", "winter"].includes(value);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeIdState] = useState<ThemeId>("spring");

  useEffect(() => {
    const stored = localStorage.getItem("garden-walk-theme");
    if (stored && isValidThemeId(stored)) {
      setThemeIdState(stored);
      document.documentElement.setAttribute("data-theme", stored);
    }
  }, []);

  const setThemeId = (id: ThemeId) => {
    setThemeIdState(id);
    localStorage.setItem("garden-walk-theme", id);
    document.documentElement.setAttribute("data-theme", id);
  };

  const chipColors = THEME_CHIPS[themeId];

  const getChipColor = (semantic: AnswerSemantic | undefined): ChipColor => {
    if (!semantic) return chipColors.muted;
    return chipColors[semantic];
  };

  return (
    <ThemeContext.Provider
      value={{ themeId, setThemeId, chipColors, getChipColor }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

"use client";

import {
  THEME_LABELS,
  THEME_SWATCHES,
  type ThemeId,
  useTheme,
} from "../contexts/ThemeContext";

const THEME_IDS: ThemeId[] = ["spring", "summer", "autumn", "winter"];

export default function ThemeSelector() {
  const { themeId, setThemeId } = useTheme();

  return (
    <div
      className="mb-3 flex items-center justify-center gap-2"
      role="radiogroup"
      aria-label="Color theme"
    >
      {THEME_IDS.map((id) => (
        <button
          key={id}
          type="button"
          role="radio"
          aria-checked={themeId === id}
          aria-label={THEME_LABELS[id]}
          title={THEME_LABELS[id]}
          onClick={() => setThemeId(id)}
          className={`h-5 w-5 border-2 transition-transform ${
            themeId === id
              ? "scale-125 border-th-ink"
              : "border-transparent hover:scale-110"
          }`}
          style={{ backgroundColor: THEME_SWATCHES[id] }}
        />
      ))}
    </div>
  );
}

import {
  ArrowDownIcon,
  ArrowUpIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/16/solid";
import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import {
  type AnswerOption,
  type AnswerSemantic,
  DEFAULT_ANSWER_OPTIONS,
  getEffectiveAnswerOptions,
  PRESET_COLORS,
} from "../types/Form";
import IconButton from "./IconButton";
import { AVAILABLE_ICONS } from "./SelectionButton";

const SEMANTIC_TIERS: { key: AnswerSemantic; label: string }[] = [
  { key: "must", label: "Must" },
  { key: "like", label: "Like" },
  { key: "neutral", label: "Neutral" },
  { key: "maybe", label: "Maybe" },
  { key: "dislike", label: "Dislike" },
  { key: "misc", label: "Misc" },
];

interface AnswerSchemaEditorProps {
  answerOptions: AnswerOption[] | undefined;
  onChange: (options: AnswerOption[] | undefined) => void;
  disabled?: boolean;
}

/** Inline picker for semantic tier / color presets + free color + icon selection. */
function ColorIconPicker({
  option,
  onColorChange,
  onIconChange,
  onSemanticChange,
}: {
  option: AnswerOption;
  onColorChange: (color: string) => void;
  onIconChange: (icon: string) => void;
  onSemanticChange: (semantic: AnswerSemantic | undefined) => void;
}) {
  const { getChipColor } = useTheme();
  const hasSemantic = !!option.semantic;

  // Resolve the displayed color: theme-derived when semantic is set, raw color otherwise
  const displayColor = hasSemantic
    ? getChipColor(option.semantic).bg
    : option.color;

  return (
    <div className="flex flex-col gap-2 border-t border-th-line bg-th-paper px-2 pt-2 pb-2">
      {/* Semantic tier picker */}
      <div className="flex flex-wrap items-center gap-1">
        <span className="mr-1 text-xs text-th-ink-muted">Tier:</span>
        {SEMANTIC_TIERS.map((tier) => {
          const tierColor = getChipColor(tier.key);
          const isActive = option.semantic === tier.key;
          return (
            <button
              key={tier.key}
              type="button"
              className={`flex items-center gap-1 rounded-sm border px-1.5 py-0.5 text-xs ${
                isActive
                  ? "border-th-primary ring-1 ring-th-primary"
                  : "border-th-line hover:bg-th-paper-soft"
              }`}
              onClick={() => onSemanticChange(tier.key)}
              title={`Theme-aware "${tier.label}" color`}
              aria-label={`Set tier to ${tier.label}`}
              aria-pressed={isActive}
            >
              <span
                className="inline-block h-3 w-3 rounded-sm"
                style={{ backgroundColor: tierColor.bg }}
                aria-hidden="true"
              />
              {tier.label}
            </button>
          );
        })}
        <button
          type="button"
          className={`rounded-sm border px-1.5 py-0.5 text-xs ${
            !hasSemantic
              ? "border-th-primary ring-1 ring-th-primary"
              : "border-th-line hover:bg-th-paper-soft"
          }`}
          onClick={() => onSemanticChange(undefined)}
          title="Use a fixed custom color instead of a theme tier"
          aria-label="Set to custom color"
          aria-pressed={!hasSemantic}
        >
          Custom
        </button>
      </div>
      {/* Color presets — only shown when no semantic tier is selected */}
      {!hasSemantic && (
        <div className="flex flex-wrap items-center gap-1">
          <span className="mr-1 text-xs text-th-ink-muted">Color:</span>
          {PRESET_COLORS.map((preset) => (
            <button
              key={preset.hex}
              type="button"
              className={`h-5 w-5 rounded-sm border ${
                option.color.toLowerCase() === preset.hex.toLowerCase()
                  ? "border-th-primary ring-1 ring-th-primary"
                  : "border-th-line"
              }`}
              style={{ backgroundColor: preset.hex }}
              onClick={() => onColorChange(preset.hex)}
              title={preset.name}
              aria-label={`Set color to ${preset.name}`}
            />
          ))}
          <label
            className="flex items-center gap-1 text-xs text-th-ink-muted"
            title="Custom color"
          >
            <input
              type="color"
              value={option.color}
              onChange={(e) => onColorChange(e.target.value)}
              className="h-5 w-5 cursor-pointer border-none bg-transparent p-0"
              aria-label="Custom color"
            />
          </label>
        </div>
      )}
      {/* Icon picker */}
      <div className="flex flex-wrap items-center gap-1">
        <span className="mr-1 text-xs text-th-ink-muted">Icon:</span>
        {AVAILABLE_ICONS.map(({ key, label, Icon }) => (
          <button
            key={key}
            type="button"
            className={`flex h-6 w-6 items-center justify-center rounded-sm border ${
              (option.icon ?? "") === key || (!option.icon && key === "empty")
                ? "border-th-primary bg-th-paper-soft ring-1 ring-th-primary"
                : "border-th-line hover:bg-th-paper-soft"
            }`}
            onClick={() => onIconChange(key)}
            title={label}
            aria-label={`Set icon to ${label}`}
          >
            <Icon
              className="h-4 w-4"
              style={{ color: displayColor }}
              aria-hidden="true"
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function AnswerSchemaEditor({
  answerOptions,
  onChange,
  disabled = false,
}: AnswerSchemaEditorProps) {
  const { getChipColor } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  /** Index of the option row whose color/icon picker is open, or null. */
  const [pickerOpenIndex, setPickerOpenIndex] = useState<number | null>(null);
  const effectiveOptions = getEffectiveAnswerOptions(answerOptions);
  const isCustom = answerOptions !== undefined && answerOptions.length > 0;

  const enableCustom = () => {
    onChange([...DEFAULT_ANSWER_OPTIONS]);
    setIsExpanded(true);
  };

  const resetToDefaults = () => {
    onChange(undefined);
    setPickerOpenIndex(null);
  };

  const updateOption = (
    index: number,
    field: keyof AnswerOption,
    value: string | undefined,
  ) => {
    const updated = effectiveOptions.map((o, i) =>
      i === index ? { ...o, [field]: value } : o,
    );
    // Auto-sync key from label when adding new options (only for non-default keys)
    if (
      field === "label" &&
      typeof value === "string" &&
      !DEFAULT_ANSWER_OPTIONS.some(
        (d) => d.key === updated[index].key && d.label !== value,
      )
    ) {
      updated[index] = {
        ...updated[index],
        key: value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "_")
          .replace(/^_|_$/g, ""),
      };
    }
    onChange(updated);
  };

  const addOption = () => {
    // Insert before the last option (which is always "unset")
    const newOption: AnswerOption = {
      key: `opt_${Math.random().toString(36).slice(2, 8)}`,
      label: "",
      shortLabel: "",
      color: "#888888",
      icon: "empty",
      semantic: "misc",
    };
    const updated = [...effectiveOptions];
    updated.splice(updated.length - 1, 0, newOption);
    onChange(updated);
  };

  const removeOption = (index: number) => {
    if (effectiveOptions.length <= 2) return; // Must keep at least one option + unset
    const updated = effectiveOptions.filter((_, i) => i !== index);
    if (pickerOpenIndex === index) setPickerOpenIndex(null);
    onChange(updated);
  };

  const moveOption = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    // Cannot move the last item (unset) or move into the last position
    if (newIndex < 0 || newIndex >= effectiveOptions.length - 1) return;
    if (index === effectiveOptions.length - 1) return;
    const updated = [...effectiveOptions];
    const temp = updated[newIndex];
    updated[newIndex] = updated[index];
    updated[index] = temp;
    // Follow the picker if its row moved
    if (pickerOpenIndex === index) setPickerOpenIndex(newIndex);
    else if (pickerOpenIndex === newIndex) setPickerOpenIndex(index);
    onChange(updated);
  };

  /** Resolves the displayed swatch color for an option row. */
  const getSwatchColor = (option: AnswerOption, isLast: boolean): string => {
    if (option.semantic) return getChipColor(option.semantic).bg;
    if (isLast) return getChipColor(undefined).bg;
    return option.color;
  };

  if (disabled) {
    return (
      <div className="document-sheet mb-2 border border-th-line bg-th-paper px-4 py-3">
        <p className="text-sm font-semibold text-th-ink-muted">
          Answer Options
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {effectiveOptions.map((option, index) => {
            const isLast = index === effectiveOptions.length - 1;
            return (
              <span
                key={option.key}
                className="inline-flex items-center gap-1 border border-th-line px-2 py-1 text-sm"
              >
                <span
                  className="inline-block h-3 w-3 rounded-sm"
                  style={{ backgroundColor: getSwatchColor(option, isLast) }}
                  aria-hidden="true"
                />
                {option.label}
              </span>
            );
          })}
        </div>
        {isCustom && (
          <p className="mt-1 text-xs text-th-ink-muted">
            Custom answer options are in use.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="document-sheet mb-2 border border-th-line bg-th-paper px-4 py-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="text-sm font-semibold text-th-ink-muted hover:text-th-ink"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          Answer Options {isCustom ? "(custom)" : "(default)"}{" "}
          {isExpanded ? "▾" : "▸"}
        </button>
        {!isCustom && !isExpanded && (
          <button
            type="button"
            className="text-xs text-th-info hover:text-th-info"
            onClick={enableCustom}
          >
            Customize
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="mt-3 space-y-2">
          {isCustom && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-th-ink-muted">
                The last option is always the default (unset) state. Drag or
                reorder the rest.
              </p>
              <button
                type="button"
                className="text-xs text-th-danger hover:text-th-danger"
                onClick={resetToDefaults}
              >
                Reset to defaults
              </button>
            </div>
          )}

          {!isCustom && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-th-ink-muted">
                Currently using the built-in answer options.
              </p>
              <button
                type="button"
                className="text-xs text-th-info hover:text-th-info"
                onClick={enableCustom}
              >
                Customize
              </button>
            </div>
          )}

          <div className="space-y-1">
            {effectiveOptions.map((option, index) => {
              const isLast = index === effectiveOptions.length - 1;
              const isPickerOpen = pickerOpenIndex === index;
              return (
                <div key={index} className="flex flex-col">
                  <div
                    className={`flex items-center gap-2 border border-th-line px-2 py-1 ${isLast ? "bg-th-paper-soft" : "bg-th-paper"}`}
                  >
                    {/* Color swatch — click to toggle picker */}
                    <button
                      type="button"
                      className={`h-6 w-6 shrink-0 rounded-sm border ${
                        isPickerOpen
                          ? "border-th-primary ring-1 ring-th-primary"
                          : "border-th-line"
                      }`}
                      style={{
                        backgroundColor: getSwatchColor(option, isLast),
                      }}
                      onClick={() =>
                        isCustom &&
                        setPickerOpenIndex(isPickerOpen ? null : index)
                      }
                      disabled={!isCustom}
                      aria-label={`Pick color and icon for ${option.label || "answer option"}`}
                      title="Pick color and icon"
                    />
                    <input
                      type="text"
                      value={option.label}
                      onChange={(e) =>
                        updateOption(index, "label", e.target.value)
                      }
                      placeholder="Label"
                      className="min-w-0 flex-1 border-b border-th-line bg-transparent px-1 py-0.5 text-sm focus:outline-none"
                      disabled={!isCustom}
                      aria-label="Answer label"
                    />
                    <input
                      type="text"
                      value={option.shortLabel}
                      onChange={(e) =>
                        updateOption(index, "shortLabel", e.target.value)
                      }
                      placeholder="Short"
                      className="w-16 border-b border-th-line bg-transparent px-1 py-0.5 text-sm focus:outline-none"
                      disabled={!isCustom}
                      aria-label="Short label"
                    />

                    {isCustom && !isLast && (
                      <div
                        className="flex items-center gap-0.5"
                        role="toolbar"
                        aria-label={`Actions for ${option.label || "answer option"}`}
                      >
                        <IconButton
                          onClick={() => moveOption(index, "up")}
                          disabled={index === 0}
                          title="Move up"
                          aria-label="Move up"
                        >
                          <ArrowUpIcon className="h-3 w-3" aria-hidden="true" />
                        </IconButton>
                        <IconButton
                          onClick={() => moveOption(index, "down")}
                          disabled={index >= effectiveOptions.length - 2}
                          title="Move down"
                          aria-label="Move down"
                        >
                          <ArrowDownIcon
                            className="h-3 w-3"
                            aria-hidden="true"
                          />
                        </IconButton>
                        <IconButton
                          onClick={() => removeOption(index)}
                          disabled={effectiveOptions.length <= 2}
                          title="Remove"
                          aria-label={`Remove ${option.label || "answer option"}`}
                        >
                          <TrashIcon className="h-3 w-3" aria-hidden="true" />
                        </IconButton>
                      </div>
                    )}

                    {isLast && (
                      <span className="text-xs italic text-th-ink-muted">
                        default
                      </span>
                    )}
                  </div>

                  {/* Inline semantic tier / color preset + icon picker */}
                  {isCustom && isPickerOpen && (
                    <ColorIconPicker
                      option={option}
                      onColorChange={(color) =>
                        updateOption(index, "color", color)
                      }
                      onIconChange={(icon) => updateOption(index, "icon", icon)}
                      onSemanticChange={(semantic) =>
                        updateOption(index, "semantic", semantic)
                      }
                    />
                  )}
                </div>
              );
            })}
          </div>

          {isCustom && (
            <button
              type="button"
              className="flex items-center gap-1 text-xs text-th-info hover:text-th-info"
              onClick={addOption}
            >
              <PlusIcon className="h-3 w-3" aria-hidden="true" />
              Add answer option
            </button>
          )}
        </div>
      )}
    </div>
  );
}

import {
  ArrowDownIcon,
  ArrowUpIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/16/solid";
import { useState } from "react";
import {
  type AnswerOption,
  DEFAULT_ANSWER_OPTIONS,
  getEffectiveAnswerOptions,
} from "../types/Form";
import IconButton from "./IconButton";

interface AnswerSchemaEditorProps {
  answerOptions: AnswerOption[] | undefined;
  onChange: (options: AnswerOption[] | undefined) => void;
  disabled?: boolean;
}

export default function AnswerSchemaEditor({
  answerOptions,
  onChange,
  disabled = false,
}: AnswerSchemaEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const effectiveOptions = getEffectiveAnswerOptions(answerOptions);
  const isCustom = answerOptions !== undefined && answerOptions.length > 0;

  const enableCustom = () => {
    onChange([...DEFAULT_ANSWER_OPTIONS]);
    setIsExpanded(true);
  };

  const resetToDefaults = () => {
    onChange(undefined);
  };

  const updateOption = (
    index: number,
    field: keyof AnswerOption,
    value: string,
  ) => {
    const updated = effectiveOptions.map((o, i) =>
      i === index ? { ...o, [field]: value } : o,
    );
    // Auto-sync key from label when adding new options (only for non-default keys)
    if (
      field === "label" &&
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
    };
    const updated = [...effectiveOptions];
    updated.splice(updated.length - 1, 0, newOption);
    onChange(updated);
  };

  const removeOption = (index: number) => {
    if (effectiveOptions.length <= 2) return; // Must keep at least one option + unset
    const updated = effectiveOptions.filter((_, i) => i !== index);
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
    onChange(updated);
  };

  if (disabled) {
    return (
      <div className="document-sheet mb-2 border border-sand-200 bg-sand-50 px-4 py-3">
        <p className="text-sm font-semibold text-lavender-700">
          Answer Options
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {effectiveOptions.map((option) => (
            <span
              key={option.key}
              className="inline-flex items-center gap-1 border border-sand-200 px-2 py-1 text-sm"
            >
              <span
                className="inline-block h-3 w-3 rounded-sm"
                style={{ backgroundColor: option.color }}
                aria-hidden="true"
              />
              {option.label}
            </span>
          ))}
        </div>
        {isCustom && (
          <p className="mt-1 text-xs text-lavender-500">
            Custom answer options are in use.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="document-sheet mb-2 border border-sand-200 bg-sand-50 px-4 py-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="text-sm font-semibold text-lavender-700 hover:text-lavender-900"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          Answer Options {isCustom ? "(custom)" : "(default)"}{" "}
          {isExpanded ? "▾" : "▸"}
        </button>
        {!isCustom && !isExpanded && (
          <button
            type="button"
            className="text-xs text-complement-700 hover:text-complement-900"
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
              <p className="text-xs text-lavender-500">
                The last option is always the default (unset) state. Drag or
                reorder the rest.
              </p>
              <button
                type="button"
                className="text-xs text-danger-700 hover:text-danger-900"
                onClick={resetToDefaults}
              >
                Reset to defaults
              </button>
            </div>
          )}

          {!isCustom && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-lavender-500">
                Currently using the built-in answer options.
              </p>
              <button
                type="button"
                className="text-xs text-complement-700 hover:text-complement-900"
                onClick={enableCustom}
              >
                Customize
              </button>
            </div>
          )}

          <div className="space-y-1">
            {effectiveOptions.map((option, index) => {
              const isLast = index === effectiveOptions.length - 1;
              return (
                <div
                  key={index}
                  className={`flex items-center gap-2 border border-sand-200 px-2 py-1 ${isLast ? "bg-sand-100" : "bg-sand-50"}`}
                >
                  <input
                    type="color"
                    value={option.color}
                    onChange={(e) =>
                      updateOption(index, "color", e.target.value)
                    }
                    className="h-6 w-6 cursor-pointer border-none bg-transparent p-0"
                    disabled={!isCustom}
                    aria-label={`Color for ${option.label || "answer option"}`}
                    title="Answer color"
                  />
                  <input
                    type="text"
                    value={option.label}
                    onChange={(e) =>
                      updateOption(index, "label", e.target.value)
                    }
                    placeholder="Label"
                    className="min-w-0 flex-1 border-b border-sand-200 bg-transparent px-1 py-0.5 text-sm focus:outline-none"
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
                    className="w-16 border-b border-sand-200 bg-transparent px-1 py-0.5 text-sm focus:outline-none"
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
                        <ArrowDownIcon className="h-3 w-3" aria-hidden="true" />
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
                    <span className="text-xs italic text-lavender-500">
                      default
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {isCustom && (
            <button
              type="button"
              className="flex items-center gap-1 text-xs text-complement-700 hover:text-complement-900"
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

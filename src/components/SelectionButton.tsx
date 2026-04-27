import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  HandThumbUpIcon,
  HeartIcon,
  MinusCircleIcon,
  QuestionMarkCircleIcon,
  StarIcon,
  XCircleIcon,
} from "@heroicons/react/16/solid";
import dynamic from "next/dynamic";
import type React from "react";
import { useDisplayPreferences } from "../contexts/DisplayPreferencesContext";
import { useTheme } from "../contexts/ThemeContext";
import {
  type AnswerOption,
  getEffectiveAnswerOptions,
  getUnsetKey,
} from "../types/Form";

/** A simple open circle for unset/unknown answer keys in icon mode. */
function EmptyCircleIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
      {...props}
    >
      <circle cx="10" cy="10" r="7" />
    </svg>
  );
}

type IconComponent = React.ComponentType<React.ComponentProps<"svg">>;

/**
 * Available icons for answer options. Each entry has a stable string key,
 * a display label, and the React icon component.
 * Exported so the AnswerSchemaEditor icon picker can reuse the same set.
 */
export const AVAILABLE_ICONS: {
  key: string;
  label: string;
  Icon: IconComponent;
}[] = [
  { key: "exclamation", label: "Exclamation", Icon: ExclamationCircleIcon },
  { key: "check", label: "Check", Icon: CheckCircleIcon },
  { key: "question", label: "Question", Icon: QuestionMarkCircleIcon },
  { key: "minus", label: "Minus", Icon: MinusCircleIcon },
  { key: "x", label: "Cross", Icon: XCircleIcon },
  { key: "heart", label: "Heart", Icon: HeartIcon },
  { key: "star", label: "Star", Icon: StarIcon },
  { key: "thumbsup", label: "Thumbs Up", Icon: HandThumbUpIcon },
  { key: "empty", label: "Empty", Icon: EmptyCircleIcon },
];

/** Icon registry keyed by icon identifier string. */
const ICON_MAP: Record<string, IconComponent> = Object.fromEntries(
  AVAILABLE_ICONS.map((i) => [i.key, i.Icon]),
);

/**
 * Legacy lookup: maps old built-in answer keys to icon identifiers
 * for backward compatibility with data that lacks an explicit `icon` field.
 */
const LEGACY_KEY_TO_ICON: Record<string, string> = {
  must: "exclamation",
  like: "check",
  open: "thumbsup",
  maybe: "question",
  off_limits: "minus",
  unset: "empty",
};

/**
 * Resolves the icon component for an answer option.
 * Prefers the explicit `icon` field; falls back to legacy key mapping; then EmptyCircleIcon.
 */
function getIconForOption(option: AnswerOption): IconComponent {
  if (option.icon && ICON_MAP[option.icon]) {
    return ICON_MAP[option.icon];
  }
  const legacyIcon = LEGACY_KEY_TO_ICON[option.key];
  if (legacyIcon && ICON_MAP[legacyIcon]) {
    return ICON_MAP[legacyIcon];
  }
  return EmptyCircleIcon;
}

interface SelectionButtonProps {
  selection: string;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
  answerOptions?: AnswerOption[];
}

const SelectionButtonComponent: React.FC<SelectionButtonProps> = ({
  selection,
  onClick,
  className = "",
  disabled = false,
  answerOptions,
}) => {
  const { showIcon } = useDisplayPreferences();
  const { getChipColor } = useTheme();
  const options = getEffectiveAnswerOptions(answerOptions);
  const unsetKey = getUnsetKey(answerOptions);

  const option =
    options.find((o) => o.key === selection) ?? options[options.length - 1];

  const Icon = getIconForOption(option);
  const isSelected = selection !== unsetKey;

  // Resolve colors: prefer theme-derived semantic colors, fall back to raw option.color
  const isUnset = selection === unsetKey;
  const chipColor = option.semantic
    ? getChipColor(option.semantic)
    : isUnset
      ? getChipColor(undefined)
      : null;
  const bgColor = chipColor ? chipColor.bg : option.color;
  const textColor = chipColor ? chipColor.text : "#ffffff";

  // Icon button rendering
  if (showIcon) {
    return (
      <button
        type="button"
        className={`selection-button group flex h-8 w-8 cursor-pointer items-center justify-center ${disabled ? "cursor-not-allowed" : ""}`}
        onClick={disabled ? undefined : onClick}
        title={option.label}
        disabled={disabled}
        aria-label={`Set response to ${option.label}`}
        aria-pressed={isSelected}
        data-selected={isSelected}
        data-label={option.shortLabel}
      >
        <Icon
          className={`${className}`}
          style={{ color: bgColor }}
          aria-hidden="true"
        />
      </button>
    );
  }

  // Text button rendering
  return (
    <button
      type="button"
      className={`selection-button h-8 w-16 cursor-pointer font-extrabold ${className} ${disabled ? "cursor-not-allowed" : ""}`}
      onClick={disabled ? undefined : onClick}
      title={option.label}
      disabled={disabled}
      aria-label={`Set response to ${option.label}`}
      aria-pressed={isSelected}
      data-selected={isSelected}
      data-label={option.shortLabel}
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {option.shortLabel}
    </button>
  );
};

// Create a client-side only version using dynamic import
const SelectionButton = dynamic(
  () => Promise.resolve(SelectionButtonComponent),
  {
    ssr: false,
    loading: () => <div className="h-10 w-10" />,
  },
);

export default SelectionButton;

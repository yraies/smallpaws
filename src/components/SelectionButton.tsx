import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  MinusCircleIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/16/solid";
import dynamic from "next/dynamic";
import type React from "react";
import { useDisplayPreferences } from "../contexts/DisplayPreferencesContext";
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

/** Icon lookup for the built-in default answer keys. Custom keys use EmptyCircleIcon. */
const DEFAULT_ICONS: Record<
  string,
  React.ComponentType<React.ComponentProps<"svg">>
> = {
  must: ExclamationCircleIcon,
  like: CheckCircleIcon,
  maybe: QuestionMarkCircleIcon,
  off_limits: MinusCircleIcon,
  unset: EmptyCircleIcon,
};

function getIconForKey(
  key: string,
): React.ComponentType<React.ComponentProps<"svg">> {
  return DEFAULT_ICONS[key] ?? EmptyCircleIcon;
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
  const options = getEffectiveAnswerOptions(answerOptions);
  const unsetKey = getUnsetKey(answerOptions);

  const option =
    options.find((o) => o.key === selection) ?? options[options.length - 1];

  const Icon = getIconForKey(option.key);
  const isSelected = selection !== unsetKey;

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
          style={{ color: option.color }}
          aria-hidden="true"
        />
      </button>
    );
  }

  // Text button rendering
  return (
    <button
      type="button"
      className={`selection-button h-8 w-16 cursor-pointer font-extrabold text-white ${className} ${disabled ? "cursor-not-allowed" : ""}`}
      onClick={disabled ? undefined : onClick}
      title={option.label}
      disabled={disabled}
      aria-label={`Set response to ${option.label}`}
      aria-pressed={isSelected}
      data-selected={isSelected}
      data-label={option.shortLabel}
      style={{ backgroundColor: option.color }}
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

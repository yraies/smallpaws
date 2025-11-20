import React from "react";
import dynamic from "next/dynamic";
import { Selection } from "../types/Form";
import {
  QuestionMarkCircleIcon,
  MinusCircleIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/16/solid";
import { StopIcon } from "@heroicons/react/24/outline";
import { useDisplayPreferences } from "../contexts/DisplayPreferencesContext";

// Define selection type configuration for better organization
type SelectionConfig = {
  Icon: React.ComponentType<React.ComponentProps<"svg">>;
  textColor: string;
  bgColor: string;
  text: string;
  shortText: string;
};

interface SelectionButtonProps {
  selection: Selection;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}

const SelectionButtonComponent: React.FC<SelectionButtonProps> = ({
  selection,
  onClick,
  className = "",
  disabled = false,
}) => {
  const { showIcon } = useDisplayPreferences();

  // Selection configuration map for easier maintenance
  const selectionConfig: Record<Selection, SelectionConfig> = {
    [Selection.MUST_HAVE]: {
      Icon: ExclamationCircleIcon,
      textColor: "text-green-500",
      bgColor: "bg-green-500",
      text: "Must Have",
      shortText: "Must",
    },
    [Selection.WOULD_LIKE]: {
      Icon: CheckCircleIcon,
      textColor: "text-blue-400",
      bgColor: "bg-blue-400",
      text: "Would Like",
      shortText: "Like",
    },
    [Selection.MAYBE]: {
      Icon: QuestionMarkCircleIcon,
      textColor: "text-amber-400",
      bgColor: "bg-amber-500",
      text: "Maybe",
      shortText: "Maybe",
    },
    [Selection.OFF_LIMITS]: {
      Icon: MinusCircleIcon,
      textColor: "text-red-400",
      bgColor: "bg-red-400",
      text: "Off Limits",
      shortText: "Limit",
    },
    [Selection.UNSET]: {
      Icon: StopIcon,
      textColor: "text-gray-400",
      bgColor: "bg-gray-400",
      text: "Unset",
      shortText: "Unset",
    },
  };

  const config = selectionConfig[selection];

  // Icon button rendering
  if (showIcon) {
    return (
      <button
        type="button"
        className={`group -m-2 flex h-12 w-12 cursor-pointer items-center justify-center selection-button ${disabled ? "cursor-not-allowed" : ""}`}
        onClick={disabled ? undefined : onClick}
        title={config.text}
        disabled={disabled}
        aria-label={`Set response to ${config.text}`}
        aria-pressed={selection !== Selection.UNSET}
        data-selected={selection !== Selection.UNSET}
        data-label={config.shortText}
      >
        <config.Icon
          className={`${className} ${config.textColor}`}
          aria-hidden="true"
        />
      </button>
    );
  }

  // Text button rendering
  return (
    <button
      type="button"
      className={`h-8 w-16 cursor-pointer font-extrabold text-white selection-button ${config.bgColor} ${className} ${disabled ? "cursor-not-allowed" : ""}`}
      onClick={disabled ? undefined : onClick}
      title={config.text}
      disabled={disabled}
      aria-label={`Set response to ${config.text}`}
      aria-pressed={selection !== Selection.UNSET}
      data-selected={selection !== Selection.UNSET}
      data-label={config.shortText}
    >
      {config.shortText}
    </button>
  );
};

// Create a client-side only version using dynamic import
const SelectionButton = dynamic(
  () => Promise.resolve(SelectionButtonComponent),
  {
    ssr: false,
    loading: () => <div>Loading...</div>,
  }
);

export default SelectionButton;

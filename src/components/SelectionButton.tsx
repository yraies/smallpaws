import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  MinusCircleIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/16/solid";
import { StopIcon } from "@heroicons/react/24/outline";
import dynamic from "next/dynamic";
import type React from "react";
import { useDisplayPreferences } from "../contexts/DisplayPreferencesContext";
import { Selection } from "../types/Form";

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
      textColor: "text-[#8d4f3f]",
      bgColor: "bg-[#8d4f3f]",
      text: "Must Have",
      shortText: "Must",
    },
    [Selection.WOULD_LIKE]: {
      Icon: CheckCircleIcon,
      textColor: "text-[#7c4f73]",
      bgColor: "bg-[#7c4f73]",
      text: "Would Like",
      shortText: "Like",
    },
    [Selection.MAYBE]: {
      Icon: QuestionMarkCircleIcon,
      textColor: "text-[#c69055]",
      bgColor: "bg-[#c69055]",
      text: "Maybe",
      shortText: "Maybe",
    },
    [Selection.OFF_LIMITS]: {
      Icon: MinusCircleIcon,
      textColor: "text-[#aa6c67]",
      bgColor: "bg-[#aa6c67]",
      text: "Off Limits",
      shortText: "Limit",
    },
    [Selection.UNSET]: {
      Icon: StopIcon,
      textColor: "text-[#b39a84]",
      bgColor: "bg-[#b39a84]",
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
        className={`selection-button group -m-2 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-[rgba(170,108,103,0.15)] bg-[rgba(255,253,248,0.9)] ${disabled ? "cursor-not-allowed" : ""}`}
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
      className={`selection-button h-9 w-16 cursor-pointer rounded-full font-extrabold text-white ${config.bgColor} ${className} ${disabled ? "cursor-not-allowed" : ""}`}
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
    loading: () => <div className="h-10 w-10" />,
  },
);

export default SelectionButton;

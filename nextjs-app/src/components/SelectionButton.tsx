import React from "react";
import dynamic from "next/dynamic";
import { Selection } from "../types/Form";
import {
  QuestionMarkCircleIcon,
  MinusCircleIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/16/solid";
import { useLocalStorage } from "@uidotdev/usehooks";
import { StopIcon } from "@heroicons/react/24/outline";

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
}

const SelectionButtonComponent: React.FC<SelectionButtonProps> = ({
  selection,
  onClick,
  className = "",
}) => {
  const [showIcon] = useLocalStorage("showIcons", false);

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
        className={`group -m-2 flex h-12 w-12 cursor-pointer items-center justify-center`}
        onClick={onClick}
        title={config.text}
      >
        <config.Icon className={`${className} ${config.textColor}`} />
      </button>
    );
  }

  // Text button rendering
  return (
    <button
      type="button"
      className={`h-8 w-16 cursor-pointer font-extrabold text-white ${config.bgColor} ${className}`}
      onClick={onClick}
      title={config.text}
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

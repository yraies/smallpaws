import type React from "react";

interface IconButtonProps {
  onClick: () => void;
  children: React.ReactElement;
  className?: string;
  disabled?: boolean;
  title?: string;
  "aria-label"?: string;
}

const IconButton: React.FC<IconButtonProps> = ({
  onClick,
  children,
  className,
  disabled = false,
  title,
  "aria-label": ariaLabel,
}) => {
  return (
    <button
      type="button"
      className={`tactile-button group flex h-8 w-8 cursor-pointer items-center justify-center ${disabled ? "cursor-not-allowed" : ""} ${className}`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
};

export default IconButton;

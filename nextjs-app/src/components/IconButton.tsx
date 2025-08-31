import React from "react";

interface IconButtonProps {
  onClick: () => void;
  children: React.ReactElement;
  className?: string;
  disabled?: boolean;
}

const IconButton: React.FC<IconButtonProps> = ({
  onClick,
  children,
  className,
  disabled = false,
}) => {
  return (
    <button
      type="button"
      className={`group flex h-8 w-8 cursor-pointer items-center justify-center ${disabled ? "cursor-not-allowed opacity-50" : ""} ${className}`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default IconButton;

import React from "react";

interface IconButtonProps {
  onClick: () => void;
  children: React.ReactElement;
  className?: string;
  disabled?: boolean;
  title?: string;
}

const IconButton: React.FC<IconButtonProps> = ({
  onClick,
  children,
  className,
  disabled = false,
  title,
}) => {
  return (
    <button
      type="button"
      className={`group flex h-8 w-8 cursor-pointer items-center justify-center ${disabled ? "cursor-not-allowed" : ""} ${className}`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </button>
  );
};

export default IconButton;

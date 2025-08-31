import React from "react";

interface IconButtonProps {
  onClick: () => void;
  children: React.ReactElement;
  className?: string;
}

const IconButton: React.FC<IconButtonProps> = ({
  onClick,
  children,
  className,
}) => {
  return (
    <button
      type="button"
      className={`group flex h-8 w-8 cursor-pointer items-center justify-center ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default IconButton;

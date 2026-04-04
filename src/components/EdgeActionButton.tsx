import type React from "react";

interface EdgeActionButtonProps {
  onClick: () => void;
  label: string;
  children: React.ReactElement;
  disabled?: boolean;
  title?: string;
  variant?: "default" | "success" | "info" | "danger";
  className?: string;
}

const variantClasses = {
  default: "border-violet-300 bg-white text-violet-800",
  success: "border-green-300 bg-white text-green-800",
  info: "border-blue-300 bg-white text-blue-800",
  danger: "border-red-300 bg-white text-red-800",
} as const;

export default function EdgeActionButton({
  onClick,
  label,
  children,
  disabled = false,
  title,
  variant = "default",
  className = "",
}: EdgeActionButtonProps) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      title={title ?? label}
      className={`flex items-center gap-2 border px-2 py-1 text-sm font-semibold shadow-sm ${variantClasses[variant]} ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:backdrop-brightness-95"} ${className}`}
    >
      <span className="flex h-6 w-6 items-center justify-center">
        {children}
      </span>
      <span>{label}</span>
    </button>
  );
}

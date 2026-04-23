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
  default: "border-lavender-300 bg-sand-50 text-lavender-900",
  success: "border-pistachio-500 bg-sand-50 text-pistachio-700",
  info: "border-complement-500 bg-sand-50 text-complement-700",
  danger: "border-danger-300 bg-sand-50 text-danger-700",
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
      <span
        className="flex h-6 w-6 items-center justify-center"
        aria-hidden="true"
      >
        {children}
      </span>
      <span>{label}</span>
    </button>
  );
}

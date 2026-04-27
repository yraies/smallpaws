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
  default: "border-th-line bg-th-paper text-th-ink",
  success: "border-th-success bg-th-paper text-th-success",
  info: "border-th-info bg-th-paper text-th-info",
  danger: "border-th-danger bg-th-paper text-th-danger",
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

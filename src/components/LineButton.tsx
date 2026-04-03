import type React from "react";

export function LineButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className="w-fill flex cursor-pointer flex-row items-center px-2 py-1 text-center hover:backdrop-brightness-90"
      onClick={() => onClick()}
    >
      {children}
    </button>
  );
}

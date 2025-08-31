import React from "react";

export function LineButton({
  onClick,
  children,
  role = "link",
}: {
  onClick: () => void;
  children: React.ReactNode;
  role?: React.AriaRole | undefined;
}) {
  return (
    <div
      role={role}
      className="w-fill flex cursor-pointer flex-row items-center px-2 py-1 text-center hover:backdrop-brightness-90"
      onClick={() => onClick()}
    >
      {children}
    </div>
  );
}

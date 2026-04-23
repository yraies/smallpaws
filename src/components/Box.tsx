import type React from "react";

interface BoxProps {
  title: string;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  children: React.ReactNode;
  buttons?: React.ReactNode;
  editableTitle?: boolean;
  className?: string;
  role?: string;
  "aria-label"?: string;
}

const Box: React.FC<BoxProps> = ({
  title,
  onTitleChange,
  editableTitle,
  children,
  buttons,
  className = "",
  role,
  "aria-label": ariaLabel,
}) => {
  return (
    // biome-ignore lint/a11y/useAriaPropsSupportedByRole: role is always a valid landmark (e.g. "region") when aria-label is provided
    <div
      className={`paper-panel flex w-full flex-col items-center gap-2 bg-[var(--accent-block)] p-2 text-white ${className}`}
      role={role}
      aria-label={ariaLabel}
    >
      <header className="flex h-8 w-full items-center justify-between gap-4 px-3">
        {editableTitle ? (
          <input
            type="text"
            className="small-caps min-w-20 shrink grow border-b-1 bg-transparent text-xl font-semibold tracking-widest focus:outline-none"
            value={title}
            onChange={onTitleChange}
            placeholder="Category"
            aria-label="Category name"
          />
        ) : (
          <h2 className="small-caps min-w-20 grow border-b-1 text-xl font-semibold tracking-widest">
            {title}
          </h2>
        )}
        {buttons && (
          <div className="flex" role="toolbar" aria-label="Category actions">
            {buttons}
          </div>
        )}
      </header>
      <div className="w-full bg-sand-50 p-1 text-lavender-900">{children}</div>
    </div>
  );
};

export default Box;

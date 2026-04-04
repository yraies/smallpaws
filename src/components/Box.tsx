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
      className={`paper-panel flex w-full flex-col items-center gap-3 p-3 text-[var(--ink)] ${className}`}
      role={role}
      aria-label={ariaLabel}
    >
      <header className="flex min-h-12 w-full items-center justify-between gap-4 rounded-[1.1rem] bg-[var(--paper-accent-soft)] px-4 py-2 text-[var(--ink)]">
        {editableTitle ? (
          <input
            type="text"
            className="small-caps min-w-20 shrink grow border-b border-[rgba(124,79,115,0.22)] bg-transparent text-lg font-semibold tracking-[0.18em] focus:outline-none"
            value={title}
            onChange={onTitleChange}
            placeholder="Category"
            aria-label="Category name"
          />
        ) : (
          <h2 className="small-caps min-w-20 grow border-b border-[rgba(124,79,115,0.22)] text-lg font-semibold tracking-[0.18em]">
            {title}
          </h2>
        )}
        {buttons && (
          <div className="flex" role="toolbar" aria-label="Category actions">
            {buttons}
          </div>
        )}
      </header>
      <div className="w-full rounded-[1.15rem] bg-[rgba(255,253,248,0.92)] p-2 text-[var(--ink)]">
        {children}
      </div>
    </div>
  );
};

export default Box;

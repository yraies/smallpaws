import { HomeIcon } from "@heroicons/react/16/solid";
import EncryptionStatus from "./EncryptionStatus";
import IconButton from "./IconButton";

interface FormHeaderProps {
  formName: string;
  isEncrypted: boolean;
  status: "draft" | "finalized" | "published" | "shared";
  onFormNameChange?: (name: string) => void;
  onHomeClick: () => void;
  readOnly?: boolean;
}

export default function FormHeader({
  formName,
  isEncrypted,
  status,
  onFormNameChange,
  onHomeClick,
  readOnly = false,
}: FormHeaderProps) {
  const statusConfig = {
    draft: {
      label: "Draft",
      className: "bg-[var(--paper-accent-soft)] text-[var(--paper-accent)]",
    },
    finalized: {
      label: "Finalized",
      className: "bg-[var(--plum-soft)] text-[var(--plum)]",
    },
    published: {
      label: "Published",
      className: "bg-[rgba(198,144,85,0.18)] text-[#8d5b2c]",
    },
    shared: {
      label: "Shared",
      className: "bg-[rgba(198,144,85,0.18)] text-[#8d5b2c]",
    },
  };

  const config = statusConfig[status];

  return (
    <header className="document-sheet relative mb-4 pt-12">
      <IconButton
        onClick={onHomeClick}
        className="absolute top-4 left-4"
        title="Home"
        aria-label="Go home"
      >
        <HomeIcon className="h-5 w-5 text-[var(--plum)] transition-transform group-hover:scale-90" />
      </IconButton>

      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <EncryptionStatus
            isEncrypted={isEncrypted}
            showText={false}
            className="h-4 w-4"
          />
          <span
            id="form-status-badge"
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${config.className}`}
          >
            {config.label}
          </span>
        </div>
        {readOnly ? (
          <h2
            id="form-name"
            className="max-w-full border-b border-[rgba(124,79,115,0.18)] px-4 pb-2 text-center text-3xl font-semibold text-[var(--ink)]"
          >
            {formName}
          </h2>
        ) : (
          <input
            id="form-name"
            type="text"
            title="Title"
            className="min-w-[14rem] max-w-full border-b border-[rgba(124,79,115,0.18)] bg-transparent px-4 pb-2 text-center text-3xl font-semibold text-[var(--ink)] focus:outline-none"
            value={formName}
            onChange={(e) => onFormNameChange?.(e.target.value)}
            placeholder="Title"
            disabled={readOnly}
            name="form-name"
          />
        )}
        <p className="max-w-2xl text-sm ink-muted">
          Keep the document itself in focus. Navigation and utilities stay near
          the edges while the template or form remains centered.
        </p>
      </div>
    </header>
  );
}

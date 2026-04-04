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
      className: "bg-orange-100 text-orange-700",
    },
    finalized: {
      label: "Finalized",
      className: "bg-violet-100 text-violet-700",
    },
    published: {
      label: "Published",
      className: "bg-green-100 text-green-700",
    },
    shared: {
      label: "Shared",
      className: "bg-blue-100 text-blue-700",
    },
  };

  const config = statusConfig[status];

  return (
    <div className="document-sheet relative mb-4">
      <IconButton
        onClick={onHomeClick}
        className="absolute top-2 left-2"
        title="Home"
        aria-label="Go home"
      >
        <HomeIcon className="h-6 w-6 transition-transform group-hover:scale-90 group-hover:text-violet-400" />
      </IconButton>

      <div className="mb-4 flex items-center justify-center gap-2 text-center">
        {readOnly ? (
          <div
            id="form-name"
            className="max-w-full border-b-1 bg-transparent text-center text-2xl"
          >
            {formName}
          </div>
        ) : (
          <input
            id="form-name"
            type="text"
            title="Title"
            className="w-fit max-w-full border-b-1 bg-transparent text-center text-2xl focus:outline-none"
            value={formName}
            onChange={(e) => onFormNameChange?.(e.target.value)}
            placeholder="Title"
            disabled={readOnly}
            name="form-name"
          />
        )}
        <EncryptionStatus isEncrypted={isEncrypted} showText={false} />
        <span
          id="form-status-badge"
          className={`px-2 py-1 text-sm font-semibold ${config.className}`}
        >
          {config.label}
        </span>
      </div>
    </div>
  );
}

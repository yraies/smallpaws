import React from "react";
import { HomeIcon } from "@heroicons/react/16/solid";
import IconButton from "./IconButton";
import EncryptionStatus from "./EncryptionStatus";

interface FormHeaderProps {
  formName: string;
  isEncrypted: boolean;
  status: "draft" | "published" | "shared";
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
      className: "text-orange-600 bg-orange-100",
    },
    published: {
      label: "Published",
      className: "text-green-600 bg-green-100",
    },
    shared: {
      label: "Shared",
      className: "text-blue-600 bg-blue-100",
    },
  };

  const config = statusConfig[status];

  return (
    <>
      {/* Home Button */}
      <IconButton onClick={onHomeClick} className="absolute top-2 left-2">
        <HomeIcon className="h-6 w-6 transition-transform group-hover:scale-90 group-hover:text-violet-400" />
      </IconButton>

      {/* Form Title with Encryption Status */}
      <div className="mb-4 flex items-center gap-2">
        {readOnly ? (
          <div
            id="form-name"
            className="w-fit border-b-1 text-center text-2xl bg-transparent"
          >
            {formName}
          </div>
        ) : (
          <input
            id="form-name"
            type="text"
            title="Form name"
            className="w-fit border-b-1 text-center text-2xl bg-transparent focus:outline-none"
            value={formName}
            onChange={(e) => onFormNameChange?.(e.target.value)}
            placeholder="Form Name"
            disabled={readOnly}
          />
        )}
        <EncryptionStatus isEncrypted={isEncrypted} showText={false} />
        <span
          id="form-status-badge"
          className={`text-sm font-semibold px-2 py-1 rounded ${config.className}`}
        >
          {config.label}
        </span>
      </div>
    </>
  );
}

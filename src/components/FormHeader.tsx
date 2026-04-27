import { HomeIcon } from "@heroicons/react/16/solid";
import EdgeActionButton from "./EdgeActionButton";
import EncryptionStatus from "./EncryptionStatus";
import IconButton from "./IconButton";

interface FormHeaderProps {
  formName: string;
  isEncrypted: boolean;
  onFormNameChange?: (name: string) => void;
  onHomeClick: () => void;
  readOnly?: boolean;
  respondentName?: string;
  onRespondentNameChange?: (name: string) => void;
}

export default function FormHeader({
  formName,
  isEncrypted,
  onFormNameChange,
  onHomeClick,
  readOnly = false,
  respondentName,
  onRespondentNameChange,
}: FormHeaderProps) {
  const hasRespondentField =
    onRespondentNameChange !== undefined || respondentName !== undefined;

  return (
    <div className="document-sheet relative mb-4">
      <IconButton
        onClick={onHomeClick}
        className="absolute top-2 left-2 lg:hidden"
        title="Home"
        aria-label="Go home"
      >
        <HomeIcon className="h-6 w-6 transition-transform group-hover:scale-90 group-hover:text-th-ink-muted" />
      </IconButton>

      <div className="fixed top-6 left-6 z-10 hidden lg:flex xl:left-10">
        <EdgeActionButton
          onClick={onHomeClick}
          label="Home"
          title="Home"
          variant="default"
        >
          <HomeIcon className="h-5 w-5" />
        </EdgeActionButton>
      </div>

      {/* Title: always read-only when respondent field is shown */}
      <div className="mb-4 flex items-center justify-center gap-2 text-center">
        {readOnly || hasRespondentField ? (
          <div
            id="form-name"
            className="max-w-full border-b-1 bg-transparent text-center text-2xl"
          >
            {formName}
          </div>
        ) : (
          <>
            <label htmlFor="form-name" className="sr-only">
              Form title
            </label>
            <input
              id="form-name"
              type="text"
              className="w-fit max-w-full border-b-1 bg-transparent text-center text-2xl focus:outline-none"
              value={formName}
              onChange={(e) => onFormNameChange?.(e.target.value)}
              placeholder="Title"
              disabled={readOnly}
              name="form-name"
            />
          </>
        )}
        <EncryptionStatus isEncrypted={isEncrypted} showText={false} />
      </div>

      {/* Respondent name input for forms */}
      {onRespondentNameChange && !readOnly && (
        <div className="flex items-center justify-center gap-2 text-center">
          <label
            htmlFor="respondent-name"
            className="text-sm text-th-ink-muted"
          >
            Your Name
          </label>
          <input
            id="respondent-name"
            type="text"
            className="w-48 max-w-full border-b-1 bg-transparent text-center text-base focus:outline-none"
            value={respondentName ?? ""}
            onChange={(e) => onRespondentNameChange(e.target.value)}
            placeholder="Enter your name"
            name="respondent-name"
          />
        </div>
      )}

      {/* Respondent name display for read-only forms */}
      {hasRespondentField && readOnly && respondentName && (
        <div className="flex items-center justify-center gap-1 text-center text-sm text-th-ink-muted">
          Filled by {respondentName}
        </div>
      )}
    </div>
  );
}

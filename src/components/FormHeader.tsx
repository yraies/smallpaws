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
}

export default function FormHeader({
  formName,
  isEncrypted,
  onFormNameChange,
  onHomeClick,
  readOnly = false,
}: FormHeaderProps) {
  return (
    <div className="document-sheet relative mb-4">
      <IconButton
        onClick={onHomeClick}
        className="absolute top-2 left-2 lg:hidden"
        title="Home"
        aria-label="Go home"
      >
        <HomeIcon className="h-6 w-6 transition-transform group-hover:scale-90 group-hover:text-violet-400" />
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
      </div>
    </div>
  );
}

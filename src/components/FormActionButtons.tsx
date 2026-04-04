import {
  ArrowDownTrayIcon,
  CloudArrowUpIcon,
  DocumentDuplicateIcon,
  FaceSmileIcon,
  NewspaperIcon,
  ShareIcon,
  TrashIcon,
} from "@heroicons/react/16/solid";
import { useDisplayPreferences } from "../contexts/DisplayPreferencesContext";
import { useFormActions } from "../contexts/FormActionsContext";
import IconButton from "./IconButton";

export default function FormActionButtons() {
  const {
    isPublished,
    isPublishing,
    isCloning,
    isDeleting,
    handleClone,
    handleExportCSV,
    handleExportJSON,
    handleDelete,
    handlePublish,
    handleShare,
  } = useFormActions();

  const { showIcon, setShowIcon } = useDisplayPreferences();

  return (
    <div className="print:hidden">
      {/* Left side buttons - Content actions */}

      {/* Clone Button - Only show when published */}
      {isPublished && (
        <IconButton
          onClick={handleClone}
          className="absolute top-4 left-16"
          disabled={isCloning}
          title="Create New Draft"
        >
          <DocumentDuplicateIcon className="h-5 w-5 text-[var(--plum)] transition-transform group-hover:scale-90" />
        </IconButton>
      )}

      {/* Export CSV Button - Only show when published */}
      {isPublished && (
        <IconButton
          onClick={handleExportCSV}
          className="absolute top-4 left-29"
          title="Export as CSV"
        >
          <ArrowDownTrayIcon className="h-5 w-5 text-[#8d5b2c] transition-transform group-hover:scale-90" />
        </IconButton>
      )}

      {/* Export JSON Button - Only show when published */}
      {isPublished && (
        <IconButton
          onClick={handleExportJSON}
          className="absolute top-4 left-42"
          title="Export as JSON"
        >
          <ArrowDownTrayIcon className="h-5 w-5 text-[var(--paper-accent)] transition-transform group-hover:scale-90" />
        </IconButton>
      )}

      {/* Delete Button - Only show when published and handler provided */}
      {isPublished && handleDelete && (
        <IconButton
          onClick={handleDelete}
          className="absolute top-4 left-55"
          disabled={isDeleting}
          title="Delete Form"
        >
          <TrashIcon
            className={`h-5 w-5 transition-transform ${
              isDeleting
                ? "text-[#b39a84]"
                : "text-[var(--paper-accent)] group-hover:scale-90"
            }`}
          />
        </IconButton>
      )}

      {/* Right side buttons - View/Meta actions */}

      {/* Publish Button - Only show when NOT published and handler provided */}
      {!isPublished && handlePublish && (
        <IconButton
          onClick={handlePublish}
          className="absolute top-4 right-16"
          disabled={isPublishing}
          title="Publish Form"
        >
          <CloudArrowUpIcon
            className={`h-5 w-5 transition-transform ${
              isPublishing
                ? "text-[#b39a84]"
                : "text-[#8d5b2c] group-hover:scale-90"
            }`}
          />
        </IconButton>
      )}

      {/* Share Button - Only show when published and handler provided */}
      {isPublished && handleShare && (
        <IconButton
          onClick={handleShare}
          className="absolute top-4 right-16"
          title="Share Form"
        >
          <ShareIcon className="h-5 w-5 text-[var(--plum)] transition-transform group-hover:scale-90" />
        </IconButton>
      )}

      {/* Show Icon Toggle */}
      <IconButton
        onClick={() => setShowIcon(!showIcon)}
        className="absolute top-4 right-4"
        title={showIcon ? "Show Text Labels" : "Show Icons"}
      >
        {!showIcon ? (
          <NewspaperIcon className="h-5 w-5 text-[var(--plum)] transition-transform group-hover:scale-90" />
        ) : (
          <FaceSmileIcon className="h-5 w-5 text-[var(--plum)] transition-transform group-hover:scale-90" />
        )}
      </IconButton>
    </div>
  );
}

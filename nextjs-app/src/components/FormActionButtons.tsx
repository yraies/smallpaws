import React from "react";
import IconButton from "./IconButton";
import {
  CloudArrowUpIcon,
  ShareIcon,
  DocumentDuplicateIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  EyeIcon,
  WrenchScrewdriverIcon,
  NewspaperIcon,
  FaceSmileIcon,
} from "@heroicons/react/16/solid";
import { useFormActions } from "../contexts/FormActionsContext";
import { useDisplayPreferences } from "../contexts/DisplayPreferencesContext";

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

  const { advancedOptions, setAdvancedOptions, showIcon, setShowIcon } =
    useDisplayPreferences();

  return (
    <div className="print:hidden">
      {/* Left side buttons - Content actions */}

      {/* Clone Button - Only show when published */}
      {isPublished && (
        <IconButton
          onClick={handleClone}
          className="absolute top-2 left-14"
          disabled={isCloning}
          title="Clone Form"
        >
          <DocumentDuplicateIcon className="h-6 w-6 transition-transform group-hover:scale-90 group-hover:text-blue-400" />
        </IconButton>
      )}

      {/* Export CSV Button - Only show when published */}
      {isPublished && (
        <IconButton
          onClick={handleExportCSV}
          className="absolute top-2 left-26"
          title="Export as CSV"
        >
          <ArrowDownTrayIcon className="h-6 w-6 transition-transform group-hover:scale-90 group-hover:text-green-400" />
        </IconButton>
      )}

      {/* Export JSON Button - Only show when published */}
      {isPublished && (
        <IconButton
          onClick={handleExportJSON}
          className="absolute top-2 left-38"
          title="Export as JSON"
        >
          <ArrowDownTrayIcon className="h-6 w-6 transition-transform group-hover:scale-90 group-hover:text-blue-400" />
        </IconButton>
      )}

      {/* Delete Button - Only show when published and handler provided */}
      {isPublished && handleDelete && (
        <IconButton
          onClick={handleDelete}
          className="absolute top-2 left-50"
          disabled={isDeleting}
          title="Delete Form"
        >
          <TrashIcon
            className={`h-6 w-6 transition-transform ${
              isDeleting
                ? "text-gray-400"
                : "group-hover:scale-90 group-hover:text-red-400"
            }`}
          />
        </IconButton>
      )}

      {/* Right side buttons - View/Meta actions */}

      {/* Publish Button - Only show when NOT published and handler provided */}
      {!isPublished && handlePublish && (
        <IconButton
          onClick={handlePublish}
          className="absolute top-2 right-26"
          disabled={isPublishing}
          title="Publish Form"
        >
          <CloudArrowUpIcon
            className={`h-6 w-6 transition-transform ${
              isPublishing
                ? "text-gray-400"
                : "group-hover:scale-90 group-hover:text-green-400"
            }`}
          />
        </IconButton>
      )}

      {/* Share Button - Only show when published and handler provided */}
      {isPublished && handleShare && (
        <IconButton
          onClick={handleShare}
          className="absolute top-2 right-26"
          title="Share Form"
        >
          <ShareIcon className="h-6 w-6 transition-transform group-hover:scale-90 group-hover:text-blue-400" />
        </IconButton>
      )}

      {/* Advanced Options Toggle - Only show when NOT published (edit mode only) */}
      {!isPublished && (
        <IconButton
          onClick={() => setAdvancedOptions(!advancedOptions)}
          className="absolute top-2 right-2"
          title={
            advancedOptions ? "Switch to View Mode" : "Switch to Edit Mode"
          }
        >
          {!advancedOptions ? (
            <EyeIcon className="h-6 w-6 transition-transform group-hover:scale-90 group-hover:text-violet-400" />
          ) : (
            <WrenchScrewdriverIcon className="h-6 w-6 transition-transform group-hover:scale-90 group-hover:text-violet-400" />
          )}
        </IconButton>
      )}

      {/* Show Icon Toggle */}
      <IconButton
        onClick={() => setShowIcon(!showIcon)}
        className="absolute top-2 right-14"
        title={showIcon ? "Show Text Labels" : "Show Icons"}
      >
        {!showIcon ? (
          <NewspaperIcon className="h-6 w-6 transition-transform group-hover:scale-90 group-hover:text-violet-400" />
        ) : (
          <FaceSmileIcon className="h-6 w-6 transition-transform group-hover:scale-90 group-hover:text-violet-400" />
        )}
      </IconButton>
    </div>
  );
}

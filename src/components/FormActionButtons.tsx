import {
  ArrowDownTrayIcon,
  CloudArrowUpIcon,
  DocumentDuplicateIcon,
  FaceSmileIcon,
  NewspaperIcon,
  ShareIcon,
  TrashIcon,
} from "@heroicons/react/16/solid";
import type React from "react";
import { useDisplayPreferences } from "../contexts/DisplayPreferencesContext";
import { useFormActions } from "../contexts/FormActionsContext";
import EdgeActionButton from "./EdgeActionButton";

type ActionConfig = {
  key: string;
  label: string;
  onClick: () => void;
  title: string;
  disabled?: boolean;
  variant: "default" | "success" | "info" | "danger";
  icon: React.ReactElement;
};

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

  const leftActions: ActionConfig[] = [];
  if (isPublished) {
    leftActions.push(
      {
        key: "clone",
        label: "New Draft",
        onClick: handleClone,
        title: "Create New Draft",
        disabled: isCloning,
        variant: "default",
        icon: <DocumentDuplicateIcon className="h-5 w-5" />,
      },
      {
        key: "csv",
        label: "Export CSV",
        onClick: handleExportCSV,
        title: "Export as CSV",
        variant: "success",
        icon: <ArrowDownTrayIcon className="h-5 w-5" />,
      },
      {
        key: "json",
        label: "Export JSON",
        onClick: handleExportJSON,
        title: "Export as JSON",
        variant: "info",
        icon: <ArrowDownTrayIcon className="h-5 w-5" />,
      },
    );

    if (handleDelete) {
      leftActions.push({
        key: "delete",
        label: "Delete",
        onClick: handleDelete,
        title: "Delete Form",
        disabled: isDeleting,
        variant: "danger",
        icon: <TrashIcon className="h-5 w-5" />,
      });
    }
  }

  const rightActions: ActionConfig[] = [];
  if (!isPublished && handlePublish) {
    rightActions.push({
      key: "publish",
      label: "Publish",
      onClick: handlePublish,
      title: "Publish Form",
      disabled: isPublishing,
      variant: "success",
      icon: <CloudArrowUpIcon className="h-5 w-5" />,
    });
  }

  if (isPublished && handleShare) {
    rightActions.push({
      key: "share",
      label: "Share",
      onClick: handleShare,
      title: "Share Form",
      variant: "info",
      icon: <ShareIcon className="h-5 w-5" />,
    });
  }

  rightActions.push({
    key: "display",
    label: showIcon ? "Text Labels" : "Icons",
    onClick: () => setShowIcon(!showIcon),
    title: showIcon ? "Show Text Labels" : "Show Icons",
    variant: "default",
    icon: !showIcon ? (
      <NewspaperIcon className="h-5 w-5" />
    ) : (
      <FaceSmileIcon className="h-5 w-5" />
    ),
  });

  return (
    <div className="print:hidden">
      <div className="fixed top-20 left-6 z-10 hidden flex-col gap-2 lg:flex xl:left-10">
        {leftActions.map((action) => (
          <EdgeActionButton
            key={action.key}
            onClick={action.onClick}
            label={action.label}
            title={action.title}
            disabled={action.disabled}
            variant={action.variant}
          >
            {action.icon}
          </EdgeActionButton>
        ))}
      </div>

      <div className="fixed top-20 right-6 z-10 hidden flex-col gap-2 lg:flex xl:right-10">
        {rightActions.map((action) => (
          <EdgeActionButton
            key={action.key}
            onClick={action.onClick}
            label={action.label}
            title={action.title}
            disabled={action.disabled}
            variant={action.variant}
          >
            {action.icon}
          </EdgeActionButton>
        ))}
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-center gap-2 lg:hidden">
        {leftActions.map((action) => (
          <EdgeActionButton
            key={action.key}
            onClick={action.onClick}
            label={action.label}
            title={action.title}
            disabled={action.disabled}
            variant={action.variant}
          >
            {action.icon}
          </EdgeActionButton>
        ))}
        {rightActions.map((action) => (
          <EdgeActionButton
            key={action.key}
            onClick={action.onClick}
            label={action.label}
            title={action.title}
            disabled={action.disabled}
            variant={action.variant}
          >
            {action.icon}
          </EdgeActionButton>
        ))}
      </div>
    </div>
  );
}

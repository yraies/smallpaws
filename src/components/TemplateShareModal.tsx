import {
  CheckIcon,
  DocumentDuplicateIcon,
  ShareIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/16/solid";
import React from "react";

interface TemplateShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateId: string;
  templateName: string;
  requiresPassword: boolean;
}

interface ShareInfo {
  shareId: string;
  shareUrl: string;
  requiresPassword: boolean;
  viewCount: number;
  createdAt: string;
}

export default function TemplateShareModal({
  isOpen,
  onClose,
  templateId,
  templateName,
  requiresPassword,
}: TemplateShareModalProps) {
  const [shareInfo, setShareInfo] = React.useState<ShareInfo | null>(null);
  const [isCreating, setIsCreating] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [error, setError] = React.useState("");

  const fetchShare = React.useCallback(async () => {
    try {
      const response = await fetch(`/api/templates/${templateId}/share`);
      if (!response.ok) return;

      const data = await response.json();
      if (!data.success) return;

      setShareInfo(data.share);
    } catch (fetchError) {
      console.error("Error fetching template share:", fetchError);
    }
  }, [templateId]);

  React.useEffect(() => {
    if (isOpen) {
      void fetchShare();
    }
  }, [fetchShare, isOpen]);

  if (!isOpen) return null;

  const createShare = async () => {
    setIsCreating(true);
    setError("");

    try {
      const response = await fetch(`/api/templates/${templateId}/share`, {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to create share link");
        return;
      }

      const data = await response.json();
      setShareInfo({
        shareId: data.shareId,
        shareUrl: data.shareUrl,
        requiresPassword: data.requiresPassword,
        viewCount: data.viewCount,
        createdAt: data.createdAt,
      });
    } catch {
      setError("Network error occurred");
    } finally {
      setIsCreating(false);
    }
  };

  const deleteShare = async () => {
    setIsDeleting(true);
    setError("");

    try {
      const response = await fetch(`/api/templates/${templateId}/share`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to remove share link");
        return;
      }

      setShareInfo(null);
      setCopied(false);
    } catch {
      setError("Network error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.setAttribute("readonly", "");
        textArea.style.position = "absolute";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      setError("");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (copyError) {
      console.error("Failed to copy:", copyError);
      setError("Could not copy the link. Please copy it manually.");
    }
  };

  const resetModal = () => {
    setShareInfo(null);
    setCopied(false);
    setError("");
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="template-share-modal-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-th-line bg-th-paper"
      >
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div className="flex items-center gap-3">
            <ShareIcon className="h-6 w-6 text-th-info" aria-hidden="true" />
            <h2
              id="template-share-modal-title"
              className="text-xl font-semibold text-th-ink"
            >
              Share &quot;{templateName}&quot;
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-th-line transition-colors hover:text-th-ink"
            aria-label="Close"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-5 px-5 py-4">
          <p className="text-sm text-th-ink-muted">
            Shared template links are read-only. Recipients can inspect the
            structure and create their own local form from it.
          </p>

          <div className="border-l-4 border-th-info bg-th-paper-soft px-3 py-2 text-sm text-th-ink">
            Shared links use the template&apos;s own protection settings.
            <br />
            {requiresPassword || shareInfo?.requiresPassword
              ? "Recipients will need that same template password."
              : "This template does not currently require a password."}
          </div>

          {shareInfo ? (
            <div className="space-y-3 border border-th-line bg-th-paper-soft px-3 py-3">
              <div>
                <p className="text-sm font-semibold">Active share link</p>
                <p className="mt-1 text-sm text-th-ink-muted">
                  You can copy this link or remove it when you no longer want to
                  share this template.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="template-share-url-display" className="sr-only">
                  Share URL
                </label>
                <input
                  id="template-share-url-display"
                  type="text"
                  value={shareInfo.shareUrl}
                  readOnly
                  className="flex-1 border border-th-line bg-th-paper px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(shareInfo.shareUrl)}
                  className={`border px-3 py-2 ${
                    copied
                      ? "border-th-success bg-th-paper-soft text-th-success"
                      : "border-th-line bg-th-paper text-th-ink"
                  }`}
                  aria-label="Copy share link"
                >
                  {copied ? (
                    <CheckIcon className="h-4 w-4" />
                  ) : (
                    <DocumentDuplicateIcon className="h-4 w-4" />
                  )}
                </button>
              </div>

              <p className="text-xs text-th-ink-muted">
                Created {new Date(shareInfo.createdAt).toLocaleString()}
                {shareInfo.requiresPassword ? " • Uses template password" : ""}
              </p>
            </div>
          ) : (
            <div className="space-y-3 border border-th-line bg-th-paper px-3 py-3">
              <h3 className="text-base font-semibold">Create a share link</h3>

              <p className="text-sm text-th-ink-muted">
                Create a link people can open to inspect this template and start
                their own local form from it.
              </p>
            </div>
          )}

          <div role="alert" aria-live="assertive">
            {error && (
              <div className="border-l-4 border-th-danger bg-th-danger-soft px-3 py-2 text-sm text-th-danger">
                {error}
              </div>
            )}
          </div>

          <div className="flex justify-between gap-3">
            {shareInfo ? (
              <button
                type="button"
                onClick={deleteShare}
                disabled={isDeleting}
                className="flex items-center justify-center gap-2 border border-th-danger bg-th-paper px-4 py-2 text-sm font-medium text-th-danger disabled:cursor-not-allowed disabled:opacity-50"
              >
                <TrashIcon className="h-4 w-4" />
                {isDeleting ? "Removing..." : "Remove share link"}
              </button>
            ) : (
              <span />
            )}

            <button
              type="button"
              onClick={createShare}
              disabled={isCreating}
              className="flex items-center justify-center gap-2 bg-th-primary px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShareIcon className="h-4 w-4" />
              {isCreating
                ? "Saving..."
                : shareInfo
                  ? "Create share link again"
                  : "Create share link"}
            </button>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="border border-th-line bg-th-paper px-4 py-2 text-sm font-medium text-th-ink-muted"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

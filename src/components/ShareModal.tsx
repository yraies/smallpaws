import {
  CalendarIcon,
  CheckIcon,
  DocumentDuplicateIcon,
  ArrowPathIcon,
  ShareIcon,
  XMarkIcon,
} from "@heroicons/react/16/solid";
import React, { useState } from "react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  formId: string;
  formName: string;
  requiresPassword: boolean;
}

interface ShareInfo {
  shareId: string;
  shareUrl: string;
  requiresPassword: boolean;
  autoDeleteAt: string | null;
  viewCount: number;
  createdAt: string;
}

const AUTO_DELETE_OPTIONS = [1, 7, 30, 90] as const;

function getAutoDeleteSelection(autoDeleteAt: string | null): number | "" {
  if (!autoDeleteAt) {
    return "";
  }

  const diffMs = new Date(autoDeleteAt).getTime() - Date.now();
  if (diffMs <= 0) {
    return "";
  }

  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  return AUTO_DELETE_OPTIONS.find((days) => days === diffDays) ?? "";
}

const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  formId,
  formName,
  requiresPassword,
}) => {
  const [autoDeleteInDays, setAutoDeleteInDays] = useState<number | "">("");
  const [shareInfo, setShareInfo] = useState<ShareInfo | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const fetchShare = React.useCallback(async () => {
    try {
      const response = await fetch(`/api/forms/${formId}/share`);
      if (!response.ok) return;

      const data = await response.json();
      if (!data.success) return;

      setShareInfo(data.share);
      setAutoDeleteInDays(getAutoDeleteSelection(data.share?.autoDeleteAt ?? null));
    } catch (fetchError) {
      console.error("Error fetching share link:", fetchError);
    }
  }, [formId]);

  React.useEffect(() => {
    if (isOpen) {
      void fetchShare();
    }
  }, [fetchShare, isOpen]);

  const saveShareSettings = async () => {
    setIsSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/forms/${formId}/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          autoDeleteInDays: autoDeleteInDays || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to save share settings");
        return;
      }

      const data = await response.json();
      setShareInfo({
        shareId: data.shareId,
        shareUrl: data.shareUrl,
        requiresPassword: data.requiresPassword,
        autoDeleteAt: data.autoDeleteAt,
        viewCount: data.viewCount,
        createdAt: data.createdAt,
      });
      setAutoDeleteInDays(getAutoDeleteSelection(data.autoDeleteAt));
    } catch {
      setError("Network error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const regenerateShare = async () => {
    setIsRegenerating(true);
    setError("");

    try {
      const response = await fetch(`/api/forms/${formId}/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          regenerate: true,
          autoDeleteInDays: autoDeleteInDays || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to save share link");
        return;
      }

      const data = await response.json();
      setShareInfo({
        shareId: data.shareId,
        shareUrl: data.shareUrl,
        requiresPassword: data.requiresPassword,
        autoDeleteAt: data.autoDeleteAt,
        viewCount: data.viewCount,
        createdAt: data.createdAt,
      });
      setAutoDeleteInDays(getAutoDeleteSelection(data.autoDeleteAt));
    } catch {
      setError("Network error occurred");
    } finally {
      setIsRegenerating(false);
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

  const resetForm = () => {
    setAutoDeleteInDays("");
    setShareInfo(null);
    setError("");
    setCopied(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-modal-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-sand-200 bg-sand-50"
      >
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div className="flex items-center gap-3">
            <ShareIcon
              className="h-6 w-6 text-complement-700"
              aria-hidden="true"
            />
            <h2
              id="share-modal-title"
              className="text-xl font-semibold text-lavender-900"
            >
              Share &quot;{formName}&quot;
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-lavender-300 transition-colors hover:text-lavender-700"
            aria-label="Close"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-5 px-5 py-4">
          <p className="text-sm text-lavender-700">
            Shared links are read-only. Anyone opening them will see the same
            published form results.
          </p>

          <div className="border-l-4 border-complement-500 bg-complement-50 px-3 py-2 text-sm text-complement-900">
            Shared links use the form&apos;s own protection settings.
            <br />
            {requiresPassword || shareInfo?.requiresPassword
              ? "Recipients will need the same form password."
              : "This form does not currently require a password."}
          </div>

          {shareInfo ? (
            <div className="space-y-3 border border-sand-200 bg-sand-100 px-3 py-3">
              <div>
                <p className="text-sm font-semibold">Shared view URL</p>
                <p className="mt-1 text-sm text-lavender-700">
                  This published form always has a read-only shared view. You can
                  copy the current URL, configure auto-delete, or regenerate a
                  new one.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="share-url-display" className="sr-only">
                  Share URL
                </label>
                <input
                  id="share-url-display"
                  type="text"
                  value={shareInfo.shareUrl}
                  readOnly
                  className="flex-1 border border-sand-200 bg-sand-50 px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(shareInfo.shareUrl)}
                  className={`border px-3 py-2 ${
                    copied
                      ? "border-pistachio-500 bg-pistachio-100 text-pistachio-700"
                      : "border-complement-500 bg-sand-50 text-complement-700"
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

              <div>
                <label
                  htmlFor="share-auto-delete"
                  className="mb-2 flex items-center gap-2 text-sm font-medium text-lavender-700"
                >
                  <CalendarIcon className="h-4 w-4" aria-hidden="true" />
                  Auto-delete underlying published form
                </label>
                <select
                  id="share-auto-delete"
                  value={autoDeleteInDays}
                  onChange={(e) =>
                    setAutoDeleteInDays(
                      e.target.value ? Number(e.target.value) : "",
                    )
                  }
                  className="w-full border border-sand-200 bg-sand-50 px-3 py-2 text-sm"
                >
                  <option value="">Never auto-delete</option>
                  <option value={1}>After 1 day</option>
                  <option value={7}>After 7 days</option>
                  <option value={30}>After 30 days</option>
                  <option value={90}>After 90 days</option>
                </select>
              </div>

              <p className="text-xs text-lavender-700">
                Created {formatDate(shareInfo.createdAt)}
                {shareInfo.autoDeleteAt
                  ? ` • Auto-deletes ${formatDate(shareInfo.autoDeleteAt)}`
                  : " • No auto-delete"}
              </p>
            </div>
          ) : (
            <div className="space-y-3 border border-sand-200 bg-sand-50 px-3 py-3">
              <h3 className="text-base font-semibold">Loading shared view…</h3>

              <p className="text-sm text-lavender-700">
                Loading the canonical shared view for this published form.
              </p>
            </div>
          )}

          <div role="alert" aria-live="assertive">
            {error && (
              <div className="border-l-4 border-danger-500 bg-danger-50 px-3 py-2 text-sm text-danger-700">
                {error}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={saveShareSettings}
              disabled={isSaving || !shareInfo}
              className="flex items-center justify-center gap-2 border border-sand-200 bg-sand-50 px-4 py-2 text-sm font-medium text-lavender-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShareIcon className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save auto-delete"}
            </button>
            <button
              type="button"
              onClick={regenerateShare}
              disabled={isRegenerating || isSaving || !shareInfo}
              className="flex items-center justify-center gap-2 bg-complement-700 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowPathIcon className="h-4 w-4" />
              {isRegenerating ? "Regenerating..." : "Regenerate URL"}
            </button>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="border border-sand-200 bg-sand-50 px-4 py-2 text-sm font-medium text-lavender-700"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;

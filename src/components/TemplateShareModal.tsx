import {
  CheckIcon,
  DocumentDuplicateIcon,
  LinkIcon,
  ShareIcon,
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
  const [existingShares, setExistingShares] = React.useState<ShareInfo[]>([]);
  const [isCreating, setIsCreating] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [error, setError] = React.useState("");

  const fetchExistingShares = React.useCallback(async () => {
    try {
      const response = await fetch(`/api/templates/${templateId}/share`);
      if (!response.ok) return;

      const data = await response.json();
      if (!data.success) return;

      setExistingShares(
        data.shares.map(
          (share: {
            shareId: string;
            requiresPassword: boolean;
            viewCount: number;
            createdAt: string;
          }) => ({
            shareId: share.shareId,
            shareUrl: `${window.location.origin}/share/template/${share.shareId}`,
            requiresPassword: share.requiresPassword,
            viewCount: share.viewCount,
            createdAt: share.createdAt,
          }),
        ),
      );
    } catch (fetchError) {
      console.error("Error fetching template shares:", fetchError);
    }
  }, [templateId]);

  React.useEffect(() => {
    if (isOpen) {
      void fetchExistingShares();
    }
  }, [fetchExistingShares, isOpen]);

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
      void fetchExistingShares();
    } catch {
      setError("Network error occurred");
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (copyError) {
      console.error("Failed to copy:", copyError);
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
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-6">
          <div className="flex items-center gap-3">
            <ShareIcon className="h-6 w-6 text-violet-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Share &quot;{templateName}&quot;
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-400 transition-colors hover:text-gray-600"
            aria-label="Close"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6 p-6">
          {!shareInfo ? (
            <>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Shared template links are read-only. Recipients can inspect
                  the structure and create their own local form from it.
                </p>

                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                  Shared links use the template&apos;s own protection settings.
                  {requiresPassword
                    ? " Recipients will need that same password."
                    : " This template does not currently require a password."}
                </div>

                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <button
                  type="button"
                  onClick={createShare}
                  disabled={isCreating}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-white transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ShareIcon className="h-4 w-4" />
                  {isCreating ? "Creating..." : "Create Share Link"}
                </button>
              </div>

              {existingShares.length > 0 && (
                <div className="border-t pt-6">
                  <h3 className="mb-4 text-lg font-medium text-gray-900">
                    Existing Share Links
                  </h3>
                  <div className="space-y-3">
                    {existingShares.map((share, index) => (
                      <div
                        key={share.shareId}
                        className="rounded-lg bg-gray-50 p-4"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <LinkIcon className="h-4 w-4" />
                            Template Share #{index + 1}
                            {share.requiresPassword && (
                              <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                                Uses template password
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {share.viewCount} views
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={share.shareUrl}
                            readOnly
                            className="flex-1 rounded border border-gray-200 bg-white px-3 py-1 text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => copyToClipboard(share.shareUrl)}
                            className="rounded bg-violet-100 px-3 py-1 text-violet-700 transition-colors hover:bg-violet-200"
                          >
                            <DocumentDuplicateIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <CheckIcon className="mx-auto mb-4 h-12 w-12 text-green-600" />
                <h3 className="mb-2 text-lg font-medium text-gray-900">
                  Share Link Created
                </h3>
                <p className="text-gray-600">
                  Recipients can review the template and create their own local
                  form from it.
                  {shareInfo.requiresPassword
                    ? " They will need the same template password to open it."
                    : ""}
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={shareInfo.shareUrl}
                    readOnly
                    className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(shareInfo.shareUrl)}
                    className={`rounded-lg px-4 py-2 transition-colors ${
                      copied
                        ? "bg-green-100 text-green-700"
                        : "bg-violet-100 text-violet-700 hover:bg-violet-200"
                    }`}
                  >
                    {copied ? (
                      <CheckIcon className="h-4 w-4" />
                    ) : (
                      <DocumentDuplicateIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={resetModal}
                  className="flex-1 rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200"
                >
                  Create Another
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 rounded-lg bg-violet-600 px-4 py-2 text-white transition-colors hover:bg-violet-700"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

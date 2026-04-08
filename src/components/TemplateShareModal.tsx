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
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-neutral-300 bg-white">
        <div className="flex items-center justify-between border-b px-5 py-4">
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

        <div className="space-y-5 px-5 py-4">
          <p className="text-sm text-neutral-700">
            Shared template links are read-only. Recipients can inspect the
            structure and create their own local form from it.
          </p>

          <div className="border-l-4 border-blue-300 bg-blue-50 px-3 py-2 text-sm text-blue-900">
            Shared links use the template&apos;s own protection settings.
            <br />
            {requiresPassword
              ? "Recipients will need that same template password."
              : "This template does not currently require a password."}
          </div>

          {shareInfo && (
            <div className="border border-neutral-300 bg-neutral-50 px-3 py-3">
              <p className="mb-2 text-sm font-semibold">Latest link</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={shareInfo.shareUrl}
                  readOnly
                  className="flex-1 border border-neutral-300 bg-white px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(shareInfo.shareUrl)}
                  className={`border px-3 py-2 ${
                    copied
                      ? "border-green-300 bg-green-100 text-green-800"
                      : "border-violet-300 bg-white text-violet-800"
                  }`}
                >
                  {copied ? (
                    <CheckIcon className="h-4 w-4" />
                  ) : (
                    <DocumentDuplicateIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="mt-2 text-xs text-neutral-600">
                Created {new Date(shareInfo.createdAt).toLocaleString()}
                {shareInfo.requiresPassword ? " • Uses template password" : ""}
              </p>
            </div>
          )}

          <div className="space-y-3 border border-neutral-300 bg-white px-3 py-3">
            <h3 className="text-base font-semibold">Create a share link</h3>

            {error && (
              <div className="border-l-4 border-red-400 bg-red-50 px-3 py-2 text-sm text-red-800">
                {error}
              </div>
            )}

            <div className="flex justify-between gap-3">
              {shareInfo ? (
                <button
                  type="button"
                  onClick={resetModal}
                  className="border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700"
                >
                  Clear latest link
                </button>
              ) : (
                <span />
              )}
              <button
                type="button"
                onClick={createShare}
                disabled={isCreating}
                className="flex items-center justify-center gap-2 bg-violet-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShareIcon className="h-4 w-4" />
                {isCreating ? "Creating..." : "Create share link"}
              </button>
            </div>
          </div>

          {existingShares.length > 0 && (
            <div className="space-y-3 border-t pt-4">
              <h3 className="text-base font-semibold">Existing links</h3>
              <div className="space-y-2">
                {existingShares.map((share, index) => (
                  <div
                    key={share.shareId}
                    className="border border-neutral-300 bg-neutral-50 px-3 py-3"
                  >
                    <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                      <div className="flex items-center gap-2 text-neutral-700">
                        <LinkIcon className="h-4 w-4" />
                        Link #{index + 1}
                        {share.requiresPassword && (
                          <span className="border border-amber-300 bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                            Uses template password
                          </span>
                        )}
                      </div>
                      <div className="text-neutral-500">
                        {share.viewCount} views
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={share.shareUrl}
                        readOnly
                        className="flex-1 border border-neutral-300 bg-white px-3 py-2 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => copyToClipboard(share.shareUrl)}
                        className="border border-violet-300 bg-white px-3 py-2 text-violet-800"
                      >
                        <DocumentDuplicateIcon className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-neutral-500">
                      Created {new Date(share.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import {
  CalendarIcon,
  CheckIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  LinkIcon,
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
  expiresAt: string | null;
  viewCount: number;
  createdAt: string;
}

const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  formId,
  formName,
  requiresPassword,
}) => {
  const [expiresInDays, setExpiresInDays] = useState<number | "">("");
  const [shareInfo, setShareInfo] = useState<ShareInfo | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [existingShares, setExistingShares] = useState<ShareInfo[]>([]);

  const fetchExistingShares = React.useCallback(async () => {
    try {
      const response = await fetch(`/api/forms/${formId}/share`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setExistingShares(
            data.shares.map(
              (share: {
                shareId: string;
                requiresPassword: boolean;
                expiresAt: string | null;
                viewCount: number;
                createdAt: string;
              }) => ({
                shareId: share.shareId,
                shareUrl: `${window.location.origin}/share/${share.shareId}`,
                requiresPassword: share.requiresPassword,
                expiresAt: share.expiresAt,
                viewCount: share.viewCount,
                createdAt: share.createdAt,
              }),
            ),
          );
        }
      }
    } catch (error) {
      console.error("Error fetching existing shares:", error);
    }
  }, [formId]);

  React.useEffect(() => {
    if (isOpen && !shareInfo) {
      fetchExistingShares();
    }
  }, [isOpen, shareInfo, fetchExistingShares]);

  const createShare = async () => {
    setIsCreating(true);
    setError("");

    try {
      const response = await fetch(`/api/forms/${formId}/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ expiresInDays: expiresInDays || undefined }),
      });

      if (response.ok) {
        const data = await response.json();
        setShareInfo({
          shareId: data.shareId,
          shareUrl: data.shareUrl,
          requiresPassword: data.requiresPassword,
          expiresAt: data.expiresAt,
          viewCount: data.viewCount,
          createdAt: data.createdAt,
        });
        // Refresh existing shares
        fetchExistingShares();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to create share");
      }
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
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const resetForm = () => {
    setExpiresInDays("");
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
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-neutral-300 bg-white">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div className="flex items-center gap-3">
            <ShareIcon className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Share &quot;{formName}&quot;
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-5 px-5 py-4">
          <p className="text-sm text-neutral-700">
            Shared links are read-only. Anyone opening them will see the same
            published form results.
          </p>

          <div className="border-l-4 border-blue-300 bg-blue-50 px-3 py-2 text-sm text-blue-900">
            Shared links use the form&apos;s own protection settings.
            <br />
            {requiresPassword ||
            existingShares.some((share) => share.requiresPassword) ||
            shareInfo?.requiresPassword
              ? "Recipients will need the same form password."
              : "This form does not currently require a password."}
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
                      : "border-blue-300 bg-white text-blue-800"
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
                Created {formatDate(shareInfo.createdAt)}
                {shareInfo.expiresAt
                  ? ` • Expires ${formatDate(shareInfo.expiresAt)}`
                  : " • No expiry"}
              </p>
            </div>
          )}

          <div className="space-y-3 border border-neutral-300 bg-white px-3 py-3">
            <h3 className="text-base font-semibold">Create a share link</h3>

            <div>
              <label
                htmlFor="share-expiry"
                className="mb-2 flex items-center gap-2 text-sm font-medium text-neutral-700"
              >
                <CalendarIcon className="h-4 w-4" />
                Expiry (optional)
              </label>
              <select
                id="share-expiry"
                value={expiresInDays}
                onChange={(e) =>
                  setExpiresInDays(e.target.value ? Number(e.target.value) : "")
                }
                className="w-full border border-neutral-300 bg-white px-3 py-2 text-sm"
              >
                <option value="">Never expires</option>
                <option value={1}>1 day</option>
                <option value={7}>7 days</option>
                <option value={30}>30 days</option>
                <option value={90}>90 days</option>
              </select>
            </div>

            {error && (
              <div className="border-l-4 border-red-400 bg-red-50 px-3 py-2 text-sm text-red-800">
                {error}
              </div>
            )}

            <div className="flex justify-between gap-3">
              {shareInfo ? (
                <button
                  type="button"
                  onClick={resetForm}
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
                className="flex items-center justify-center gap-2 bg-blue-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
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
                            Uses form password
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-neutral-500">
                        <EyeIcon className="h-4 w-4" />
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
                        className="border border-blue-300 bg-white px-3 py-2 text-blue-800"
                      >
                        <DocumentDuplicateIcon className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-neutral-500">
                      Created {formatDate(share.createdAt)}
                      {share.expiresAt
                        ? ` • Expires ${formatDate(share.expiresAt)}`
                        : " • No expiry"}
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
};

export default ShareModal;

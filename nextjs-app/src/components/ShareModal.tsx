import React, { useState } from "react";
import {
  XMarkIcon,
  ShareIcon,
  LinkIcon,
  LockClosedIcon,
  CalendarIcon,
  CheckIcon,
  EyeIcon,
  DocumentDuplicateIcon,
} from "@heroicons/react/16/solid";
import { validatePassword } from "../lib/crypto";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  formId: string;
  formName: string;
}

interface ShareInfo {
  shareId: string;
  shareUrl: string;
  hasPassword: boolean;
  expiresAt: string | null;
  viewCount: number;
  createdAt: string;
}

const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  formId,
  formName,
}) => {
  const [password, setPassword] = useState("");
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
                hasPassword: boolean;
                expiresAt: string | null;
                viewCount: number;
                createdAt: string;
              }) => ({
                shareId: share.shareId,
                shareUrl: `${window.location.origin}/share/${share.shareId}`,
                hasPassword: share.hasPassword,
                expiresAt: share.expiresAt,
                viewCount: share.viewCount,
                createdAt: share.createdAt,
              })
            )
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
        body: JSON.stringify({
          password: password.trim() || undefined,
          expiresInDays: expiresInDays || undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setShareInfo({
          shareId: data.shareId,
          shareUrl: data.shareUrl,
          hasPassword: data.hasPassword,
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
    setPassword("");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <ShareIcon className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Share &quot;{formName}&quot;
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!shareInfo ? (
            <>
              {/* Create New Share */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Create New Share Link
                </h3>

                {/* Optional Password */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <LockClosedIcon className="h-4 w-4" />
                    Password Protection (Optional)
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Leave empty for no password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {password && !validatePassword(password).isValid && (
                    <p className="mt-1 text-sm text-amber-600">
                      Password should be at least 1 character
                    </p>
                  )}
                </div>

                {/* Expiry */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <CalendarIcon className="h-4 w-4" />
                    Expires In (Optional)
                  </label>
                  <select
                    value={expiresInDays}
                    onChange={(e) =>
                      setExpiresInDays(
                        e.target.value ? Number(e.target.value) : ""
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Never expires</option>
                    <option value={1}>1 day</option>
                    <option value={7}>7 days</option>
                    <option value={30}>30 days</option>
                    <option value={90}>90 days</option>
                  </select>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}

                {/* Create Button */}
                <button
                  onClick={createShare}
                  disabled={isCreating}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ShareIcon className="h-4 w-4" />
                  {isCreating ? "Creating..." : "Create Share Link"}
                </button>
              </div>

              {/* Existing Shares */}
              {existingShares.length > 0 && (
                <div className="mt-8 pt-6 border-t">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Existing Share Links
                  </h3>
                  <div className="space-y-3">
                    {existingShares.map((share, index) => (
                      <div
                        key={share.shareId}
                        className="p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <LinkIcon className="h-4 w-4" />
                            Share #{index + 1}
                            {share.hasPassword && (
                              <LockClosedIcon className="h-3 w-3 text-amber-600" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <EyeIcon className="h-4 w-4" />
                            {share.viewCount} views
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={share.shareUrl}
                            readOnly
                            className="flex-1 px-3 py-1 text-sm bg-white border border-gray-200 rounded"
                          />
                          <button
                            onClick={() => copyToClipboard(share.shareUrl)}
                            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                          >
                            <DocumentDuplicateIcon className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          Created: {formatDate(share.createdAt)}
                          {share.expiresAt &&
                            ` • Expires: ${formatDate(share.expiresAt)}`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Share Created Successfully */
            <div className="space-y-4">
              <div className="text-center">
                <CheckIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Share Link Created!
                </h3>
                <p className="text-gray-600">
                  Your form can now be accessed using the link below:
                </p>
              </div>

              {/* Share URL */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={shareInfo.shareUrl}
                    readOnly
                    className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(shareInfo.shareUrl)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      copied
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700 hover:bg-blue-200"
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

              {/* Share Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {shareInfo.viewCount}
                  </div>
                  <div className="text-sm text-blue-800">Views</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-600">
                    {shareInfo.hasPassword ? "Protected" : "Public"}
                  </div>
                  <div className="text-sm text-blue-800">Access</div>
                </div>
              </div>

              {shareInfo.expiresAt && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-amber-800 text-sm">
                    <CalendarIcon className="h-4 w-4 inline mr-1" />
                    This link will expire on {formatDate(shareInfo.expiresAt)}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Create Another
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
};

export default ShareModal;

"use client";

import React from "react";
import dynamic from "next/dynamic";
import CategoryBox from "../../../components/CategoryPage";
import IconButton from "../../../components/IconButton";
import {
  FormContextProvider,
  useFormContext,
} from "../../../contexts/FormContext";
import EncryptionStatus from "../../../components/EncryptionStatus";
import { decryptFormData } from "../../../lib/crypto";
import {
  HomeIcon,
  EyeIcon,
  CalendarIcon,
  ClockIcon,
  DocumentDuplicateIcon,
} from "@heroicons/react/24/outline";
import { Form, FormPOJO } from "../../../types/Form";
import { formatRelativeTime } from "../../../utils/RelativeDates";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";

interface ShareInfo {
  shareId: string;
  viewCount: number;
  createdAt: string;
  expiresAt: string;
}

function SharedFormPageContent() {
  const { form, setForm } = useFormContext();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [needsPasswordVerification, setNeedsPasswordVerification] =
    React.useState(false);
  const [shareInfo, setShareInfo] = React.useState<ShareInfo | null>(null);
  const [isFormEncrypted, setIsFormEncrypted] = React.useState(false);
  const [formName, setFormName] = React.useState("");
  const [isCloning, setIsCloning] = React.useState(false);

  const params = useParams();
  const shareId = params?.shareId as string;

  const loadFormData = React.useCallback(
    async (data: {
      form: {
        id: string;
        name: string;
        data: string;
        encrypted: boolean;
        password_hash?: string;
      };
      shareInfo: ShareInfo;
    }) => {
      try {
        const formData = data.form;
        setShareInfo(data.shareInfo);
        setIsFormEncrypted(formData.encrypted);
        setFormName(formData.name);

        if (formData.encrypted) {
          // Form itself is encrypted, need to prompt for form password
          setNeedsPasswordVerification(true);
          return;
        }

        // Parse the stored form data
        const parsedData = JSON.parse(formData.data);

        // Create Form object from the parsed data
        const loadedForm = Form.fromPOJO(parsedData as FormPOJO);
        setForm(loadedForm);
      } catch (error) {
        console.error("Error loading form data:", error);
        setError("Failed to parse form data");
      }
    },
    [setForm]
  );

  const loadSharedForm = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/share/${shareId}`);

      if (response.status === 404) {
        setError("Shared form not found");
        return;
      }

      if (response.status === 410) {
        setError("This shared form has expired");
        return;
      }

      if (!response.ok) {
        setError("Failed to load shared form");
        return;
      }

      const data = await response.json();

      if (data.requiresPassword) {
        setNeedsPasswordVerification(true);
        setFormName(data.formName);
        setIsFormEncrypted(data.isEncrypted);
        setShareInfo({
          shareId: data.shareId,
          viewCount: data.viewCount,
          createdAt: data.createdAt,
          expiresAt: data.expiresAt,
        });
      } else {
        // Load form directly
        await loadFormData(data);
      }
    } catch (error) {
      console.error("Error loading shared form:", error);
      setError("Failed to load shared form");
    } finally {
      setIsLoading(false);
    }
  }, [shareId, loadFormData]);

  // Load shared form on component mount
  React.useEffect(() => {
    if (shareId) {
      loadSharedForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shareId]);

  const handlePasswordVerification = async (password: string) => {
    try {
      const response = await fetch(`/api/share/${shareId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Invalid password");
        }
        throw new Error("Failed to verify password");
      }

      const data = await response.json();

      if (data.form.encrypted) {
        // This is an encrypted form, decrypt it with the form password (not share password)
        try {
          const encryptedData = JSON.parse(data.form.data);
          const decryptedData = decryptFormData(encryptedData, password);
          const loadedForm = Form.fromPOJO(decryptedData as FormPOJO);
          setForm(loadedForm);
        } catch (decryptError) {
          console.error("Failed to decrypt form:", decryptError);
          throw new Error("Failed to decrypt form data");
        }
      } else {
        // Form is not encrypted, parse directly
        const parsedData = JSON.parse(data.form.data);
        const loadedForm = Form.fromPOJO(parsedData as FormPOJO);
        setForm(loadedForm);
      }

      setNeedsPasswordVerification(false);
      setFormName(data.form.name);
      setShareInfo(data.shareInfo);
    } catch (error) {
      console.error("Password verification error:", error);
      throw error;
    }
  };

  const handleCloneForm = async () => {
    if (!shareId || !form) return;

    setIsCloning(true);
    try {
      const response = await fetch(`/api/share/${shareId}/clone`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to clone form");
      }

      const data = await response.json();

      // Store the cloned form in sessionStorage so it can be loaded
      sessionStorage.setItem("create_new", "true");
      sessionStorage.setItem(
        "form",
        JSON.stringify(Form.fromPOJO(JSON.parse(data.formData.data)))
      );

      // Navigate to the new form
      router.push(`/form/${data.formId}`);
    } catch (error) {
      console.error("Error cloning form:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to clone form. Please try again."
      );
    } finally {
      setIsCloning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading shared form...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <HomeIcon className="w-4 h-4 mr-2" />
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (needsPasswordVerification) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-full max-w-md px-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-center mb-6">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <EyeIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900 mb-2">
                {formName || "Shared Form"}
              </h1>
              {isFormEncrypted && (
                <div className="flex items-center justify-center text-sm text-blue-600 mb-4">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Encrypted Form
                </div>
              )}
              <p className="text-gray-600">
                This form is password protected. Please enter the password to
                view it.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter form password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onKeyDown={async (e) => {
                    if (e.key === "Enter") {
                      const target = e.target as HTMLInputElement;
                      if (target.value) {
                        try {
                          await handlePasswordVerification(target.value);
                        } catch (error) {
                          alert(
                            error instanceof Error
                              ? error.message
                              : "Invalid password"
                          );
                        }
                      }
                    }
                  }}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => router.push("/")}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    const input = document.getElementById(
                      "password"
                    ) as HTMLInputElement;
                    if (input?.value) {
                      try {
                        await handlePasswordVerification(input.value);
                      } catch (error) {
                        alert(
                          error instanceof Error
                            ? error.message
                            : "Invalid password"
                        );
                      }
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Access Form
                </button>
              </div>
            </div>

            {shareInfo && (
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                <div className="flex items-center text-sm text-gray-500">
                  <EyeIcon className="w-4 h-4 mr-2" />
                  <span>Viewed {shareInfo.viewCount} times</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  <span>
                    Shared {formatRelativeTime(new Date(shareInfo.createdAt))}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <ClockIcon className="w-4 h-4 mr-2" />
                  <span>
                    Expires {formatRelativeTime(new Date(shareInfo.expiresAt))}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Unable to load form data</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Home Button */}
      <IconButton
        onClick={() => router.push("/")}
        className="absolute top-2 left-2"
      >
        <HomeIcon className="h-6 w-6 transition-transform group-hover:scale-90 group-hover:text-violet-400" />
      </IconButton>

      {/* Clone Button */}
      <IconButton
        onClick={handleCloneForm}
        className="absolute top-2 right-2"
        disabled={isCloning}
      >
        <DocumentDuplicateIcon className="h-6 w-6 transition-transform group-hover:scale-90 group-hover:text-blue-400" />
      </IconButton>

      {/* Share Info Overlay (top-right, below clone button) */}
      {shareInfo && (
        <div className="absolute top-14 right-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs text-blue-700 space-y-1 shadow-sm">
          <div className="flex items-center">
            <EyeIcon className="w-3 h-3 mr-1" />
            <span>{shareInfo.viewCount} views</span>
          </div>
          <div className="flex items-center">
            <CalendarIcon className="w-3 h-3 mr-1" />
            <span>
              Shared {formatRelativeTime(new Date(shareInfo.createdAt))}
            </span>
          </div>
          <div className="flex items-center">
            <ClockIcon className="w-3 h-3 mr-1" />
            <span>
              Expires {formatRelativeTime(new Date(shareInfo.expiresAt))}
            </span>
          </div>
        </div>
      )}

      {/* Form Title with Encryption Status */}
      <div className="mb-4 flex items-center gap-2">
        <div className="w-fit border-b-1 text-center text-2xl bg-transparent">
          {formName}
        </div>
        {isFormEncrypted && (
          <EncryptionStatus isEncrypted={true} showText={false} />
        )}
        <span className="text-sm text-blue-600 font-semibold bg-blue-100 px-2 py-1 rounded">
          Shared
        </span>
      </div>

      {/* Form Categories */}
      {form.categories.map((category) => (
        <CategoryBox
          id={category.id}
          key={category.id.toString()}
          advancedOptions={false}
          readOnly={true}
        />
      ))}
    </>
  );
}

// Export with dynamic loading to prevent SSR issues
export default dynamic(
  () =>
    Promise.resolve(() => (
      <FormContextProvider>
        <SharedFormPageContent />
      </FormContextProvider>
    )),
  { ssr: false }
);

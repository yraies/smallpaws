"use client";

import React from "react";
import dynamic from "next/dynamic";
import IconButton from "../../../components/IconButton";
import {
  FormContextProvider,
  useFormContext,
} from "../../../contexts/FormContext";
import FormHeader from "../../../components/FormHeader";
import DeletedFormMessage from "../../../components/DeletedFormMessage";
import FormCategoryList from "../../../components/FormCategoryList";
import LoadingState from "../../../components/LoadingState";
import ErrorMessage from "../../../components/ErrorMessage";
import ShareInfoOverlay from "../../../components/ShareInfoOverlay";
import { decryptFormData } from "../../../lib/crypto";
import {
  DocumentDuplicateIcon,
  EyeIcon,
  CalendarIcon,
  ClockIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import { Form, FormPOJO } from "../../../types/Form";
import { formatRelativeTime } from "../../../utils/RelativeDates";
import { exportFormAsCSV, exportFormAsJSON } from "../../../utils/formActions";
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
  const [isDeleted, setIsDeleted] = React.useState(false);

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

        // Check if form has been deleted (soft delete)
        if (formData.name === "[Deleted]" || formData.data === "{}") {
          setIsDeleted(true);
          setIsLoading(false);
          return;
        }

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

  // Export handlers
  const handleExportCSV = () => {
    if (form) {
      exportFormAsCSV(form);
    }
  };

  const handleExportJSON = () => {
    if (form) {
      exportFormAsJSON(form);
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading shared form..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onGoHome={() => router.push("/")} />;
  }

  // Show deleted form message if the form has been deleted
  if (isDeleted) {
    return (
      <DeletedFormMessage
        message="The shared form you're trying to access has been removed."
        onGoHome={() => router.push("/")}
      />
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
      <FormHeader
        formName={formName}
        isEncrypted={isFormEncrypted}
        status="shared"
        onHomeClick={() => router.push("/")}
        readOnly={true}
      />

      {/* Clone Button */}
      <IconButton
        onClick={handleCloneForm}
        className="absolute top-2 right-2"
        disabled={isCloning}
      >
        <DocumentDuplicateIcon className="h-6 w-6 transition-transform group-hover:scale-90 group-hover:text-blue-400" />
      </IconButton>

      {/* Export CSV Button */}
      <IconButton
        onClick={handleExportCSV}
        className="absolute top-2 right-14"
        title="Export as CSV"
      >
        <ArrowDownTrayIcon className="h-6 w-6 transition-transform group-hover:scale-90 group-hover:text-green-400" />
      </IconButton>

      {/* Export JSON Button */}
      <IconButton
        onClick={handleExportJSON}
        className="absolute top-2 right-26"
        title="Export as JSON"
      >
        <ArrowDownTrayIcon className="h-6 w-6 transition-transform group-hover:scale-90 group-hover:text-purple-400" />
      </IconButton>

      {/* Share Info Overlay (top-right, below clone button) */}
      {shareInfo && <ShareInfoOverlay shareInfo={shareInfo} />}

      {/* Form Categories */}
      <FormCategoryList
        categories={form.categories}
        advancedOptions={false}
        readOnly={true}
      />
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

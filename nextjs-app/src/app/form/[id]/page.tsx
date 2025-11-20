"use client";

import React from "react";
import dynamic from "next/dynamic";
import CategoryBox from "../../../components/CategoryPage";
import {
  FormContextProvider,
  useFormContext,
} from "../../../contexts/FormContext";
import { Category, Question } from "../../../types/Form";
import IconButton from "../../../components/IconButton";
import PasswordModal from "../../../components/PasswordModal";
import ShareModal from "../../../components/ShareModal";
import EncryptionStatus from "../../../components/EncryptionStatus";
import {
  EyeIcon,
  NewspaperIcon,
  PaintBrushIcon,
  WrenchScrewdriverIcon,
  HomeIcon,
  CloudArrowUpIcon,
  PlusIcon,
  ShareIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/16/solid";
import { useLocalStorage } from "@uidotdev/usehooks";
import { useRouter, useParams } from "next/navigation";
import {
  encryptFormData,
  hashPassword,
  decryptFormData,
} from "../../../lib/crypto";
import { Form, FormPOJO } from "../../../types/Form";

function FormPageContent() {
  const { form, setForm } = useFormContext();
  const [advancedOptions, setAdvancedOptions] = React.useState(false);
  const [showIcon, setShowIcon] = useLocalStorage("showIcons", false);
  const [showPasswordModal, setShowPasswordModal] = React.useState(false);
  const [showShareModal, setShowShareModal] = React.useState(false);
  const [isPublishing, setIsPublishing] = React.useState(false);
  const [isPublished, setIsPublished] = React.useState(false);
  const [isEncrypted, setIsEncrypted] = React.useState(false);
  const [needsPasswordVerification, setNeedsPasswordVerification] =
    React.useState(false);
  const [isLoadingForm, setIsLoadingForm] = React.useState(true);
  const [isCloning, setIsCloning] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isDeleted, setIsDeleted] = React.useState(false);
  const router = useRouter();
  const params = useParams();
  const formId = params?.id as string;

  // Check if form exists and if it's encrypted
  React.useEffect(() => {
    if (formId) {
      // Always check form status when formId is available
      checkFormStatus(formId);
    }
  }, [formId]);

  // Once form is loaded, stop the loading state
  React.useEffect(() => {
    if (form) {
      setIsLoadingForm(false);
    }
  }, [form]);

  const checkFormStatus = async (id: string) => {
    try {
      const response = await fetch(`/api/forms/${id}`);
      if (response.ok) {
        const storedForm = await response.json();

        // Check if form has been deleted (soft delete)
        if (storedForm.name === "[Deleted]" || storedForm.data === "{}") {
          setIsDeleted(true);
          setIsPublished(true);
          setIsLoadingForm(false);
          return;
        }

        setIsPublished(true); // Form exists in database, so it's published
        if (storedForm.encrypted) {
          setNeedsPasswordVerification(true);
          setIsEncrypted(true);
        }
      } else {
        // Form not found in API, not published yet
        setIsPublished(false);
      }
      // Always set loading to false after checking, whether form exists or not
      setIsLoadingForm(false);
    } catch (error) {
      console.error("Error checking form status:", error);
      setIsPublished(false);
      setIsLoadingForm(false);
    }
  };

  const handlePasswordVerification = async (password: string) => {
    if (!formId) return;

    try {
      const response = await fetch(`/api/forms/${formId}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Decryption - raw result:", result.form.data);
        // Parse the stored data - it's been JSON.stringify'd by the API
        const storedData = JSON.parse(result.form.data);
        console.log("Decryption - parsed data:", storedData);
        // storedData should now be the EncryptedData object with encrypted and salt
        const decryptedFormData = decryptFormData(storedData, password);
        console.log("Decryption - decrypted successfully");
        const loadedForm = Form.fromPOJO(decryptedFormData as FormPOJO);
        setForm(loadedForm);
        setNeedsPasswordVerification(false);
      } else {
        console.error("Invalid password");
        // Could show error message to user
      }
    } catch (error) {
      console.error("Error verifying password:", error);
    }
  };

  if (isLoadingForm) {
    return <h1>Loading...</h1>;
  }

  if (needsPasswordVerification) {
    return (
      <div className="flex w-full flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold">Password Protected Form</h1>
        <p>This form is encrypted and requires a password to view.</p>
        <PasswordModal
          isOpen={true}
          onClose={() => router.push("/")}
          onSubmit={(password: string) => handlePasswordVerification(password)}
          mode="enter"
          title="Enter Password"
          description="This form is encrypted and requires a password to view."
        />
      </div>
    );
  }

  // Check for deleted form BEFORE checking if form exists
  // (deleted forms won't be loaded into state)
  if (isDeleted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <TrashIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">
            This form has been deleted
          </h1>
          <p className="text-gray-400 mb-6">
            The form you&apos;re trying to access has been removed.
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-violet-500 hover:bg-violet-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  if (!form) return <h1>Form not found</h1>;

  const handlePublishForm = async (
    password: string,
    shouldEncrypt: boolean
  ) => {
    if (!form || !formId) return;

    setIsPublishing(true);

    try {
      let formData = form;
      let encrypted = false;
      let password_hash = null;

      if (shouldEncrypt && password) {
        // Encrypt form data
        console.log("Encryption - original form:", form);
        const encryptedData = encryptFormData(form, password);
        console.log("Encryption - encrypted data:", encryptedData);
        formData = encryptedData as unknown as typeof form; // Store entire encrypted data object
        encrypted = true;
        password_hash = hashPassword(password);
      }

      const response = await fetch(`/api/forms/${formId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          data: formData,
          encrypted,
          password_hash,
        }),
      });

      if (response.ok) {
        setIsEncrypted(encrypted);
        setIsPublished(true);
        setShowPasswordModal(false);
        alert("Form published successfully!");
      } else {
        const error = await response.json();
        if (response.status === 409) {
          // Form already published
          alert(
            error.error ||
              "This form has already been published and cannot be modified."
          );
        } else {
          console.error("Failed to publish form:", error);
          alert("Failed to publish form. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error publishing form:", error);
      alert("An error occurred while publishing the form.");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCloneForm = () => {
    if (!form || !formId) return;

    setIsCloning(true);
    try {
      // Generate a new form ID
      const newFormId = `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create a copy of the current form with new name
      const clonedForm = form.withName(`${form.name} (Copy)`);

      // Store in sessionStorage for the new form page
      sessionStorage.setItem("create_new", "true");
      sessionStorage.setItem("form", JSON.stringify(clonedForm));

      // Navigate to the new form with the new ID
      router.push(`/form/${newFormId}`);
    } catch (error) {
      console.error("Error cloning form:", error);
      alert("Failed to clone form. Please try again.");
    } finally {
      setIsCloning(false);
    }
  };

  const handleExportCSV = () => {
    if (!form) return;

    try {
      // Build CSV content: Category, Question, Selection
      const csvLines = ["Category,Question,Selection"];

      form.categories.forEach((category) => {
        category.questions.forEach((question) => {
          const selection =
            question.selection === null ? "Unset" : question.selection;
          // Escape quotes in category/question text
          const cat = `"${category.name.replace(/"/g, '""')}"`;
          const q = `"${question.value.replace(/"/g, '""')}"`;
          csvLines.push(`${cat},${q},${selection}`);
        });
      });

      const csvContent = csvLines.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute("download", `${form.name || "form"}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting CSV:", error);
      alert("Failed to export CSV. Please try again.");
    }
  };

  const handleExportJSON = () => {
    if (!form) return;

    try {
      // Export the full form data as JSON
      const jsonContent = JSON.stringify(form, null, 2);
      const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute("download", `${form.name || "form"}.json`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting JSON:", error);
      alert("Failed to export JSON. Please try again.");
    }
  };

  const handleDeleteForm = async () => {
    if (!form || !formId) return;

    const confirmed = confirm(
      `Are you sure you want to delete "${form.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/forms/${formId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Also clean up any localStorage remnants
        localStorage.removeItem(`${formId}-data`);
        localStorage.removeItem(`${formId}-meta`);

        alert("Form deleted successfully!");
        router.push("/");
      } else {
        const error = await response.json();
        console.error("Failed to delete form:", error);
        alert("Failed to delete form. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting form:", error);
      alert("An error occurred while deleting the form.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <IconButton
        onClick={() => router.push("/")}
        className="absolute top-2 left-2"
      >
        <HomeIcon className="h-6 w-6 transition-transform group-hover:scale-90 group-hover:text-violet-400" />
      </IconButton>

      {/* Publish Button - Only show when NOT published */}
      {!isPublished && (
        <IconButton
          onClick={() => setShowPasswordModal(true)}
          className="absolute top-2 right-26"
          disabled={isPublishing}
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

      {/* Share Button - Only show when published */}
      {isPublished && (
        <IconButton
          onClick={() => setShowShareModal(true)}
          className="absolute top-2 right-26"
        >
          <ShareIcon className="h-6 w-6 transition-transform group-hover:scale-90 group-hover:text-blue-400" />
        </IconButton>
      )}

      {/* Clone Button - Only show when published */}
      {isPublished && (
        <IconButton
          onClick={handleCloneForm}
          className="absolute top-2 left-14"
          disabled={isCloning}
        >
          <DocumentDuplicateIcon className="h-6 w-6 transition-transform group-hover:scale-90 group-hover:text-blue-400" />
        </IconButton>
      )}

      {/* Export CSV Button - Only show when published */}
      {isPublished && (
        <IconButton
          onClick={handleExportCSV}
          className="absolute top-2 left-26"
        >
          <ArrowDownTrayIcon className="h-6 w-6 transition-transform group-hover:scale-90 group-hover:text-green-400" />
        </IconButton>
      )}

      {/* Export JSON Button - Only show when published */}
      {isPublished && (
        <IconButton
          onClick={handleExportJSON}
          className="absolute top-2 left-38"
        >
          <ArrowDownTrayIcon className="h-6 w-6 transition-transform group-hover:scale-90 group-hover:text-blue-400" />
        </IconButton>
      )}

      {/* Delete Button - Only show when published */}
      {isPublished && (
        <IconButton
          onClick={handleDeleteForm}
          className="absolute top-2 left-50"
          disabled={isDeleting}
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

      <IconButton
        onClick={() => setAdvancedOptions(!advancedOptions)}
        className="absolute top-2 right-2"
      >
        {!advancedOptions ? (
          <EyeIcon className="h-6 w-6 transition-transform group-hover:scale-90 group-hover:text-violet-400" />
        ) : (
          <WrenchScrewdriverIcon className="h-6 w-6 transition-transform group-hover:scale-90 group-hover:text-violet-400" />
        )}
      </IconButton>
      <IconButton
        onClick={() => setShowIcon(!showIcon)}
        className="absolute top-2 right-14"
      >
        {!showIcon ? (
          <NewspaperIcon className="h-6 w-6 transition-transform group-hover:scale-90 group-hover:text-violet-400" />
        ) : (
          <PaintBrushIcon className="h-6 w-6 transition-transform group-hover:scale-90 group-hover:text-violet-400" />
        )}
      </IconButton>

      {/* Form Title with Encryption Status */}
      <div className="mb-4 flex items-center gap-2">
        <input
          type="text"
          title="Form name"
          className="w-fit border-b-1 text-center text-2xl bg-transparent focus:outline-none"
          value={form?.name || ""}
          onChange={(e) => setForm((prev) => prev.withName(e.target.value))}
          placeholder="Form Name"
          disabled={isPublished}
        />
        <EncryptionStatus isEncrypted={isEncrypted} showText={false} />
        {isPublished && (
          <span className="text-sm text-green-600 font-semibold bg-green-100 px-2 py-1 rounded">
            Published
          </span>
        )}
        {!isPublished && (
          <span className="text-sm text-orange-600 font-semibold bg-orange-100 px-2 py-1 rounded">
            Draft
          </span>
        )}
      </div>

      {form.categories.map((category) => (
        <CategoryBox
          id={category.id}
          key={category.id.toString()}
          advancedOptions={advancedOptions}
          readOnly={isPublished}
        />
      ))}

      {advancedOptions && !isPublished && (
        <button
          className="flex w-fit items-center justify-center gap-2 px-2 py-1 hover:backdrop-brightness-90"
          onClick={() =>
            setForm((prev) =>
              prev.addCategory(Category.new("", [Question.new("")]))
            )
          }
        >
          <PlusIcon className="h-4 w-4" />
          Add new Category
        </button>
      )}

      {/* Password Modal */}
      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSubmit={handlePublishForm}
        mode="set"
        title="Publish Form"
        description="Choose whether to protect your form with a password"
      />

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        formId={formId}
        formName={form.name}
      />
    </>
  );
}

// Create a client-side only version using dynamic import
const FormPageContentClientOnly = dynamic(
  () => Promise.resolve(FormPageContent),
  {
    ssr: false,
    loading: () => <div>Loading form...</div>,
  }
);

export default function FormPage() {
  return (
    <FormContextProvider>
      <FormPageContentClientOnly />
    </FormContextProvider>
  );
}

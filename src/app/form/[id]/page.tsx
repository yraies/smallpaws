"use client";

import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import DeletedFormMessage from "../../../components/DeletedFormMessage";
import DocumentPageShell from "../../../components/DocumentPageShell";
import FormActionButtons from "../../../components/FormActionButtons";
import FormCategoryList from "../../../components/FormCategoryList";
import FormPhaseBanner from "../../../components/FormPhaseBanner";
import LoadingState from "../../../components/LoadingState";
import PasswordModal from "../../../components/PasswordModal";
import ShareModal from "../../../components/ShareModal";
import { DisplayPreferencesProvider } from "../../../contexts/DisplayPreferencesContext";
import { FormActionsProvider } from "../../../contexts/FormActionsContext";
import {
  FormContextProvider,
  useFormContext,
} from "../../../contexts/FormContext";
import {
  decryptFormData,
  encryptFormData,
  hashPassword,
} from "../../../lib/crypto";
import { Form, type FormPOJO } from "../../../types/Form";
import { getCompareIdentity } from "../../../utils/compareIdentity";
import {
  computeStructureFingerprint,
  removeLocalDraft,
  saveRecentFormMeta,
} from "../../../utils/recentForms";

function FormPageContent() {
  const { form, setForm } = useFormContext();
  const [showPasswordModal, setShowPasswordModal] = React.useState(false);
  const [showShareModal, setShowShareModal] = React.useState(false);
  const [isPublished, setIsPublished] = React.useState(false);
  const [isEncrypted, setIsEncrypted] = React.useState(false);
  const [_isPublishing, setIsPublishing] = React.useState(false);
  const [needsPasswordVerification, setNeedsPasswordVerification] =
    React.useState(false);
  const [isLoadingForm, setIsLoadingForm] = React.useState(true);
  const [isDeleted, setIsDeleted] = React.useState(false);
  const router = useRouter();
  const params = useParams();
  const formId = params?.id as string;

  const checkFormStatus = React.useCallback(async (id: string) => {
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
  }, []);

  // Check if form exists and if it's encrypted
  React.useEffect(() => {
    if (formId) {
      checkFormStatus(formId);
    }
  }, [formId, checkFormStatus]);

  // Once form is loaded, stop the loading state
  React.useEffect(() => {
    if (form) {
      setIsLoadingForm(false);
    }
  }, [form]);

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
    return <LoadingState message="Loading..." showSpinner={false} />;
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
      <DeletedFormMessage
        message="The form you're trying to access has been removed."
        onGoHome={() => router.push("/")}
      />
    );
  }

  if (!form) return <h1>Form not found</h1>;

  const handlePublishForm = async (
    password: string,
    shouldEncrypt: boolean,
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
        saveRecentFormMeta(localStorage, {
          id: formId,
          name: form.name,
          respondentName: form.respondentName,
          templateName: form.templateName,
          structureFingerprint: computeStructureFingerprint(form),
          compareIdentity: getCompareIdentity(formId),
          encrypted,
          kind: "form",
          phase: "published",
        });
        removeLocalDraft(localStorage, formId);
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
              "This form has already been published and cannot be modified.",
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

  return (
    <FormActionsProvider
      formId={formId}
      initialIsPublished={isPublished}
      initialIsEncrypted={isEncrypted}
      onPublish={() => setShowPasswordModal(true)}
      onShare={() => setShowShareModal(true)}
    >
      <DocumentPageShell
        formName={form?.templateName || form?.name || ""}
        isEncrypted={isEncrypted}
        onFormNameChange={
          form?.templateName
            ? undefined
            : (name) => setForm((prev) => prev.withName(name))
        }
        respondentName={
          form?.templateName ? (form.respondentName ?? "") : undefined
        }
        onRespondentNameChange={
          form?.templateName && !isPublished
            ? (name) => setForm((prev) => prev.withRespondentName(name))
            : undefined
        }
        onHomeClick={() => router.push("/")}
        readOnly={isPublished}
        actions={<FormActionButtons />}
        notice={<FormPhaseBanner phase={isPublished ? "published" : "draft"} />}
      >
        <FormCategoryList
          setDocument={setForm}
          categories={form.categories}
          answerMode={isPublished ? "readonly" : "editable"}
          structureEditable={false}
          answerOptions={form.answerOptions}
        />

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
          requiresPassword={isEncrypted}
        />
      </DocumentPageShell>
    </FormActionsProvider>
  );
}

// Create a client-side only version using dynamic import
const FormPageContentClientOnly = dynamic(
  () => Promise.resolve(FormPageContent),
  {
    ssr: false,
    loading: () => <div>Loading form...</div>,
  },
);

export default function FormPage() {
  return (
    <FormContextProvider>
      <DisplayPreferencesProvider initialShowIcon={false}>
        <FormPageContentClientOnly />
      </DisplayPreferencesProvider>
    </FormContextProvider>
  );
}

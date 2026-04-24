"use client";

import {
  ArrowDownTrayIcon,
  DocumentDuplicateIcon,
  PrinterIcon,
  ScaleIcon,
} from "@heroicons/react/16/solid";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import DeletedFormMessage from "../../../components/DeletedFormMessage";
import DocumentPageShell from "../../../components/DocumentPageShell";
import ErrorMessage from "../../../components/ErrorMessage";
import FormCategoryList from "../../../components/FormCategoryList";
import FormPhaseBanner from "../../../components/FormPhaseBanner";
import LoadingState from "../../../components/LoadingState";
import PageActionRails, {
  type RailAction,
} from "../../../components/PageActionRails";
import PasswordModal from "../../../components/PasswordModal";
import ShareInfoOverlay from "../../../components/ShareInfoOverlay";
import { DisplayPreferencesProvider } from "../../../contexts/DisplayPreferencesContext";
import {
  FormContextProvider,
  useFormContext,
} from "../../../contexts/FormContext";
import { decryptFormData } from "../../../lib/crypto";
import { Form, type FormPOJO } from "../../../types/Form";
import {
  exportFormAsCSV,
  exportFormAsJSON,
  prepareFormClone,
  printCurrentView,
} from "../../../utils/formActions";
import {
  computeStructureFingerprint,
  saveRecentSharedForm,
} from "../../../utils/recentForms";

interface ShareInfo {
  shareId: string;
  viewCount: number;
  createdAt: string;
  expiresAt: string | null;
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
  const [isDeleted, setIsDeleted] = React.useState(false);

  const params = useParams();
  const shareId = params?.shareId as string;

  const loadFormData = React.useCallback(
    async (data: {
      compareIdentity?: string;
      form: {
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

        if (formData.name === "[Deleted]" || formData.data === "{}") {
          setIsDeleted(true);
          setIsLoading(false);
          return;
        }

        if (formData.encrypted) {
          setNeedsPasswordVerification(true);
          return;
        }

        const parsedData = JSON.parse(formData.data);
        const loadedForm = Form.fromPOJO(parsedData as FormPOJO);
        setForm(loadedForm);

        // Save to recently viewed shared forms
        saveRecentSharedForm(localStorage, {
          shareId,
          compareIdentity: data.compareIdentity,
          name: formData.name,
          respondentName: loadedForm.respondentName,
          templateName: loadedForm.templateName,
          structureFingerprint: computeStructureFingerprint(loadedForm),
          date: new Date().toISOString(),
          encrypted: false,
        });
      } catch (loadError) {
        console.error("Error loading form data:", loadError);
        setError("Failed to parse form data");
      }
    },
    [setForm, shareId],
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
        return;
      }

      await loadFormData(data);
    } catch (loadError) {
      console.error("Error loading shared form:", loadError);
      setError("Failed to load shared form");
    } finally {
      setIsLoading(false);
    }
  }, [loadFormData, shareId]);

  React.useEffect(() => {
    if (shareId) {
      void loadSharedForm();
    }
  }, [shareId, loadSharedForm]);

  const handlePasswordVerification = async (password: string) => {
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
    let loadedForm: Form;

    if (data.form.encrypted) {
      try {
        const encryptedData = JSON.parse(data.form.data);
        const decryptedData = decryptFormData(encryptedData, password);
        loadedForm = Form.fromPOJO(decryptedData as FormPOJO);
      } catch (decryptError) {
        console.error("Failed to decrypt form:", decryptError);
        throw new Error("Failed to decrypt form data");
      }
    } else {
      const parsedData = JSON.parse(data.form.data);
      loadedForm = Form.fromPOJO(parsedData as FormPOJO);
    }

    setForm(loadedForm);
    setNeedsPasswordVerification(false);
    setFormName(data.form.name);
    setShareInfo(data.shareInfo);

    // Save to recently viewed shared forms
    saveRecentSharedForm(localStorage, {
      shareId,
      compareIdentity: data.compareIdentity,
      name: data.form.name,
      respondentName: loadedForm.respondentName,
      templateName: loadedForm.templateName,
      structureFingerprint: computeStructureFingerprint(loadedForm),
      date: new Date().toISOString(),
      encrypted: data.form.encrypted,
    });
  };

  const startLocalDraft = () => {
    if (!form) {
      return;
    }

    const newFormId = prepareFormClone(form);
    router.push(`/form/${newFormId}`);
  };

  if (isLoading) {
    return <LoadingState message="Loading shared form..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onGoHome={() => router.push("/")} />;
  }

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
      <DocumentPageShell
        formName={formName || "Shared Form"}
        isEncrypted={isFormEncrypted}
        onHomeClick={() => router.push("/")}
        readOnly={true}
        notice={<FormPhaseBanner phase="shared" />}
        overlay={shareInfo ? <ShareInfoOverlay shareInfo={shareInfo} /> : null}
      >
        <PasswordModal
          isOpen={true}
          onClose={() => router.push("/")}
          onSubmit={(password: string) => handlePasswordVerification(password)}
          mode="enter"
          title="Enter Password"
          description={`Enter the password for "${formName || "Shared Form"}".`}
          submitLabelEnter="Open Shared Form"
        />
      </DocumentPageShell>
    );
  }

  if (!form) {
    return (
      <ErrorMessage
        message="Unable to load form data"
        onGoHome={() => router.push("/")}
      />
    );
  }

  return (
    <DocumentPageShell
      formName={form.templateName || formName}
      isEncrypted={isFormEncrypted}
      onHomeClick={() => router.push("/")}
      readOnly={true}
      respondentName={
        form.templateName ? (form.respondentName ?? undefined) : undefined
      }
      actions={
        <PageActionRails
          leftActions={
            [
              {
                key: "new-draft",
                label: "New Draft",
                onClick: startLocalDraft,
                title: "Create New Draft",
                variant: "default",
                icon: <DocumentDuplicateIcon className="h-5 w-5" />,
              },
              {
                key: "compare",
                label: "Compare",
                onClick: () =>
                  router.push(
                    `/compare?forms=${encodeURIComponent(`share:${shareId}`)}`,
                  ),
                title: "Compare with other forms",
                variant: "info",
                icon: <ScaleIcon className="h-5 w-5" />,
              },
              {
                key: "csv",
                label: "Export CSV",
                onClick: () => exportFormAsCSV(form),
                title: "Export as CSV",
                variant: "success",
                icon: <ArrowDownTrayIcon className="h-5 w-5" />,
              },
              {
                key: "json",
                label: "Export JSON",
                onClick: () => exportFormAsJSON(form),
                title: "Export as JSON",
                variant: "info",
                icon: <ArrowDownTrayIcon className="h-5 w-5" />,
              },
            ] satisfies RailAction[]
          }
          rightActions={
            [
              {
                key: "print",
                label: "Print",
                onClick: printCurrentView,
                title: "Print this view",
                variant: "default",
                icon: <PrinterIcon className="h-5 w-5" />,
              },
            ] satisfies RailAction[]
          }
        />
      }
      notice={<FormPhaseBanner phase="shared" />}
      overlay={shareInfo ? <ShareInfoOverlay shareInfo={shareInfo} /> : null}
    >
      <FormCategoryList
        categories={form.categories}
        answerMode="readonly"
        structureEditable={false}
        answerOptions={form.answerOptions}
      />
    </DocumentPageShell>
  );
}

export default dynamic(
  () =>
    Promise.resolve(() => (
      <FormContextProvider>
        <DisplayPreferencesProvider initialShowIcon={true}>
          <SharedFormPageContent />
        </DisplayPreferencesProvider>
      </FormContextProvider>
    )),
  { ssr: false },
);

"use client";

import { PlayIcon, PrinterIcon } from "@heroicons/react/16/solid";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import { typeid } from "typeid-js";
import DocumentPageShell from "../../../../components/DocumentPageShell";
import DocumentPhaseNotice from "../../../../components/DocumentPhaseNotice";
import ErrorMessage from "../../../../components/ErrorMessage";
import FormCategoryList from "../../../../components/FormCategoryList";
import LoadingState from "../../../../components/LoadingState";
import PageActionRails, {
  type RailAction,
} from "../../../../components/PageActionRails";
import PasswordModal from "../../../../components/PasswordModal";
import { decryptFormData } from "../../../../lib/crypto";
import { Form, type FormPOJO } from "../../../../types/Form";
import { printCurrentView } from "../../../../utils/formActions";
import {
  saveDraftFormData,
  saveRecentFormMeta,
} from "../../../../utils/recentForms";

function SharedTemplatePageContent() {
  const [template, setTemplate] = React.useState<Form | null>(null);
  const [templateName, setTemplateName] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [viewCount, setViewCount] = React.useState<number | null>(null);
  const [isEncrypted, setIsEncrypted] = React.useState(false);
  const [needsPasswordVerification, setNeedsPasswordVerification] =
    React.useState(false);
  const router = useRouter();
  const params = useParams();
  const shareId = params?.shareId as string;

  React.useEffect(() => {
    if (!shareId) return;

    void (async () => {
      try {
        const response = await fetch(`/api/template-share/${shareId}`);
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to load shared template");
        }

        const data = await response.json();
        if (data.requiresPassword) {
          setTemplateName(data.templateName);
          setViewCount(data.viewCount ?? null);
          setIsEncrypted(true);
          setNeedsPasswordVerification(true);
          return;
        }

        setTemplate(Form.fromPOJO(JSON.parse(data.template.data) as FormPOJO));
        setTemplateName(data.template.name);
        setViewCount(data.shareInfo.viewCount);
      } catch (loadError) {
        console.error("Error loading shared template:", loadError);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load shared template",
        );
      } finally {
        setIsLoading(false);
      }
    })();
  }, [shareId]);

  const handlePasswordVerification = async (password: string) => {
    try {
      const response = await fetch(`/api/template-share/${shareId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Invalid password");
        return;
      }

      const result = await response.json();
      const encryptedData = JSON.parse(result.template.data);
      const decryptedTemplate = decryptFormData(
        encryptedData,
        password,
      ) as FormPOJO;

      setTemplate(Form.fromPOJO(decryptedTemplate));
      setTemplateName(result.template.name);
      setViewCount(result.shareInfo.viewCount);
      setIsEncrypted(true);
      setNeedsPasswordVerification(false);
    } catch (verifyError) {
      console.error("Error verifying shared template password:", verifyError);
      alert("Failed to unlock template.");
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading shared template..." />;
  }

  if (needsPasswordVerification) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Password Protected Template</h1>
        <p>This shared template requires the template password to open.</p>
        <PasswordModal
          isOpen={true}
          onClose={() => router.push("/")}
          onSubmit={(password: string) => handlePasswordVerification(password)}
          mode="enter"
          title="Enter Password"
          description={`Enter the password for "${templateName}".`}
        />
      </div>
    );
  }

  if (error || !template) {
    return (
      <ErrorMessage
        message={error || "Unable to load shared template"}
        onGoHome={() => router.push("/")}
      />
    );
  }

  const startLocalForm = () => {
    const formId = typeid("form").toString();
    const draftForm = template.withoutAnswers();

    saveRecentFormMeta(localStorage, {
      id: formId,
      name: draftForm.name,
      encrypted: false,
      isPublished: false,
      kind: "form",
    });
    saveDraftFormData(localStorage, formId, JSON.stringify(draftForm));

    sessionStorage.setItem("create_new", "true");
    sessionStorage.setItem("form", JSON.stringify(draftForm));
    router.push(`/form/${formId}`);
  };

  return (
    <DocumentPageShell
      formName={template.name}
      isEncrypted={isEncrypted}
      onHomeClick={() => router.push("/")}
      readOnly={true}
      actions={
        <PageActionRails
          rightActions={
            [
              {
                key: "print-template",
                label: "Print",
                onClick: printCurrentView,
                title: "Print this template",
                variant: "default",
                icon: <PrinterIcon className="h-5 w-5" />,
              },
              {
                key: "create-my-form",
                label: "Create My Form",
                onClick: startLocalForm,
                title: "Create My Form",
                variant: "success",
                icon: <PlayIcon className="h-5 w-5" />,
              },
            ] satisfies RailAction[]
          }
        />
      }
      notice={
        <DocumentPhaseNotice
          label="Shared Template"
          tone="shared"
          description="This shared template is read-only. Review the structure, then create your own local form to fill in answers."
          meta={viewCount !== null ? `Viewed ${viewCount} times` : undefined}
        />
      }
    >
      <FormCategoryList
        categories={template.categories}
        answerMode="hidden"
        structureEditable={false}
      />
    </DocumentPageShell>
  );
}

const SharedTemplatePageContentClientOnly = dynamic(
  () => Promise.resolve(SharedTemplatePageContent),
  {
    ssr: false,
    loading: () => <div>Loading shared template...</div>,
  },
);

export default function SharedTemplatePage() {
  return <SharedTemplatePageContentClientOnly />;
}

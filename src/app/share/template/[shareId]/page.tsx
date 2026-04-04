"use client";

import { PlayIcon } from "@heroicons/react/16/solid";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import { typeid } from "typeid-js";
import DocumentPhaseNotice from "../../../../components/DocumentPhaseNotice";
import ErrorMessage from "../../../../components/ErrorMessage";
import FormCategoryList from "../../../../components/FormCategoryList";
import FormHeader from "../../../../components/FormHeader";
import LoadingState from "../../../../components/LoadingState";
import PageActionRails, {
  type RailAction,
} from "../../../../components/PageActionRails";
import { Form, type FormPOJO } from "../../../../types/Form";
import {
  saveDraftFormData,
  saveRecentFormMeta,
} from "../../../../utils/recentForms";

function SharedTemplatePageContent() {
  const [template, setTemplate] = React.useState<Form | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [viewCount, setViewCount] = React.useState<number | null>(null);
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
        setTemplate(Form.fromPOJO(JSON.parse(data.template.data) as FormPOJO));
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

  if (isLoading) {
    return <LoadingState message="Loading shared template..." />;
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
    <>
      <FormHeader
        formName={template.name}
        isEncrypted={false}
        onHomeClick={() => router.push("/")}
        readOnly={true}
      />

      <PageActionRails
        rightActions={
          [
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

      <DocumentPhaseNotice
        label="Shared Template"
        tone="shared"
        description="This shared template is read-only. Review the structure, then create your own local form to fill in answers."
        meta={viewCount !== null ? `Viewed ${viewCount} times` : undefined}
      />

      <FormCategoryList
        categories={template.categories}
        answerMode="hidden"
        structureEditable={false}
      />
    </>
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

"use client";

import {
  CloudArrowUpIcon,
  DocumentDuplicateIcon,
  PlayIcon,
  PrinterIcon,
  ShareIcon,
} from "@heroicons/react/16/solid";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import { typeid } from "typeid-js";
import DocumentPhaseNotice from "../../../components/DocumentPhaseNotice";
import FormCategoryList from "../../../components/FormCategoryList";
import FormHeader from "../../../components/FormHeader";
import LoadingState from "../../../components/LoadingState";
import PageActionRails, {
  type RailAction,
} from "../../../components/PageActionRails";
import TemplateShareModal from "../../../components/TemplateShareModal";
import {
  TemplateContextProvider,
  useTemplateContext,
} from "../../../contexts/TemplateContext";
import { Category, Question } from "../../../types/Form";
import { hasValidStructure } from "../../../utils/documentStructure";
import { printCurrentView } from "../../../utils/formActions";
import {
  removeDraftFormData,
  saveDraftFormData,
  saveRecentFormMeta,
} from "../../../utils/recentForms";

function TemplatePageContent() {
  const { template, setTemplate, isFinalized, setIsFinalized, isLoading } =
    useTemplateContext();
  const [isFinalizing, setIsFinalizing] = React.useState(false);
  const [showShareModal, setShowShareModal] = React.useState(false);
  const router = useRouter();
  const params = useParams();
  const templateId = params?.id as string;

  if (isLoading) {
    return <LoadingState message="Loading template..." showSpinner={false} />;
  }

  if (!template) {
    return <h1>Template not found</h1>;
  }

  const finalizeTemplate = async () => {
    if (!templateId || !hasValidStructure(template)) {
      alert("Templates need at least one category and one question.");
      return;
    }

    setIsFinalizing(true);
    try {
      const response = await fetch(`/api/templates/${templateId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: template.name,
          data: template.withoutAnswers(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || "Failed to finalize template.");
        return;
      }

      saveRecentFormMeta(localStorage, {
        id: templateId,
        name: template.name,
        encrypted: false,
        isPublished: true,
        kind: "template",
      });
      removeDraftFormData(localStorage, templateId);
      setIsFinalized(true);
    } catch (error) {
      console.error("Error finalizing template:", error);
      alert("Failed to finalize template.");
    } finally {
      setIsFinalizing(false);
    }
  };

  const startForm = () => {
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

  const createNewDraft = () => {
    const newTemplateId = typeid("template");
    sessionStorage.setItem("create_new_template", "true");
    sessionStorage.setItem(
      "template",
      JSON.stringify(template.withoutAnswers()),
    );
    router.push(`/template/${newTemplateId}`);
  };

  return (
    <>
      <FormHeader
        formName={template.name}
        isEncrypted={false}
        onFormNameChange={(name) => setTemplate((prev) => prev.withName(name))}
        onHomeClick={() => router.push("/")}
        readOnly={isFinalized}
      />

      <PageActionRails
        rightActions={
          isFinalized
            ? ([
                {
                  key: "print-template",
                  label: "Print",
                  onClick: printCurrentView,
                  title: "Print this template",
                  variant: "default",
                  icon: <PrinterIcon className="h-5 w-5" />,
                },
                {
                  key: "start-form",
                  label: "Start Form",
                  onClick: startForm,
                  title: "Start Form",
                  variant: "success",
                  icon: <PlayIcon className="h-5 w-5" />,
                },
                {
                  key: "new-draft",
                  label: "New Draft",
                  onClick: createNewDraft,
                  title: "Create New Draft",
                  variant: "default",
                  icon: <DocumentDuplicateIcon className="h-5 w-5" />,
                },
                {
                  key: "share-template",
                  label: "Share",
                  onClick: () => setShowShareModal(true),
                  title: "Share Template",
                  variant: "info",
                  icon: <ShareIcon className="h-5 w-5" />,
                },
              ] satisfies RailAction[])
            : ([
                {
                  key: "print-template",
                  label: "Print",
                  onClick: printCurrentView,
                  title: "Print this template",
                  variant: "default",
                  icon: <PrinterIcon className="h-5 w-5" />,
                },
                {
                  key: "finalize-template",
                  label: isFinalizing ? "Finalizing..." : "Finalize",
                  onClick: finalizeTemplate,
                  title: "Finalize Template",
                  disabled: isFinalizing,
                  variant: "success",
                  icon: <CloudArrowUpIcon className="h-5 w-5" />,
                },
              ] satisfies RailAction[])
        }
      />

      <DocumentPhaseNotice
        label={isFinalized ? "Finalized Template" : "Template Draft"}
        tone={isFinalized ? "finalized" : "draft"}
        description={
          isFinalized
            ? "This template is finalized. Its structure is frozen and ready for creating forms."
            : "Edit the structure here. Templates define categories and questions, but do not contain filled answers."
        }
      />

      <FormCategoryList
        setDocument={setTemplate}
        categories={template.categories}
        answerMode="hidden"
        structureEditable={!isFinalized}
        showAddButton={!isFinalized}
        onAddCategory={() =>
          setTemplate((prev) =>
            prev.addCategory(Category.new("", [Question.new("")])),
          )
        }
      />

      <TemplateShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        templateId={templateId}
        templateName={template.name}
      />
    </>
  );
}

const TemplatePageContentClientOnly = dynamic(
  () => Promise.resolve(TemplatePageContent),
  {
    ssr: false,
    loading: () => <div>Loading template...</div>,
  },
);

export default function TemplatePage() {
  return (
    <TemplateContextProvider>
      <TemplatePageContentClientOnly />
    </TemplateContextProvider>
  );
}

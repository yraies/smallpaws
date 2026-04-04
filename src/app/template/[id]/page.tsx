"use client";

import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import { typeid } from "typeid-js";
import FormCategoryList from "../../../components/FormCategoryList";
import FormHeader from "../../../components/FormHeader";
import LoadingState from "../../../components/LoadingState";
import TemplateShareModal from "../../../components/TemplateShareModal";
import {
  TemplateContextProvider,
  useTemplateContext,
} from "../../../contexts/TemplateContext";
import { Category, Question } from "../../../types/Form";
import { hasValidStructure } from "../../../utils/documentStructure";
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
        status={isFinalized ? "finalized" : "draft"}
        onFormNameChange={(name) => setTemplate((prev) => prev.withName(name))}
        onHomeClick={() => router.push("/")}
        readOnly={isFinalized}
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <p className="grow text-sm text-neutral-700">
          {isFinalized
            ? "This template is finalized. Its structure is frozen and ready for creating forms."
            : "Edit the structure here. Templates define categories and questions, but do not contain filled answers."}
        </p>
        {isFinalized ? (
          <>
            <button
              type="button"
              className="cursor-pointer rounded bg-violet-500 px-4 py-2 font-semibold text-white hover:bg-violet-600"
              onClick={startForm}
            >
              Start Form
            </button>
            <button
              type="button"
              className="cursor-pointer rounded border border-violet-500 px-4 py-2 font-semibold text-violet-700 hover:bg-violet-50"
              onClick={createNewDraft}
            >
              Create New Draft
            </button>
            <button
              type="button"
              className="cursor-pointer rounded border border-violet-500 px-4 py-2 font-semibold text-violet-700 hover:bg-violet-50"
              onClick={() => setShowShareModal(true)}
            >
              Share Template
            </button>
          </>
        ) : (
          <button
            type="button"
            className="cursor-pointer rounded bg-violet-500 px-4 py-2 font-semibold text-white hover:bg-violet-600 disabled:cursor-not-allowed disabled:bg-violet-300"
            onClick={finalizeTemplate}
            disabled={isFinalizing}
          >
            {isFinalizing ? "Finalizing..." : "Finalize Template"}
          </button>
        )}
      </div>

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

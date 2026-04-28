"use client";

import {
  ArrowDownTrayIcon,
  CloudArrowUpIcon,
  DocumentDuplicateIcon,
  PlayIcon,
  PrinterIcon,
  ShareIcon,
  TrashIcon,
} from "@heroicons/react/16/solid";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import { typeid } from "typeid-js";
import AnswerSchemaEditor from "../../../components/AnswerSchemaEditor";
import DocumentPageShell from "../../../components/DocumentPageShell";
import DocumentPhaseNotice from "../../../components/DocumentPhaseNotice";
import FormCategoryList from "../../../components/FormCategoryList";
import LoadingState from "../../../components/LoadingState";
import PageActionRails, {
  type RailAction,
} from "../../../components/PageActionRails";
import PasswordModal from "../../../components/PasswordModal";
import TemplateShareModal from "../../../components/TemplateShareModal";
import {
  TemplateContextProvider,
  useTemplateContext,
} from "../../../contexts/TemplateContext";
import { encryptFormData, hashPasswordWithSalt } from "../../../lib/crypto";
import { Category, getUnsetKey, Question } from "../../../types/Form";
import { hasValidStructure } from "../../../utils/documentStructure";
import { exportFormAsJSON, printCurrentView } from "../../../utils/formActions";
import {
  removeLocalDraft,
  removeRecentFormFromStorage,
  saveLocalDraft,
  saveRecentFormMeta,
} from "../../../utils/recentForms";
import {
  createFormDraftFromTemplate,
  createTemplateDraftFromStructure,
  setPendingFormDraft,
  setPendingTemplateDraft,
} from "../../../utils/templateLifecycle";

function TemplatePageContent() {
  const {
    template,
    templateName,
    setTemplate,
    isFinalized,
    setIsFinalized,
    isEncrypted,
    setIsEncrypted,
    needsPasswordVerification,
    unlockTemplate,
    isLoading,
  } = useTemplateContext();
  const [isFinalizing, setIsFinalizing] = React.useState(false);
  const [showPasswordModal, setShowPasswordModal] = React.useState(false);
  const [showShareModal, setShowShareModal] = React.useState(false);
  const router = useRouter();
  const params = useParams();
  const templateId = params?.id as string;

  if (isLoading) {
    return <LoadingState message="Loading template..." showSpinner={false} />;
  }

  if (needsPasswordVerification) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Password Protected Template</h1>
        <p>
          This template is protected and requires a password before you can view
          or share it.
        </p>
        <PasswordModal
          isOpen={true}
          onClose={() => router.push("/")}
          onSubmit={(password: string) => unlockTemplate(password)}
          mode="enter"
          title="Enter Password"
          description={
            templateName
              ? `Enter the password for "${templateName}".`
              : "This template is protected and requires a password to view."
          }
        />
      </div>
    );
  }

  if (!template) {
    return <h1>Template not found</h1>;
  }

  const finalizeTemplate = async (password: string, shouldEncrypt: boolean) => {
    if (!templateId || !hasValidStructure(template)) {
      alert("Templates need at least one category and one question.");
      return;
    }

    setIsFinalizing(true);
    try {
      const templateData = template.withoutAnswers();
      const passwordCreds = shouldEncrypt
        ? hashPasswordWithSalt(password)
        : null;
      const response = await fetch(`/api/templates/${templateId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: template.name,
          data: shouldEncrypt
            ? encryptFormData(templateData, password)
            : templateData,
          encrypted: shouldEncrypt,
          password_hash: passwordCreds?.hash ?? null,
          password_salt: passwordCreds?.salt ?? null,
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
        encrypted: shouldEncrypt,
        kind: "template",
        phase: "finalized",
      });
      removeLocalDraft(localStorage, templateId);
      setIsEncrypted(shouldEncrypt);
      setIsFinalized(true);
      setShowPasswordModal(false);
    } catch (error) {
      console.error("Error finalizing template:", error);
      alert("Failed to finalize template.");
    } finally {
      setIsFinalizing(false);
    }
  };

  const startForm = () => {
    const formId = typeid("form").toString();
    const draftForm = createFormDraftFromTemplate(template);

    saveRecentFormMeta(localStorage, {
      id: formId,
      name: draftForm.name,
      encrypted: false,
      kind: "form",
      phase: "draft",
    });
    saveLocalDraft(localStorage, formId, JSON.stringify(draftForm));

    setPendingFormDraft(draftForm, formId);
    router.push(`/form/${formId}`);
  };

  const createNewDraft = () => {
    const newTemplateId = typeid("template");
    setPendingTemplateDraft(
      createTemplateDraftFromStructure(template),
      newTemplateId.toString(),
    );
    router.push(`/template/${newTemplateId}`);
  };

  const deleteTemplate = async () => {
    const confirmed = confirm(
      `Are you sure you want to delete "${template.name}"? This action cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      if (isFinalized) {
        const response = await fetch(`/api/templates/${templateId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const error = await response.json();
          alert(error.error || "Failed to delete template.");
          return;
        }
      }

      removeRecentFormFromStorage(localStorage, templateId);
      alert("Template deleted successfully!");
      router.push("/");
    } catch (error) {
      console.error("Error deleting template:", error);
      alert("Failed to delete template.");
    }
  };

  return (
    <DocumentPageShell
      formName={template.name}
      isEncrypted={isEncrypted}
      onFormNameChange={(name) => setTemplate((prev) => prev.withName(name))}
      onHomeClick={() => router.push("/")}
      readOnly={isFinalized}
      actions={
        <PageActionRails
          leftActions={
            [
              {
                key: "delete-template",
                label: "Delete",
                onClick: deleteTemplate,
                title: "Delete Template",
                variant: "danger",
                icon: <TrashIcon className="h-5 w-5" />,
              },
              {
                key: "json",
                label: "Export JSON",
                onClick: () => exportFormAsJSON(template),
                title: "Export as JSON",
                variant: "info",
                icon: <ArrowDownTrayIcon className="h-5 w-5" />,
              },
            ] satisfies RailAction[]
          }
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
                    onClick: () => setShowPasswordModal(true),
                    title: "Finalize Template",
                    disabled: isFinalizing,
                    variant: "success",
                    icon: <CloudArrowUpIcon className="h-5 w-5" />,
                  },
                ] satisfies RailAction[])
          }
        />
      }
      notice={
        <DocumentPhaseNotice
          label={isFinalized ? "Finalized Template" : "Template Draft"}
          tone={isFinalized ? "finalized" : "draft"}
          description={
            isFinalized
              ? "This template is finalized. Its structure is frozen and ready for creating forms."
              : "Edit the structure here. Templates define categories and questions, but do not contain filled answers."
          }
        />
      }
    >
      <AnswerSchemaEditor
        answerOptions={template.answerOptions}
        onChange={(options) =>
          setTemplate((prev) => prev.withAnswerOptions(options))
        }
        disabled={isFinalized}
      />

      <FormCategoryList
        setDocument={setTemplate}
        categories={template.categories}
        answerMode="hidden"
        structureEditable={!isFinalized}
        showAddButton={!isFinalized}
        onAddCategory={() =>
          setTemplate((prev) =>
            prev.addCategory(
              Category.new("", [
                Question.new("", getUnsetKey(prev.answerOptions)),
              ]),
            ),
          )
        }
        answerOptions={template.answerOptions}
      />

      <TemplateShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        templateId={templateId}
        templateName={template.name}
        requiresPassword={isEncrypted}
      />

      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSubmit={finalizeTemplate}
        mode="set"
        title="Finalize Template"
        description="Choose whether to protect your template with a password. Shared links will use the same password."
        toggleLabel="Protect this template with a password"
        submitLabelWithPassword="Finalize with Password"
        submitLabelWithoutPassword="Finalize without Password"
      />
    </DocumentPageShell>
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

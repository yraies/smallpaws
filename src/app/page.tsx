"use client";

import {
  ArrowUpTrayIcon,
  ScaleIcon,
  TrashIcon,
} from "@heroicons/react/16/solid";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef } from "react";
import { typeid } from "typeid-js";
import FormTemplates from "../assets/FormTemplates";
import Box from "../components/Box";
import EncryptionStatus from "../components/EncryptionStatus";
import IconButton from "../components/IconButton";
import type { Form } from "../types/Form";
import { parseImportedJSON, readFileAsText } from "../utils/formActions";
import { formatRelativeTime } from "../utils/RelativeDates";
import {
  clearRecentFormsFromStorage,
  loadRecentForms,
  type RecentItemMeta,
  removeRecentFormFromStorage,
} from "../utils/recentForms";
import {
  canStartFormFromTemplate,
  createFormDraftFromTemplate,
  createTemplateDraftFromStructure,
  setPendingFormDraft,
  setPendingTemplateDraft,
} from "../utils/templateLifecycle";

function Spacer() {
  return <div className="col-span-full mx-auto my-2 w-4/5" />;
}

function HomePageContent() {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = React.useState("empty");
  const [templateName, setTemplateName] = React.useState("");
  const [recentItems, setRecentItems] = React.useState<RecentItemMeta[]>([]);
  const [importError, setImportError] = React.useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedStarterTemplate =
    FormTemplates.find((template) => template.id === selectedTemplate) ??
    FormTemplates[0];
  const canFillFormFromStarter = canStartFormFromTemplate(
    selectedStarterTemplate.template,
  );

  useEffect(() => {
    loadRecentFormsFromLocalStorage(setRecentItems);
  }, []);

  return (
    <main id="main-content" className="flex w-full flex-col items-center gap-4">
      <section className="w-full border border-sand-200 bg-sand-50 px-4 py-3 text-left">
        <h2 className="text-base font-semibold">What Garden Walk helps with</h2>
        <p className="mt-2 text-sm leading-6 text-lavender-700">
          Garden Walk helps people talk through sensitive topics by turning them
          into a shared list of prompts. You can set up the questions first,
          fill them in later, and then review the answers without needing user
          accounts or server-side access to your plaintext answers.
        </p>

        <div className="mt-3 grid gap-2">
          <WorkflowStep
            title="1. Set up the questions"
            description="Start from scratch or from a built-in starting point. This is where you decide what should be asked."
          />
          <WorkflowStep
            title="2. Fill it out"
            description="Once the question set looks right, make an answerable copy and mark your responses without changing the structure."
          />
          <WorkflowStep
            title="3. Review or share"
            description="Look back over the answers yourself or share a read-only version. If you want to revise something later, make a new local copy."
          />
        </div>

        <p className="mt-3 border-l-4 border-lavender-300 px-3 py-1 text-sm text-lavender-700">
          Recent work stays in this browser for convenience. If you use
          encryption, the decryption password stays client-side.
        </p>
      </section>

      <Box title="New Template" onTitleChange={() => {}} buttons={null}>
        <div className="grid w-full grid-cols-1 md:grid-cols-2">
          <p className="col-span-full px-2 text-sm text-lavender-700">
            Choose a starting point and an optional title. You can create a
            template draft to edit the structure, and non-empty starter
            templates can also open directly as fillable forms.
          </p>
          <Spacer />
          <div className="col-span-full flex flex-row gap-2 px-2">
            <label htmlFor="template-name" className="text-lg font-semibold">
              Starting Title
            </label>
            <input
              type="text"
              id="template-name"
              className="paper-field min-w-1 grow"
              placeholder="My Template"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              name="template-name"
            />
          </div>
          <Spacer />
          <p className="col-span-full px-2 text-lg font-semibold">Templates</p>
          {FormTemplates.map((template) =>
            renderTemplateOption(
              template,
              selectedTemplate,
              setSelectedTemplate,
            ),
          )}
          <Spacer />
          <div className="col-span-full flex flex-wrap justify-end gap-2 px-2">
            <button
              type="button"
              className="cursor-pointer border border-sand-200 bg-sand-50 px-3 py-2 text-sm font-semibold text-lavender-700 hover:backdrop-brightness-95"
              onClick={() =>
                createAndNavigateTemplateDraft(
                  selectedStarterTemplate.template,
                  templateName,
                  router,
                )
              }
            >
              Create Template Draft
            </button>
            {canFillFormFromStarter && (
              <button
                type="button"
                className="cursor-pointer bg-lavender-700 px-3 py-2 text-sm font-semibold text-white hover:backdrop-brightness-95"
                onClick={() =>
                  createAndNavigateFormDraft(
                    selectedStarterTemplate.template,
                    templateName,
                    router,
                  )
                }
              >
                Fill Form
              </button>
            )}
          </div>
        </div>
      </Box>

      <section className="flex w-full items-center gap-3 border border-sand-200 bg-sand-50 px-4 py-3">
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={(e) =>
            handleFileImport(
              e.target.files,
              setImportError,
              router,
              fileInputRef,
            )
          }
        />
        <button
          type="button"
          className="flex cursor-pointer items-center gap-1.5 border border-sand-200 bg-sand-50 px-3 py-2 text-sm font-semibold text-lavender-700 hover:backdrop-brightness-95"
          onClick={() => fileInputRef.current?.click()}
        >
          <ArrowUpTrayIcon className="h-4 w-4" aria-hidden="true" />
          Import JSON
        </button>
        <button
          type="button"
          className="flex cursor-pointer items-center gap-1.5 border border-sand-200 bg-sand-50 px-3 py-2 text-sm font-semibold text-lavender-700 hover:backdrop-brightness-95"
          onClick={() => router.push("/compare")}
        >
          <ScaleIcon className="h-4 w-4" aria-hidden="true" />
          Compare Forms
        </button>
        <p className="text-sm text-lavender-700">
          Import a previously exported JSON file as a new local draft.
        </p>
        {importError && (
          <p className="text-sm text-danger-700" role="alert">
            {importError}
          </p>
        )}
      </section>

      <Box
        title="Recent Work"
        onTitleChange={() => {}}
        buttons={
          recentItems.length > 0 ? (
            <IconButton
              onClick={() => clearRecents(setRecentItems)}
              title="Clear Recent Work"
            >
              <TrashIcon className="h-4 w-4 transition-transform group-hover:scale-90 group-hover:text-danger-500" />
            </IconButton>
          ) : null
        }
      >
        <div className="grid w-full grid-cols-1 gap-2">
          <p className="px-2 text-sm text-lavender-700">
            Reopen recent drafts, finalized templates, or published forms from
            this browser.
          </p>
          {recentItems.length > 0 ? (
            recentItems.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <button
                  type="button"
                  className="flex grow cursor-pointer flex-row items-center px-2 py-1 text-center hover:backdrop-brightness-90"
                  onClick={() => navigateToRecent(item, router)}
                >
                  <span
                    className="grow font-semibold"
                    title={item.date.toLocaleString()}
                  >
                    {item.name}{" "}
                    <span className="text-xs text-lavender-700">
                      ({describeRecentItem(item)} -{" "}
                      {formatRelativeTime(item.date)})
                    </span>
                  </span>

                  <EncryptionStatus isEncrypted={item.encrypted} />
                </button>

                <IconButton
                  onClick={() =>
                    removeRecent(item, setRecentItems, recentItems)
                  }
                  title="Delete item from recent work"
                >
                  <TrashIcon className="h-4 w-4 transition-transform group-hover:scale-90 group-hover:text-danger-500" />
                </IconButton>
              </div>
            ))
          ) : (
            <p className="place-self-center px-2 py-1 text-center italic">
              No recent work
            </p>
          )}
        </div>
      </Box>
    </main>
  );
}

const HomePageClientOnly = dynamic(() => Promise.resolve(HomePageContent), {
  ssr: false,
  loading: () => <div>Loading home...</div>,
});

export default function HomePage() {
  return <HomePageClientOnly />;
}

function WorkflowStep({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="border-l-2 border-lavender-300 px-3 py-1">
      <p className="font-semibold">{title}</p>
      <p className="text-sm text-lavender-700">{description}</p>
    </div>
  );
}

function renderTemplateOption(
  template: { id: string; name: string; template: Form },
  selectedTemplate: string,
  setSelectedTemplate: React.Dispatch<React.SetStateAction<string>>,
) {
  return (
    <label
      key={template.id.toString()}
      htmlFor={`template${template.id}`}
      className="flex items-center gap-2 px-2 py-1 hover:backdrop-brightness-90"
    >
      <input
        type="radio"
        name="template"
        id={`template${template.id}`}
        checked={selectedTemplate === template.id}
        value={template.id}
        onChange={(e) =>
          e.target.checked && setSelectedTemplate(e.target.value)
        }
      />
      <span className="text-lg font-semibold">{template.name}</span>
    </label>
  );
}

function loadRecentFormsFromLocalStorage(
  setRecentForms: React.Dispatch<React.SetStateAction<RecentItemMeta[]>>,
) {
  setRecentForms(loadRecentForms(localStorage));
}

function createAndNavigateTemplateDraft(
  template: Form,
  templateName: string,
  router: ReturnType<typeof useRouter>,
) {
  const id = typeid("template");
  setPendingTemplateDraft(
    createTemplateDraftFromStructure(template, templateName),
  );
  router.push(`/template/${id}`);
}

function createAndNavigateFormDraft(
  template: Form,
  templateName: string,
  router: ReturnType<typeof useRouter>,
) {
  if (!canStartFormFromTemplate(template)) {
    return;
  }

  const id = typeid("form");
  const draftForm = createFormDraftFromTemplate(template, templateName);

  setPendingFormDraft(draftForm);
  router.push(`/form/${id}`);
}

function navigateToRecent(
  item: RecentItemMeta,
  router: ReturnType<typeof useRouter>,
) {
  router.push(`/${item.kind}/${item.id}`);
}

function removeRecent(
  item: RecentItemMeta,
  setRecentForms: React.Dispatch<React.SetStateAction<RecentItemMeta[]>>,
  recentForms: RecentItemMeta[],
) {
  removeRecentFormFromStorage(localStorage, item.id);
  setRecentForms(recentForms.filter((f) => f.id !== item.id));
}

function clearRecents(
  setRecentForms: React.Dispatch<React.SetStateAction<RecentItemMeta[]>>,
) {
  clearRecentFormsFromStorage(localStorage);
  setRecentForms([]);
}

function describeRecentItem(item: RecentItemMeta): string {
  if (item.kind === "template") {
    return item.phase === "finalized" ? "finalized template" : "template draft";
  }

  return item.phase === "published" ? "published form" : "form draft";
}

async function handleFileImport(
  files: FileList | null,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  router: ReturnType<typeof useRouter>,
  fileInputRef: React.RefObject<HTMLInputElement | null>,
) {
  setError(null);

  if (!files || files.length === 0) return;
  const file = files[0];

  try {
    const text = await readFileAsText(file);
    const { form, hasAnswers } = parseImportedJSON(text);

    if (hasAnswers) {
      // Import as form draft (preserving answers)
      const id = typeid("form");
      setPendingFormDraft(form);
      router.push(`/form/${id}`);
    } else {
      // Import as template draft (no answers to preserve)
      const id = typeid("template");
      setPendingTemplateDraft(form);
      router.push(`/template/${id}`);
    }
  } catch (e) {
    setError(e instanceof Error ? e.message : "Failed to import file.");
  } finally {
    // Reset the file input so the same file can be re-selected
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }
}

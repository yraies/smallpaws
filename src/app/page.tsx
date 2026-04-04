"use client";

import { HomeIcon, TrashIcon } from "@heroicons/react/16/solid";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { typeid } from "typeid-js";
import FormTemplates from "../assets/FormTemplates";
import Box from "../components/Box";
import EncryptionStatus from "../components/EncryptionStatus";
import IconButton from "../components/IconButton";
import type { Form } from "../types/Form";
import { formatRelativeTime } from "../utils/RelativeDates";
import {
  clearRecentFormsFromStorage,
  loadRecentForms,
  type RecentItemMeta,
  removeRecentFormFromStorage,
} from "../utils/recentForms";

function Spacer() {
  return <div className="col-span-2 mx-auto my-2 w-4/5" />;
}

export default function HomePage() {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = React.useState("empty");
  const [templateName, setTemplateName] = React.useState("");
  const [recentItems, setRecentItems] = React.useState<RecentItemMeta[]>([]);

  useEffect(() => {
    loadRecentFormsFromLocalStorage(setRecentItems);
  }, []);

  return (
    <>
      <IconButton
        onClick={() => router.push("/")}
        className="absolute top-4 left-4"
        title="Home"
      >
        <HomeIcon className="h-5 w-5 text-[var(--plum)] transition-transform group-hover:scale-90" />
      </IconButton>
      <div className="flex w-full max-w-4xl flex-col items-center gap-4">
        <Box title="New Template" onTitleChange={() => {}} buttons={null}>
          <div className="grid w-full grid-cols-2 gap-y-1">
            <div className="col-span-2 flex flex-row gap-2 px-2">
              <legend className="text-lg font-semibold text-[var(--ink)]">
                Template Title
              </legend>
              <input
                type="text"
                className="paper-field min-w-1 grow px-3 py-2"
                placeholder="My Template"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                name="template-name"
              />
            </div>
            <Spacer />
            <legend className="col-span-2 px-2 text-lg font-semibold text-[var(--ink)]">
              Templates
            </legend>
            {FormTemplates.map((template) =>
              renderTemplateOption(
                template,
                selectedTemplate,
                setSelectedTemplate,
              ),
            )}
            <Spacer />
            <button
              type="button"
              className="tactile-button col-start-2 justify-self-end px-4 py-2 font-semibold text-[var(--plum)]"
              onClick={() =>
                createAndNavigateTemplate(
                  selectedTemplate,
                  templateName,
                  router,
                )
              }
            >
              Create Draft
            </button>
          </div>
        </Box>
        <Box
          title="Recent Work"
          onTitleChange={() => {}}
          buttons={
            <IconButton
              onClick={() => clearRecents(setRecentItems)}
              title="Clear Recent Work"
            >
              <TrashIcon className="h-4 w-4 text-[var(--paper-accent)] transition-transform group-hover:scale-90" />
            </IconButton>
          }
        >
          <div className="grid w-full grid-cols-1 gap-2">
            {recentItems.length > 0 ? (
              recentItems.map((item) => (
                <div
                  key={item.id}
                  className="paper-field flex items-center gap-2 px-2 py-2"
                >
                  <button
                    type="button"
                    className="flex grow cursor-pointer flex-row items-center px-2 py-1 text-center"
                    onClick={() => navigateToRecent(item, router)}
                  >
                    <legend
                      className="grow font-semibold text-[var(--ink)]"
                      title={item.date.toLocaleString()}
                    >
                      {item.name}{" "}
                      <span className="text-xs ink-muted">
                        ({describeRecentItem(item)} -{" "}
                        {formatRelativeTime(item.date)})
                      </span>
                    </legend>

                    <EncryptionStatus isEncrypted={item.encrypted} />
                  </button>

                  <IconButton
                    onClick={() =>
                      removeRecent(item, setRecentItems, recentItems)
                    }
                    title="Delete item from recent work"
                  >
                    <TrashIcon className="h-4 w-4 text-[var(--paper-accent)] transition-transform group-hover:scale-90" />
                  </IconButton>
                </div>
              ))
            ) : (
              <legend className="place-self-center px-2 py-1 text-center italic ink-muted">
                No recent work
              </legend>
            )}
          </div>
        </Box>
      </div>
    </>
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
      className="paper-field flex items-center gap-3 px-3 py-3"
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
      <legend className="text-lg font-semibold text-[var(--ink)]">
        {template.name}
      </legend>
    </label>
  );
}

function loadRecentFormsFromLocalStorage(
  setRecentForms: React.Dispatch<React.SetStateAction<RecentItemMeta[]>>,
) {
  setRecentForms(loadRecentForms(localStorage));
}

function createAndNavigateTemplate(
  selectedTemplate: string,
  templateName: string,
  router: ReturnType<typeof useRouter>,
) {
  const template =
    FormTemplates.find((t) => t.id === selectedTemplate)?.template ||
    FormTemplates[0].template;
  const id = typeid("template");
  sessionStorage.setItem("create_new_template", "true");
  sessionStorage.setItem(
    "template",
    JSON.stringify(
      templateName !== "" ? template.withName(templateName) : template,
    ),
  );
  router.push(`/template/${id}`);
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
    return item.isPublished ? "finalized template" : "template draft";
  }

  return item.isPublished ? "published form" : "form draft";
}

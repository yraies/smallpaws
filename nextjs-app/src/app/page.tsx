"use client";

import { useRouter } from "next/navigation";
import Box from "../components/Box";
import FormTemplates from "../assets/FormTemplates";
import React, { useEffect } from "react";
import { typeid } from "typeid-js";
import IconButton from "../components/IconButton";
import { TrashIcon, HomeIcon } from "@heroicons/react/16/solid";
import { formatRelativeTime } from "../utils/RelativeDates";
import { LineButton } from "../components/LineButton";
import { Form } from "../types/Form";
import EncryptionStatus from "../components/EncryptionStatus";

function Spacer() {
  return <div className="col-span-2 mx-auto my-2 w-4/5" />;
}

export default function HomePage() {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = React.useState("empty");
  const [formName, setFormName] = React.useState("");
  const [recentForms, setRecentForms] = React.useState<
    { id: string; name: string; date: Date; encrypted: boolean }[]
  >([]);

  useEffect(() => {
    loadRecentFormsFromLocalStorage(setRecentForms);
  }, []);

  return (
    <>
      <IconButton
        onClick={() => router.push("/")}
        className="absolute top-2 left-2"
      >
        <HomeIcon className="h-6 w-6 transition-transform group-hover:scale-90 group-hover:text-violet-400" />
      </IconButton>
      <div className="flex w-full flex-col items-center gap-4">
        <Box title="New Form" onTitleChange={() => {}} buttons={null}>
          <div className="grid w-full grid-cols-2">
            <div className="col-span-2 flex flex-row gap-2 px-2">
              <legend className="text-lg font-semibold">Form Title</legend>
              <input
                type="text"
                className="min-w-1 grow border-b-1"
                placeholder="My Form"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <Spacer />
            <legend className="col-span-2 px-2 text-lg font-semibold">
              Templates
            </legend>
            {FormTemplates.map((template) =>
              renderTemplateOption(
                template,
                selectedTemplate,
                setSelectedTemplate
              )
            )}
            <Spacer />
            <button
              className="col-start-2 px-2 py-1 hover:backdrop-brightness-90"
              onClick={() =>
                createAndNavigateForm(selectedTemplate, formName, router)
              }
            >
              <legend className="text-lg font-semibold">Create</legend>
            </button>
          </div>
        </Box>
        <Box
          title="Recent Forms"
          onTitleChange={() => {}}
          buttons={
            <IconButton onClick={() => clearRecents(setRecentForms)}>
              <TrashIcon className="h-4 w-4 transition-transform group-hover:scale-90 group-hover:text-red-400" />
            </IconButton>
          }
        >
          <div className="grid w-full grid-cols-1 gap-2">
            {recentForms.length > 0 ? (
              recentForms.map((form) => (
                <LineButton
                  key={form.id}
                  onClick={() => navigateToRecent(form, router)}
                >
                  <legend
                    className="grow font-semibold"
                    title={form.date.toLocaleString()}
                  >
                    {form.name}{" "}
                    <span className="text-xs text-neutral-600">
                      ({formatRelativeTime(form.date)})
                    </span>
                  </legend>

                  <EncryptionStatus isEncrypted={form.encrypted} />

                  <IconButton
                    onClick={() =>
                      removeRecent(form, setRecentForms, recentForms)
                    }
                  >
                    <TrashIcon className="h-4 w-4 transition-transform group-hover:scale-90 group-hover:text-red-400" />
                  </IconButton>
                </LineButton>
              ))
            ) : (
              <legend className="place-self-center px-2 py-1 text-center italic">
                No recent forms
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
  setSelectedTemplate: React.Dispatch<React.SetStateAction<string>>
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
      <legend className="text-lg font-semibold">{template.name}</legend>
    </label>
  );
}

function loadRecentFormsFromLocalStorage(
  setRecentForms: React.Dispatch<
    React.SetStateAction<
      { id: string; name: string; date: Date; encrypted: boolean }[]
    >
  >
) {
  console.log("loading recent forms");

  // Try to load from API first
  fetch("/api/forms")
    .then((response) => response.json())
    .then((apiForms) => {
      const forms = apiForms.map(
        (form: {
          id: string;
          name: string;
          date: string;
          encrypted: boolean;
        }) => ({
          id: form.id,
          name: form.name,
          date: new Date(form.date),
          encrypted: form.encrypted,
        })
      );
      setRecentForms(forms);
    })
    .catch(() => {
      // Fallback to localStorage if API fails
      const keys = Object.keys(localStorage);
      const forms = keys
        .filter((key) => key.endsWith("-meta"))
        .map((key) => {
          const id = key.split("-")[0];
          const value = localStorage.getItem(key);
          if (!value) return null;
          const { name, date } = JSON.parse(value);
          return { id, name, date: new Date(date), encrypted: false }; // Legacy forms are unencrypted
        })
        .filter((form) => form !== null);
      forms.sort((a, b) => b.date.getTime() - a.date.getTime());
      setRecentForms(forms);
    });
}

function createAndNavigateForm(
  selectedTemplate: string,
  formName: string,
  router: ReturnType<typeof useRouter>
) {
  const template =
    FormTemplates.find((t) => t.id === selectedTemplate)?.template ||
    FormTemplates[0].template;
  const id = typeid("form");
  sessionStorage.setItem("create_new", "true");
  sessionStorage.setItem(
    "form",
    JSON.stringify(formName !== "" ? template.withName(formName) : template)
  );
  router.push(`/form/${id}`);
}

function navigateToRecent(
  form: { id: string; name: string; date: Date },
  router: ReturnType<typeof useRouter>
) {
  sessionStorage.setItem("create_new", "false");
  sessionStorage.setItem("form", localStorage.getItem(form.id) ?? "");
  router.push(`/form/${form.id}`);
}

function removeRecent(
  form: { id: string; name: string; date: Date; encrypted: boolean },
  setRecentForms: React.Dispatch<
    React.SetStateAction<
      { id: string; name: string; date: Date; encrypted: boolean }[]
    >
  >,
  recentForms: { id: string; name: string; date: Date; encrypted: boolean }[]
) {
  // Remove from both localStorage and API
  localStorage.removeItem(`${form.id}-meta`);
  localStorage.removeItem(`${form.id}-data`);

  fetch(`/api/forms/${form.id}`, { method: "DELETE" })
    .then(() => {
      setRecentForms(recentForms.filter((f) => f.id !== form.id));
    })
    .catch(() => {
      // If API fails, still update the local state
      setRecentForms(recentForms.filter((f) => f.id !== form.id));
    });
}

function clearRecents(
  setRecentForms: React.Dispatch<
    React.SetStateAction<
      { id: string; name: string; date: Date; encrypted: boolean }[]
    >
  >
) {
  // Clear both localStorage and API
  localStorage.clear();
  fetch("/api/forms", { method: "DELETE" })
    .then(() => {
      setRecentForms([]);
    })
    .catch(() => {
      // If API fails, still clear the local state
      setRecentForms([]);
    });
}

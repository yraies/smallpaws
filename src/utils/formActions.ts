import {
  Form,
  type FormPOJO,
  getEffectiveAnswerOptions,
  getUnsetKey,
} from "../types/Form";
import { getCompareIdentity } from "./compareIdentity";
import {
  computeStructureFingerprint,
  saveLocalDraft,
  saveRecentFormMeta,
} from "./recentForms";
import { setPendingFormDraft } from "./templateLifecycle";

/**
 * Prepares a form for cloning by creating a new ID and storing it in sessionStorage
 * Returns the new form ID to navigate to
 */
export function prepareFormClone(form: Form): string {
  // Generate a new form ID
  const newFormId = `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Create a copy of the current form with new name
  const clonedForm = form.withName(`${form.name} (Copy)`);

  saveRecentFormMeta(localStorage, {
    id: newFormId,
    name: clonedForm.name,
    respondentName: clonedForm.respondentName,
    templateName: clonedForm.templateName,
    structureFingerprint: computeStructureFingerprint(clonedForm),
    compareIdentity: getCompareIdentity(newFormId),
    encrypted: false,
    kind: "form",
    phase: "draft",
  });
  saveLocalDraft(localStorage, newFormId, JSON.stringify(clonedForm));

  setPendingFormDraft(clonedForm, newFormId);

  return newFormId;
}

/**
 * Exports form data as CSV
 */
export function exportFormAsCSV(form: Form): void {
  const options = getEffectiveAnswerOptions(form.answerOptions);
  // Build CSV content: Category, Question, Selection
  const csvLines = ["Category,Question,Selection"];

  form.categories.forEach((category) => {
    category.questions.forEach((question) => {
      const option = options.find((o) => o.key === question.selection);
      const selectionLabel = option ? option.label : question.selection;
      // Escape quotes in category/question text
      const cat = `"${category.name.replace(/"/g, '""')}"`;
      const q = `"${question.value.replace(/"/g, '""')}"`;
      csvLines.push(`${cat},${q},${selectionLabel}`);
    });
  });

  const csvContent = csvLines.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", `${form.name || "form"}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exports form data as JSON
 */
export function exportFormAsJSON(form: Form): void {
  const jsonContent = JSON.stringify(form, null, 2);
  const blob = new Blob([jsonContent], {
    type: "application/json;charset=utf-8;",
  });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", `${form.name || "form"}.json`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Opens the browser print dialog for the current document view.
 */
export function printCurrentView(): void {
  window.print();
}

export type ImportResult = {
  form: Form;
  hasAnswers: boolean;
};

/**
 * Parses and validates a JSON string as a Form.
 * Returns the parsed Form and whether it contains non-unset answers.
 * Throws a user-friendly error message on invalid input.
 */
export function parseImportedJSON(jsonString: string): ImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    throw new Error("The file does not contain valid JSON.");
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error(
      "The JSON does not have the expected structure (should be an object).",
    );
  }

  const obj = parsed as Record<string, unknown>;

  if (typeof obj.name !== "string") {
    throw new Error("Missing or invalid 'name' field in the JSON.");
  }

  if (!Array.isArray(obj.categories)) {
    throw new Error("Missing or invalid 'categories' field in the JSON.");
  }

  let form: Form;
  try {
    form = Form.fromPOJO(obj as unknown as FormPOJO);
  } catch (e) {
    throw new Error(
      `Could not parse the form structure: ${e instanceof Error ? e.message : String(e)}`,
    );
  }

  // Detect whether the imported form has any non-unset answers
  const unsetKey = getUnsetKey(form.answerOptions);
  const hasAnswers = form.categories.some((category) =>
    category.questions.some((question) => question.selection !== unsetKey),
  );

  return { form, hasAnswers };
}

/**
 * Reads a File object and returns its text content.
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read the file."));
    reader.readAsText(file);
  });
}

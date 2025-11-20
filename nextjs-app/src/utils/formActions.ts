import { Form } from "../types/Form";

/**
 * Prepares a form for cloning by creating a new ID and storing it in sessionStorage
 * Returns the new form ID to navigate to
 */
export function prepareFormClone(form: Form): string {
  // Generate a new form ID
  const newFormId = `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Create a copy of the current form with new name
  const clonedForm = form.withName(`${form.name} (Copy)`);

  // Store in sessionStorage for the new form page
  sessionStorage.setItem("create_new", "true");
  sessionStorage.setItem("form", JSON.stringify(clonedForm));

  return newFormId;
}

/**
 * Exports form data as CSV
 */
export function exportFormAsCSV(form: Form): void {
  // Build CSV content: Category, Question, Selection
  const csvLines = ["Category,Question,Selection"];

  form.categories.forEach((category) => {
    category.questions.forEach((question) => {
      const selection =
        question.selection === null ? "Unset" : question.selection;
      // Escape quotes in category/question text
      const cat = `"${category.name.replace(/"/g, '""')}"`;
      const q = `"${question.value.replace(/"/g, '""')}"`;
      csvLines.push(`${cat},${q},${selection}`);
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

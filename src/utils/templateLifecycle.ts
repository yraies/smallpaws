import type { Form } from "../types/Form";

function applyOptionalName(document: Form, name: string): Form {
  const trimmedName = name.trim();

  return trimmedName === "" ? document : document.withName(trimmedName);
}

export function canStartFormFromTemplate(template: Form): boolean {
  return template.hasValidStructure();
}

export function createTemplateDraftFromStructure(
  template: Form,
  name = "",
): Form {
  return applyOptionalName(template.withoutAnswers(), name);
}

export function createFormDraftFromTemplate(template: Form, name = ""): Form {
  return applyOptionalName(template.withoutAnswers(), name);
}

import { Form, type FormPOJO } from "../types/Form";

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

// ---------------------------------------------------------------------------
// Session-based pending-draft handoff
//
// When the user creates a new template draft or form draft from a page
// action, we stash the draft in sessionStorage so the target page can pick
// it up on mount. Each helper pair (set + consume) uses a single key that
// stores the serialised Form POJO. Consuming removes the key atomically.
// ---------------------------------------------------------------------------

const PENDING_TEMPLATE_DRAFT_KEY = "pending_template_draft";
const PENDING_FORM_DRAFT_KEY = "pending_form_draft";

export function setPendingTemplateDraft(template: Form): void {
  sessionStorage.setItem(PENDING_TEMPLATE_DRAFT_KEY, JSON.stringify(template));
}

export function consumePendingTemplateDraft(): Form | null {
  const raw = sessionStorage.getItem(PENDING_TEMPLATE_DRAFT_KEY);
  if (!raw) return null;
  sessionStorage.removeItem(PENDING_TEMPLATE_DRAFT_KEY);
  return Form.fromPOJO(JSON.parse(raw) as FormPOJO);
}

export function setPendingFormDraft(form: Form): void {
  sessionStorage.setItem(PENDING_FORM_DRAFT_KEY, JSON.stringify(form));
}

export function consumePendingFormDraft(): Form | null {
  const raw = sessionStorage.getItem(PENDING_FORM_DRAFT_KEY);
  if (!raw) return null;
  sessionStorage.removeItem(PENDING_FORM_DRAFT_KEY);
  return Form.fromPOJO(JSON.parse(raw) as FormPOJO);
}

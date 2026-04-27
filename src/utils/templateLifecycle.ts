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
  const draft = applyOptionalName(template.withoutAnswers(), name);
  return draft.withTemplateName(template.name);
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

type PendingTemplateDraftPayload = {
  targetId: string;
  template: FormPOJO;
};

type PendingFormDraftPayload = {
  targetId: string;
  form: FormPOJO;
};

export function setPendingTemplateDraft(
  template: Form,
  targetId: string,
): void {
  const payload: PendingTemplateDraftPayload = {
    targetId,
    template: JSON.parse(JSON.stringify(template)) as FormPOJO,
  };

  sessionStorage.setItem(PENDING_TEMPLATE_DRAFT_KEY, JSON.stringify(payload));
}

export function consumePendingTemplateDraft(targetId: string): Form | null {
  const raw = sessionStorage.getItem(PENDING_TEMPLATE_DRAFT_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<PendingTemplateDraftPayload>;

    if (parsed.targetId !== targetId || !parsed.template) {
      if (!parsed.targetId || !parsed.template) {
        sessionStorage.removeItem(PENDING_TEMPLATE_DRAFT_KEY);
      }

      return null;
    }

    sessionStorage.removeItem(PENDING_TEMPLATE_DRAFT_KEY);
    return Form.fromPOJO(parsed.template);
  } catch {
    sessionStorage.removeItem(PENDING_TEMPLATE_DRAFT_KEY);
    return null;
  }
}

export function setPendingFormDraft(form: Form, targetId: string): void {
  const payload: PendingFormDraftPayload = {
    targetId,
    form: JSON.parse(JSON.stringify(form)) as FormPOJO,
  };

  sessionStorage.setItem(PENDING_FORM_DRAFT_KEY, JSON.stringify(payload));
}

export function consumePendingFormDraft(targetId: string): Form | null {
  const raw = sessionStorage.getItem(PENDING_FORM_DRAFT_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<PendingFormDraftPayload>;

    if (parsed.targetId !== targetId || !parsed.form) {
      if (!parsed.targetId || !parsed.form) {
        sessionStorage.removeItem(PENDING_FORM_DRAFT_KEY);
      }

      return null;
    }

    sessionStorage.removeItem(PENDING_FORM_DRAFT_KEY);
    return Form.fromPOJO(parsed.form);
  } catch {
    sessionStorage.removeItem(PENDING_FORM_DRAFT_KEY);
    return null;
  }
}

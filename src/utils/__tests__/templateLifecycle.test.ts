import { Form, Selection } from "../../types/Form";
import {
  canStartFormFromTemplate,
  consumePendingFormDraft,
  consumePendingTemplateDraft,
  createFormDraftFromTemplate,
  createTemplateDraftFromStructure,
  setPendingFormDraft,
  setPendingTemplateDraft,
} from "../templateLifecycle";

describe("template lifecycle helpers", () => {
  test("allows direct form creation only from valid starter templates", () => {
    expect(canStartFormFromTemplate(Form.new("Empty", []))).toBe(false);
    expect(canStartFormFromTemplate(Form.example())).toBe(true);
  });

  test("creates a fillable form draft with cleared answers", () => {
    const draftForm = createFormDraftFromTemplate(
      Form.example(),
      "Custom Starter",
    );

    expect(draftForm.name).toBe("Custom Starter");
    expect(
      draftForm.categories.every((category) =>
        category.questions.every(
          (question) => question.selection === Selection.UNSET,
        ),
      ),
    ).toBe(true);
  });

  test("creates a structure-only template draft with an optional title", () => {
    const draftTemplate = createTemplateDraftFromStructure(
      Form.example(),
      "  Starter Draft  ",
    );

    expect(draftTemplate.name).toBe("Starter Draft");
    expect(draftTemplate.hasValidStructure()).toBe(true);
  });
});

describe("pending-draft session handoff", () => {
  const mockSessionStorage = (() => {
    const store = new Map<string, string>();
    return {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
      removeItem: (key: string) => store.delete(key),
      clear: () => store.clear(),
    };
  })();

  beforeEach(() => {
    // Replace sessionStorage with mock for tests
    mockSessionStorage.clear();
    Object.defineProperty(globalThis, "sessionStorage", {
      value: mockSessionStorage,
      writable: true,
    });
  });

  test("setPendingTemplateDraft + consumePendingTemplateDraft round-trips a template", () => {
    const template = Form.example();
    setPendingTemplateDraft(template);

    const consumed = consumePendingTemplateDraft();
    expect(consumed).not.toBeNull();
    expect(consumed?.name).toBe(template.name);
    expect(consumed?.categories.length).toBe(template.categories.length);
  });

  test("consumePendingTemplateDraft returns null when nothing is pending", () => {
    expect(consumePendingTemplateDraft()).toBeNull();
  });

  test("consumePendingTemplateDraft removes the item after first read", () => {
    setPendingTemplateDraft(Form.example());

    expect(consumePendingTemplateDraft()).not.toBeNull();
    expect(consumePendingTemplateDraft()).toBeNull();
  });

  test("setPendingFormDraft + consumePendingFormDraft round-trips a form", () => {
    const form = Form.example();
    setPendingFormDraft(form);

    const consumed = consumePendingFormDraft();
    expect(consumed).not.toBeNull();
    expect(consumed?.name).toBe(form.name);
  });

  test("consumePendingFormDraft returns null when nothing is pending", () => {
    expect(consumePendingFormDraft()).toBeNull();
  });

  test("consumePendingFormDraft removes the item after first read", () => {
    setPendingFormDraft(Form.example());

    expect(consumePendingFormDraft()).not.toBeNull();
    expect(consumePendingFormDraft()).toBeNull();
  });

  test("template and form pending drafts are independent", () => {
    setPendingTemplateDraft(Form.example());
    setPendingFormDraft(Form.example());

    expect(consumePendingTemplateDraft()).not.toBeNull();
    expect(consumePendingFormDraft()).not.toBeNull();
    expect(consumePendingTemplateDraft()).toBeNull();
    expect(consumePendingFormDraft()).toBeNull();
  });
});

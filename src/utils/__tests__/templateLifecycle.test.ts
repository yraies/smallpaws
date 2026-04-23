import { Form, Selection } from "../../types/Form";
import {
  canStartFormFromTemplate,
  createFormDraftFromTemplate,
  createTemplateDraftFromStructure,
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

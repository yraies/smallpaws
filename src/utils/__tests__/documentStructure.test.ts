import { Form, Selection } from "../../types/Form";
import { hasValidStructure } from "../documentStructure";

describe("document structure validation", () => {
  test("rejects an empty structure", () => {
    expect(hasValidStructure(Form.new("Empty", []))).toBe(false);
  });

  test("accepts a form with at least one category and one question", () => {
    expect(hasValidStructure(Form.example())).toBe(true);
  });

  test("clears answers when deriving a fillable copy from structure", () => {
    const form = Form.example().withoutAnswers();

    expect(
      form.categories.every((category) =>
        category.questions.every(
          (question) => question.selection === Selection.UNSET,
        ),
      ),
    ).toBe(true);
  });
});

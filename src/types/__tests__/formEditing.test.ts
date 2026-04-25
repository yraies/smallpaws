import {
  Category,
  Form,
  getUnsetKey,
  Question,
  type AnswerOption,
} from "../Form";

const CUSTOM_OPTIONS: AnswerOption[] = [
  { key: "yes", label: "Yes", shortLabel: "Y", color: "#00aa00" },
  { key: "no", label: "No", shortLabel: "N", color: "#aa0000" },
  { key: "blank", label: "Blank", shortLabel: "-", color: "#999999" },
];

describe("template editing model behavior", () => {
  test("new categories use the template's current unset key", () => {
    const form = Form.new("Template", [], CUSTOM_OPTIONS);

    const updated = form.addCategory(
      Category.new("", [Question.new("", getUnsetKey(form.answerOptions))]),
    );

    expect(updated.categories[0].questions[0].selection).toBe("blank");
  });

  test("new questions use the template's current unset key", () => {
    const form = Form.new(
      "Template",
      [Category.new("Category", [Question.new("Existing", "blank")])],
      CUSTOM_OPTIONS,
    );

    const categoryId = form.categories[0].id;
    const updated = form.withCategory(categoryId, (category) =>
      category.addQuestion(Question.new("", getUnsetKey(form.answerOptions))),
    );

    expect(updated.categories[0].questions[1].selection).toBe("blank");
  });

  test("withMovedCategory reorders categories", () => {
    const form = Form.new("Template", [
      Category.new("First", [Question.new("Q1")]),
      Category.new("Second", [Question.new("Q2")]),
    ]);

    const updated = form.withMovedCategory(form.categories[1].id, "up");

    expect(updated.categories.map((category) => category.name)).toEqual([
      "Second",
      "First",
    ]);
  });

  test("withMovedQuestion reorders questions within a category", () => {
    const category = Category.new("Category", [
      Question.new("First"),
      Question.new("Second"),
    ]);

    const updated = category.withMovedQuestion(category.questions[1].id, "up");

    expect(updated.questions.map((question) => question.value)).toEqual([
      "Second",
      "First",
    ]);
  });
});

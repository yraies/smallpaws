import { type AnswerOption, Form } from "../../types/Form";
import { parseImportedJSON } from "../formActions";

describe("parseImportedJSON", () => {
  function makeValidJSON(overrides: Record<string, unknown> = {}): string {
    const base = {
      name: "Test Form",
      categories: [
        {
          id: { prefix: "category", suffix: "01234567890123456789abcdef" },
          name: "Category One",
          questions: [
            {
              id: { prefix: "question", suffix: "01234567890123456789abcdef" },
              selection: "unset",
              value: "First question",
            },
          ],
        },
      ],
      ...overrides,
    };
    return JSON.stringify(base);
  }

  function makeFormWithAnswers(): string {
    return JSON.stringify({
      name: "Answered Form",
      categories: [
        {
          id: { prefix: "category", suffix: "01234567890123456789abcdef" },
          name: "Category One",
          questions: [
            {
              id: { prefix: "question", suffix: "01234567890123456789abcdef" },
              selection: "must",
              value: "Important question",
            },
            {
              id: { prefix: "question", suffix: "11234567890123456789abcdef" },
              selection: "unset",
              value: "Unanswered question",
            },
          ],
        },
      ],
    });
  }

  describe("valid inputs", () => {
    test("parses a valid form with all unset answers", () => {
      const result = parseImportedJSON(makeValidJSON());
      expect(result.form).toBeInstanceOf(Form);
      expect(result.form.name).toBe("Test Form");
      expect(result.hasAnswers).toBe(false);
    });

    test("detects non-unset answers", () => {
      const result = parseImportedJSON(makeFormWithAnswers());
      expect(result.form.name).toBe("Answered Form");
      expect(result.hasAnswers).toBe(true);
    });

    test("preserves categories and questions", () => {
      const result = parseImportedJSON(makeValidJSON());
      expect(result.form.categories).toHaveLength(1);
      expect(result.form.categories[0].name).toBe("Category One");
      expect(result.form.categories[0].questions).toHaveLength(1);
      expect(result.form.categories[0].questions[0].value).toBe(
        "First question",
      );
    });

    test("preserves custom answer options", () => {
      const customOptions: AnswerOption[] = [
        { key: "yes", label: "Yes", shortLabel: "Y", color: "#00ff00" },
        { key: "no", label: "No", shortLabel: "N", color: "#ff0000" },
        { key: "unset", label: "Unset", shortLabel: "-", color: "#999999" },
      ];
      const result = parseImportedJSON(
        makeValidJSON({ answerOptions: customOptions }),
      );
      expect(result.form.answerOptions).toEqual(customOptions);
    });

    test("detects answers with custom answer options", () => {
      const customOptions: AnswerOption[] = [
        { key: "yes", label: "Yes", shortLabel: "Y", color: "#00ff00" },
        { key: "no", label: "No", shortLabel: "N", color: "#ff0000" },
        { key: "none", label: "None", shortLabel: "-", color: "#999999" },
      ];
      const json = JSON.stringify({
        name: "Custom Answered",
        categories: [
          {
            id: { prefix: "category", suffix: "01234567890123456789abcdef" },
            name: "Cat",
            questions: [
              {
                id: {
                  prefix: "question",
                  suffix: "01234567890123456789abcdef",
                },
                selection: "yes",
                value: "Q1",
              },
            ],
          },
        ],
        answerOptions: customOptions,
      });
      const result = parseImportedJSON(json);
      expect(result.hasAnswers).toBe(true);
    });

    test("all-unset with custom options detects no answers", () => {
      const customOptions: AnswerOption[] = [
        { key: "yes", label: "Yes", shortLabel: "Y", color: "#00ff00" },
        { key: "blank", label: "Blank", shortLabel: "-", color: "#999999" },
      ];
      const json = JSON.stringify({
        name: "Custom Unset",
        categories: [
          {
            id: { prefix: "category", suffix: "01234567890123456789abcdef" },
            name: "Cat",
            questions: [
              {
                id: {
                  prefix: "question",
                  suffix: "01234567890123456789abcdef",
                },
                selection: "blank",
                value: "Q1",
              },
            ],
          },
        ],
        answerOptions: customOptions,
      });
      const result = parseImportedJSON(json);
      expect(result.hasAnswers).toBe(false);
    });

    test("handles form with empty categories array", () => {
      const result = parseImportedJSON(makeValidJSON({ categories: [] }));
      expect(result.form.categories).toHaveLength(0);
      expect(result.hasAnswers).toBe(false);
    });
  });

  describe("invalid inputs", () => {
    test("rejects non-JSON text", () => {
      expect(() => parseImportedJSON("not json at all")).toThrow(
        "does not contain valid JSON",
      );
    });

    test("rejects JSON arrays", () => {
      expect(() => parseImportedJSON("[1, 2, 3]")).toThrow(
        "expected structure",
      );
    });

    test("rejects JSON primitives", () => {
      expect(() => parseImportedJSON('"hello"')).toThrow("expected structure");
      expect(() => parseImportedJSON("42")).toThrow("expected structure");
      expect(() => parseImportedJSON("null")).toThrow("expected structure");
    });

    test("rejects object without name", () => {
      expect(() =>
        parseImportedJSON(JSON.stringify({ categories: [] })),
      ).toThrow("'name'");
    });

    test("rejects object without categories", () => {
      expect(() => parseImportedJSON(JSON.stringify({ name: "Test" }))).toThrow(
        "'categories'",
      );
    });

    test("rejects object with non-string name", () => {
      expect(() =>
        parseImportedJSON(JSON.stringify({ name: 123, categories: [] })),
      ).toThrow("'name'");
    });

    test("rejects object with non-array categories", () => {
      expect(() =>
        parseImportedJSON(JSON.stringify({ name: "Test", categories: "bad" })),
      ).toThrow("'categories'");
    });

    test("wraps Form.fromPOJO errors with user-friendly message", () => {
      const badForm = JSON.stringify({
        name: "Test",
        categories: [
          {
            id: {
              prefix: "wrong_prefix",
              suffix: "01234567890123456789abcdef",
            },
            name: "Cat",
            questions: [],
          },
        ],
      });
      expect(() => parseImportedJSON(badForm)).toThrow(
        "Could not parse the form structure",
      );
    });
  });
});

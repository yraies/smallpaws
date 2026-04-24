import { type AnswerOption, Form } from "../../types/Form";
import { buildComparison, type ComparisonEntry } from "../compareLogic";

/** Helper to create a Form from a minimal POJO structure. */
function makeForm(
  name: string,
  categories: {
    id: string;
    name: string;
    questions: { id: string; value: string; selection: string }[];
  }[],
  answerOptions?: AnswerOption[],
): Form {
  return Form.fromPOJO({
    name,
    categories: categories.map((cat) => ({
      id: { prefix: "category", suffix: cat.id },
      name: cat.name,
      questions: cat.questions.map((q) => ({
        id: { prefix: "question", suffix: q.id },
        selection: q.selection,
        value: q.value,
      })),
    })),
    answerOptions,
  });
}

function makeEntry(label: string, form: Form): ComparisonEntry {
  return { label, form };
}

describe("buildComparison", () => {
  // Valid 26-char base32 suffixes for TypeIDs
  const CAT1 = "01234567890123456789000001";
  const CAT2 = "01234567890123456789000002";
  const Q1 = "01234567890123456789100001";
  const Q2 = "01234567890123456789100002";

  it("returns empty result for fewer than 2 entries", () => {
    const form = makeForm("A", [
      {
        id: CAT1,
        name: "Cat",
        questions: [{ id: Q1, value: "Q?", selection: "must" }],
      },
    ]);
    const result = buildComparison([makeEntry("A", form)]);
    expect(result.isCompatible).toBe(false);
    expect(result.categories).toHaveLength(0);
    expect(result.overlapCount).toBe(0);
  });

  it("aligns identical forms correctly", () => {
    const form1 = makeForm("A", [
      {
        id: CAT1,
        name: "Cat One",
        questions: [
          { id: Q1, value: "First?", selection: "must" },
          { id: Q2, value: "Second?", selection: "like" },
        ],
      },
    ]);
    const form2 = makeForm("B", [
      {
        id: CAT1,
        name: "Cat One",
        questions: [
          { id: Q1, value: "First?", selection: "must" },
          { id: Q2, value: "Second?", selection: "maybe" },
        ],
      },
    ]);

    const result = buildComparison([
      makeEntry("A", form1),
      makeEntry("B", form2),
    ]);
    expect(result.isCompatible).toBe(true);
    expect(result.overlapCount).toBe(2);
    expect(result.totalQuestionCount).toBe(2);
    expect(result.categories).toHaveLength(1);
    expect(result.categories[0].categoryName).toBe("Cat One");
    expect(result.categories[0].rows).toHaveLength(2);
    expect(result.categories[0].rows[0].selections).toEqual(["must", "must"]);
    expect(result.categories[0].rows[1].selections).toEqual(["like", "maybe"]);
  });

  it("handles forms with different categories", () => {
    const form1 = makeForm("A", [
      {
        id: CAT1,
        name: "Cat One",
        questions: [{ id: Q1, value: "Q?", selection: "must" }],
      },
    ]);
    const form2 = makeForm("B", [
      {
        id: CAT2,
        name: "Cat Two",
        questions: [{ id: Q2, value: "Q2?", selection: "like" }],
      },
    ]);

    const result = buildComparison([
      makeEntry("A", form1),
      makeEntry("B", form2),
    ]);
    expect(result.isCompatible).toBe(false);
    expect(result.overlapCount).toBe(0);
    expect(result.totalQuestionCount).toBe(2);
    expect(result.categories).toHaveLength(2);
  });

  it("fills unset for missing questions across forms", () => {
    const form1 = makeForm("A", [
      {
        id: CAT1,
        name: "Cat",
        questions: [
          { id: Q1, value: "Shared?", selection: "must" },
          { id: Q2, value: "Only A?", selection: "like" },
        ],
      },
    ]);
    const form2 = makeForm("B", [
      {
        id: CAT1,
        name: "Cat",
        questions: [{ id: Q1, value: "Shared?", selection: "maybe" }],
      },
    ]);

    const result = buildComparison([
      makeEntry("A", form1),
      makeEntry("B", form2),
    ]);
    expect(result.isCompatible).toBe(true);
    expect(result.overlapCount).toBe(1);
    expect(result.totalQuestionCount).toBe(2);
    // q1: both have it
    expect(result.categories[0].rows[0].selections).toEqual(["must", "maybe"]);
    // q2: only form1 has it, form2 gets unset
    expect(result.categories[0].rows[1].selections).toEqual(["like", "unset"]);
  });

  it("uses answer options from the first form", () => {
    const customOptions: AnswerOption[] = [
      { key: "yes", label: "Yes", shortLabel: "Y", color: "#00ff00" },
      { key: "no", label: "No", shortLabel: "N", color: "#ff0000" },
      { key: "skip", label: "Skip", shortLabel: "-", color: "#999999" },
    ];
    const form1 = makeForm(
      "A",
      [
        {
          id: CAT1,
          name: "Cat",
          questions: [{ id: Q1, value: "Q?", selection: "yes" }],
        },
      ],
      customOptions,
    );
    const form2 = makeForm(
      "B",
      [
        {
          id: CAT1,
          name: "Cat",
          questions: [{ id: Q1, value: "Q?", selection: "no" }],
        },
      ],
      customOptions,
    );

    const result = buildComparison([
      makeEntry("A", form1),
      makeEntry("B", form2),
    ]);
    expect(result.answerOptions).toEqual(customOptions);
  });

  it("handles 3+ forms", () => {
    const makeF = (label: string, sel: string) =>
      makeForm(label, [
        {
          id: CAT1,
          name: "Cat",
          questions: [{ id: Q1, value: "Q?", selection: sel }],
        },
      ]);

    const result = buildComparison([
      makeEntry("A", makeF("A", "must")),
      makeEntry("B", makeF("B", "must")),
      makeEntry("C", makeF("C", "like")),
    ]);

    expect(result.isCompatible).toBe(true);
    expect(result.categories[0].rows[0].selections).toEqual([
      "must",
      "must",
      "like",
    ]);
  });
});

import { TypeID, typeid } from "typeid-js";

enum Selection {
  MUST_HAVE = "must",
  LIKE = "like",
  OPEN_TO_IT = "open",
  MAYBE = "maybe",
  OFF_LIMITS = "off_limits",
  UNSET = "unset",
}

/**
 * Semantic tier for answer options. Used by the seasonal theme system
 * to provide appropriate colors for each answer state.
 * - "must": strong positive / essential answers
 * - "like": moderate positive / affirmative answers
 * - "neutral": no strong opinion either way
 * - "maybe": uncertain / slight hesitation
 * - "dislike": negative / boundary answers
 * - "misc": special / attention-needed answers
 */
export type AnswerSemantic =
  | "must"
  | "like"
  | "neutral"
  | "maybe"
  | "dislike"
  | "misc";

/**
 * Defines one answer option in a template-wide answer schema.
 * The `key` is stored in `Question.selection` and must be unique within a schema.
 */
export type AnswerOption = {
  key: string;
  label: string;
  shortLabel: string;
  /** Fallback color hex used when no theme is active or no semantic tier is set. */
  color: string;
  /** Optional icon identifier. See AVAILABLE_ICONS in AnswerSchemaEditor. */
  icon?: string;
  /** Semantic tier for theme-aware coloring. */
  semantic?: AnswerSemantic;
};

/**
 * Preset color palette for answer options.
 * Warm, muted pastels that harmonize with the app's paper aesthetic and
 * provide enough contrast for white text overlays.
 */
export const PRESET_COLORS: { name: string; hex: string }[] = [
  { name: "Lavender", hex: "#9C7DB5" },
  { name: "Sky", hex: "#7094B0" },
  { name: "Pistachio", hex: "#8A9B58" },
  { name: "Sand", hex: "#C5A958" },
  { name: "Raspberry", hex: "#B5586A" },
  { name: "Sepia", hex: "#8D6A4F" },
  { name: "Limoncello", hex: "#B8A535" },
  { name: "Rose", hex: "#C0808A" },
  { name: "Coral", hex: "#CC7A68" },
  { name: "Peach", hex: "#D09468" },
  { name: "Mint", hex: "#68A58A" },
  { name: "Grey", hex: "#908A82" },
];

/** The built-in default answer options: a 5-point scale from strong positive to hard boundary. */
export const DEFAULT_ANSWER_OPTIONS: AnswerOption[] = [
  {
    key: "must",
    label: "Must Have",
    shortLabel: "Must",
    color: "#8d4f3f",
    icon: "exclamation",
    semantic: "must",
  },
  {
    key: "like",
    label: "Like",
    shortLabel: "Like",
    color: "#7c4f73",
    icon: "check",
    semantic: "like",
  },
  {
    key: "open",
    label: "Open to It",
    shortLabel: "Open",
    color: "#6a9878",
    icon: "thumbsup",
    semantic: "neutral",
  },
  {
    key: "maybe",
    label: "Maybe",
    shortLabel: "Maybe",
    color: "#c6a055",
    icon: "question",
    semantic: "maybe",
  },
  {
    key: "off_limits",
    label: "Off Limits",
    shortLabel: "Limit",
    color: "#aa6c67",
    icon: "minus",
    semantic: "dislike",
  },
  {
    key: "unset",
    label: "Unset",
    shortLabel: "Unset",
    color: "#b39a84",
    icon: "empty",
  },
];

/**
 * Returns the effective answer options for a form, falling back to defaults.
 */
export function getEffectiveAnswerOptions(
  answerOptions: AnswerOption[] | undefined,
): AnswerOption[] {
  return answerOptions && answerOptions.length > 0
    ? answerOptions
    : DEFAULT_ANSWER_OPTIONS;
}

/**
 * Returns the "unset" key for a given answer option set.
 * Always the last option in the array.
 */
export function getUnsetKey(answerOptions: AnswerOption[] | undefined): string {
  const options = getEffectiveAnswerOptions(answerOptions);
  return options[options.length - 1].key;
}

/**
 * Returns the next selection key in the cycle order.
 * Cycles through the answer options array, wrapping at the end.
 */
export function nextSelectionKey(
  currentKey: string,
  answerOptions: AnswerOption[] | undefined,
): string {
  const options = getEffectiveAnswerOptions(answerOptions);
  const currentIndex = options.findIndex((o) => o.key === currentKey);
  if (currentIndex === -1) return options[options.length - 1].key;
  return options[(currentIndex + 1) % options.length].key;
}

type TypeIdPOJO = { prefix: string; suffix: string };

const QuestionIDLiteral = "question";
type QuestionID = TypeID<typeof QuestionIDLiteral>;
export type QuestionPOJO = {
  id: TypeIdPOJO;
  selection: string;
  value: string;
};

class Question {
  readonly id: QuestionID;
  readonly selection: string;
  readonly value: string;

  private constructor(id: QuestionID, selection: string, value: string) {
    this.id = id;
    this.selection = selection;
    this.value = value;
  }

  static new(value: string, unsetKey = Selection.UNSET as string): Question {
    return new Question(typeid(QuestionIDLiteral), unsetKey, value);
  }

  /** Create a Question with a deterministic ID suffix (for stable starter templates). */
  static withStableId(
    suffix: string,
    value: string,
    unsetKey = Selection.UNSET as string,
  ): Question {
    return new Question(new TypeID(QuestionIDLiteral, suffix), unsetKey, value);
  }

  static fromPOJO(obj: QuestionPOJO, answerOptions?: AnswerOption[]): Question {
    if (obj.id.prefix !== QuestionIDLiteral) {
      throw new Error("Invalid Question ID");
    }
    const options = getEffectiveAnswerOptions(answerOptions);
    const validKeys = options.map((o) => o.key);
    const selection = validKeys.includes(obj.selection)
      ? obj.selection
      : options[options.length - 1].key;
    return new Question(
      new TypeID(obj.id.prefix, obj.id.suffix),
      selection,
      obj.value,
    );
  }

  withSelection(selection: string): Question {
    return new Question(this.id, selection, this.value);
  }

  withValue(value: string): Question {
    return new Question(this.id, this.selection, value);
  }

  withNextSelection(answerOptions?: AnswerOption[]): Question {
    return new Question(
      this.id,
      nextSelectionKey(this.selection, answerOptions),
      this.value,
    );
  }

  /** @deprecated Use nextSelectionKey() with answer options instead. */
  static nextSelection(selection: Selection): Selection {
    switch (selection) {
      case Selection.MUST_HAVE:
        return Selection.LIKE;
      case Selection.LIKE:
        return Selection.OPEN_TO_IT;
      case Selection.OPEN_TO_IT:
        return Selection.MAYBE;
      case Selection.MAYBE:
        return Selection.OFF_LIMITS;
      case Selection.OFF_LIMITS:
        return Selection.UNSET;
      case Selection.UNSET:
        return Selection.MUST_HAVE;
      default:
        return Selection.UNSET;
    }
  }
}

const CategoryIDLiteral = "category";
type CategoryID = TypeID<typeof CategoryIDLiteral>;
export type CategoryPOJO = {
  id: TypeIdPOJO;
  name: string;
  questions: QuestionPOJO[];
};

class Category {
  readonly id: CategoryID;
  readonly name: string;
  readonly questions: Question[];

  private constructor(id: CategoryID, name: string, questions: Question[]) {
    this.id = id;
    this.name = name;
    this.questions = questions;
  }

  static new(name: string, questions: Question[]): Category {
    return new Category(typeid(CategoryIDLiteral), name, questions);
  }

  /** Create a Category with a deterministic ID suffix (for stable starter templates). */
  static withStableId(
    suffix: string,
    name: string,
    questions: Question[],
  ): Category {
    return new Category(new TypeID(CategoryIDLiteral, suffix), name, questions);
  }

  static fromPOJO(obj: CategoryPOJO, answerOptions?: AnswerOption[]): Category {
    if (obj.id.prefix !== CategoryIDLiteral) {
      throw new Error("Invalid Category ID");
    }
    return new Category(
      new TypeID(obj.id.prefix, obj.id.suffix),
      obj.name,
      obj.questions.map((q) => Question.fromPOJO(q, answerOptions)),
    );
  }

  withName(name: string): Category {
    return new Category(this.id, name, this.questions);
  }

  withQuestions(questions: Question[]): Category {
    return new Category(this.id, this.name, questions);
  }

  withQuestion(
    questionID: QuestionID,
    modifier: (question: Question) => Question,
  ): Category {
    const updatedQuestions = this.questions.map((q) =>
      q.id === questionID ? modifier(q) : q,
    );
    return new Category(this.id, this.name, updatedQuestions);
  }

  withMovedQuestion(
    questionID: QuestionID,
    direction: "up" | "down",
  ): Category {
    const index = this.questions.findIndex(
      (question) => question.id === questionID,
    );
    if (index === -1) return this;

    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= this.questions.length) return this;

    const newQuestions = [...this.questions];
    newQuestions[index] = newQuestions[newIndex];
    newQuestions[newIndex] = this.questions[index];
    return new Category(this.id, this.name, newQuestions);
  }

  addQuestion(question: Question): Category {
    return new Category(this.id, this.name, [...this.questions, question]);
  }

  removeQuestion(questionID: QuestionID): Category {
    return new Category(
      this.id,
      this.name,
      this.questions.filter((q) => q.id !== questionID),
    );
  }

  withoutAnswers(unsetKey: string = Selection.UNSET): Category {
    return new Category(
      this.id,
      this.name,
      this.questions.map((question) =>
        question.selection === unsetKey
          ? question
          : question.withSelection(unsetKey),
      ),
    );
  }
}

export type FormPOJO = {
  name: string;
  categories: CategoryPOJO[];
  answerOptions?: AnswerOption[];
  templateName?: string;
  respondentName?: string;
};

class Form {
  readonly name: string;
  readonly categories: Category[];
  readonly answerOptions?: AnswerOption[];
  readonly templateName?: string;
  readonly respondentName?: string;

  private constructor(
    name: string,
    categories: Category[],
    answerOptions?: AnswerOption[],
    templateName?: string,
    respondentName?: string,
  ) {
    this.name = name;
    this.categories = categories;
    this.answerOptions = answerOptions;
    this.templateName = templateName;
    this.respondentName = respondentName;
  }

  static new(
    name: string,
    categories: Category[],
    answerOptions?: AnswerOption[],
  ): Form {
    return new Form(name, categories, answerOptions);
  }

  static fromPOJO(obj: FormPOJO): Form {
    return new Form(
      obj.name,
      obj.categories.map((c) => Category.fromPOJO(c, obj.answerOptions)),
      obj.answerOptions,
      obj.templateName,
      obj.respondentName,
    );
  }

  getCategory(categoryID: CategoryID): Category | undefined {
    return this.categories.find((category) => category.id === categoryID);
  }

  withName(name: string): Form {
    return new Form(
      name,
      this.categories,
      this.answerOptions,
      this.templateName,
      this.respondentName,
    );
  }

  withCategories(categories: Category[]): Form {
    return new Form(
      this.name,
      categories,
      this.answerOptions,
      this.templateName,
      this.respondentName,
    );
  }

  withAnswerOptions(answerOptions: AnswerOption[] | undefined): Form {
    return new Form(
      this.name,
      this.categories,
      answerOptions,
      this.templateName,
      this.respondentName,
    );
  }

  withTemplateName(templateName: string): Form {
    return new Form(
      this.name,
      this.categories,
      this.answerOptions,
      templateName,
      this.respondentName,
    );
  }

  withRespondentName(respondentName: string): Form {
    return new Form(
      this.name,
      this.categories,
      this.answerOptions,
      this.templateName,
      respondentName,
    );
  }

  withCategory(
    categoryID: CategoryID,
    modifier: (category: Category) => Category,
  ): Form {
    const updatedCategories = this.categories.map((c) =>
      c.id === categoryID ? modifier(c) : c,
    );
    return new Form(
      this.name,
      updatedCategories,
      this.answerOptions,
      this.templateName,
      this.respondentName,
    );
  }

  withMovedCategory(categoryID: CategoryID, direction: "up" | "down"): Form {
    const index = this.categories.findIndex(
      (category) => category.id === categoryID,
    );
    if (index === -1) return this;

    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= this.categories.length) return this;

    const newCategories = [...this.categories];
    newCategories[index] = newCategories[newIndex];
    newCategories[newIndex] = this.categories[index];
    return new Form(
      this.name,
      newCategories,
      this.answerOptions,
      this.templateName,
      this.respondentName,
    );
  }

  addCategory(category: Category): Form {
    return new Form(
      this.name,
      [...this.categories, category],
      this.answerOptions,
      this.templateName,
      this.respondentName,
    );
  }

  removeCategory(categoryID: CategoryID): Form {
    return new Form(
      this.name,
      this.categories.filter((c) => c.id !== categoryID),
      this.answerOptions,
      this.templateName,
      this.respondentName,
    );
  }

  withoutAnswers(): Form {
    const unsetKey = getUnsetKey(this.answerOptions);
    return new Form(
      this.name,
      this.categories.map((category) => category.withoutAnswers(unsetKey)),
      this.answerOptions,
      this.templateName,
      this.respondentName,
    );
  }

  questionCount(): number {
    return this.categories.reduce(
      (count, category) => count + category.questions.length,
      0,
    );
  }

  hasValidStructure(): boolean {
    return this.categories.length > 0 && this.questionCount() > 0;
  }

  getStatistics(): Record<string, number> {
    return this.categories.reduce(
      (acc, category) => {
        for (const question of category.questions) {
          acc[question.selection] = (acc[question.selection] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>,
    );
  }

  static example(): Form {
    return new Form("Test Form", [
      Category.new("First Category", [
        Question.new("Must Have Question").withSelection(Selection.MUST_HAVE),
        Question.new("Like Question").withSelection(Selection.LIKE),
        Question.new("Open to It Question").withSelection(Selection.OPEN_TO_IT),
        Question.new("Maybe Question").withSelection(Selection.MAYBE),
        Question.new("Off Limits Question").withSelection(Selection.OFF_LIMITS),
      ]),
      Category.new("Second Category", [
        Question.new("First Question").withSelection(Selection.MUST_HAVE),
        Question.new("Second Question").withSelection(Selection.LIKE),
        Question.new("Third Question").withSelection(Selection.MAYBE),
      ]),
    ]);
  }

  static generateTsRepresenation(form: Form): string {
    const tsRepresentation: string[] = [`Form.new('${form.name}', [`];
    form.categories.forEach((category) => {
      tsRepresentation.push(`  Category.new('${category.name}', [`);
      category.questions.forEach((question) => {
        tsRepresentation.push(`    Question.new('${question.value}'),`);
      });
      tsRepresentation.push("  ]),");
    });
    tsRepresentation.push("]);");
    return tsRepresentation.join("\n");
  }
}

export type { CategoryID, QuestionID };
export { Category, Form, Question, Selection };

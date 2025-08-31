import { typeid, TypeID } from "typeid-js";

enum Selection {
  MUST_HAVE = "must",
  WOULD_LIKE = "like",
  MAYBE = "maybe",
  OFF_LIMITS = "off_limits",
  UNSET = "unset",
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
  readonly selection: Selection;
  readonly value: string;

  private constructor(id: QuestionID, selection: Selection, value: string) {
    this.id = id;
    this.selection = selection;
    this.value = value;
  }

  static new(value: string): Question {
    return new Question(typeid(QuestionIDLiteral), Selection.UNSET, value);
  }

  static fromPOJO(obj: QuestionPOJO): Question {
    if (obj.id.prefix !== QuestionIDLiteral) {
      throw new Error("Invalid Question ID");
    }
    if (!Object.values(Selection).includes(obj.selection as Selection)) {
      throw new Error("Invalid Selection");
    }
    return new Question(
      new TypeID(obj.id.prefix, obj.id.suffix),
      obj.selection as Selection,
      obj.value
    );
  }

  withSelection(selection: Selection): Question {
    return new Question(this.id, selection, this.value);
  }

  withValue(value: string): Question {
    return new Question(this.id, this.selection, value);
  }

  withNextSelection(): Question {
    return new Question(
      this.id,
      Question.nextSelection(this.selection),
      this.value
    );
  }

  static nextSelection(selection: Selection): Selection {
    switch (selection) {
      case Selection.MUST_HAVE:
        return Selection.WOULD_LIKE;
      case Selection.WOULD_LIKE:
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

  static fromPOJO(obj: CategoryPOJO): Category {
    if (obj.id.prefix !== CategoryIDLiteral) {
      throw new Error("Invalid Category ID");
    }
    return new Category(
      new TypeID(obj.id.prefix, obj.id.suffix),
      obj.name,
      obj.questions.map((q) => Question.fromPOJO(q))
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
    modifier: (question: Question) => Question
  ): Category {
    const updatedQuestions = this.questions.map((q) =>
      q.id === questionID ? modifier(q) : q
    );
    return new Category(this.id, this.name, updatedQuestions);
  }

  withMovedQuestion(
    questionID: QuestionID,
    direction: "up" | "down"
  ): Category {
    const index = this.questions.findIndex(
      (question) => question.id === questionID
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
      this.questions.filter((q) => q.id !== questionID)
    );
  }
}

export type FormPOJO = {
  name: string;
  categories: CategoryPOJO[];
};

class Form {
  readonly name: string;
  readonly categories: Category[];

  private constructor(name: string, categories: Category[]) {
    this.name = name;
    this.categories = categories;
  }

  static new(name: string, categories: Category[]): Form {
    return new Form(name, categories);
  }

  static fromPOJO(obj: FormPOJO): Form {
    return new Form(
      obj.name,
      obj.categories.map((c) => Category.fromPOJO(c))
    );
  }

  getCategory(categoryID: CategoryID): Category | undefined {
    return this.categories.find((category) => category.id === categoryID);
  }

  withName(name: string): Form {
    return new Form(name, this.categories);
  }

  withCategories(categories: Category[]): Form {
    return new Form(this.name, categories);
  }

  withCategory(
    categoryID: CategoryID,
    modifier: (category: Category) => Category
  ): Form {
    const updatedCategories = this.categories.map((c) =>
      c.id === categoryID ? modifier(c) : c
    );
    return new Form(this.name, updatedCategories);
  }

  withMovedCategory(categoryID: CategoryID, direction: "up" | "down"): Form {
    const index = this.categories.findIndex(
      (category) => category.id === categoryID
    );
    if (index === -1) return this;

    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= this.categories.length) return this;

    const newCategories = [...this.categories];
    newCategories[index] = newCategories[newIndex];
    newCategories[newIndex] = this.categories[index];
    return new Form(this.name, newCategories);
  }

  addCategory(category: Category): Form {
    return new Form(this.name, [...this.categories, category]);
  }

  removeCategory(categoryID: CategoryID): Form {
    return new Form(
      this.name,
      this.categories.filter((c) => c.id !== categoryID)
    );
  }

  getStatistics(): Record<Selection, number> {
    return this.categories.reduce(
      (acc, category) => {
        category.questions.forEach((question) => {
          acc[question.selection] = (acc[question.selection] || 0) + 1;
        });
        return acc;
      },
      {} as Record<Selection, number>
    );
  }

  static example(): Form {
    return new Form("Test Form", [
      Category.new("First Category", [
        Question.new("Must Have Question").withSelection(Selection.MUST_HAVE),
        Question.new("Would Like Question").withSelection(Selection.WOULD_LIKE),
        Question.new("Maybe Question").withSelection(Selection.MAYBE),
        Question.new("Off Limits Question").withSelection(Selection.OFF_LIMITS),
      ]),
      Category.new("Second Category", [
        Question.new("First Question").withSelection(Selection.MUST_HAVE),
        Question.new("Second Question").withSelection(Selection.WOULD_LIKE),
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

export { Selection, Question, Category, Form };
export type { QuestionID, CategoryID };

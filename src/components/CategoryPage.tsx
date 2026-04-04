import {
  ArrowDownIcon,
  ArrowUpIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/16/solid";
import type { Dispatch, SetStateAction } from "react";
import { type Category, type Form, Question } from "../types/Form";
import Box from "./Box";
import IconButton from "./IconButton";
import QuestionLine from "./QuestionsLine";

function CategoryBox({
  category,
  setDocument,
  answerMode,
  structureEditable,
}: {
  category: Category;
  setDocument?: Dispatch<SetStateAction<Form>>;
  answerMode: "hidden" | "editable" | "readonly";
  structureEditable: boolean;
}) {
  const questionBlock = category.questions.map((question) => (
    <QuestionLine
      question={question}
      categoryID={category.id}
      key={question.id.toString()}
      onChange={(categoryMapper) =>
        setDocument?.((prev) => {
          const previousCategory =
            // biome-ignore lint/style/noNonNullAssertion: category is guaranteed by form data model
            prev.getCategory(category.id)!;
          const updatedCategory = categoryMapper(previousCategory);
          return prev.withCategory(category.id, () => updatedCategory);
        })
      }
      answerMode={answerMode}
      structureEditable={structureEditable}
    />
  ));

  const buttons = (
    <div className="not-print:flex not-print:flex-row print:hidden">
      <IconButton
        onClick={() => {
          if (!structureEditable) return;
          setDocument?.((prev) =>
            prev.withCategory(category.id, (currentCategory) =>
              currentCategory.addQuestion(Question.new("")),
            ),
          );
        }}
        disabled={!structureEditable}
        aria-label="Add question"
        title="Add question"
      >
        <PlusIcon
          className="h-4 w-4 text-[var(--plum)] transition-transform group-hover:scale-90"
          aria-hidden="true"
        />
      </IconButton>
      <IconButton
        onClick={() => {
          if (!structureEditable) return;
          setDocument?.((prev) => prev.withMovedCategory(category.id, "up"));
        }}
        disabled={!structureEditable}
        aria-label="Move category up"
        title="Move category up"
      >
        <ArrowUpIcon
          className="h-4 w-4 text-[var(--plum)] transition-transform group-hover:scale-90"
          aria-hidden="true"
        />
      </IconButton>
      <IconButton
        onClick={() => {
          if (!structureEditable) return;
          setDocument?.((prev) => prev.withMovedCategory(category.id, "down"));
        }}
        disabled={!structureEditable}
        aria-label="Move category down"
        title="Move category down"
      >
        <ArrowDownIcon
          className="h-4 w-4 text-[var(--plum)] transition-transform group-hover:scale-90"
          aria-hidden="true"
        />
      </IconButton>
      <IconButton
        onClick={() => {
          if (!structureEditable) return;
          setDocument?.((prev) => prev.removeCategory(category.id));
        }}
        disabled={!structureEditable}
        aria-label={`Delete ${category.name} category`}
        title={`Delete category`}
      >
        <TrashIcon
          className="h-4 w-4 text-[var(--paper-accent)] transition-transform group-hover:scale-90"
          aria-hidden="true"
        />
      </IconButton>
    </div>
  );

  return (
    <Box
      editableTitle={structureEditable}
      title={category.name}
      onTitleChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        if (!structureEditable) return;
        setDocument?.((prev) =>
          prev.withCategory(category.id, (currentCategory) =>
            currentCategory.withName(e.target.value),
          ),
        );
      }}
      buttons={structureEditable ? buttons : null}
      className="category border border-[rgba(198,144,85,0.18)]"
      role="region"
      aria-label={`${category.name} category`}
    >
      <ul className="m-0 list-none p-0">{questionBlock}</ul>
    </Box>
  );
}

export default CategoryBox;

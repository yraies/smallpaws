import {
  ArrowDownIcon,
  ArrowUpIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/16/solid";
import { useFormContext } from "@/contexts/FormContext";
import { type CategoryID, Question } from "../types/Form";
import Box from "./Box";
import IconButton from "./IconButton";
import QuestionLine from "./QuestionsLine";

function CategoryBox({
  id,
  advancedOptions,
  readOnly = false,
}: {
  id: CategoryID;
  advancedOptions: boolean;
  readOnly?: boolean;
}) {
  const { form, setForm } = useFormContext();
  const category = form?.getCategory(id);

  if (!category) return null;

  const questionBlock = category.questions.map((question) => (
    <QuestionLine
      question={question}
      categoryID={id}
      key={question.id.toString()}
      onChange={(categoryMapper) =>
        setForm((prev) => {
          const category =
            // biome-ignore lint/style/noNonNullAssertion: category is guaranteed by form data model
            prev.getCategory(id)!;
          const updatedCategory = categoryMapper(category);
          return prev.withCategory(id, () => updatedCategory);
        })
      }
      advancedOptions={advancedOptions}
      readOnly={readOnly}
    />
  ));

  const buttons = (
    <div className="not-print:flex not-print:flex-row print:hidden">
      <IconButton
        onClick={() => {
          if (readOnly) return;
          setForm((prev) =>
            prev.withCategory(id, (category) =>
              category.addQuestion(Question.new("")),
            ),
          );
        }}
        disabled={readOnly}
        aria-label="Add question"
        title="Add question"
      >
        <PlusIcon
          className="h-4 w-4 transition-transform group-hover:scale-90 group-hover:text-violet-400"
          aria-hidden="true"
        />
      </IconButton>
      <IconButton
        onClick={() => {
          if (readOnly) return;
          setForm((prev) => prev.withMovedCategory(id, "up"));
        }}
        disabled={readOnly}
        aria-label="Move category up"
        title="Move category up"
      >
        <ArrowUpIcon
          className="h-4 w-4 transition-transform group-hover:scale-90 group-hover:text-violet-400"
          aria-hidden="true"
        />
      </IconButton>
      <IconButton
        onClick={() => {
          if (readOnly) return;
          setForm((prev) => prev.withMovedCategory(id, "down"));
        }}
        disabled={readOnly}
        aria-label="Move category down"
        title="Move category down"
      >
        <ArrowDownIcon
          className="h-4 w-4 transition-transform group-hover:scale-90 group-hover:text-violet-400"
          aria-hidden="true"
        />
      </IconButton>
      <IconButton
        onClick={() => {
          if (readOnly) return;
          setForm((prev) => prev.removeCategory(id));
        }}
        disabled={readOnly}
        aria-label={`Delete ${category.name} category`}
        title={`Delete category`}
      >
        <TrashIcon
          className="h-4 w-4 transition-transform group-hover:scale-90 group-hover:text-red-400"
          aria-hidden="true"
        />
      </IconButton>
    </div>
  );

  return (
    <Box
      editableTitle={!readOnly}
      title={category.name}
      onTitleChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        if (readOnly) return;
        setForm((prev) =>
          prev.withCategory(id, (category) =>
            category.withName(e.target.value),
          ),
        );
      }}
      buttons={advancedOptions ? buttons : null}
      className="category"
      role="region"
      aria-label={`${category.name} category`}
    >
      <ul className="m-0 list-none p-0">{questionBlock}</ul>
    </Box>
  );
}

export default CategoryBox;

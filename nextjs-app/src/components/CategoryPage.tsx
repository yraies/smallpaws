import {
  ArrowDownIcon,
  ArrowUpIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/16/solid";
import { Question, CategoryID } from "../types/Form";
import Box from "./Box";
import QuestionLine from "./QuestionsLine";
import IconButton from "./IconButton";
import { useFormContext } from "@/contexts/FormContext";

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
          const category = prev.getCategory(id)!;
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
              category.addQuestion(Question.new(""))
            )
          );
        }}
        disabled={readOnly}
        aria-label="Add question"
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
          prev.withCategory(id, (category) => category.withName(e.target.value))
        );
      }}
      buttons={advancedOptions ? buttons : null}
      className="category"
      role="region"
      aria-label={`${category.name} category`}
    >
      {questionBlock}
    </Box>
  );
}

export default CategoryBox;

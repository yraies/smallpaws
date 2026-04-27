import {
  ArrowDownIcon,
  ArrowUpIcon,
  TrashIcon,
} from "@heroicons/react/16/solid";
import type {
  AnswerOption,
  Category,
  CategoryID,
  Question,
} from "../types/Form";
import IconButton from "./IconButton";
import SelectionButton from "./SelectionButton";

function QuestionLine({
  question,
  onChange,
  answerMode,
  structureEditable,
  answerOptions,
}: {
  question: Question;
  categoryID: CategoryID;
  onChange: (mapper: (category: Category) => Category) => void;
  answerMode: "hidden" | "editable" | "readonly";
  structureEditable: boolean;
  answerOptions?: AnswerOption[];
}) {
  return (
    <li
      key={question.id.toString()}
      className="question-line flex flex-row items-center gap-1 px-2 py-1 hover:backdrop-brightness-90"
    >
      {answerMode !== "hidden" && (
        <SelectionButton
          selection={question.selection}
          onClick={() => {
            if (answerMode !== "editable") return;
            onChange((cat) =>
              cat.withQuestion(question.id, (q) =>
                q.withNextSelection(answerOptions),
              ),
            );
          }}
          className="h-6 w-6 min-w-4 shrink-0 transition-transform group-hover:scale-75"
          disabled={answerMode !== "editable"}
          answerOptions={answerOptions}
        />
      )}

      {/* Input for screen, span for print (to enable text wrapping) */}
      <input
        type="text"
        className="paper-field question-text screen-only mx-2 min-w-10 grow"
        value={question.value}
        placeholder="Question"
        onChange={(e) => {
          if (!structureEditable) return;
          onChange((cat) =>
            cat.withQuestion(question.id, (q) => q.withValue(e.target.value)),
          );
        }}
        disabled={!structureEditable}
        readOnly={!structureEditable}
        aria-label="Question text"
        name="question-text"
      />

      {/* Print-only text that can wrap */}
      <span className="print-only question-text" aria-hidden="true">
        {question.value}
      </span>

      {/* Handwritten response space (print only) */}
      {answerMode !== "hidden" && (
        <div
          className="print-only print-response-space"
          aria-hidden="true"
        ></div>
      )}

      <div
        className="flex flex-row print:hidden"
        hidden={!structureEditable}
        role="toolbar"
        aria-label="Question actions"
      >
        <IconButton
          onClick={() => {
            if (!structureEditable) return;
            onChange((cat) => cat.withMovedQuestion(question.id, "up"));
          }}
          disabled={!structureEditable}
          aria-label="Move question up"
          title="Move question up"
        >
          <ArrowUpIcon
            className="h-4 w-4 transition-transform group-hover:scale-90 group-hover:text-th-ink-muted"
            aria-hidden="true"
          />
        </IconButton>
        <IconButton
          onClick={() => {
            if (!structureEditable) return;
            onChange((cat) => cat.withMovedQuestion(question.id, "down"));
          }}
          disabled={!structureEditable}
          aria-label="Move question down"
          title="Move question down"
        >
          <ArrowDownIcon
            className="h-4 w-4 transition-transform group-hover:scale-90 group-hover:text-th-ink-muted"
            aria-hidden="true"
          />
        </IconButton>
        <IconButton
          onClick={() => {
            if (!structureEditable) return;
            onChange((cat) => cat.removeQuestion(question.id));
          }}
          disabled={!structureEditable}
          aria-label={`Delete question: ${question.value || "untitled question"}`}
          title="Delete question"
        >
          <TrashIcon
            className="h-4 w-4 transition-transform group-hover:scale-75 group-hover:text-th-danger"
            aria-hidden="true"
          />
        </IconButton>
      </div>
    </li>
  );
}

export default QuestionLine;

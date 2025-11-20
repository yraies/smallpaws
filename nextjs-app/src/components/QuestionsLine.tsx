import {
  ArrowDownIcon,
  ArrowUpIcon,
  TrashIcon,
} from "@heroicons/react/16/solid";
import { Question, CategoryID, Category } from "../types/Form";
import IconButton from "./IconButton";
import SelectionButton from "./SelectionButton";

function QuestionLine({
  question,
  onChange,
  advancedOptions,
  readOnly = false,
}: {
  question: Question;
  categoryID: CategoryID;
  onChange: (mapper: (category: Category) => Category) => void;
  advancedOptions: boolean;
  readOnly?: boolean;
}) {
  return (
    <div
      key={question.id.toString()}
      className="flex flex-row items-center gap-1 px-2 py-1 hover:backdrop-brightness-90 question-line"
      role="listitem"
    >
      <SelectionButton
        selection={question.selection}
        onClick={() => {
          if (readOnly) return;
          onChange((cat) =>
            cat.withQuestion(question.id, (q) => q.withNextSelection())
          );
        }}
        className="h-6 w-6 min-w-4 shrink-0 transition-transform group-hover:scale-75"
        disabled={readOnly}
      />

      {/* Input for screen, span for print (to enable text wrapping) */}
      <input
        type="text"
        className="mx-2 min-w-10 grow border-b-1 question-text screen-only"
        value={question.value}
        placeholder="Question"
        onChange={(e) => {
          if (readOnly) return;
          onChange((cat) =>
            cat.withQuestion(question.id, (q) => q.withValue(e.target.value))
          );
        }}
        disabled={readOnly}
        readOnly={readOnly}
        aria-label="Question text"
      />

      {/* Print-only text that can wrap */}
      <span className="print-only question-text" aria-hidden="true">
        {question.value}
      </span>

      {/* Handwritten response space (print only) */}
      <div className="print-only print-response-space" aria-hidden="true"></div>

      <div
        className="flex flex-row print:hidden"
        hidden={!advancedOptions}
        role="toolbar"
        aria-label="Question actions"
      >
        <IconButton
          onClick={() => {
            if (readOnly) return;
            onChange((cat) => cat.withMovedQuestion(question.id, "up"));
          }}
          disabled={readOnly}
          aria-label="Move question up"
        >
          <ArrowUpIcon
            className="h-4 w-4 transition-transform group-hover:scale-90 group-hover:text-violet-400"
            aria-hidden="true"
          />
        </IconButton>
        <IconButton
          onClick={() => {
            if (readOnly) return;
            onChange((cat) => cat.withMovedQuestion(question.id, "down"));
          }}
          disabled={readOnly}
          aria-label="Move question down"
        >
          <ArrowDownIcon
            className="h-4 w-4 transition-transform group-hover:scale-90 group-hover:text-violet-400"
            aria-hidden="true"
          />
        </IconButton>
        <IconButton
          onClick={() => {
            if (readOnly) return;
            onChange((cat) => cat.removeQuestion(question.id));
          }}
          disabled={readOnly}
          aria-label={`Delete question: ${question.value || "untitled question"}`}
        >
          <TrashIcon
            className="h-4 w-4 transition-transform group-hover:scale-75 group-hover:text-red-400"
            aria-hidden="true"
          />
        </IconButton>
      </div>
    </div>
  );
}

export default QuestionLine;

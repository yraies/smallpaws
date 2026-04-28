import {
  type AnswerOption,
  getEffectiveAnswerOptions,
  getUnsetKey,
} from "../types/Form";

interface PrintAnswerLegendProps {
  answerOptions?: AnswerOption[];
}

export default function PrintAnswerLegend({
  answerOptions,
}: PrintAnswerLegendProps) {
  const options = getEffectiveAnswerOptions(answerOptions);
  const unsetKey = getUnsetKey(answerOptions);
  const printableOptions = options.filter(
    (option) => option.key !== unsetKey && option.label.trim().length > 0,
  );

  return (
    <div className="print-only document-sheet mb-1 bg-white px-3 py-1.5 text-center text-black">
      <div className="flex items-center justify-center gap-2 text-sm leading-tight">
        <span className="font-semibold uppercase tracking-wide">Legend:</span>
        {printableOptions.map((option) => (
          <span
            key={option.key}
            className="border border-[#666] px-2 py-0.5 font-semibold"
          >
            {(option.shortLabel || option.label).trim()}
          </span>
        ))}
      </div>
    </div>
  );
}

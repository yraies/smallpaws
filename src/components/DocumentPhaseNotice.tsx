interface DocumentPhaseNoticeProps {
  label: string;
  description: string;
  tone?: "draft" | "finalized" | "published" | "shared";
  meta?: string;
}

const toneClasses = {
  draft: "border-orange-400 text-orange-700",
  finalized: "border-violet-400 text-violet-700",
  published: "border-green-400 text-green-700",
  shared: "border-blue-400 text-blue-700",
} as const;

export default function DocumentPhaseNotice({
  label,
  description,
  tone = "draft",
  meta,
}: DocumentPhaseNoticeProps) {
  return (
    <div
      className={`mb-3 w-full max-w-lg border-l-4 bg-white px-3 py-2 print:hidden ${toneClasses[tone]}`}
    >
      <p className="text-sm font-semibold uppercase tracking-widest">{label}</p>
      <p className="text-sm text-neutral-700">{description}</p>
      {meta && <p className="mt-1 text-xs text-neutral-500">{meta}</p>}
    </div>
  );
}

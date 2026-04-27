interface DocumentPhaseNoticeProps {
  label: string;
  description: string;
  tone?: "draft" | "finalized" | "published" | "shared";
  meta?: string;
}

const toneClasses = {
  draft: "border-th-block text-th-ink-muted",
  finalized: "border-th-primary text-th-ink",
  published: "border-th-success text-th-success",
  shared: "border-th-info text-th-info",
} as const;

export default function DocumentPhaseNotice({
  label,
  description,
  tone = "draft",
  meta,
}: DocumentPhaseNoticeProps) {
  return (
    <div
      className={`mb-3 w-full max-w-lg border-l-4 bg-th-paper px-3 py-2 print:hidden ${toneClasses[tone]}`}
    >
      <p className="text-sm font-semibold uppercase tracking-widest">{label}</p>
      <p className="text-sm text-th-ink">{description}</p>
      {meta && <p className="mt-1 text-xs text-th-ink-muted">{meta}</p>}
    </div>
  );
}
